import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { getDataSource } from "@/src/lib/db"
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { AgendaItem } from "@/src/entities/AgendaItem"
import { User } from "@/src/entities/User"

// GET - Buscar item específico da agenda
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const agendaItem = await agendaRepository.findOne({
      where: { 
        id: parseInt(params.id),
        userId: user.id 
      }
    })

    if (!agendaItem) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ agendaItem })
  } catch (error) {
    console.error('Erro ao buscar item da agenda:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar item da agenda
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Buscar item existente
    const existingItem = await agendaRepository.findOne({
      where: { 
        id: parseInt(params.id),
        userId: user.id 
      }
    })

    if (!existingItem) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })
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

    // Atualizar item
    Object.assign(existingItem, {
      ...data,
      updatedAt: new Date()
    })

    const updatedItem = await agendaRepository.save(existingItem)

    return NextResponse.json({ 
      message: 'Item atualizado com sucesso',
      agendaItem: updatedItem
    })
  } catch (error) {
    console.error('Erro ao atualizar item da agenda:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir item da agenda
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Buscar item existente
    const existingItem = await agendaRepository.findOne({
      where: { 
        id: parseInt(params.id),
        userId: user.id 
      }
    })

    if (!existingItem) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })
    }

    // Excluir item
    await agendaRepository.remove(existingItem)

    return NextResponse.json({ 
      message: 'Item excluído com sucesso'
    })
  } catch (error) {
    console.error('Erro ao excluir item da agenda:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 