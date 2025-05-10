import { NextResponse } from 'next/server'
import { Orcamento } from '../../../src/entities/Orcamento'
import { ItemOrcamento } from '../../../src/entities/ItemOrcamento'
import { AppDataSource } from '../../../src/lib/db'
import { HeaderOrcamento } from '../../../src/entities/HeaderOrcamento'
import { FooterOrcamento } from '../../../src/entities/FooterOrcamento'
import { User } from '../../../src/entities/User'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'Usuário não fornecido' }, { status: 400 })
    }

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    const orcamentoRepository = AppDataSource.getRepository(Orcamento)
    const headerRepo = AppDataSource.getRepository(HeaderOrcamento)
    const footerRepo = AppDataSource.getRepository(FooterOrcamento)

    const orcamentos = await orcamentoRepository.find({
      where: { user: { id: Number(userId) } },
      relations: ['cliente', 'itens'],
      order: { createdAt: 'DESC' }
    })

    const header = await headerRepo.findOne({ where: { user: { id: Number(userId) } } })
    const footer = await footerRepo.findOne({ where: { user: { id: Number(userId) } } })

    return NextResponse.json({ orcamentos, header, footer })
  } catch (error) {
    console.error('Erro ao buscar orçamentos:', error)
    return NextResponse.json({ error: 'Erro ao buscar orçamentos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    const orcamentoRepository = AppDataSource.getRepository(Orcamento)
    const itemOrcamentoRepository = AppDataSource.getRepository(ItemOrcamento)

    // Criar o orçamento
    const orcamento = orcamentoRepository.create({
      numero: body.numero,
      codigo: body.codigo,
      cliente: { id: body.clienteId },
      user: { id: body.userId },
      dataValidade: new Date(body.dataValidade),
      valorTotal: body.valorTotal,
      observacoes: body.observacoes,
      status: body.status
    })

    const savedOrcamento = await orcamentoRepository.save(orcamento)

    // Criar os itens do orçamento
    const itens = body.itens.map((item: any) => ({
      descricao: item.descricao,
      quantidade: item.quantidade,
      valorUnitario: item.valorUnitario,
      valorTotal: item.valorTotal,
      observacoes: item.observacoes,
      orcamento: { id: savedOrcamento.id }
    }))

    await itemOrcamentoRepository.save(itens)

    return NextResponse.json({ orcamento: savedOrcamento })
  } catch (error) {
    console.error('Erro ao criar orçamento:', error)
    return NextResponse.json({ error: 'Erro ao criar orçamento' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { userId, header, footer } = body
    if (!userId || !header || !footer) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    const userRepo = AppDataSource.getRepository(User)
    const headerRepo = AppDataSource.getRepository(HeaderOrcamento)
    const footerRepo = AppDataSource.getRepository(FooterOrcamento)
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
    }
    // Atualizar Footer
    let footerEntity = await footerRepo.findOne({ where: { user: { id: user.id } } })
    if (footerEntity) {
      Object.assign(footerEntity, footer)
      footerEntity.user = user
      await footerRepo.save(footerEntity)
    }
    return NextResponse.json({ header: headerEntity, footer: footerEntity })
  } catch (error) {
    console.error('Erro ao atualizar header/footer:', error)
    return NextResponse.json({ error: 'Erro ao atualizar header/footer' }, { status: 500 })
  }
} 