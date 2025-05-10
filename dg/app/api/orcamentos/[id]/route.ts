import { NextResponse } from 'next/server'
import { Orcamento } from '../../../../src/entities/Orcamento'
import { ItemOrcamento } from '../../../../src/entities/ItemOrcamento'
import { AppDataSource } from '../../../../src/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    const orcamentoRepository = AppDataSource.getRepository(Orcamento)

    const orcamento = await orcamentoRepository.findOne({
      where: { id: Number(params.id) },
      relations: ['cliente', 'itens']
    })

    if (!orcamento) {
      return NextResponse.json({ error: 'Orçamento não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ orcamento })
  } catch (error) {
    console.error('Erro ao buscar orçamento:', error)
    return NextResponse.json({ error: 'Erro ao buscar orçamento' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    const orcamentoRepository = AppDataSource.getRepository(Orcamento)
    const itemOrcamentoRepository = AppDataSource.getRepository(ItemOrcamento)

    // Atualizar o orçamento
    const orcamento = await orcamentoRepository.findOne({
      where: { id: Number(params.id) },
      relations: ['itens']
    })

    if (!orcamento) {
      return NextResponse.json({ error: 'Orçamento não encontrado' }, { status: 404 })
    }

    orcamento.numero = body.numero
    orcamento.codigo = body.codigo
    orcamento.cliente = body.clienteId
    orcamento.dataValidade = new Date(body.dataValidade)
    orcamento.valorTotal = body.valorTotal
    orcamento.observacoes = body.observacoes
    orcamento.status = body.status

    const updatedOrcamento = await orcamentoRepository.save(orcamento)

    // Remover itens antigos
    await itemOrcamentoRepository.remove(orcamento.itens)

    // Criar novos itens
    const itens = body.itens.map((item: any) => ({
      descricao: item.descricao,
      quantidade: item.quantidade,
      valorUnitario: item.valorUnitario,
      valorTotal: item.valorTotal,
      observacoes: item.observacoes,
      orcamento: { id: updatedOrcamento.id }
    }))

    await itemOrcamentoRepository.save(itens)

    return NextResponse.json({ orcamento: updatedOrcamento })
  } catch (error) {
    console.error('Erro ao atualizar orçamento:', error)
    return NextResponse.json({ error: 'Erro ao atualizar orçamento' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    const orcamentoRepository = AppDataSource.getRepository(Orcamento)

    const orcamento = await orcamentoRepository.findOne({
      where: { id: Number(params.id) }
    })

    if (!orcamento) {
      return NextResponse.json({ error: 'Orçamento não encontrado' }, { status: 404 })
    }

    await orcamentoRepository.remove(orcamento)

    return NextResponse.json({ message: 'Orçamento removido com sucesso' })
  } catch (error) {
    console.error('Erro ao remover orçamento:', error)
    return NextResponse.json({ error: 'Erro ao remover orçamento' }, { status: 500 })
  }
} 