import { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { initializeDB } from '@/src/lib/db'
import { User, UserStatus, TipoPlano } from '@/src/entities/User'

declare module 'next-auth' {
  interface User {
    id: string
    name: string
    email: string
    status: UserStatus
    plano: TipoPlano
    phoneVerified: boolean
  }

  interface Session {
    user: User
  }

  interface Token {
    id: string
    status: UserStatus
    plano: TipoPlano
    phoneVerified: boolean
  }
}

export const authOptions: AuthOptions = {
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

        try {
          const connection = await initializeDB()
          const userRepository = connection.getRepository(User)

          const user = await userRepository.findOne({
            where: { email: credentials.email }
          })

          if (!user) {
            throw new Error('Usuário não encontrado')
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordValid) {
            throw new Error('Senha incorreta')
          }

          // Verifica se o telefone foi validado, mas não bloqueia o login
          const phoneVerified = user.verificationCode === true

          await connection.destroy()

          return {
            id: String(user.id),
            name: user.name,
            email: user.email,
            status: user.status,
            plano: user.plano,
            phoneVerified
          } as any // Força o tipo para alinhar com o esperado pelo NextAuth
        } catch (error) {
          console.error('Erro durante autenticação:', error)
          throw new Error('Erro ao autenticar usuário')
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          email: user.email,
          name: user.name,
          status: user.status,
          plano: user.plano,
          phoneVerified: user.phoneVerified
        }
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          email: token.email,
          name: token.name,
          status: token.status,
          plano: token.plano,
          phoneVerified: token.phoneVerified
        }
      }
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Se for signout, redireciona para o login
      if (url.includes('signout')) {
        return '/login'
      }

      // Se for uma URL absoluta externa, mantém o comportamento padrão
      if (url.startsWith('http')) return url
      
      // Se for uma URL relativa, retorna apenas a URL
      if (url.startsWith('/')) {
        return url
      }
      
      return url
    }
  },
  pages: {
    signIn: '/login',
    signOut: '/login'
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60 // 30 dias
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key',
  debug: process.env.NODE_ENV === 'development'
} 