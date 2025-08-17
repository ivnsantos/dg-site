import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getDataSource } from '@/src/lib/db'
import { Feedback } from '@/src/entities/Feedback'
import { FeedbackResponse } from '@/src/entities/FeedbackResponse'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const dataSource = await getDataSource()
    const feedbackId = parseInt(params.id)

    if (isNaN(feedbackId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    // Verificar se o questionário existe e pertence ao usuário
    const feedback = await dataSource
      .getRepository(Feedback)
      .findOne({
        where: { id: feedbackId, user: { id: session.user.id } }
      })

    if (!feedback) {
      return NextResponse.json({ error: 'Questionário não encontrado' }, { status: 404 })
    }

    // Deletar respostas primeiro
    await dataSource
      .getRepository(FeedbackResponse)
      .delete({ feedbackId })

    // Deletar o questionário
    await dataSource
      .getRepository(Feedback)
      .delete({ id: feedbackId })

    return NextResponse.json({ message: 'Questionário excluído com sucesso' })

  } catch (error: any) {
    console.error('Erro ao excluir questionário:', error)
    
    // Verificar se é erro de conexão com banco
    if (error.message?.includes('Driver not Connected')) {
      return NextResponse.json(
        { error: 'Erro de conexão com banco de dados' },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const dataSource = await getDataSource()
    const feedbackId = parseInt(params.id)

    if (isNaN(feedbackId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    // Buscar questionário com respostas
    const feedback = await dataSource
      .getRepository(Feedback)
      .findOne({
        where: { id: feedbackId, user: { id: session.user.id } },
        relations: ['feedbackResponses']
      })

    if (!feedback) {
      return NextResponse.json({ error: 'Questionário não encontrado' }, { status: 404 })
    }

    // Calcular estatísticas das respostas
    const optionStats: { [key: string]: number } = {}
    feedback.options.forEach(option => {
      optionStats[option] = 0
    })

    feedback.feedbackResponses?.forEach(response => {
      if (optionStats.hasOwnProperty(response.selectedOption)) {
        optionStats[response.selectedOption]++
      }
    })

    const responseStats = Object.entries(optionStats).map(([option, count]) => ({
      option,
      count,
      percentage: feedback.feedbackResponses?.length ? Math.round((count / feedback.feedbackResponses.length) * 100) : 0
    }))

    return NextResponse.json({
      feedback: {
        id: feedback.id,
        title: feedback.title,
        question: feedback.question,
        description: feedback.description,
        code: feedback.code,
        status: feedback.status,
        options: feedback.options,
        createdAt: feedback.createdAt,
        responses: feedback.feedbackResponses?.map(response => ({
          id: response.id,
          selectedOption: response.selectedOption,
          textResponse: response.textResponse,
          clientName: response.clientName,
          clientEmail: response.clientEmail,
          createdAt: response.createdAt
        })) || [],
        stats: responseStats,
        totalResponses: feedback.feedbackResponses?.length || 0
      }
    })

  } catch (error: any) {
    console.error('Erro ao buscar questionário:', error)
    
    // Verificar se é erro de conexão com banco
    if (error.message?.includes('Driver not Connected')) {
      return NextResponse.json(
        { error: 'Erro de conexão com banco de dados' },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 