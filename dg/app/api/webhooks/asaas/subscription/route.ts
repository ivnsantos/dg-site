import { NextRequest, NextResponse } from 'next/server'
import { initializeDB } from '@/src/lib/db'
import { Subscription } from '@/src/entities/Subscription'
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
  
  // Buscar assinatura pelo externalId
  const existingSubscription = await subscriptionRepository.findOne({
    where: { externalId: subscriptionData.id }
  })

  if (!existingSubscription) {
    console.warn(`Assinatura não encontrada: ${subscriptionData.id}`)
    return { success: false, message: 'Assinatura não encontrada' }
  }

  switch (event) {
    case 'SUBSCRIPTION_CREATED':
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
      
      await subscriptionRepository.save(existingSubscription)
      return { success: true, message: 'Assinatura criada/atualizada com sucesso' }

    case 'SUBSCRIPTION_UPDATED':
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
      
      await subscriptionRepository.save(existingSubscription)
      return { success: true, message: 'Assinatura atualizada com sucesso' }

    case 'SUBSCRIPTION_INACTIVATED':
      // Marcar assinatura como inativa
      existingSubscription.status = 'INACTIVE'
      existingSubscription.deleted = true
      
      await subscriptionRepository.save(existingSubscription)
      return { success: true, message: 'Assinatura inativada com sucesso' }

    case 'SUBSCRIPTION_DELETED':
      // Marcar assinatura como deletada
      existingSubscription.status = 'CANCELLED'
      existingSubscription.deleted = true
      
      await subscriptionRepository.save(existingSubscription)
      return { success: true, message: 'Assinatura deletada com sucesso' }

    default:
      return { success: false, message: 'Evento não reconhecido' }
  }
}

export async function POST(request: NextRequest) {
  let dataSource: any = null
  
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
    dataSource = await initializeDB()
    
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