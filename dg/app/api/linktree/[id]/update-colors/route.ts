import { NextRequest, NextResponse } from 'next/server'
import { getDataSource } from '@/src/lib/db'
import { LinkTree } from '@/src/entities/LinkTree'

let dataSource: any

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    dataSource = await getDataSource()
    
    const id = parseInt(params.id)
    const body = await request.json()
    const { backgroundColor, textColor, accentColor } = body

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      )
    }

    if (!backgroundColor || !textColor || !accentColor) {
      return NextResponse.json(
        { error: 'Todas as cores são obrigatórias' },
        { status: 400 }
      )
    }

    const linkTreeRepository = dataSource.getRepository(LinkTree)

    const linkTree = await linkTreeRepository.findOne({
      where: { id }
    })

    if (!linkTree) {
      return NextResponse.json(
        { error: 'LinkTree não encontrado' },
        { status: 404 }
      )
    }

    linkTree.backgroundColor = backgroundColor
    linkTree.textColor = textColor
    linkTree.accentColor = accentColor
    
    await linkTreeRepository.save(linkTree)

    return NextResponse.json({
      message: 'Cores atualizadas com sucesso',
      linkTree
    })

  } catch (error: any) {
    console.error('Erro ao atualizar cores do LinkTree:', error)
    
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