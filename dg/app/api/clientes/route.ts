export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { Cliente } from '../../../src/entities/Cliente'
import { AppDataSource } from '../../../src/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'Usuário não fornecido' }, { status: 400 })
    }

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    const clienteRepository = AppDataSource.getRepository(Cliente)

    const clientes = await clienteRepository.find({
      where: { user: { id: Number(userId) } },
      order: { nome: 'ASC' }
    })

    return NextResponse.json({ clientes })
  } catch (error) {
    console.error('Erro ao buscar clientes:', error)
    return NextResponse.json({ error: 'Erro ao buscar clientes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    const clienteRepository = AppDataSource.getRepository(Cliente)

    const cliente = clienteRepository.create({
      nome: body.nome,
      telefone: body.telefone,
      endereco: body.endereco,
      user: { id: body.userId }
    })

    const savedCliente = await clienteRepository.save(cliente)

    return NextResponse.json({ cliente: savedCliente })
  } catch (error) {
    console.error('Erro ao criar cliente:', error)
    return NextResponse.json({ error: 'Erro ao criar cliente' }, { status: 500 })
  }
} 