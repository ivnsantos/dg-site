import { NextRequest, NextResponse } from 'next/server'
import { getDataSource } from '@/src/lib/db'
import { PedidoDG } from '@/src/entities/PedidoDG'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dataSource = await getDataSource()
    const { id } = params
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json(
        { error: 'Status é obrigatório' },
        { status: 400 }
      )
    }

    // Validar se o status é válido
    const statusValidos = ['pendente', 'em_andamento', 'em_entrega', 'finalizado']
    if (!statusValidos.includes(status)) {
      return NextResponse.json(
        { error: 'Status inválido' },
        { status: 400 }
      )
    }

    // Buscar o pedido
    const pedido = await dataSource.getRepository(PedidoDG).findOne({
      where: { id: parseInt(id) }
    })

    if (!pedido) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }

    // Atualizar o status
    pedido.status = status
    await dataSource.getRepository(PedidoDG).save(pedido)

    console.log(`Status do pedido ${id} atualizado para: ${status}`)

    return NextResponse.json({ 
      success: true, 
      message: 'Status atualizado com sucesso',
      pedido: {
        id: pedido.id,
        status: pedido.status
      }
    })

  } catch (error) {
    console.error('Erro ao atualizar status do pedido:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
