import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getDataSource } from '@/src/lib/db'
import { Ingredient } from '@/src/entities/Ingredient'
import { User } from '@/src/entities/User'
import { FichaTecnica } from '@/src/entities/FichaTecnica'
import { Product } from '@/src/entities/Product'

// GET /api/ingredientes
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const dataSource = await getDataSource()
    const userRepository = dataSource.getRepository(User)
    const ingredientRepository = dataSource.getRepository(Ingredient)

    const user = await userRepository.findOne({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const ingredients = await ingredientRepository.find({
      where: { user: { id: user.id } },
      order: { name: 'ASC' }
    })

    // Garantir que pricePerGram e quantity sejam números
    const formattedIngredients = ingredients.map(ingredient => ({
      ...ingredient,
      pricePerGram: Number(ingredient.pricePerGram),
      quantity: Number(ingredient.quantity)
    }))

    return NextResponse.json(formattedIngredients)
  } catch (error) {
    console.error('Erro ao buscar ingredientes:', error)
    
    if (error instanceof Error && error.message.includes('Driver not Connected')) {
      return NextResponse.json({ 
        error: 'Erro de conexão com o banco de dados. Tente novamente em alguns segundos.',
        code: 'DB_CONNECTION_ERROR'
      }, { status: 503 })
    }
    
    return NextResponse.json(
      { error: 'Erro ao buscar ingredientes' },
      { status: 500 }
    )
  }
}

// POST /api/ingredientes
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const data = await request.json()
    const { name, unit, quantity, price, brand } = data

    if (!name || !unit || quantity === undefined || !price || !brand) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      )
    }

    const dataSource = await getDataSource()
    const userRepository = dataSource.getRepository(User)
    const ingredientRepository = dataSource.getRepository(Ingredient)

    const user = await userRepository.findOne({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const ingredient = new Ingredient()
    ingredient.name = name
    ingredient.unit = unit
    ingredient.quantity = parseFloat(quantity)
    ingredient.pricePerGram = parseFloat(price)
    ingredient.brand = brand
    ingredient.lastUpdate = new Date()
    ingredient.user = user

    await ingredientRepository.save(ingredient)

    return NextResponse.json(ingredient)
  } catch (error) {
    console.error('Erro ao criar ingrediente:', error)
    
    if (error instanceof Error && error.message.includes('Driver not Connected')) {
      return NextResponse.json({ 
        error: 'Erro de conexão com o banco de dados. Tente novamente em alguns segundos.',
        code: 'DB_CONNECTION_ERROR'
      }, { status: 503 })
    }
    
    return NextResponse.json(
      { error: 'Erro ao criar ingrediente' },
      { status: 500 }
    )
  }
}

// PUT /api/ingredientes?id=123
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json(
        { error: 'ID não fornecido' },
        { status: 400 }
      )
    }

    const data = await request.json()
    const { name, unit, quantity, price, brand } = data

    if (!name || !unit || quantity === undefined || !price || !brand) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      )
    }

    const dataSource = await getDataSource()
    const userRepository = dataSource.getRepository(User)
    const ingredientRepository = dataSource.getRepository(Ingredient)

    const user = await userRepository.findOne({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const ingredient = await ingredientRepository.findOne({
      where: { id: parseInt(id), user: { id: user.id } }
    })

    if (!ingredient) {
      return NextResponse.json(
        { error: 'Ingrediente não encontrado' },
        { status: 404 }
      )
    }

    ingredient.name = name
    ingredient.unit = unit
    ingredient.quantity = parseFloat(quantity)
    ingredient.pricePerGram = parseFloat(price)
    ingredient.brand = brand
    ingredient.lastUpdate = new Date()

    await ingredientRepository.save(ingredient)

    return NextResponse.json(ingredient)
  } catch (error) {
    console.error('Erro ao atualizar ingrediente:', error)
    
    if (error instanceof Error && error.message.includes('Driver not Connected')) {
      return NextResponse.json({ 
        error: 'Erro de conexão com o banco de dados. Tente novamente em alguns segundos.',
        code: 'DB_CONNECTION_ERROR'
      }, { status: 503 })
    }
    
    return NextResponse.json(
      { error: 'Erro ao atualizar ingrediente' },
      { status: 500 }
    )
  }
}

// DELETE /api/ingredientes?id=123
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Pegar o ID da URL como query parameter
    const url = new URL(request.url)
    const ingredientId = parseInt(url.searchParams.get('id') || '')
    
    if (!ingredientId) {
      return NextResponse.json(
        { error: 'ID do ingrediente não fornecido' },
        { status: 400 }
      )
    }

    const dataSource = await getDataSource()

    // 1. Buscar o ingrediente com suas relações
    const ingredient = await dataSource
      .getRepository(Ingredient)
      .findOne({
        where: { id: ingredientId },
        relations: ['fichaTecnicas', 'fichaTecnicas.product']
      })

    if (!ingredient) {
      return NextResponse.json(
        { error: 'Ingrediente não encontrado' },
        { status: 404 }
      )
    }

    // 2. Primeiro remover as fichas técnicas
    const fichaTecnicaRepo = dataSource.getRepository(FichaTecnica)
    for (const ft of ingredient.fichaTecnicas) {
      const product = ft.product
      
      // Atualizar o produto
      if (product) {
        // Remover o custo e peso deste ingrediente
        product.totalCost = Number((product.totalCost - Number(ft.totalCost)).toFixed(2))
        product.totalWeight = Number((product.totalWeight - Number(ft.quantityUsed)).toFixed(3))
        
        // Recalcular preço sugerido e margem
        if (product.totalCost > 0) {
          product.suggestedPrice = Number((product.totalCost * (1 + product.idealMarkup)).toFixed(2))
          product.profitMargin = Number(
            ((product.sellingPrice - product.totalCost) / product.totalCost * 100).toFixed(2)
          )
        } else {
          product.suggestedPrice = 0
          product.profitMargin = 0
        }

        await dataSource.getRepository(Product).save(product)
      }

      // Remover a ficha técnica
      await fichaTecnicaRepo.delete(ft.id)
    }

    // 3. Finalmente remover o ingrediente
    await dataSource
      .getRepository(Ingredient)
      .delete(ingredientId)

    return NextResponse.json({
      success: true,
      message: 'Ingrediente removido com sucesso'
    })

  } catch (error) {
    console.error('Erro ao deletar ingrediente:', error)
    
    if (error instanceof Error && error.message.includes('Driver not Connected')) {
      return NextResponse.json({ 
        error: 'Erro de conexão com o banco de dados. Tente novamente em alguns segundos.',
        code: 'DB_CONNECTION_ERROR'
      }, { status: 503 })
    }
    
    return NextResponse.json(
      { error: 'Erro ao deletar ingrediente' },
      { status: 500 }
    )
  }
} 
