import { NextRequest, NextResponse } from 'next/server'
import { getDataSource } from '@/src/lib/db'
import { PedidoDG, EnderecoDG } from '@/src/entities'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dataSource = await getDataSource()
    const { id } = params

    // Buscar o pedido com relações básicas
    const pedido = await dataSource.getRepository(PedidoDG).findOne({
      where: { id: parseInt(id) },
      relations: ['cliente', 'itens']
    })

    if (!pedido) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }

    // Formatar os dados para retornar
    const pedidoFormatado = {
      id: pedido.id,
      codigo: pedido.codigo,
      valorTotal: pedido.valorTotal,
      status: pedido.status,
      formaEntrega: pedido.formaEntrega,
      formaPagamento: pedido.formaPagamento,
      observacoes: pedido.observacoes,
      createdAt: pedido.createdAt,
      enderecoEntrega: pedido.formaEntrega === 'entrega' ? {
        id: 0, // ID fictício para compatibilidade
        endereco: pedido.enderecoEntrega || '',
        numero: pedido.numeroEntrega || '',
        complemento: pedido.complementoEntrega || '',
        bairro: pedido.bairroEntrega || '',
        cidade: pedido.cidadeEntrega || '',
        estado: pedido.estadoEntrega || '',
        cep: pedido.cepEntrega || ''
      } : null,
      cliente: {
        id: pedido.cliente.id,
        nome: pedido.cliente.nome,
        telefone: pedido.cliente.telefone
      },
      itens: pedido.itens?.map(item => ({
        id: item.id,
        nomeProduto: item.nomeProduto,
        quantidade: item.quantidade,
        precoUnitario: item.precoUnitario,
        precoTotal: item.precoTotal,
        observacao: item.observacao
      })) || []
    }

    return NextResponse.json({
      success: true,
      pedido: pedidoFormatado
    })

  } catch (error) {
    console.error('Erro ao buscar pedido:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
