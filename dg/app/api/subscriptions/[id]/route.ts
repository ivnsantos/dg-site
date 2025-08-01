import { NextRequest, NextResponse } from 'next/server'
import { initializeDB } from '@/src/lib/db'
import { Subscription } from '@/src/entities/Subscription'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let dataSource: any = null
  
  try {
    dataSource = await initializeDB()
    const subscriptionRepository = dataSource.getRepository(Subscription)
    
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar assinatura com dados do usuário
    const subscription = await subscriptionRepository.findOne({
      where: { id: parseInt(id) },
      relations: ['user']
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'Assinatura não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      subscription
    })

  } catch (error: any) {
    console.error('Erro ao buscar assinatura:', error)
    
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let dataSource: any = null
  
  try {
    dataSource = await initializeDB()
    const subscriptionRepository = dataSource.getRepository(Subscription)
    
    const { id } = params
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar assinatura existente
    const existingSubscription = await subscriptionRepository.findOne({
      where: { id: parseInt(id) }
    })

    if (!existingSubscription) {
      return NextResponse.json(
        { error: 'Assinatura não encontrada' },
        { status: 404 }
      )
    }

    // Campos que podem ser atualizados
    const updateableFields = [
      'value',
      'cycle',
      'description',
      'billingType',
      'status',
      'nextDueDate',
      'endDate',
      'externalReference',
      'paymentLink',
      'checkoutSession',
      'creditCardNumber',
      'creditCardBrand',
      'creditCardToken',
      'deleted'
    ]

    // Atualizar apenas campos permitidos
    updateableFields.forEach(field => {
      if (body[field] !== undefined) {
        if (field === 'nextDueDate' || field === 'endDate') {
          existingSubscription[field] = body[field] ? new Date(body[field]) : null
        } else if (field === 'value') {
          existingSubscription[field] = parseFloat(body[field])
        } else {
          existingSubscription[field] = body[field]
        }
      }
    })

    const updatedSubscription = await subscriptionRepository.save(existingSubscription)

    return NextResponse.json({
      success: true,
      message: 'Assinatura atualizada com sucesso',
      subscription: updatedSubscription
    })

  } catch (error: any) {
    console.error('Erro ao atualizar assinatura:', error)
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let dataSource: any = null
  
  try {
    dataSource = await initializeDB()
    const subscriptionRepository = dataSource.getRepository(Subscription)
    
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar assinatura
    const subscription = await subscriptionRepository.findOne({
      where: { id: parseInt(id) }
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'Assinatura não encontrada' },
        { status: 404 }
      )
    }

    // Soft delete - marcar como deletada
    subscription.deleted = true
    subscription.status = 'CANCELLED'
    
    await subscriptionRepository.save(subscription)

    return NextResponse.json({
      success: true,
      message: 'Assinatura cancelada com sucesso'
    })

  } catch (error: any) {
    console.error('Erro ao cancelar assinatura:', error)
    
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