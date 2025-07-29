const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

// Create the Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Add security headers to response
const addSecurityHeaders = (res) => {
  res.setHeader('X-DNS-Prefetch-Control', 'on');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Content-Security-Policy', "default-src 'self'; connect-src 'self' sea1.ingest.uploadthing.com *.uploadthing.com https://accounts.google.com https://*.vercel-insights.com https://*.vercel.app https://*.googleapis.com https://*.google.com localhost:*; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://utfs.io *.uploadthing.com https://*.googleusercontent.com https://*.google.com; font-src 'self'; object-src 'none'; frame-ancestors 'self'; frame-src 'self' https://accounts.google.com https://*.google.com;");
  return res;
};

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Add security headers
      addSecurityHeaders(res);
      
      // Parse the URL
      const parsedUrl = parse(req.url, true);
      const { pathname, query } = parsedUrl;
      
      // Special handling for Vite client requests (404 errors)
      if (pathname.includes('/@vite/client')) {
        res.statusCode = 204; // No content
        res.end();
        return;
      }
      
      // Handle _rsc requests (React Server Components)
      if (pathname.includes('_rsc')) {
        // Let Next.js handle RSC requests
        await handle(req, res, parsedUrl);
        return;
      }
      
      // Handle static files
      if (/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/i.test(pathname)) {
        await handle(req, res, parsedUrl);
        return;
      }
      
      // Handle API routes
      if (pathname.startsWith('/api/')) {
        await handle(req, res, parsedUrl);
        return;
      }
      
      // Handle Next.js specific routes
      if (pathname.startsWith('/_next/')) {
        await handle(req, res, parsedUrl);
        return;
      }
      
      // Handle locale-specific routes
      const localeRegex = /^\/(en-US|en|fr|ar)(\/|$)/;
      if (localeRegex.test(pathname)) {
        await handle(req, res, parsedUrl);
        return;
      }
      
      // Default handling for all other routes
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});