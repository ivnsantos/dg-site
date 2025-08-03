import { NextResponse } from 'next/server'
import { Orcamento } from '@/src/entities/Orcamento'
import { ItemOrcamento } from '@/src/entities/ItemOrcamento'
import { getDataSource } from '@/src/lib/db'
import { HeaderOrcamento } from '@/src/entities/HeaderOrcamento'
import { FooterOrcamento } from '@/src/entities/FooterOrcamento'
import { User } from '@/src/entities/User'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'Usuário não fornecido' }, { status: 400 })
    }

    const dataSource = await getDataSource()
    const orcamentoRepository = dataSource.getRepository(Orcamento)
    const headerRepo = dataSource.getRepository(HeaderOrcamento)
    const footerRepo = dataSource.getRepository(FooterOrcamento)

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
    
    if (error instanceof Error && error.message.includes('Driver not Connected')) {
      return NextResponse.json({ 
        error: 'Erro de conexão com o banco de dados. Tente novamente em alguns segundos.',
        code: 'DB_CONNECTION_ERROR'
      }, { status: 503 })
    }
    
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { orcamento, itens, userId } = data

    if (!userId) {
      return NextResponse.json({ error: 'Usuário não fornecido' }, { status: 400 })
    }

    const dataSource = await getDataSource()
    const orcamentoRepository = dataSource.getRepository(Orcamento)
    const itemOrcamentoRepository = dataSource.getRepository(ItemOrcamento)
    const userRepository = dataSource.getRepository(User)
    const clienteRepository = dataSource.getRepository(require('@/src/entities/Cliente').Cliente)

    const user = await userRepository.findOne({
      where: { id: Number(userId) }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Buscar o cliente pelo ID
    const cliente = await clienteRepository.findOne({ where: { id: orcamento.clienteId } })
    if (!cliente) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }

    // Criar o orçamento com o objeto cliente
    const novoOrcamento = orcamentoRepository.create({
      ...orcamento,
      user,
      cliente
    })

    const savedOrcamento = await orcamentoRepository.save(novoOrcamento)

    // Criar os itens do orçamento
    const savedItens = await Promise.all(
      itens.map(async (item: any) => {
        const novoItem = itemOrcamentoRepository.create({
          ...item,
          orcamento: savedOrcamento
        })
        return itemOrcamentoRepository.save(novoItem)
      })
    )

    return NextResponse.json({
      orcamento: savedOrcamento,
      itens: savedItens
    })
  } catch (error) {
    console.error('Erro ao criar orçamento:', error)
    
    if (error instanceof Error && error.message.includes('Driver not Connected')) {
      return NextResponse.json({ 
        error: 'Erro de conexão com o banco de dados. Tente novamente em alguns segundos.',
        code: 'DB_CONNECTION_ERROR'
      }, { status: 503 })
    }
    
    return NextResponse.json({ 
      error: 'Erro ao criar orçamento',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      code: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { userId, header, footer } = body
    if (!userId || !header || !footer) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }
    const dataSource = await getDataSource()
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
    
    if (error instanceof Error && error.message.includes('Driver not Connected')) {
      return NextResponse.json({ 
        error: 'Erro de conexão com o banco de dados. Tente novamente em alguns segundos.',
        code: 'DB_CONNECTION_ERROR'
      }, { status: 503 })
    }
    
    return NextResponse.json({ error: 'Erro ao atualizar header/footer' }, { status: 500 })
  }
} 
