import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getDataSource } from '@/src/lib/db'
import { Cliente } from '@/src/entities/Cliente'
import { User } from '@/src/entities/User'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ error: 'Usuário não fornecido' }, { status: 400 })
    }

    const dataSource = await getDataSource()
    const clienteRepository = dataSource.getRepository(Cliente)

    const clientes = await clienteRepository.find({
      where: { user: { id: Number(userId) } },
      order: { nome: 'ASC' }
    })

    return NextResponse.json({ clientes })
  } catch (error) {
    console.error('Erro ao buscar clientes:', error)
    
    if (error instanceof Error && error.message.includes('Driver not Connected')) {
      return NextResponse.json({ 
        error: 'Erro de conexão com o banco de dados. Tente novamente em alguns segundos.',
        code: 'DB_CONNECTION_ERROR'
      }, { status: 503 })
    }
    
    return NextResponse.json({ error: 'Erro ao buscar clientes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const dataSource = await getDataSource()
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
    
    if (error instanceof Error && error.message.includes('Driver not Connected')) {
      return NextResponse.json({ 
        error: 'Erro de conexão com o banco de dados. Tente novamente em alguns segundos.',
        code: 'DB_CONNECTION_ERROR'
      }, { status: 503 })
    }
    
    return NextResponse.json({ error: 'Erro ao criar cliente' }, { status: 500 })
  }
}
