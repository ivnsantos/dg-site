import { NextRequest, NextResponse } from 'next/server'
import { initializeDB } from '@/src/lib/db'
import { Subscription } from '@/src/entities/Subscription'
import { User } from '@/src/entities/User'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  let dataSource: any = null
  
  try {
    dataSource = await initializeDB()
    const subscriptionRepository = dataSource.getRepository(Subscription)
    const userRepository = dataSource.getRepository(User)
    
    const { userId } = params

    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o usuário existe
    const user = await userRepository.findOne({ where: { id: parseInt(userId) } })
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Buscar assinatura do usuário
    const subscription = await subscriptionRepository.findOne({
      where: { userId: parseInt(userId) },
      relations: ['user']
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
      subscription: subscriptionInfo
    })

  } catch (error: any) {
    console.error('Erro ao buscar assinatura do usuário:', error)
    
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

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  let dataSource: any = null
  
  try {
    dataSource = await initializeDB()
    const subscriptionRepository = dataSource.getRepository(Subscription)
    const userRepository = dataSource.getRepository(User)
    
    const { userId } = params
    const body = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o usuário existe
    const user = await userRepository.findOne({ where: { id: parseInt(userId) } })
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o usuário já tem uma assinatura
    const existingSubscription = await subscriptionRepository.findOne({
      where: { userId: parseInt(userId) }
    })

    if (existingSubscription) {
      return NextResponse.json(
        { error: 'Usuário já possui uma assinatura' },
        { status: 400 }
      )
    }

    const {
      externalId,
      customerId,
      value,
      cycle,
      description,
      billingType,
      status,
      dateCreated,
      nextDueDate,
      endDate,
      externalReference,
      paymentLink,
      checkoutSession,
      creditCardNumber,
      creditCardBrand,
      creditCardToken
    } = body

    // Validações
    if (!externalId || !value || !cycle || !billingType || !status) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: externalId, value, cycle, billingType, status' },
        { status: 400 }
      )
    }

    // Verificar se o externalId já existe
    const existingExternalId = await subscriptionRepository.findOne({
      where: { externalId }
    })

    if (existingExternalId) {
      return NextResponse.json(
        { error: 'ExternalId já existe' },
        { status: 400 }
      )
    }

    // Criar assinatura
    const subscription = subscriptionRepository.create({
      externalId,
      customerId,
      value: parseFloat(value),
      cycle,
      description,
      billingType,
      status,
      dateCreated: dateCreated ? new Date(dateCreated) : null,
      nextDueDate: nextDueDate ? new Date(nextDueDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      externalReference,
      paymentLink,
      checkoutSession,
      creditCardNumber,
      creditCardBrand,
      creditCardToken,
      userId: parseInt(userId),
      deleted: false
    })

    const savedSubscription = await subscriptionRepository.save(subscription)

    return NextResponse.json({
      success: true,
      message: 'Assinatura criada com sucesso',
      subscription: savedSubscription
    })

  } catch (error: any) {
    console.error('Erro ao criar assinatura para usuário:', error)
    
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