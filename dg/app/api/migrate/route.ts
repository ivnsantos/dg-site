import { NextRequest, NextResponse } from 'next/server'
import { getDataSource } from '@/src/lib/db'

export async function POST(request: NextRequest) {
  try {
    const dataSource = await getDataSource()
    const queryRunner = dataSource.createQueryRunner()
    
    // Verificar se a coluna existe
    const hasColumn = await queryRunner.hasColumn('feedbacks', 'primary_color')
    
    if (!hasColumn) {
      console.log('Adicionando colunas de cores aos feedbacks...')
      await queryRunner.query(`ALTER TABLE "feedbacks" ADD "primary_color" character varying(7)`)
      await queryRunner.query(`ALTER TABLE "feedbacks" ADD "secondary_color" character varying(7)`)
      console.log('Colunas de cores adicionadas com sucesso')
      
      await queryRunner.release()
      return NextResponse.json({ 
        success: true, 
        message: 'Colunas de cores adicionadas com sucesso' 
      })
    } else {
      await queryRunner.release()
      return NextResponse.json({ 
        success: true, 
        message: 'Colunas de cores já existem' 
      })
    }
    
  } catch (error: any) {
    console.error('Erro ao adicionar colunas:', error)
    return NextResponse.json(
      { error: 'Erro ao adicionar colunas', details: error.message },
      { status: 500 }
    )
  }
}
