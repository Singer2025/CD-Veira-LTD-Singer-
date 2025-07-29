import NextAuth from 'next-auth'

// Notice this is only an object, not a full Auth.js instance
export default {
  providers: [], // Keep empty to avoid edge runtime issues
  callbacks: {
    authorized({ request, auth }) {
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
}