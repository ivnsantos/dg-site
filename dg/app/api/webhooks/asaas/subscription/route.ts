import { NextRequest, NextResponse } from 'next/server'
import { getDataSource } from '@/src/lib/db'
import { Subscription } from '@/src/entities/Subscription'
import { User, UserStatus } from '@/src/entities/User'
import crypto from 'crypto'

interface AsaasSubscriptionWebhook {
  id: string
  event: 'SUBSCRIPTION_CREATED' | 'SUBSCRIPTION_UPDATED' | 'SUBSCRIPTION_INACTIVATED' | 'SUBSCRIPTION_DELETED'
  dateCreated: string
  subscription: {
    object: string
    id: string
    dateCreated: string
    customer: string
    paymentLink: string | null
    value: number
    nextDueDate: string
    cycle: string
    description: string
    billingType: string
    deleted: boolean
    status: string
    externalReference: string | null
    sendPaymentByPostalService: boolean
    discount?: {
      value: number
      limitDate: string | null
      dueDateLimitDays: number
      type: string
    }
    fine?: {
      value: number
      type: string
    }
    interest?: {
      value: number
      type: string
    }
    split?: Array<{
      walletId: string
      fixedValue: number | null
      percentualValue: number
      externalReference: string | null
      description: string | null
    }>
  }
}

// Função para validar a assinatura do webhook
function validateWebhookSignature(payload: string, signature: string, secret: string): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex')
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )
  } catch (error) {
    console.error('Erro ao validar assinatura do webhook:', error)
    return false
  }
}

// Função para converter data do formato brasileiro para ISO
function parseBrazilianDate(dateString: string): Date | null {
  if (!dateString) return null
  
  try {
    // Formato: "16/10/2024"
    const [day, month, year] = dateString.split('/')
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  } catch (error) {
    console.error('Erro ao converter data:', error)
    return null
  }
}

// Função para processar cada tipo de evento
async function processSubscriptionEvent(event: string, subscriptionData: any, dataSource: any) {
  const subscriptionRepository = dataSource.getRepository(Subscription)
  const userRepository = dataSource.getRepository(User)
  
  // Buscar assinatura pelo externalId
  const existingSubscription = await subscriptionRepository.findOne({
    where: { externalId: subscriptionData.id }
  })

  if (!existingSubscription) {
    console.warn(`Assinatura não encontrada: ${subscriptionData.id}`)
    return { success: false, message: 'Assinatura não encontrada' }
  }

  // Buscar o usuário uma vez para todos os casos
  const user = await userRepository.findOne({
    where: { id: existingSubscription.userId }
  })

  switch (event) {
    case 'SUBSCRIPTION_CREATED':
      console.log(`Assinatura ${existingSubscription.id} sendo criada`)
      // Atualizar dados da assinatura criada
      existingSubscription.value = subscriptionData.value
      existingSubscription.cycle = subscriptionData.cycle
      existingSubscription.description = subscriptionData.description
      existingSubscription.billingType = subscriptionData.billingType
      existingSubscription.status = subscriptionData.status
      existingSubscription.deleted = subscriptionData.deleted
      existingSubscription.dateCreated = parseBrazilianDate(subscriptionData.dateCreated) || existingSubscription.dateCreated
      existingSubscription.nextDueDate = parseBrazilianDate(subscriptionData.nextDueDate) || existingSubscription.nextDueDate
      existingSubscription.externalReference = subscriptionData.externalReference
      existingSubscription.paymentLink = subscriptionData.paymentLink
      break

    case 'SUBSCRIPTION_UPDATED':
      console.log(`Assinatura ${existingSubscription.id} sendo atualizada`)
      // Atualizar dados da assinatura
      existingSubscription.value = subscriptionData.value
      existingSubscription.cycle = subscriptionData.cycle
      existingSubscription.description = subscriptionData.description
      existingSubscription.billingType = subscriptionData.billingType
      existingSubscription.status = subscriptionData.status
      existingSubscription.deleted = subscriptionData.deleted
      existingSubscription.nextDueDate = parseBrazilianDate(subscriptionData.nextDueDate) || existingSubscription.nextDueDate
      existingSubscription.externalReference = subscriptionData.externalReference
      existingSubscription.paymentLink = subscriptionData.paymentLink
      break

    case 'SUBSCRIPTION_INACTIVATED':
      console.log(`Assinatura ${existingSubscription.id} sendo inativada`)
      // Marcar assinatura como inativa
      existingSubscription.status = 'INACTIVE'
      existingSubscription.deleted = true
      
      // Inativar o usuário
      if (user) {
        user.status = UserStatus.INATIVO
        await userRepository.save(user)
        console.log(`Usuário ${user.id} inativado devido à assinatura inativa`)
      }
      break

    case 'SUBSCRIPTION_DELETED':
      console.log(`Assinatura ${existingSubscription.id} sendo deletada`)
      // Marcar assinatura como deletada 
      existingSubscription.status = 'INACTIVE'
      existingSubscription.deleted = true

      // Inativar o usuário
      if (user) {
        user.status = UserStatus.INATIVO
        await userRepository.save(user)
        console.log(`Usuário ${user.id} inativado devido à assinatura deletada`)
      }
      break

    default:
      return { success: false, message: 'Evento não reconhecido' }
  }

  // Salvar a assinatura uma vez após todas as modificações
  await subscriptionRepository.save(existingSubscription)
  
  const eventMessages = {
    'SUBSCRIPTION_CREATED': 'Assinatura criada/atualizada com sucesso',
    'SUBSCRIPTION_UPDATED': 'Assinatura atualizada com sucesso',
    'SUBSCRIPTION_INACTIVATED': 'Assinatura e usuário inativados com sucesso',
    'SUBSCRIPTION_DELETED': 'Assinatura deletada com sucesso'
  }

  console.log(`Assinatura ${existingSubscription.id} processada com sucesso: ${event}`)
  return { success: true, message: eventMessages[event as keyof typeof eventMessages] || 'Evento processado com sucesso' }
}

