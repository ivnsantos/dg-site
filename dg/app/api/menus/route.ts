import { NextRequest, NextResponse } from 'next/server'
import { getDataSource } from '@/src/lib/db'
import { Menu } from '@/src/entities/Menu'
import { MenuSection } from '@/src/entities/MenuSection'
import { MenuItem } from '@/src/entities/MenuItem'
import { User } from '@/src/entities/User'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, codigo, description, template, status, telefone, instagram, imageUrl, imageUrlBackground, valorFrete, fazEntregas, sections, userId } = body
    const dataSource = await getDataSource()

    // Busca o usuário
    const user = await dataSource.getRepository(User).findOneByOrFail({ id: userId })

    // Verifica se o usuário já tem 2 menus (limite máximo)
    const existingMenusCount = await dataSource.getRepository(Menu).count({
      where: { user: { id: userId } }
    })

    if (existingMenusCount >= 2) {
      return NextResponse.json(
        { error: 'Você já possui o limite máximo de 2 menus online. Exclua um menu existente para criar um novo.' },
        { status: 400 }
      )
    }

    // Cria o menu
    const menu = new Menu()
    menu.name = name
    menu.codigo = codigo
    menu.description = description
    menu.template = template
    menu.status = status
    menu.telefone = telefone
    menu.instagram = instagram
    menu.imageUrl = imageUrl
    menu.imageUrlBackground = imageUrlBackground
    menu.valorFrete = valorFrete || 0.00
    menu.fazEntregas = fazEntregas !== undefined ? fazEntregas : true
    menu.user = user
    menu.sections = []

    // Cria as seções e itens
    for (const sectionData of sections) {
      // Remove id do payload se existir
      if ('id' in sectionData) delete sectionData.id
      const section = new MenuSection()
      section.title = sectionData.title
      section.description = sectionData.description
      section.imageUrl = sectionData.imageUrl
      section.position = sectionData.position
      section.menu = menu
      section.items = []

      for (const itemData of sectionData.items) {
        // Remove id do payload se existir
        if ('id' in itemData) delete itemData.id
        const item = new MenuItem()
        item.name = itemData.name
        item.description = itemData.description
        item.price = Number(itemData.price)
        item.available = itemData.available
        item.position = itemData.position
        item.section = section
        item.imageUrl = itemData.imageUrl
        section.items.push(item)
      }
      menu.sections.push(section)
    }

    await dataSource.manager.save(menu)
    return NextResponse.json({ success: true, menuId: menu.id })
  } catch (error) {
    console.error('Erro ao salvar menu:', error)
    
    if (error instanceof Error && error.message.includes('Driver not Connected')) {
      return NextResponse.json({ 
        error: 'Erro de conexão com o banco de dados. Tente novamente em alguns segundos.',
        code: 'DB_CONNECTION_ERROR'
      }, { status: 503 })
    }
    
    return NextResponse.json({ error: 'Erro ao salvar menu' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const dataSource = await getDataSource()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    let menus
    if (!userId) {
      // Se não houver userId, retornar todos os menus
      menus = await dataSource.getRepository(Menu).find({
        order: { createdAt: 'DESC' },
        relations: ['user']
      })
    } else {
      // Se houver userId, filtrar por usuário
      menus = await dataSource.getRepository(Menu).find({
        where: { user: { id: Number(userId) } },
        order: { createdAt: 'DESC' },
        relations: ['user']
      })
    }
    
    const result = menus.map(menu => ({
      id: menu.id,
      name: menu.name,
      codigo: menu.codigo,
      status: menu.status,
      imageUrl: menu.imageUrl,
    }))
    
    return NextResponse.json({ 
      success: true,
      menus: result,
      total: menus.length
    })
  } catch (error) {
    console.error('Erro ao buscar menus:', error)
    
    if (error instanceof Error && error.message.includes('Driver not Connected')) {
      return NextResponse.json({ 
        error: 'Erro de conexão com o banco de dados. Tente novamente em alguns segundos.',
        code: 'DB_CONNECTION_ERROR'
      }, { status: 503 })
    }
    
    return NextResponse.json({ 
      success: false,
      menus: [],
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
} 
