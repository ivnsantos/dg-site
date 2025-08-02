import { NextRequest, NextResponse } from 'next/server'
import { initializeDB } from '@/src/lib/db'
import { Menu } from '@/src/entities/Menu'
import { MenuSection } from '@/src/entities/MenuSection'
import { MenuItem } from '@/src/entities/MenuItem'
import { User } from '@/src/entities/User'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, codigo, description, template, status, telefone, instagram, imageUrl, imageUrlBackground, sections, userId } = body
    const db = await initializeDB()

    // Busca o usuário (ajuste conforme autenticação depois)
    const user = await db.getRepository(User).findOneByOrFail({ id: userId })

    // Verifica se o usuário já tem 2 menus (limite máximo)
    const existingMenusCount = await db.getRepository(Menu).count({
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

    await db.manager.save(menu)
    return NextResponse.json({ success: true, menuId: menu.id })
  } catch (error) {
    console.error('Erro ao salvar menu:', error)
    return NextResponse.json({ error: 'Erro ao salvar menu' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const db = await initializeDB()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ menus: [] })
    }
    const menus = await db.getRepository(Menu).find({
      where: { user: { id: Number(userId) } },
      order: { createdAt: 'DESC' },
    })
    const result = menus.map(menu => ({
      id: menu.id,
      name: menu.name,
      codigo: menu.codigo,
      status: menu.status,
      imageUrl: menu.imageUrl,
    }))
    return NextResponse.json({ menus: result })
  } catch (error) {
    console.error('Erro ao buscar menus:', error)
    return NextResponse.json({ menus: [] }, { status: 500 })
  }
} 