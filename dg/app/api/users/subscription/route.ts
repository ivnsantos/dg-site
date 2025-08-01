import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { initializeDB } from '@/src/lib/db'
import { User } from '@/src/entities/User'
import { Subscription } from '@/src/entities/Subscription'

export async function GET(request: NextRequest) {
  let dataSource: any = null
  
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    dataSource = await initializeDB()
    const userRepository = dataSource.getRepository(User)
    const subscriptionRepository = dataSource.getRepository(Subscription)
    
    // Buscar usuário
    const user = await userRepository.findOne({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Buscar assinatura
    const subscription = await subscriptionRepository.findOne({
      where: { userId: user.id }
    })

    if (!subscription) {
      return NextResponse.json({
        hasSubscription: false,
        subscription: null,
        message: 'Usuário não possui assinatura'
      })
    }

    // Calcular informações adicionais
    const subscriptionInfo = {
      ...subscription,
      isActive: subscription.isActive(),
      isOverdue: subscription.isOverdue(),
      isExpired: subscription.isExpired(),
      daysUntilNextDue: subscription.getDaysUntilNextDue(),
      formattedValue: subscription.getFormattedValue(),
      formattedNextDueDate: subscription.getFormattedNextDueDate(),
      formattedEndDate: subscription.getFormattedEndDate()
    }

    return NextResponse.json({
      hasSubscription: true,
      subscription: subscriptionInfo,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status,
        plano: user.plano,
        valorPlano: user.valorPlano
      }
    })

  } catch (error: any) {
    console.error('Erro ao buscar dados da assinatura:', error)
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    if (dataSource) {
      try {
        await dataSource.destroy()
      } catch (error) {
        console.warn('Erro ao destruir conexão:', error)
      }
    }
  }
} 