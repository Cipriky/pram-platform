import { NextAuthOptions, getServerSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/db'
import { UserRole } from '@prisma/client'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 zile
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Parolă', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email și parola sunt obligatorii.')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) {
          throw new Error('Email sau parolă incorectă.')
        }

        if (user.status !== 'ACTIV') {
          throw new Error('Contul tău este inactiv. Contactează administratorul.')
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error('Email sau parolă incorectă.')
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.prenume} ${user.nume}`,
          role: user.role,
          clientId: user.clientId,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.clientId = (user as any).clientId
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
        session.user.clientId = token.clientId as string | null
      }
      return session
    },
  },
  events: {
    async signIn({ user }) {
      // Log activitate login
      console.log(`User ${user.email} s-a autentificat`)
    },
  },
}

export const getAuthSession = () => getServerSession(authOptions)

export async function getCurrentUser() {
  const session = await getAuthSession()
  if (!session?.user?.id) return null

  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      nume: true,
      prenume: true,
      telefon: true,
      avatar: true,
      role: true,
      status: true,
      clientId: true,
    },
  })
}
