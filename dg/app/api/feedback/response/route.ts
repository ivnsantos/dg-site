import { NextRequest, NextResponse } from 'next/server'
import { getDataSource } from '@/src/lib/db'
import { Feedback, FeedbackStatus } from '@/src/entities/Feedback'
import { FeedbackResponse } from '@/src/entities/FeedbackResponse'

export async function POST(request: NextRequest) {
  try {
    const dataSource = await getDataSource()
    const { feedbackCode, selectedOption, textResponse, clientName, clientEmail } = await request.json()

    // Validações
    if (!feedbackCode) {
      return NextResponse.json({ error: 'Código do questionário é obrigatório' }, { status: 400 })
    }

    if (!selectedOption) {
      return NextResponse.json({ error: 'Opção selecionada é obrigatória' }, { status: 400 })
    }

    // Buscar questionário
    const feedback = await dataSource
      .getRepository(Feedback)
      .findOne({
        where: { code: feedbackCode, status: FeedbackStatus.ACTIVE }
      })

    if (!feedback) {
      return NextResponse.json({ error: 'Questionário não encontrado ou inativo' }, { status: 404 })
    }

    // Verificar se a opção selecionada é válida
    if (!feedback.options.includes(selectedOption)) {
      return NextResponse.json({ error: 'Opção selecionada inválida' }, { status: 400 })
    }

    // Criar resposta
    const response = new FeedbackResponse()
    response.feedbackId = feedback.id
    response.selectedOption = selectedOption
    response.textResponse = textResponse?.trim() || null
    response.clientName = clientName?.trim() || null

    await dataSource.getRepository(FeedbackResponse).save(response)

    return NextResponse.json({
      message: 'Resposta enviada com sucesso',
      response: {
        id: response.id,
        selectedOption: response.selectedOption,
        createdAt: response.createdAt
      }
    })

  } catch (error: any) {
    console.error('Erro ao salvar resposta:', error)
    
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