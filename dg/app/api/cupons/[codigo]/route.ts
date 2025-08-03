import { NextRequest, NextResponse } from 'next/server'
import { getDataSource } from '@/src/lib/db'
import { Cupom, StatusCupom } from '@/src/entities/Cupom'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: { codigo: string } }
) {
  try {
    const { codigo } = params
    
    const dataSource = await getDataSource()
    const cupomRepository = dataSource.getRepository(Cupom)
    
    const cupom = await cupomRepository.findOne({
      where: { codigo: codigo.toUpperCase() }
    })

    if (!cupom) {
      return NextResponse.json(
        { error: 'Cupom não encontrado' },
        { status: 404 }
      )
    }

    // Verifica se o cupom está ativo
    if (cupom.status !== StatusCupom.ATIVO) {
      return NextResponse.json({
        codigo: cupom.codigo,
        desconto: cupom.desconto,
        status: cupom.status
      })
    }

    // Verifica se o cupom expirou
    if (cupom.dataExpiracao && cupom.dataExpiracao < new Date()) {
      cupom.status = StatusCupom.EXPIRADO
      await cupomRepository.save(cupom)
      
      return NextResponse.json({
        codigo: cupom.codigo,
        desconto: cupom.desconto,
        status: StatusCupom.EXPIRADO
      })
    }

    // Verifica se atingiu o limite de usos
    if (cupom.limiteUsos && cupom.quantidadeUsos >= cupom.limiteUsos) {
      cupom.status = StatusCupom.INATIVO
      await cupomRepository.save(cupom)
      
      return NextResponse.json({
        codigo: cupom.codigo,
        desconto: cupom.desconto,
        status: StatusCupom.INATIVO
      })
    }

    return NextResponse.json({
      codigo: cupom.codigo,
      desconto: cupom.desconto,
      status: cupom.status
    })

  } catch (error) {
    console.error('Erro ao validar cupom:', error)
    
    if (error instanceof Error && error.message.includes('Driver not Connected')) {
      return NextResponse.json({ 
        error: 'Erro de conexão com o banco de dados. Tente novamente em alguns segundos.',
        code: 'DB_CONNECTION_ERROR'
      }, { status: 503 })
    }
    
    return NextResponse.json(
      { error: 'Erro ao validar cupom' },
      { status: 500 }
    )
  }
} 