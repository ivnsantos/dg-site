import { NextRequest, NextResponse } from 'next/server'
import { getDataSource } from '@/src/lib/db'
import { Subscription } from '@/src/entities/Subscription'
import { User } from '@/src/entities/User'

export async function GET(request: NextRequest) {
  let dataSource: any = null
  
  try {
    dataSource = await getDataSource()
    const subscriptionRepository = dataSource.getRepository(Subscription)
    const userRepository = dataSource.getRepository(User)
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Construir query
    const queryBuilder = subscriptionRepository
      .createQueryBuilder('subscription')
      .leftJoinAndSelect('subscription.user', 'user')
      .select([
        'subscription',
        'user.id',
        'user.name',
        'user.email'
      ])
    
    // Filtros
    if (userId) {
      queryBuilder.andWhere('subscription.userId = :userId', { userId: parseInt(userId) })
    }
    
    if (status) {
      queryBuilder.andWhere('subscription.status = :status', { status })
    }

    // Ordenação
    queryBuilder.orderBy('subscription.createdAt', 'DESC')

    // Paginação
    const offset = (page - 1) * limit
    queryBuilder.skip(offset).take(limit)

    // Executar query
    const [subscriptions, total] = await queryBuilder.getManyAndCount()

    // Calcular estatísticas
    const stats = await subscriptionRepository
      .createQueryBuilder('subscription')
      .select([
        'subscription.status',
        'COUNT(*) as count'
      ])
      .groupBy('subscription.status')
      .getRawMany()

    return NextResponse.json({
      subscriptions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      stats
    })

  } catch (error: any) {
    console.error('Erro ao buscar assinaturas:', error)
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  let dataSource: any = null
  
  try {
    dataSource = await getDataSource()
    const subscriptionRepository = dataSource.getRepository(Subscription)
    const userRepository = dataSource.getRepository(User)
    
    const body = await request.json()
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
      creditCardToken,
      userId
    } = body

    // Validações
    if (!externalId || !value || !cycle || !billingType || !status || !userId) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: externalId, value, cycle, billingType, status, userId' },
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
    console.error('Erro ao criar assinatura:', error)
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
