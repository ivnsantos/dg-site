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
      relations: ['cliente', 'endereco'],
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

    // Validar se endereço é fornecido quando formaEntrega for 'entrega'
    if (formaEntrega === 'entrega' && (!enderecoEntrega || !enderecoEntrega.endereco)) {
      return NextResponse.json(
        { error: 'Endereço de entrega é obrigatório para pedidos com entrega' },
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

      // Para pedidos com entrega, usar o endereço fornecido SEM criar na tabela de endereços
      let enderecoId: number | null = null
      if (enderecoEntrega && enderecoEntrega.endereco && formaEntrega === 'entrega') {
        console.log('📍 Usando endereço de entrega fornecido pelo cliente')
        console.log('🏠 Dados do endereço:', enderecoEntrega)
        
        // NÃO criar endereço na tabela - apenas usar os dados para o pedido
        // O endereço será salvo como dados do pedido, não como endereço do cliente
        console.log('✅ Endereço será salvo como dados do pedido (não na tabela de endereços)')
      } else if (formaEntrega === 'entrega') {
        console.log('⚠️ Forma de entrega é "entrega" mas não há dados de endereço')
      } else {
        console.log('📦 Pedido para retirada - sem endereço necessário')
      }

      // Criar o pedido
      const dadosEndereco = {
        enderecoEntrega: enderecoEntrega?.endereco || null,
        numeroEntrega: enderecoEntrega?.numero || null,
        bairroEntrega: enderecoEntrega?.bairro || null,
        cidadeEntrega: enderecoEntrega?.cidade || null,
        estadoEntrega: enderecoEntrega?.estado || null,
        cepEntrega: enderecoEntrega?.cep || null,
        complementoEntrega: enderecoEntrega?.complemento || null
      }

      console.log('🏠 Dados do endereço que serão salvos:', dadosEndereco)

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
        menuId,
        enderecoId: enderecoId,
        // Salvar dados do endereço diretamente no pedido
        ...dadosEndereco
      })

      const pedidoSalvo = await queryRunner.manager.save(PedidoDG, novoPedido)

      console.log('📋 Pedido criado:', {
        id: pedidoSalvo.id,
        codigo: pedidoSalvo.codigo,
        enderecoId: enderecoId || 'N/A',
        formaEntrega: pedidoSalvo.formaEntrega
      })

      // Verificar se os dados do endereço foram salvos
      console.log('🏠 Verificando dados do endereço salvos:', {
        enderecoEntrega: (pedidoSalvo as any).enderecoEntrega,
        numeroEntrega: (pedidoSalvo as any).numeroEntrega,
        bairroEntrega: (pedidoSalvo as any).bairroEntrega,
        cidadeEntrega: (pedidoSalvo as any).cidadeEntrega,
        estadoEntrega: (pedidoSalvo as any).estadoEntrega,
        cepEntrega: (pedidoSalvo as any).cepEntrega,
        complementoEntrega: (pedidoSalvo as any).complementoEntrega
      })

      // Verificar se o enderecoId foi salvo corretamente
      console.log('🔍 Verificando enderecoId salvo:', {
        enderecoIdOriginal: enderecoId,
        enderecoIdSalvo: (pedidoSalvo as any).enderecoId,
        pedidoCompleto: pedidoSalvo
      })

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

 