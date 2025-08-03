import { NextRequest, NextResponse } from 'next/server'
import { getDataSource } from '@/src/lib/db'
import { Feedback, FeedbackStatus } from '@/src/entities/Feedback'

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const dataSource = await getDataSource()
    const { code } = params

    if (!code) {
      return NextResponse.json({ error: 'Código não fornecido' }, { status: 400 })
    }

    // Buscar questionário por código
    const feedback = await dataSource
      .getRepository(Feedback)
      .findOne({
        where: { code, status: FeedbackStatus.ACTIVE }
      })

    if (!feedback) {
      return NextResponse.json({ error: 'Questionário não encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      feedback: {
        id: feedback.id,
        title: feedback.title,
        question: feedback.question,
        description: feedback.description,
        logoUrl: feedback.logoUrl,
        primaryColor: feedback.primaryColor,
        secondaryColor: feedback.secondaryColor,
        options: feedback.options,
        status: feedback.status
      }
    })

  } catch (error: any) {
    console.error('Erro ao buscar questionário público:', error)
    
    // Verificar se é erro de conexão com banco
    if (error.message?.includes('Driver not Connected') || error.message?.includes('Connection terminated')) {
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