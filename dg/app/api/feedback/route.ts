import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getDataSource } from '@/src/lib/db'
import { Feedback, FeedbackStatus } from '@/src/entities/Feedback'

// Função para gerar código único
function generateUniqueCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const dataSource = await getDataSource()
    const { title, question, description, logoUrl, primaryColor, secondaryColor, options } = await request.json()

    // Validações
    if (!title?.trim()) {
      return NextResponse.json({ error: 'Título é obrigatório' }, { status: 400 })
    }

    if (!question?.trim()) {
      return NextResponse.json({ error: 'Pergunta é obrigatória' }, { status: 400 })
    }

    if (!Array.isArray(options) || options.length < 2) {
      return NextResponse.json({ error: 'Adicione pelo menos 2 opções de resposta' }, { status: 400 })
    }

    const validOptions = options.filter(option => option.trim() !== '')
    if (validOptions.length < 2) {
      return NextResponse.json({ error: 'Adicione pelo menos 2 opções válidas' }, { status: 400 })
    }

    // Gerar código único
    let code: string
    let isUnique = false
    let attempts = 0

    while (!isUnique && attempts < 10) {
      code = generateUniqueCode()
      const existingFeedback = await dataSource
        .getRepository(Feedback)
        .findOne({ where: { code } })
      
      if (!existingFeedback) {
        isUnique = true
      }
      attempts++
    }

    if (!isUnique) {
      return NextResponse.json({ error: 'Erro ao gerar código único' }, { status: 500 })
    }

    // Criar questionário
    const feedback = new Feedback()
    feedback.title = title.trim()
    feedback.question = question.trim()
    feedback.description = description?.trim() || null
    feedback.logoUrl = logoUrl?.trim() || null
    feedback.primaryColor = primaryColor?.trim() || null
    feedback.secondaryColor = secondaryColor?.trim() || null
    feedback.options = validOptions
    feedback.code = code!
    feedback.status = FeedbackStatus.ACTIVE
    feedback.userId = parseInt(session.user.id)

    await dataSource.getRepository(Feedback).save(feedback)

    return NextResponse.json({
      message: 'Questionário criado com sucesso',
      feedback: {
        id: feedback.id,
        title: feedback.title,
        code: feedback.code,
        createdAt: feedback.createdAt
      }
    })

  } catch (error: any) {
    console.error('Erro ao criar questionário:', error)
    
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

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const dataSource = await getDataSource()
    
    const feedbacks = await dataSource
      .getRepository(Feedback)
      .find({
        where: { userId: parseInt(session.user.id) },
        relations: ['responses'],
        order: { createdAt: 'DESC' }
      })

    const feedbacksWithStats = feedbacks.map((feedback: Feedback) => ({
      id: feedback.id,
      title: feedback.title,
      question: feedback.question,
      description: feedback.description,
      logoUrl: feedback.logoUrl,
      code: feedback.code,
      status: feedback.status,
      createdAt: feedback.createdAt,
      responsesCount: feedback.responses?.length || 0
    }))

    return NextResponse.json({ feedbacks: feedbacksWithStats })

  } catch (error: any) {
    console.error('Erro ao buscar questionários:', error)
    
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
