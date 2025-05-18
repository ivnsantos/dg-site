import { NextResponse } from 'next/server'
import { HeaderOrcamento } from '../../../../src/entities/HeaderOrcamento'
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
    const headerRepository = dataSource.getRepository(HeaderOrcamento)

    const header = await headerRepository.findOne({
      where: { user: { id: Number(userId) } }
    })

    return NextResponse.json(header)
  } catch (error) {
    console.error('Erro ao buscar cabeçalho:', error)
    return NextResponse.json({ error: 'Erro ao buscar cabeçalho' }, { status: 500 })
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
    const { header, userId } = data

    if (!userId) {
      return NextResponse.json({ error: 'Usuário não fornecido' }, { status: 400 })
    }

    dataSource = await initializeDB()
    const headerRepository = dataSource.getRepository(HeaderOrcamento)
    const userRepository = dataSource.getRepository(User)

    const user = await userRepository.findOne({
      where: { id: Number(userId) }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const novoHeader = headerRepository.create({
      ...header,
      user
    })

    const savedHeader = await headerRepository.save(novoHeader)
    return NextResponse.json(savedHeader)
  } catch (error) {
    console.error('Erro ao criar cabeçalho:', error)
    return NextResponse.json({ error: 'Erro ao criar cabeçalho' }, { status: 500 })
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
    const { header, userId } = data

    if (!userId) {
      return NextResponse.json({ error: 'Usuário não fornecido' }, { status: 400 })
    }

    dataSource = await initializeDB()
    const headerRepository = dataSource.getRepository(HeaderOrcamento)

    const existingHeader = await headerRepository.findOne({
      where: { user: { id: Number(userId) } }
    })

    if (!existingHeader) {
      return NextResponse.json({ error: 'Cabeçalho não encontrado' }, { status: 404 })
    }

    Object.assign(existingHeader, header)
    const updatedHeader = await headerRepository.save(existingHeader)

    return NextResponse.json(updatedHeader)
  } catch (error) {
    console.error('Erro ao atualizar cabeçalho:', error)
    return NextResponse.json({ error: 'Erro ao atualizar cabeçalho' }, { status: 500 })
  } finally {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy()
    }
  }
} 