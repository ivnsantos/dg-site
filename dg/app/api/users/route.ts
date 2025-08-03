import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getDataSource } from '@/src/lib/db'
import { User } from '@/src/entities/User'
import { Subscription } from '@/src/entities/Subscription'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const dataSource = await getDataSource()
    const userRepository = dataSource.getRepository(User)
    const subscriptionRepository = dataSource.getRepository(Subscription)

    const user = await userRepository.findOne({
      where: { id: Number(session.user.id) },
      select: ['id', 'name', 'email', 'plano', 'status', 'valorPlano', 'markupIdeal', 'createdAt']
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Buscar assinatura do usuário
    const subscription = await subscriptionRepository.findOne({
      where: { userId: user.id },
      order: { createdAt: 'DESC' }
    })

    return NextResponse.json({
      user,
      subscription
    })
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error)
    
    if (error instanceof Error && error.message.includes('Driver not Connected')) {
      return NextResponse.json({ 
        error: 'Erro de conexão com o banco de dados. Tente novamente em alguns segundos.',
        code: 'DB_CONNECTION_ERROR'
      }, { status: 503 })
    }
    
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
} 