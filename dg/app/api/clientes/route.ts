export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth'
import { initializeDB } from '@/src/lib/db'
import { Cliente } from '../../../src/entities/Cliente'
import { User } from '../../../src/entities/User'

export async function GET(request: Request) {
  let dataSource;
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ error: 'Usuário não fornecido' }, { status: 400 })
    }

    dataSource = await initializeDB()
    const clienteRepository = dataSource.getRepository(Cliente)

    const clientes = await clienteRepository.find({
      where: { user: { id: Number(userId) } },
      order: { nome: 'ASC' }
    })

    return NextResponse.json({ clientes })
  } catch (error) {
    console.error('Erro ao buscar clientes:', error)
    return NextResponse.json({ error: 'Erro ao buscar clientes' }, { status: 500 })
  } finally {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy()
    }
  }
}

export async function POST(request: Request) {
  let dataSource;
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    dataSource = await initializeDB()
    const clienteRepository = dataSource.getRepository(Cliente)
    const userRepository = dataSource.getRepository(User)

    const user = await userRepository.findOne({
      where: { id: Number(session.user.id) }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const data = await request.json()
    const cliente = clienteRepository.create({
      ...data,
      user
    })

    await clienteRepository.save(cliente)
    return NextResponse.json(cliente)
  } catch (error) {
    console.error('Erro ao criar cliente:', error)
    return NextResponse.json({ error: 'Erro ao criar cliente' }, { status: 500 })
  } finally {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy()
    }
  }
} 