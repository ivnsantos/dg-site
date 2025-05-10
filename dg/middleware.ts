import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

// Enum local para evitar dependência do TypeORM
enum UserStatus {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO'
}

export default withAuth(
  function middleware(request) {
    const token = request.nextauth.token
    const path = request.nextUrl.pathname

    // Se o usuário estiver inativo
    if (token?.status === UserStatus.INATIVO) {
      // Permite acesso à página de planos e à rota de criação de assinatura
      if (!path.startsWith('/dashboard/planos') && !path.startsWith('/api/assinatura/atualizar')  && !path.startsWith('/api/auth/signout')) {
        return NextResponse.redirect(new URL('/dashboard/planos', request.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/assinatura/:path*',
    '/api/confeitaria/:path*',
    '/api/ingredientes/:path*'
  ]
} 