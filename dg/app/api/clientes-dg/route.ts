import { NextRequest, NextResponse } from 'next/server'
import { getDataSource } from '@/src/lib/db'
import { ClienteDG } from '@/src/entities/ClienteDG'
import { EnderecoDG } from '@/src/entities/EnderecoDG'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const telefone = searchParams.get('telefone')

    if (telefone) {
      // Buscar cliente por telefone usando TypeORM
      const dataSource = await getDataSource()
      const cliente = await dataSource.getRepository(ClienteDG).findOne({
        where: { telefone, ativo: true }
      })

      if (!cliente) {
        return NextResponse.json(
          { error: 'Cliente não encontrado' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        cliente
      })
    }

    // Listar todos os clientes
    const dataSource = await getDataSource()
    const clientes = await dataSource.getRepository(ClienteDG).find({
      where: { ativo: true },
      order: { nome: 'ASC' }
    })

    return NextResponse.json({
      clientes
    })
  } catch (error) {
    console.error('Erro ao buscar clientes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: {
      nome: string
      telefone: string
      cep?: string
      endereco?: string
      bairro?: string
      cidade?: string
      estado?: string
      complemento?: string
      referencia?: string
    } = await request.json()

    const { nome, telefone, cep, endereco, bairro, cidade, estado, complemento, referencia } = body

    // Validar campos obrigatórios
    if (!nome || !telefone) {
      return NextResponse.json(
        { error: 'Nome e telefone são obrigatórios' },
        { status: 400 }
      )
    }

    const dataSource = await getDataSource()
    
    // Verificar se já existe cliente com este telefone
    const existingClient = await dataSource.getRepository(ClienteDG).findOne({
      where: { telefone, ativo: true }
    })

    if (existingClient) {
      return NextResponse.json(
        { error: 'Já existe um cliente com este telefone' },
        { status: 409 }
      )
    }

    // Iniciar transação
    const queryRunner = dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // Criar cliente
      const novoCliente = dataSource.getRepository(ClienteDG).create({
        nome,
        telefone,
        ativo: true
      })

      const clienteSalvo = await queryRunner.manager.save(ClienteDG, novoCliente)

      // Se forneceu endereço, criar o primeiro endereço
      if (endereco && bairro && cidade && estado) {
        const novoEndereco = dataSource.getRepository(EnderecoDG).create({
          clienteId: clienteSalvo.id,
          cep,
          endereco,
          bairro,
          cidade,
          estado,
          complemento,
          referencia,
          ativo: true
        })

        await queryRunner.manager.save(EnderecoDG, novoEndereco)
      }

      // Commit da transação
      await queryRunner.commitTransaction()

      return NextResponse.json({
        cliente: clienteSalvo,
        message: 'Cliente criado com sucesso'
      })
    } catch (error) {
      // Rollback em caso de erro
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  } catch (error) {
    console.error('Erro ao criar cliente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 