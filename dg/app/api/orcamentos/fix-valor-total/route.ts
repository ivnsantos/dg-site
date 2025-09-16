import { NextResponse } from 'next/server'
import { getDataSource } from '@/src/lib/db'
import { Orcamento } from '@/src/entities/Orcamento'

export async function POST() {
  try {
    const dataSource = await getDataSource()
    const orcamentoRepository = dataSource.getRepository(Orcamento)

    // Buscar todos os orçamentos com itens
    const orcamentos = await orcamentoRepository.find({
      relations: ['itens']
    })

    let corrigidos = 0
    let jaCorretos = 0

    for (const orcamento of orcamentos) {
      if (orcamento.itens && orcamento.itens.length > 0) {
        // Calcular valor total baseado nos itens
        const valorTotal = orcamento.itens.reduce((total, item) => {
          return total + Number(item.valorTotal || 0)
        }, 0)

        // Atualizar se o valor estiver incorreto
        if (Number(orcamento.valorTotal) !== valorTotal) {
          orcamento.valorTotal = valorTotal
          await orcamentoRepository.save(orcamento)
          corrigidos++
        } else {
          jaCorretos++
        }
      }
    }

    return NextResponse.json({
      message: 'Valores totais corrigidos com sucesso',
      corrigidos,
      jaCorretos,
      total: orcamentos.length
    })
  } catch (error) {
    console.error('Erro ao corrigir valores totais:', error)
    return NextResponse.json({ 
      error: 'Erro ao corrigir valores totais',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
