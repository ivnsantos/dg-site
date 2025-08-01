import { NextRequest, NextResponse } from 'next/server'
import { initializeDB } from '@/src/lib/db'

export async function POST(request: NextRequest) {
  try {
    const dataSource = await initializeDB()
    const queryRunner = dataSource.createQueryRunner()
    
    // Verificar se a coluna existe
    const hasColumn = await queryRunner.hasColumn('link_trees', 'background_effect')
    
    if (!hasColumn) {
      console.log('Adicionando coluna background_effect...')
      await queryRunner.query(`ALTER TABLE "link_trees" ADD "background_effect" character varying(20) DEFAULT 'none'`)
      console.log('Coluna background_effect adicionada com sucesso')
      
      await queryRunner.release()
      return NextResponse.json({ 
        success: true, 
        message: 'Coluna background_effect adicionada com sucesso' 
      })
    } else {
      await queryRunner.release()
      return NextResponse.json({ 
        success: true, 
        message: 'Coluna background_effect já existe' 
      })
    }
    
  } catch (error: any) {
    console.error('Erro ao adicionar coluna:', error)
    return NextResponse.json(
      { error: 'Erro ao adicionar coluna', details: error.message },
      { status: 500 }
    )
  }
} 