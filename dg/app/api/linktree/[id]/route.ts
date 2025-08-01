import { NextRequest, NextResponse } from 'next/server'
import { getDataSource, initializeDB } from '@/src/lib/db'
import { LinkTree } from '@/src/entities/LinkTree'
import { LinkTreeLink } from '@/src/entities/LinkTreeLink'

let dataSource: any

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    dataSource = await initializeDB()

    const linkTreeRepository = await dataSource.getRepository(LinkTree)
    const linkRepository = await dataSource.getRepository(LinkTreeLink)
    
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'ID ou código é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se é um ID numérico ou código
    const isNumericId = !isNaN(Number(id)) && Number.isInteger(Number(id))
    
    let linkTree
    if (isNumericId) {
      // Buscar por ID numérico
      linkTree = await linkTreeRepository.findOne({
        where: { id: parseInt(id) }
      })
    } else {
      // Buscar por código
      linkTree = await linkTreeRepository.findOne({
        where: { code: id, isActive: true }
      })
    }

    if (!linkTree) {
      return NextResponse.json(
        { error: 'LinkTree não encontrado' },
        { status: 404 }
      )
    }

    // Buscar os links do LinkTree
    const links = await linkRepository.find({
      where: { linkTreeId: linkTree.id },
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
    console.error('Erro ao buscar LinkTree:', error)
    
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    dataSource = await initializeDB()
    
    const { id } = params
    const body = await request.json()
    const { name, description, imageUrl, backgroundColor, textColor, accentColor, backgroundEffect, links, userId } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID ou código é obrigatório' },
        { status: 400 }
      )
    }

    if (!name || !userId || !links || !Array.isArray(links)) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      )
    }

    // Verificar se é um ID numérico ou código
    const isNumericId = !isNaN(Number(id)) && Number.isInteger(Number(id))
    
    const linkTreeRepository = dataSource.getRepository(LinkTree)
    const linkRepository = dataSource.getRepository(LinkTreeLink)

    // Verificar se o LinkTree existe e pertence ao usuário
    let existingLinkTree
    if (isNumericId) {
      existingLinkTree = await linkTreeRepository.findOne({
        where: { id: parseInt(id), userId: parseInt(userId) }
      })
    } else {
      existingLinkTree = await linkTreeRepository.findOne({
        where: { code: id, userId: parseInt(userId) }
      })
    }

    if (!existingLinkTree) {
      return NextResponse.json(
        { error: 'LinkTree não encontrado ou não autorizado' },
        { status: 404 }
      )
    }

    // Atualizar o LinkTree
    existingLinkTree.name = name
    existingLinkTree.description = description
    existingLinkTree.imageUrl = imageUrl || null
    existingLinkTree.backgroundColor = backgroundColor || existingLinkTree.backgroundColor
    existingLinkTree.textColor = textColor || existingLinkTree.textColor
    existingLinkTree.accentColor = accentColor || existingLinkTree.accentColor
    existingLinkTree.backgroundEffect = backgroundEffect || existingLinkTree.backgroundEffect
    await linkTreeRepository.save(existingLinkTree)

    // Remover links existentes
    await linkRepository.delete({ linkTreeId: existingLinkTree.id })

    // Criar os novos links
    const linkPromises = links.map((link: any, index: number) => {
      return linkRepository.save(
        linkRepository.create({
          title: link.title,
          url: link.url,
          icon: link.icon || '🔗',
          imageUrl: link.imageUrl || null,
          isActive: link.isActive !== false,
          position: index + 1,
          linkTreeId: existingLinkTree.id
        })
      )
    })

    await Promise.all(linkPromises)

    return NextResponse.json({
      message: 'LinkTree atualizado com sucesso'
    })

  } catch (error: any) {
    console.error('Erro ao atualizar LinkTree:', error)
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    dataSource = await initializeDB()
    
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'ID ou código é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se é um ID numérico ou código
    const isNumericId = !isNaN(Number(id)) && Number.isInteger(Number(id))
    
    const linkTreeRepository = await dataSource.getRepository(LinkTree)

    let linkTree
    if (isNumericId) {
      linkTree = await linkTreeRepository.findOne({
        where: { id: parseInt(id) }
      })
    } else {
      linkTree = await linkTreeRepository.findOne({
        where: { code: id }
      })
    }

    if (!linkTree) {
      return NextResponse.json(
        { error: 'LinkTree não encontrado' },
        { status: 404 }
      )
    }

    await linkTreeRepository.remove(linkTree)

    return NextResponse.json({
      message: 'LinkTree excluído com sucesso'
    })

  } catch (error: any) {
    console.error('Erro ao excluir LinkTree:', error)
    
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