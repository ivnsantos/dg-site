import { NextRequest, NextResponse } from 'next/server'
import { initializeDB } from '@/src/lib/db'
import { LinkTree } from '@/src/entities/LinkTree'
import { LinkTreeLink } from '@/src/entities/LinkTreeLink'

export async function GET(request: NextRequest) {
  let dataSource: any = null
  
  try {
    dataSource = await initializeDB()
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      )
    }

    const linkTreeRepository = dataSource.getRepository(LinkTree)
    const linkRepository = dataSource.getRepository(LinkTreeLink)

    const linkTrees = await linkTreeRepository.find({
      where: { userId: parseInt(userId) },
      order: { createdAt: 'DESC' }
    })

    // Buscar links para cada LinkTree
    const linkTreesWithLinks = await Promise.all(
      linkTrees.map(async (linkTree: any) => {
        const links = await linkRepository.find({
          where: { linkTreeId: linkTree.id },
          order: { position: 'ASC' }
        })
        return {
          ...linkTree,
          links
        }
      })
    )

    return NextResponse.json({
      linkTrees: linkTreesWithLinks
    })

  } catch (error: any) {
    console.error('Erro ao buscar LinkTrees:', error)
    
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

export async function POST(request: NextRequest) {
  let dataSource: any = null
  try {
    dataSource = await initializeDB()
    const linkTreeRepository = dataSource.getRepository(LinkTree)
    const linkTreeLinkRepository = dataSource.getRepository(LinkTreeLink)

    const body = await request.json()
    const { name, description, backgroundColor, textColor, accentColor, backgroundEffect, code, imageUrl, links, userId } = body

    if (!name || !userId || !links || !Array.isArray(links) || !code) {
      return NextResponse.json(
        { error: 'Dados inválidos. Nome, código, usuário e links são obrigatórios.' },
        { status: 400 }
      )
    }

    // Validar formato do código
    const codeRegex = /^[a-zA-Z0-9-]+$/
    if (!codeRegex.test(code)) {
      return NextResponse.json(
        { error: 'Código deve conter apenas letras, números e hífens' },
        { status: 400 }
      )
    }

    // Verificar se o código já existe
    const existingLinkTree = await linkTreeRepository.findOne({
      where: { code }
    })

    if (existingLinkTree) {
      return NextResponse.json(
        { error: 'Código já existe. Escolha outro código.' },
        { status: 400 }
      )
    }

    // Verifica se o usuário já tem 2 LinkTrees (limite máximo)
    const existingLinkTreesCount = await linkTreeRepository.count({
      where: { userId: parseInt(userId) }
    })

    if (existingLinkTreesCount >= 2) {
      return NextResponse.json(
        { error: 'Você já possui o limite máximo de 2 LinkTrees. Exclua um LinkTree existente para criar um novo.' },
        { status: 400 }
      )
    }

    // Criar o LinkTree
    const linkTree = linkTreeRepository.create({
      name,
      description,
      code,
      imageUrl: imageUrl || null,
      backgroundColor: backgroundColor || '#2D1810',
      textColor: textColor || '#ffffff',
      accentColor: accentColor || '#0B7A48',
      backgroundEffect: backgroundEffect || 'none',
      userId: parseInt(userId),
      isActive: true
    })

    const savedLinkTree = await linkTreeRepository.save(linkTree)

    // Criar os links
    const linkPromises = links.map((link: any, index: number) => {
      return linkTreeLinkRepository.save(
        linkTreeLinkRepository.create({
          title: link.title,
          url: link.url,
          icon: link.icon || '🔗',
          imageUrl: link.imageUrl || null,
          isActive: link.isActive !== false,
          position: index + 1,
          linkTreeId: savedLinkTree.id
        })
      )
    })

    await Promise.all(linkPromises)

    return NextResponse.json({
      message: 'LinkTree criado com sucesso',
      linkTree: savedLinkTree
    })

  } catch (error: any) {
    console.error('Erro ao criar LinkTree:', error)
    
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