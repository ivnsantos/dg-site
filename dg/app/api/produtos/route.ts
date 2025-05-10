import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { AppDataSource } from '../../../src/lib/db'
import { Product } from '../../../src/entities/Product'
import { FichaTecnica } from '../../../src/entities/FichaTecnica'
import { User } from '../../../src/entities/User'

export async function POST(request: Request) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Inicializar conexão com o banco
    await AppDataSource.initialize()
    const productRepository = AppDataSource.getRepository(Product)
    const fichaTecnicaRepository = AppDataSource.getRepository(FichaTecnica)
    const userRepository = AppDataSource.getRepository(User)

    // Buscar usuário para obter o markup ideal
    const user = await userRepository.findOne({ where: { id: session.user.id } })
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

    await AppDataSource.destroy()

    return NextResponse.json({
      product: savedProduct,
      fichasTecnicas
    })
  } catch (error) {
    console.error('Erro ao criar produto:', error)
    await AppDataSource.destroy()
    return NextResponse.json({ 
      error: 'Erro ao criar produto',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Inicializar conexão com o banco
    await AppDataSource.initialize()
    const productRepository = AppDataSource.getRepository(Product)

    // Buscar produtos do usuário
    const products = await productRepository.find({
      where: { user: { id: session.user.id } },
      order: { name: 'ASC' }
    })

    await AppDataSource.destroy()
    return NextResponse.json(products)
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    await AppDataSource.destroy()
    return NextResponse.json({ error: 'Erro ao buscar produtos' }, { status: 500 })
  }
} 