import { NextRequest, NextResponse } from 'next/server'
import { getDataSource } from '@/src/lib/db'
import { EnderecoDG } from '@/src/entities/EnderecoDG'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clienteId = parseInt(params.id)
    
    if (isNaN(clienteId)) {
      return NextResponse.json(
        { error: 'ID do cliente inválido' },
        { status: 400 }
      )
    }

    const dataSource = await getDataSource()
    
    // Buscar endereços ativos do cliente usando TypeORM
    const enderecos = await dataSource.getRepository(EnderecoDG).find({
      where: { clienteId, ativo: true },
      order: { createdAt: 'DESC' }
    })

    return NextResponse.json({
      enderecos,
      total: enderecos.length
    })
  } catch (error) {
    console.error('Erro ao buscar endereços:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clienteId = parseInt(params.id)
    
    if (isNaN(clienteId)) {
      return NextResponse.json(
        { error: 'ID do cliente inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { cep, endereco, bairro, cidade, estado, complemento, referencia } = body

    // Validar campos obrigatórios
    if (!endereco || !bairro || !cidade || !estado) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      )
    }

    const dataSource = await getDataSource()
    
    // Inserir novo endereço usando TypeORM
    const novoEndereco = dataSource.getRepository(EnderecoDG).create({
      clienteId,
      cep,
      endereco,
      bairro,
      cidade,
      estado,
      complemento,
      referencia,
      ativo: true
    })

    const enderecoSalvo = await dataSource.getRepository(EnderecoDG).save(novoEndereco)

    return NextResponse.json({
      endereco: enderecoSalvo,
      message: 'Endereço criado com sucesso'
    })
  } catch (error) {
    console.error('Erro ao criar endereço:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clienteId = parseInt(params.id)
    
    if (isNaN(clienteId)) {
      return NextResponse.json(
        { error: 'ID do cliente inválido' },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(request.url)
    const enderecoId = searchParams.get('enderecoId')
    
    if (!enderecoId) {
      return NextResponse.json(
        { error: 'ID do endereço é obrigatório' },
        { status: 400 }
      )
    }

    const dataSource = await getDataSource()
    
    // Buscar o endereço para verificar se existe
    const endereco = await dataSource.getRepository(EnderecoDG).findOne({
      where: { id: parseInt(enderecoId), clienteId }
    })

    if (!endereco) {
      return NextResponse.json(
        { error: 'Endereço não encontrado' },
        { status: 404 }
      )
    }

    // Marcar como inativo em vez de deletar fisicamente
    endereco.ativo = false
    await dataSource.getRepository(EnderecoDG).save(endereco)

    return NextResponse.json({
      message: 'Endereço removido com sucesso'
    })
  } catch (error) {
    console.error('Erro ao remover endereço:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
