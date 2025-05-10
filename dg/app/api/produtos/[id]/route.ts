import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth'
import { AppDataSource } from '../../../../src/lib/db'
import { Product } from '../../../../src/entities/Product'
import { FichaTecnica } from '../../../../src/entities/FichaTecnica'
import { User } from '../../../../src/entities/User'
import { initializeDB } from '@/src/lib/db'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Buscar produto existente
    const existingProduct = await productRepository.findOne({
      where: { id: parseInt(params.id), user: { id: session.user.id } },
      relations: ['fichaTecnicas']
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    // Obter dados do request
    const data = await request.json()

    // Validar dados necessários
    if (!data.name || !data.category || !data.quantity) {
      return NextResponse.json({ error: 'Dados do produto incompletos' }, { status: 400 })
    }

    // Atualizar o produto
    existingProduct.name = data.name
    existingProduct.category = data.category
    existingProduct.quantity = data.quantity
    existingProduct.description = data.description || ''
    existingProduct.totalWeight = data.totalWeight || 0
    existingProduct.totalCost = data.totalCost || 0
    existingProduct.suggestedPrice = data.totalCost * (user.markupIdeal || 2.5)
    existingProduct.sellingPrice = data.sellingPrice
    existingProduct.profitMargin = ((data.sellingPrice - data.totalCost) / data.totalCost) * 100
    existingProduct.lastUpdate = new Date()

    // Salvar o produto atualizado
    const savedProduct = await productRepository.save(existingProduct)

    // Remover fichas técnicas antigas
    await fichaTecnicaRepository.delete({ productId: savedProduct.id })

    // Criar novas fichas técnicas para cada ingrediente
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
    console.error('Erro ao atualizar produto:', error)
    await AppDataSource.destroy()
    return NextResponse.json({ 
      error: 'Erro ao atualizar produto',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Inicializar conexão apenas se não estiver inicializada
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
    }

    const produto = await AppDataSource
      .getRepository(Product)
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.fichaTecnicas', 'fichaTecnicas')
      .leftJoinAndSelect('fichaTecnicas.ingredient', 'ingredient')
      .where('product.id = :id', { id: parseInt(params.id) })
      .select([
        'product',
        'fichaTecnicas',
        'ingredient.id',
        'ingredient.name',
        'ingredient.pricePerGram',
        'ingredient.unit'
      ])
      .getOne()

    if (!produto) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    const produtoFormatado = {
      ...produto,
      fichaTecnicas: produto.fichaTecnicas.map(ft => ({
        ...ft,
        totalCost: Number(ft.totalCost || 0).toFixed(2),
        quantityUsed: Number(ft.quantityUsed || 0).toFixed(3)
      })),
      totalCost: Number(produto.totalCost || 0).toFixed(2),
      totalWeight: Number(produto.totalWeight || 0).toFixed(3),
      sellingPrice: Number(produto.sellingPrice || 0).toFixed(2),
      suggestedPrice: Number(produto.suggestedPrice || 0).toFixed(2),
      profitMargin: Number(produto.profitMargin || 0).toFixed(2)
    }

    return NextResponse.json(produtoFormatado)

  } catch (error) {
    console.error('Erro ao buscar produto:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar detalhes do produto' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Buscar produto
    const product = await productRepository.findOne({
      where: { id: parseInt(params.id), user: { id: session.user.id } }
    })

    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    // Remover fichas técnicas primeiro
    await fichaTecnicaRepository.delete({ productId: product.id })

    // Remover o produto
    await productRepository.remove(product)

    await AppDataSource.destroy()
    return NextResponse.json({ message: 'Produto excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir produto:', error)
    await AppDataSource.destroy()
    return NextResponse.json({ error: 'Erro ao excluir produto' }, { status: 500 })
  }
} 