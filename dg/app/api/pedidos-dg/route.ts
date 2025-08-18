import { NextRequest, NextResponse } from 'next/server'
import { getDataSource } from '@/src/lib/db'
import { PedidoDG, ItemPedidoDG } from '@/src/entities/PedidoDG'
import { ClienteDG } from '@/src/entities/ClienteDG'
import { EnderecoDG } from '@/src/entities/EnderecoDG'
// Função global do Socket.IO será usada

export async function GET(request: NextRequest) {
  try {
    const dataSource = await getDataSource()
    const { searchParams } = new URL(request.url)
    const menuId = searchParams.get('menuId')
    
    if (!menuId) {
      return NextResponse.json(
        { error: 'menuId é obrigatório' },
        { status: 400 }
      )
    }

    const pedidos = await dataSource.getRepository(PedidoDG).find({
      where: { menuId: parseInt(menuId) },
      relations: ['cliente'],
      order: { createdAt: 'DESC' }
    })

    // Buscar os itens de cada pedido
    const pedidosComItens = await Promise.all(
      pedidos.map(async (pedido) => {
        const itens = await dataSource.getRepository(ItemPedidoDG).find({
          where: { pedidoId: pedido.id }
        })
        return {
          ...pedido,
          itens
        }
      })
    )

    return NextResponse.json({ 
      success: true, 
      pedidos: pedidosComItens,
      debug: {
        totalPedidos: pedidosComItens.length,
        pedidosComMenuId: pedidosComItens.length,
        menuId: parseInt(menuId)
      }
    })
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const dataSource = await getDataSource()
    const body = await request.json()
    
    const { 
      clienteId, 
      menuId,
      itens, 
      valorTotal, 
      observacoes, 
      formaPagamento, 
      formaEntrega,
      dataEntrega,
      nomeDestinatario,
      telefoneDestinatario,
      enderecoEntrega
    } = body

    console.log('Dados recebidos:', body)

    if (!clienteId || !itens || !valorTotal) {
      return NextResponse.json(
        { error: 'Cliente, itens e valor total são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o cliente existe
    const cliente = await dataSource.getRepository(ClienteDG).findOne({
      where: { id: clienteId }
    })

    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    // Iniciar transação
    const queryRunner = dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // Gerar código único para o pedido
      const codigo = `PD${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`

      // Criar o pedido
      const novoPedido = dataSource.getRepository(PedidoDG).create({
        codigo,
        valorTotal,
        status: 'pendente',
        observacoes,
        formaPagamento: formaPagamento || 'pendente',
        formaEntrega: formaEntrega || 'pendente',
        dataEntrega: dataEntrega ? new Date(dataEntrega) : undefined,
        nomeDestinatario: nomeDestinatario || cliente.nome,
        telefoneDestinatario: telefoneDestinatario || cliente.telefone,
        clienteId,
        menuId
      })

      const pedidoSalvo = await queryRunner.manager.save(PedidoDG, novoPedido)

      // Criar os itens do pedido
      const itensPedido = itens.map((item: any) => ({
        nomeProduto: item.name,
        quantidade: item.quantity,
        precoUnitario: item.price,
        precoTotal: item.price * item.quantity,
        observacao: item.observation || '',
        pedidoId: (pedidoSalvo as any).id
      }))

      const itensSalvos = await queryRunner.manager.save(ItemPedidoDG, itensPedido)

      // Se forneceu endereço de entrega, criar/atualizar endereço
      if (enderecoEntrega && enderecoEntrega.endereco && formaEntrega === 'entrega') {
        const novoEndereco = dataSource.getRepository(EnderecoDG).create({
          clienteId,
          cep: enderecoEntrega.cep,
          endereco: enderecoEntrega.endereco,
          numero: enderecoEntrega.numero,
          bairro: enderecoEntrega.bairro,
          cidade: enderecoEntrega.cidade,
          estado: enderecoEntrega.estado,
          complemento: enderecoEntrega.complemento,
          referencia: enderecoEntrega.referencia,
          ativo: true
        })

        await queryRunner.manager.save(EnderecoDG, novoEndereco)
      }

      // Commit da transação
      await queryRunner.commitTransaction()

      console.log('Pedido criado com sucesso:', (pedidoSalvo as any).id)

      // Enviar notificação em tempo real para o dashboard
      console.log('📢 Enviando notificação em tempo real...')
      console.log('📊 Dados da notificação:', {
        id: (pedidoSalvo as any).id,
        codigo: pedidoSalvo.codigo,
        valorTotal: pedidoSalvo.valorTotal,
        status: pedidoSalvo.status,
        menuId: pedidoSalvo.menuId,
        cliente: {
          id: cliente.id,
          nome: cliente.nome,
          telefone: cliente.telefone
        }
      })
      
      // Enviar notificação via Socket.IO global
      if ((global as any).sendNotificationToDashboard) {
        (global as any).sendNotificationToDashboard('novo_pedido', {
          id: (pedidoSalvo as any).id,
          codigo: pedidoSalvo.codigo,
          valorTotal: pedidoSalvo.valorTotal,
          status: pedidoSalvo.status,
          menuId: pedidoSalvo.menuId,
          cliente: {
            id: cliente.id,
            nome: cliente.nome,
            telefone: cliente.telefone
          },
          createdAt: pedidoSalvo.createdAt
        })
      } else {
        console.log('⚠️ Socket.IO não está disponível ainda')
      }
      
      console.log('✅ Notificação enviada com sucesso!')

      return NextResponse.json({
        message: 'Pedido criado com sucesso',
        pedido: {
          ...pedidoSalvo,
          itens: itensSalvos
        }
      })

    } catch (error) {
      // Rollback em caso de erro
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }

  } catch (error) {
    console.error('Erro ao criar pedido:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

 