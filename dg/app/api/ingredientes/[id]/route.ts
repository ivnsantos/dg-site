import { NextResponse } from 'next/server'
import { AppDataSource, initializeDB } from '@/src/lib/db'
import { Ingredient } from '@/src/entities/Ingredient'
import { FichaTecnica } from '@/src/entities/FichaTecnica'
import { Product } from '@/src/entities/Product'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    await initializeDB()

    const ingredient = await AppDataSource
      .getRepository(Ingredient)
      .createQueryBuilder('ingredient')
      .leftJoinAndSelect('ingredient.fichaTecnicas', 'fichaTecnica')
      .leftJoinAndSelect('fichaTecnica.product', 'product')
      .where('ingredient.id = :id', { id: parseInt(params.id) })
      .getOne()

    if (!ingredient) {
      return NextResponse.json(
        { error: 'Ingrediente não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(ingredient)
  } catch (error) {
    console.error('Erro ao buscar ingrediente:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar ingrediente' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  let dataSource;
  
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Inicializar o banco primeiro
    dataSource = await initializeDB()

    const data = await request.json()
    const precoIngrediente = parseFloat(data.pricePerGram)
    const quantidadeTotal = parseFloat(data.quantity)
    const ingredientId = parseInt(params.id) // Não precisa await aqui

    const ingredient = await dataSource
      .getRepository(Ingredient)
      .findOne({
        where: { id: ingredientId },
        relations: ['fichaTecnicas', 'fichaTecnicas.product']
      })

    if (!ingredient) {
      return NextResponse.json({ error: 'Ingrediente não encontrado' }, { status: 404 })
    }

    // Atualizar o ingrediente
    ingredient.name = data.name
    ingredient.unit = data.unit
    ingredient.quantity = quantidadeTotal
    ingredient.pricePerGram = precoIngrediente // Preço do ingrediente (R$ 23.50)
    ingredient.brand = data.brand
    ingredient.lastUpdate = new Date()

    await dataSource.getRepository(Ingredient).save(ingredient)

    // Atualizar fichas técnicas e produtos
    if (ingredient.fichaTecnicas.length > 0) {
      for (const ft of ingredient.fichaTecnicas) {
        const quantidadeUsada = parseFloat(ft.quantityUsed.toString()) // 0.10 kg

        // Se 2kg custa R$ 23.50, então 0.10kg custa X
        // (23.50 * 0.10) / 2 = R$ 1.175
        const custoNaFicha = (precoIngrediente * quantidadeUsada) / quantidadeTotal

        // Atualizar ficha técnica
        ft.totalCost = Number(custoNaFicha.toFixed(2)) // Custo proporcional à quantidade usada
        await dataSource.getRepository(FichaTecnica).save(ft)

        // Buscar e atualizar produto
        const product = await dataSource
          .getRepository(Product)
          .findOne({
            where: { id: ft.product.id },
            relations: ['fichaTecnicas']
          })

        if (product) {
          // Recalcular custo total do produto (soma de todas as fichas técnicas)
          const novoCustoTotal = product.fichaTecnicas.reduce((sum, ficha) => {
            return sum + Number(ficha.totalCost)
          }, 0)

          // Recalcular peso total
          const novoPesoTotal = product.fichaTecnicas.reduce((sum, ficha) => {
            return sum + Number(ficha.quantityUsed)
          }, 0)

          // Atualizar produto
          product.totalWeight = Number(novoPesoTotal.toFixed(3))
          product.totalCost = Number(novoCustoTotal.toFixed(2))
          product.suggestedPrice = Number((novoCustoTotal * (1 + product.idealMarkup)).toFixed(2))
          product.profitMargin = Number(
            ((product.sellingPrice - novoCustoTotal) / novoCustoTotal * 100).toFixed(2)
          )

          await dataSource.getRepository(Product).save(product)
        }
      }
    }

    return NextResponse.json({ 
      message: 'Ingrediente e produtos relacionados atualizados com sucesso'
    })

  } catch (error) {
    console.error('Erro ao atualizar ingrediente:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar ingrediente' },
      { status: 500 }
    )
  } finally {
    // Fechar a conexão se estiver aberta
    if (dataSource?.isInitialized) {
      await dataSource.destroy()
    }
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  let dataSource;

  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    dataSource = await initializeDB()
    const ingredientId = parseInt(params.id)

    // 1. Primeiro, buscar o ingrediente com suas relações
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

    // 2. Primeiro, remover as fichas técnicas
    if (ingredient.fichaTecnicas.length > 0) {
      // Buscar e atualizar cada produto antes de remover as fichas
      for (const ft of ingredient.fichaTecnicas) {
        const product = await dataSource
          .getRepository(Product)
          .findOne({
            where: { id: ft.product.id },
            relations: ['fichaTecnicas']
          })

        if (product) {
          // Remover o custo e peso deste ingrediente
          const custoRemover = Number(ft.totalCost)
          const pesoRemover = Number(ft.quantityUsed)

          // Atualizar produto
          product.totalCost = Number((product.totalCost - custoRemover).toFixed(2))
          product.totalWeight = Number((product.totalWeight - pesoRemover).toFixed(3))
          
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

          // Salvar produto atualizado
          await dataSource.getRepository(Product).save(product)
        }

        // Remover a ficha técnica
        await dataSource
          .getRepository(FichaTecnica)
          .delete({ id: ft.id })
      }
    }

    // 3. Depois de remover todas as fichas técnicas, remover o ingrediente
    await dataSource
      .getRepository(Ingredient)
      .delete({ id: ingredientId })

    return NextResponse.json({
      message: 'Ingrediente e fichas técnicas removidos com sucesso',
      affectedProducts: ingredient.fichaTecnicas.map(ft => ft.product.id)
    })

  } catch (error) {
    console.error('Erro ao deletar ingrediente:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar ingrediente' },
      { status: 500 }
    )
  } finally {
    if (dataSource?.isInitialized) {
      await dataSource.destroy()
    }
  }
} 