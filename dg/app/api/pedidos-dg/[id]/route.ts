import { NextRequest, NextResponse } from 'next/server'
import { getDataSource } from '@/src/lib/db'
import { PedidoDG } from '@/src/entities/PedidoDG'

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

    // Buscar endereços do cliente separadamente
    const enderecos = await dataSource.getRepository('EnderecoDG').find({
      where: { clienteId: pedido.cliente.id, ativo: true }
    })

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
      cliente: {
        id: pedido.cliente.id,
        nome: pedido.cliente.nome,
        telefone: pedido.cliente.telefone,
        email: pedido.cliente.email,
        enderecos: enderecos.map((endereco: any) => ({
          id: endereco.id,
          logradouro: endereco.logradouro,
          numero: endereco.numero,
          complemento: endereco.complemento,
          bairro: endereco.bairro,
          cidade: endereco.cidade,
          estado: endereco.estado,
          cep: endereco.cep,
          ativo: endereco.ativo
        }))
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
