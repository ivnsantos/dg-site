import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getDataSource } from '@/src/lib/db'
import { TipoPlano, User, UserStatus } from '@/src/entities/User'
import { asaasService } from '@/src/services/AsaasService'
import { IsNull } from 'typeorm'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const dataSource = await getDataSource()
    const userRepository = dataSource.getRepository(User)

    // Busca o usuário
    const user = await userRepository.findOne({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Cancela a assinatura no Asaas
    if (user.idAssinatura) {
      await asaasService.cancelarSubscription(user.idAssinatura)
    }

    // Atualiza o status do usuário para inativo
    user.idAssinatura = '';
    user.plano = TipoPlano.INATIVO
    user.valorPlano = 0
    user.status = UserStatus.INATIVO
    user.cupomDesconto = ''
    
    await userRepository.save(user)

    // Cria a resposta com os cookies de sessão expirados
    const response = NextResponse.json({ 
      message: 'Assinatura cancelada com sucesso',
      success: true 
    })

    // Define os cookies de sessão como expirados
    response.cookies.set('next-auth.session-token', '', { maxAge: 0 })
    response.cookies.set('next-auth.csrf-token', '', { maxAge: 0 })
    response.cookies.set('next-auth.callback-url', '', { maxAge: 0 })
    response.cookies.set('__Secure-next-auth.session-token', '', { maxAge: 0 })

    return response

  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error)
    
    if (error instanceof Error && error.message.includes('Driver not Connected')) {
      return NextResponse.json({ 
        error: 'Erro de conexão com o banco de dados. Tente novamente em alguns segundos.',
        code: 'DB_CONNECTION_ERROR'
      }, { status: 503 })
    }
    
    return NextResponse.json(
      { 
        error: 'Erro ao cancelar assinatura',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
} 