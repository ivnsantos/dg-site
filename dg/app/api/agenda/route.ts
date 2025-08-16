import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { getDataSource } from "@/src/lib/db"
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { AgendaItem } from "@/src/entities/AgendaItem"
import { User } from "@/src/entities/User"

// GET - Buscar todos os itens da agenda do usuário
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const dataSource = await getDataSource()
    const agendaRepository = dataSource.getRepository(AgendaItem)
    const userRepository = dataSource.getRepository(User)

    const user = await userRepository.findOne({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Buscar todos os itens da agenda do usuário
    const agendaItems = await agendaRepository.find({
      where: { userId: user.id },
      order: { 
        startDate: 'ASC',
        createdAt: 'DESC'
      }
    })

    return NextResponse.json({ agendaItems })
  } catch (error) {
    console.error('Erro ao buscar itens da agenda:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo item na agenda
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const data = await request.json()
    const dataSource = await getDataSource()
    const agendaRepository = dataSource.getRepository(AgendaItem)
    const userRepository = dataSource.getRepository(User)

    const user = await userRepository.findOne({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Validar dados obrigatórios
    if (!data.title || !data.startDate || !data.endDate) {
      return NextResponse.json(
        { error: 'Título, data inicial e data final são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar se a data final não é anterior à inicial
    if (new Date(data.endDate) < new Date(data.startDate)) {
      return NextResponse.json(
        { error: 'A data final não pode ser anterior à data inicial' },
        { status: 400 }
      )
    }

    // Criar novo item na agenda
    const newAgendaItem = agendaRepository.create({
      ...data,
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const savedItem = await agendaRepository.save(newAgendaItem)

    return NextResponse.json({ 
      message: 'Item criado com sucesso',
      agendaItem: savedItem
    })
  } catch (error) {
    console.error('Erro ao criar item na agenda:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 