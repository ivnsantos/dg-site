import { NextRequest, NextResponse } from 'next/server'
import { initializeDB } from '@/src/lib/db'
import { Menu } from '@/src/entities/Menu'

export async function GET(request: NextRequest, { params }: { params: { codigo: string } }) {
  try {
    const db = await initializeDB()
    const menu = await db.getRepository(Menu).findOne({
      where: { codigo: params.codigo },
      relations: ['sections', 'sections.items'],
    })

    if (!menu) {
      return NextResponse.json({ error: 'Menu não encontrado' }, { status: 404 })
    }

    // Retorna apenas os dados necessários para o menu público
    const menuPublico = {
      id: menu.id,
      name: menu.name,
      description: menu.description,
      imageUrl: menu.imageUrl,
      imageUrlBackground: menu.imageUrlBackground,
      telefone: menu.telefone,
      instagram: menu.instagram,
      template: menu.template,
      status: menu.status,
      valorFrete: menu.valorFrete,
      fazEntregas: menu.fazEntregas,
      sections: (menu.sections || []).map(section => ({
        id: section.id,
        title: section.title,
        description: section.description,
        imageUrl: section.imageUrl,
        position: section.position,
        items: (section.items || []).map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          available: item.available,
          position: item.position,
          imageUrl: item.imageUrl,
        })),
      })),
    }

    return NextResponse.json(menuPublico)
  } catch (error) {
    console.error('Erro ao buscar menu público:', error)
    return NextResponse.json({ error: 'Erro ao buscar menu' }, { status: 500 })
  }
} 