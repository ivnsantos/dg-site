import { NextRequest, NextResponse } from 'next/server'
import { initializeDB } from '@/src/lib/db'
import { LinkTree } from '@/src/entities/LinkTree'
import { LinkTreeLink } from '@/src/entities/LinkTreeLink'

let dataSource: any

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    dataSource = await initializeDB()

    const linkTreeRepository = await dataSource.getRepository(LinkTree)
    const linkRepository = await dataSource.getRepository(LinkTreeLink)
    
    const { code } = params

    if (!code) {
      return NextResponse.json(
        { error: 'Código é obrigatório' },
        { status: 400 }
      )
    }

    const linkTree = await linkTreeRepository.findOne({
      where: { code, isActive: true }
    })

    if (!linkTree) {
      return NextResponse.json(
        { error: 'LinkTree não encontrado ou inativo' },
        { status: 404 }
      )
    }

    // Buscar os links do LinkTree
    const links = await linkRepository.find({
      where: { linkTreeId: linkTree.id, isActive: true },
      order: { position: 'ASC' }
    })

    const linkTreeWithLinks = {
      ...linkTree,
      links
    }

    return NextResponse.json({
      linkTree: linkTreeWithLinks
    })

  } catch (error: any) {
    console.error('Erro ao buscar LinkTree por código:', error)
    
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