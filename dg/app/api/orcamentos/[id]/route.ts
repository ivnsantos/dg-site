export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { Orcamento } from '../../../../src/entities/Orcamento'
import { ItemOrcamento } from '../../../../src/entities/ItemOrcamento'
import { initializeDB } from '@/src/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  let dataSource;
  try {
    dataSource = await initializeDB()
    const orcamentoRepository = dataSource.getRepository(Orcamento)

    const orcamento = await orcamentoRepository.findOne({
      where: { id: Number(params.id) },
      relations: ['cliente', 'itens', 'user']
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
  let dataSource;
  try {
    const data = await request.json()
    const { orcamento, itens } = data

    dataSource = await initializeDB()
    const orcamentoRepository = dataSource.getRepository(Orcamento)
    const itemOrcamentoRepository = dataSource.getRepository(ItemOrcamento)

    const existingOrcamento = await orcamentoRepository.findOne({
      where: { id: Number(params.id) },
      relations: ['itens']
    })

    if (!existingOrcamento) {
      return NextResponse.json({ error: 'Orçamento não encontrado' }, { status: 404 })
    }

    // Atualizar o orçamento
    Object.assign(existingOrcamento, orcamento)
    const updatedOrcamento = await orcamentoRepository.save(existingOrcamento)

    // Remover itens existentes
    if (existingOrcamento.itens) {
      await itemOrcamentoRepository.remove(existingOrcamento.itens)
    }

    // Criar novos itens
    const savedItens = await Promise.all(
      itens.map(async (item: any) => {
        const novoItem = itemOrcamentoRepository.create({
          ...item,
          orcamento: updatedOrcamento
        })
        return itemOrcamentoRepository.save(novoItem)
      })
    )

    return NextResponse.json({
      orcamento: updatedOrcamento,
      itens: savedItens
    })
  } catch (error) {
    console.error('Erro ao atualizar orçamento:', error)
    return NextResponse.json({ error: 'Erro ao atualizar orçamento' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  let dataSource;
  try {
    dataSource = await initializeDB()
    const orcamentoRepository = dataSource.getRepository(Orcamento)

    const orcamento = await orcamentoRepository.findOne({
      where: { id: Number(params.id) },
      relations: ['itens']
    })

    if (!orcamento) {
      return NextResponse.json({ error: 'Orçamento não encontrado' }, { status: 404 })
    }

    await orcamentoRepository.remove(orcamento)
    return NextResponse.json({ message: 'Orçamento excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir orçamento:', error)
    return NextResponse.json({ error: 'Erro ao excluir orçamento' }, { status: 500 })
  }
} 