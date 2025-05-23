export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { HeaderOrcamento } from '../../../../src/entities/HeaderOrcamento'
import { FooterOrcamento } from '../../../../src/entities/FooterOrcamento'
import { User } from '../../../../src/entities/User'
import { initializeDB } from '@/src/lib/db'

export async function GET(request: Request) {
  let dataSource;
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ error: 'Usuário não fornecido' }, { status: 400 })
    }

    dataSource = await initializeDB()
    const headerRepo = dataSource.getRepository(HeaderOrcamento)
    const footerRepo = dataSource.getRepository(FooterOrcamento)
    const header = await headerRepo.findOne({ where: { user: { id: Number(userId) } } })
    const footer = await footerRepo.findOne({ where: { user: { id: Number(userId) } } })
    return NextResponse.json({ header, footer })
  } catch (error) {
    console.error('Erro ao buscar header/footer:', error)
    return NextResponse.json({ error: 'Erro ao buscar header/footer' }, { status: 500 })
  } finally {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy()
    }
  }
}

export async function PUT(request: Request) {
  let dataSource;
  try {
    const body = await request.json()
    const { userId, header, footer } = body
    if (!userId || !header || !footer) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }
    dataSource = await initializeDB()
    const userRepo = dataSource.getRepository(User)
    const headerRepo = dataSource.getRepository(HeaderOrcamento)
    const footerRepo = dataSource.getRepository(FooterOrcamento)
    const user = await userRepo.findOne({ where: { id: Number(userId) } })
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }
    // Atualizar Header
    let headerEntity = await headerRepo.findOne({ where: { user: { id: user.id } } })
    if (headerEntity) {
      Object.assign(headerEntity, header)
      headerEntity.user = user
      await headerRepo.save(headerEntity)
    } else {
      headerEntity = headerRepo.create({ ...header, user })
      await headerRepo.save(headerEntity)
    }
    // Atualizar Footer
    let footerEntity = await footerRepo.findOne({ where: { user: { id: user.id } } })
    if (footerEntity) {
      Object.assign(footerEntity, footer)
      footerEntity.user = user
      await footerRepo.save(footerEntity)
    } else {
      footerEntity = footerRepo.create({ ...footer, user })
      await footerRepo.save(footerEntity)
    }
    return NextResponse.json({ header: headerEntity, footer: footerEntity })
  } catch (error) {
    console.error('Erro ao atualizar header/footer:', error)
    return NextResponse.json({ error: 'Erro ao atualizar header/footer' }, { status: 500 })
  } finally {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy()
    }
  }
}

export async function POST(request: Request) {
  let dataSource;
  try {
    const body = await request.json()
    const { userId, header, footer } = body
    if (!userId || !header || !footer) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }
    dataSource = await initializeDB()
    const userRepo = dataSource.getRepository(User)
    const headerRepo = dataSource.getRepository(HeaderOrcamento)
    const footerRepo = dataSource.getRepository(FooterOrcamento)
    const user = await userRepo.findOne({ where: { id: Number(userId) } })
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }
    // Salvar ou atualizar Header
    let headerEntity = await headerRepo.findOne({ where: { user: { id: user.id } } })
    if (headerEntity) {
      Object.assign(headerEntity, header)
      headerEntity.user = user
      await headerRepo.save(headerEntity)
    } else {
      headerEntity = headerRepo.create({ ...header, user })
      await headerRepo.save(headerEntity)
    }
    // Salvar ou atualizar Footer
    let footerEntity = await footerRepo.findOne({ where: { user: { id: user.id } } })
    if (!footerEntity) {
      const createdFooter = footerRepo.create({ ...footer, user })
      await footerRepo.save(createdFooter)
      footerEntity = createdFooter
    } else {
      Object.assign(footerEntity, footer)
      footerEntity.user = user
      await footerRepo.save(footerEntity)
    }
    return NextResponse.json({ header: headerEntity, footer: footerEntity })
  } catch (error) {
    console.error('Erro ao salvar header/footer:', error)
    return NextResponse.json({ error: 'Erro ao salvar header/footer' }, { status: 500 })
  } finally {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy()
    }
  }
} 