import { NextResponse } from 'next/server'
import { FooterOrcamento } from '../../../../src/entities/FooterOrcamento'
import { initializeDB } from '@/src/lib/db'
import { User } from '../../../../src/entities/User'

export async function GET(request: Request) {
  let dataSource;
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'Usuário não fornecido' }, { status: 400 })
    }

    dataSource = await initializeDB()
    const footerRepository = dataSource.getRepository(FooterOrcamento)

    const footer = await footerRepository.findOne({
      where: { user: { id: Number(userId) } }
    })

    return NextResponse.json(footer)
  } catch (error) {
    console.error('Erro ao buscar rodapé:', error)
    return NextResponse.json({ error: 'Erro ao buscar rodapé' }, { status: 500 })
  } finally {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy()
    }
  }
}

export async function POST(request: Request) {
  let dataSource;
  try {
    const data = await request.json()
    const { footer, userId } = data

    if (!userId) {
      return NextResponse.json({ error: 'Usuário não fornecido' }, { status: 400 })
    }

    dataSource = await initializeDB()
    const footerRepository = dataSource.getRepository(FooterOrcamento)
    const userRepository = dataSource.getRepository(User)

    const user = await userRepository.findOne({
      where: { id: Number(userId) }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const novoFooter = footerRepository.create({
      ...footer,
      user
    })

    const savedFooter = await footerRepository.save(novoFooter)
    return NextResponse.json(savedFooter)
  } catch (error) {
    console.error('Erro ao criar rodapé:', error)
    return NextResponse.json({ error: 'Erro ao criar rodapé' }, { status: 500 })
  } finally {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy()
    }
  }
}

export async function PUT(request: Request) {
  let dataSource;
  try {
    const data = await request.json()
    const { footer, userId } = data

    if (!userId) {
      return NextResponse.json({ error: 'Usuário não fornecido' }, { status: 400 })
    }

    dataSource = await initializeDB()
    const footerRepository = dataSource.getRepository(FooterOrcamento)

    const existingFooter = await footerRepository.findOne({
      where: { user: { id: Number(userId) } }
    })

    if (!existingFooter) {
      return NextResponse.json({ error: 'Rodapé não encontrado' }, { status: 404 })
    }

    Object.assign(existingFooter, footer)
    const updatedFooter = await footerRepository.save(existingFooter)

    return NextResponse.json(updatedFooter)
  } catch (error) {
    console.error('Erro ao atualizar rodapé:', error)
    return NextResponse.json({ error: 'Erro ao atualizar rodapé' }, { status: 500 })
  } finally {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy()
    }
  }
} 