export async function POST(request: NextRequest) {
  try {
    // Obter o corpo da requisição como string para validação da assinatura
    const rawBody = await request.text()
    const payload: AsaasSubscriptionWebhook = JSON.parse(rawBody)
    
    // Validar assinatura do webhook (se configurada)
    // const webhookSecret = process.env.ASAAS_WEBHOOK_SECRET
    // const signature = request.headers.get('asaas-access-token')
    
    // if (webhookSecret && signature) {
    //   const isValid = validateWebhookSignature(rawBody, signature, webhookSecret)
    //   if (!isValid) {
    //     console.error('Assinatura do webhook inválida')
      //  return NextResponse.json(
      //    { error: 'Assinatura inválida' },
      ////    { status: 401 }
      ////  )
      //}
    //}

    // Validar estrutura do payload
    if (!payload.id || !payload.event || !payload.subscription) {
      return NextResponse.json(
        { error: 'Payload inválido' },
        { status: 400 }
      )
    }

    // Log do webhook recebido
    console.log(`Webhook recebido: ${payload.event} - ${payload.subscription.id}`)

    // Inicializar banco de dados
    const dataSource = await getDataSource()
    
    // Processar o evento
    const result = await processSubscriptionEvent(
      payload.event,
      payload.subscription,
      dataSource
    )

    if (result.success) {
      console.log(`Webhook processado com sucesso: ${payload.event}`)
      return NextResponse.json({
        success: true,
        message: result.message,
        eventId: payload.id,
        event: payload.event,
        subscriptionId: payload.subscription.id
      })
    } else {
      console.error(`Erro ao processar webhook: ${result.message}`)
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }

  } catch (error: any) {
    console.error('Erro ao processar webhook de assinatura:', error)
    
    // Verificar se é erro de conexão com banco
    if (error.message?.includes('Driver not Connected')) {
      return NextResponse.json(
        { error: 'Erro de conexão com banco de dados' },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    message: 'Webhook de assinaturas do Asaas está funcionando',
    timestamp: new Date().toISOString(),
    supportedEvents: [
      'SUBSCRIPTION_CREATED',
      'SUBSCRIPTION_UPDATED', 
      'SUBSCRIPTION_INACTIVATED',
      'SUBSCRIPTION_DELETED'
    ],
    endpoint: '/api/webhooks/asaas/subscription'
  })
} 