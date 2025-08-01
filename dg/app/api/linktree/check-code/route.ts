import { NextRequest, NextResponse } from 'next/server'
import { initializeDB } from '@/src/lib/db'
import { LinkTree } from '@/src/entities/LinkTree'

let dataSource: any

export async function POST(request: NextRequest) {
  try {
    dataSource = await initializeDB()
    
    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json(
        { error: 'Código é obrigatório' },
        { status: 400 }
      )
    }

    // Validar formato do código (apenas letras, números e hífens)
    const codeRegex = /^[a-zA-Z0-9-]+$/
    if (!codeRegex.test(code)) {
      return NextResponse.json(
        { error: 'Código deve conter apenas letras, números e hífens' },
        { status: 400 }
      )
    }

    const linkTreeRepository = await dataSource.getRepository(LinkTree)

    // Verificar se o código já existe
    const existingLinkTree = await linkTreeRepository.findOne({
      where: { code }
    })

    return NextResponse.json({
      available: !existingLinkTree,
      message: existingLinkTree ? 'Código já existe' : 'Código disponível'
    })

  } catch (error: any) {
    console.error('Erro ao verificar código:', error)
    
    if (error.message?.includes('Driver not Connected') || error.message?.includes('Connection terminated')) {
      return NextResponse.json(
        { error: 'Erro de conexão com o banco de dados', code: 'DB_CONNECTION_ERROR' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    if (dataSource) {
      try {
        await dataSource.destroy()
      } catch (error) {
        console.warn('Erro ao destruir conexão:', error)
      }
    }
  }
} 