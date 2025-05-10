import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcrypt'
import { AppDataSource } from '@/src/lib/db'
import { User } from '@/src/entities/User'

declare module 'next-auth' {
  interface User {
    id: number
    email: string
    name: string
  }

  interface Session {
    user: User
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: number
    email: string
    name: string
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Credenciais inválidas')
        }

        const userRepository = AppDataSource.getRepository(User)
        const user = await userRepository.findOne({
          where: { email: credentials.email }
        })

        if (!user) {
          throw new Error('Usuário não encontrado')
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error('Senha incorreta')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.email = token.email
        session.user.name = token.name
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
} 