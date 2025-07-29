import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'

// Notice this is only an object, not a full Auth.js instance
export default {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    })
  ],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    authorized({ request, auth }: any) {
      const protectedPaths = [
        /\/checkout(\/.*)?/,
        /\/account(\/.*)?/,
        /\/admin(\/.*)?/,
      ]
      const { pathname } = request.nextUrl
      if (protectedPaths.some((p) => p.test(pathname))) return !!auth
      return true
    },
  },
} satisfies NextAuthConfig
