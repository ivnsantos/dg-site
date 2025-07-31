export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth'
import { initializeDB } from '@/src/lib/db'
import { Product } from '../../../src/entities/Product'
import { FichaTecnica } from '../../../src/entities/FichaTecnica'
import { User } from '../../../src/entities/User'

export async function POST(request: Request) {
  let dataSource;
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Inicializar conexão com o banco
    dataSource = await initializeDB()
    const productRepository = dataSource.getRepository(Product)
    const fichaTecnicaRepository = dataSource.getRepository(FichaTecnica)
    const userRepository = dataSource.getRepository(User)

    // Buscar usuário para obter o markup ideal
    const user = await userRepository.findOne({ where: { id: Number(session.user.id) } })
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Obter dados do request
    const data = await request.json()

    // Validar dados necessários
    if (!data.name || !data.category || !data.quantity) {
      return NextResponse.json({ error: 'Dados do produto incompletos' }, { status: 400 })
    }

    // Criar o produto
    const product = new Product()
    product.name = data.name
    product.price = data.totalCost
    product.category = data.category
    product.quantity = data.quantity
    product.description = data.description || ''
    product.totalWeight = data.totalWeight || 0
    product.totalCost = data.totalCost || 0
    product.suggestedPrice = data.totalCost * (user.markupIdeal)
    product.sellingPrice = data.sellingPrice
    product.profitMargin = ((product.sellingPrice - product.totalCost) / product.totalCost) * 100
    product.idealMarkup = user.markupIdeal
    product.lastUpdate = new Date()
    product.user = user

    // Salvar o produto
    const savedProduct = await productRepository.save(product)

    // Criar fichas técnicas para cada ingrediente
    const fichasTecnicas = await Promise.all(data.ingredients.map(async (ingredient: any) => {
      const fichaTecnica = new FichaTecnica()
      fichaTecnica.name = ingredient.name
      fichaTecnica.description = ingredient.description
      fichaTecnica.unitCost = ingredient.unitCost
      fichaTecnica.quantityUsed = ingredient.quantityUsed
      fichaTecnica.totalCost = ingredient.totalCost
      fichaTecnica.unit = ingredient.unit
      fichaTecnica.productId = savedProduct.id
      fichaTecnica.ingredientId = ingredient.ingredientId
      
      return fichaTecnicaRepository.save(fichaTecnica)
    }))

    return NextResponse.json({
      product: savedProduct,
      fichasTecnicas
    })
  } catch (error) {
    console.error('Erro ao criar produto:', error)
    
    // Tratamento específico para erros de conexão
    if (error instanceof Error && error.message.includes('Driver not Connected')) {
      return NextResponse.json({ 
        error: 'Erro de conexão com o banco de dados. Tente novamente em alguns segundos.',
        code: 'DB_CONNECTION_ERROR'
      }, { status: 503 })
    }
    
    if (error instanceof Error && error.message.includes('Failed to initialize database')) {
      return NextResponse.json({ 
        error: 'Serviço temporariamente indisponível. Tente novamente em alguns segundos.',
        code: 'DB_INIT_ERROR'
      }, { status: 503 })
    }
    
    return NextResponse.json({ 
      error: 'Erro ao criar produto',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      code: 'INTERNAL_ERROR'
    }, { status: 500 })
  } finally {
    if (dataSource && dataSource.isInitialized) {
      try {
        await dataSource.destroy()
      } catch (destroyError) {
        console.error('Erro ao fechar conexão:', destroyError)
      }
    }
  }
}

export async function GET() {
  let dataSource;
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Inicializar conexão com o banco
    dataSource = await initializeDB()
    const productRepository = dataSource.getRepository(Product)

    // Buscar produtos do usuário
    const products = await productRepository.find({
      where: { user: { id: Number(session.user.id) } },
      order: { name: 'ASC' }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    
    // Tratamento específico para erros de conexão
    if (error instanceof Error && error.message.includes('Driver not Connected')) {
      return NextResponse.json({ 
        error: 'Erro de conexão com o banco de dados. Tente novamente em alguns segundos.',
        code: 'DB_CONNECTION_ERROR'
      }, { status: 503 })
    }
    
    if (error instanceof Error && error.message.includes('Failed to initialize database')) {
      return NextResponse.json({ 
        error: 'Serviço temporariamente indisponível. Tente novamente em alguns segundos.',
        code: 'DB_INIT_ERROR'
      }, { status: 503 })
    }
    
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    }, { status: 500 })
  } finally {
    if (dataSource && dataSource.isInitialized) {
      try {
        await dataSource.destroy()
      } catch (destroyError) {
        console.error('Erro ao fechar conexão:', destroyError)
      }
    }
  }
} 