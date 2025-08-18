import { NextRequest, NextResponse } from 'next/server'
import { initializeDB } from '@/src/lib/db'
import { Menu } from '@/src/entities/Menu'
import { MenuSection } from '@/src/entities/MenuSection'
import { MenuItem } from '@/src/entities/MenuItem'
import { User } from '@/src/entities/User'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await initializeDB()
    const menu = await db.getRepository(Menu).findOne({
      where: { id: Number(params.id) },
      relations: ['sections', 'sections.items', 'user'],
    })
    if (!menu) return NextResponse.json({ error: 'Menu não encontrado' }, { status: 404 })
    return NextResponse.json({ success: true, menu })
  } catch (error) {
    console.error('ERRO AO BUSCAR MENU:', error)
    return NextResponse.json({ error: 'Erro ao buscar menu', detalhe: String(error) }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await initializeDB()
    const body = await request.json()
    console.log('Body recebido no PUT:', body)
    const menuRepo = db.getRepository(Menu)
    let menu = await menuRepo.findOne({ where: { id: Number(params.id) }, relations: ['sections', 'sections.items'] })
    if (!menu) return NextResponse.json({ error: 'Menu não encontrado' }, { status: 404 })
    // Remove seções e itens antigos
    const sectionRepo = db.getRepository(MenuSection)
    await sectionRepo.delete({ menu: { id: menu.id } })

    // Adiciona as novas seções e itens
    menu.sections = []
    for (const sectionData of body.sections) {
      if ('id' in sectionData) delete sectionData.id
      const section = new MenuSection()
      section.title = sectionData.name || sectionData.title || ''
      section.description = sectionData.description || ''
      section.imageUrl = sectionData.imageUrl || ''
      section.position = sectionData.position || 1
      section.menu = menu
      section.items = []
      for (const itemData of sectionData.items) {
        if ('id' in itemData) delete itemData.id
        const item = new MenuItem()
        item.name = itemData.name || ''
        item.description = itemData.description || ''
        item.price = Number(itemData.price) || 0
        item.available = itemData.available !== undefined ? itemData.available : true
        item.position = itemData.position || 1
        item.section = section
        item.imageUrl = itemData.imageUrl || ''
        section.items.push(item)
      }
      menu.sections.push(section)
    }
    menu.name = body.name || ''
    menu.codigo = body.codigo || ''
    menu.description = body.description || ''
    menu.template = body.template || 'default'
    menu.status = body.status || 'Ativo'
    menu.valorFrete = body.valorFrete || 0.00
    menu.fazEntregas = body.fazEntregas !== undefined ? body.fazEntregas : true
    // Sanitizar Instagram para salvar apenas o usuário
    let instagram = body.instagram || ''
    if (instagram && instagram.startsWith('http')) {
      // Extrai o usuário da URL
      const match = instagram.match(/instagram.com\/(.+?)(\/?$|\?|#)/)
      if (match && match[1]) {
        instagram = '@' + match[1].replace('/', '').replace('@', '')
      }
    } else if (instagram && !instagram.startsWith('@')) {
      instagram = '@' + instagram
    }
    // Só atualiza telefone se vier preenchido
    if (body.telefone && body.telefone.trim() !== '') {
      menu.telefone = body.telefone
    } else {
      menu.telefone = menu.telefone || ''
    }
    menu.instagram = instagram
    menu.imageUrl = body.imageUrl || ''
    menu.imageUrlBackground = body.imageUrlBackground || ''
    await menuRepo.save(menu)
    // Buscar o menu atualizado para retornar
    const menuAtualizado = await menuRepo.findOne({ where: { id: menu.id }, relations: ['sections', 'sections.items'] })
    return NextResponse.json({ success: true, menu: menuAtualizado })
  } catch (error) {
    console.error('ERRO AO EDITAR MENU:', error)
    return NextResponse.json({ 
      error: 'Erro ao editar menu', 
      detalhe: String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await initializeDB()
    const menuRepo = db.getRepository(Menu)
    const menu = await menuRepo.findOne({ where: { id: Number(params.id) } })
    if (!menu) return NextResponse.json({ error: 'Menu não encontrado' }, { status: 404 })
    await menuRepo.remove(menu)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao remover menu' }, { status: 500 })
  }
} 