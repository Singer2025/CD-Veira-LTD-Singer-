import { NextResponse, NextRequest } from 'next/server';
import { Resend } from 'resend';
import rateLimit from 'express-rate-limit';
import { check, validationResult, Result, ValidationError } from 'express-validator';

const resend = new Resend(process.env.RESEND_API_KEY);
const companyEmail = process.env.COMPANY_EMAIL; // Assuming you have a company email env var

// Helper function to get client IP
function getClientIp(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    return xff.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  // Add other IP headers if needed, e.g., from Cloudflare
  // const cfConnectingIp = request.headers.get('cf-connecting-ip');
  // if (cfConnectingIp) {
  //   return cfConnectingIp.trim();
  // }
  return 'unknown-ip'; // Fallback
}

// Define the rate limiter
const contactLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { message: 'Too many requests from this IP, please try again after a minute.' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req: unknown): string => {
    // req is cast to NextRequest because that's what applyRateLimit passes.
    return getClientIp(req as NextRequest);
  },
});

interface MockExpressResponse {
  setHeader: (_name: string, _value: string | string[]) => void;
  status: (code: number) => MockExpressResponse;
  send: (body: unknown) => void;
  json: (body: unknown) => void;
  end: () => void;
}

interface RateLimitError extends Error {
  statusCode?: number;
  body?: Record<string, unknown> | string | null;
}

// Helper to apply Express-style middleware
async function applyRateLimit(req: NextRequest, limiter: ReturnType<typeof rateLimit>) {
  return new Promise<void>((resolve, reject) => {
    let limitExceeded = false;
    let responseStatus = 200;
    let responseBody: Record<string, unknown> | string | null = null;

    const mockRes: MockExpressResponse = {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      setHeader: (_name: string, _value: string | string[]) => { /* console.log(`Set header: ${_name}=${_value}`); */ },
      status: (code: number) => {
        responseStatus = code;
        return mockRes;
      },
      send: (body: unknown) => {
        responseBody = body as Record<string, unknown> | string;
        limitExceeded = true;
      },
      json: (body: unknown) => {
        responseBody = body as Record<string, unknown>;
        limitExceeded = true;
      },
      end: () => {
        if (responseStatus === 429) limitExceeded = true;
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    limiter(req as any, mockRes as any, (err?: Error) => { // req as any & mockRes as any are due to express-rate-limit expecting Express types
      if (err) {
        return reject(err);
      }
      if (limitExceeded || responseStatus === 429) {
        const errorInstance: RateLimitError = new Error(
          (typeof responseBody === 'object' && responseBody && 'message' in responseBody && typeof responseBody.message === 'string'
            ? responseBody.message
            : typeof responseBody === 'string' ? responseBody : undefined) || 'Rate limit exceeded'
        );
        errorInstance.statusCode = responseStatus;
        errorInstance.body = responseBody;
        return reject(errorInstance);
      }
      resolve();
    });
  });
}

// Validation rules for the contact form
const contactFormValidationRules = [
  check('name')
    .notEmpty().withMessage('Name is required.')
    .trim()
    .escape(),
  check('email')
    .isEmail().withMessage('A valid email is required.')
    .normalizeEmail(), // Includes toLowerCase, trim, etc.
  check('subject')
    .notEmpty().withMessage('Subject is required.')
    .trim()
    .escape(),
  check('message')
    .notEmpty().withMessage('Message is required.')
    .trim()
    .escape(),
  check('phone') // Phone is optional
    .optional({ checkFalsy: true }) // Considers empty strings, null, undefined as "absent"
    .trim()
    .escape(),
];

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    try {
      await applyRateLimit(request, contactLimiter);
    } catch (error: unknown) {
      const rateLimitError = error as RateLimitError;
      const clientIpForLog = getClientIp(request);
      console.warn('Rate limit exceeded for contact form:', clientIpForLog, rateLimitError.message);
      const responseJson = rateLimitError.body || { message: rateLimitError.message || 'Too many requests.' };
      return NextResponse.json(responseJson, { status: rateLimitError.statusCode || 429 });
    }

    const formData = await request.formData();
    const rawData: Record<string, string | File> = {};
    for (const [key, value] of formData.entries()) {
      rawData[key] = value;
    }

    // Create a mock request for express-validator
    // express-validator expects data on req.body, req.query, req.params etc.
    // We are putting our formData into req.body for validation.
    const mockReq = {
      body: rawData,
      // headers: request.headers, // if any validator needs headers
      // params: {}, // if any validator needs params
      // query: {}, // if any validator needs query
    };

    // Run validation rules
    await Promise.all(contactFormValidationRules.map(validation => validation.run(mockReq)));

    const errors: Result<ValidationError> = validationResult(mockReq);
    if (!errors.isEmpty()) {
      return NextResponse.json({ errors: errors.array() }, { status: 400 });
    }

    // Extract sanitized data from mockReq.body (sanitizers modify it in place)
    const { name, email, subject, message, phone } = mockReq.body as {
      name: string;
      email: string;
      subject: string;
      message: string;
      phone?: string; // phone is optional
    };

    if (!companyEmail) {
       console.error('COMPANY_EMAIL environment variable is not configured.');
       return NextResponse.json({ message: 'Server email configuration error.' }, { status: 500 });
    }

    const { data, error } = await resend.emails.send({
      from: 'Contact Form <onboarding@resend.dev>', // Replace with your verified Resend domain
      to: [companyEmail],
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    if (error) {
      console.error('Error sending email:', error);
      return NextResponse.json({ message: 'Error sending email.' }, { status: 500 });
    }

    console.log('Contact form submission email sent:', data);

    return NextResponse.json({ message: 'Message sent successfully!' }, { status: 200 });
  } catch (error) {
    console.error('Error processing contact form submission:', error);
    return NextResponse.json({ message: 'Error processing message.' }, { status: 500 });
  }
}