import { MongoDBAdapter } from '@auth/mongodb-adapter'
import Google from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import CredentialsProvider from 'next-auth/providers/credentials'
import { connectToDatabase } from './lib/db/index'
import client from './lib/db/client'
import getUserModel from './lib/db/models/user.model'
import NextAuth, { type DefaultSession, type NextAuthOptions } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      role: string
    } & DefaultSession['user']
  }
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/sign-in',
    newUser: '/sign-up',
    error: '/sign-in',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  adapter: MongoDBAdapter(client),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: {
          type: 'email',
        },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        await connectToDatabase()
        if (credentials == null) return null
        // Get the User model
        const UserModel = await getUserModel()
       
        // Use the model to find the user
        const user = await UserModel.findOne({ email: credentials.email })
        if (user && user.password) {
          const isMatch = await bcrypt.compare(
            credentials.password as string,
            user.password
          )
          if (isMatch) {
            return {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
            }
          }
        }
        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        if (!user.name) {
          await connectToDatabase()
          const UserModel = await getUserModel()
          await UserModel.findByIdAndUpdate(user.id, {
            name: user.name || user.email!.split('@')[0],
            role: 'user',
          })
        }
        token.name = user.name || user.email!.split('@')[0]
        token.role = (user as any).role
      }
      if (session?.user?.name && trigger === 'update') {
        token.name = session.user.name
      }
      return token
    },
    async session({ session, token, trigger }) {
      session.user.id = token.sub as string
      session.user.role = token.role as string
      session.user.name = token.name as string
      return session
    },
  },
}

// Export NextAuth directly
export default NextAuth(authOptions)

// Export getServerSession for server-side authentication
import { getServerSession } from 'next-auth/next'

// Export auth function that uses getServerSession
export const auth = async () => {
  return getServerSession(authOptions)
}