import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcrypt'
import { getDataSource } from '@/src/lib/db'
import { User } from '@/src/entities/User'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    name: string
  }

  interface Session {
    user: User
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    email: string
    name: string
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const dataSource = await initializeDB()
        const userRepository = dataSource.getRepository(User)
        const user = await userRepository.findOne({
          where: { email: credentials.email }
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return user
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.email = token.email
        session.user.name = token.name
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 dias
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development'
} 
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth'
import { getDataSource } from '@/src/lib/db'
import { Cliente } from '../../../src/entities/Cliente'
import { User } from '../../../src/entities/User'

export async function GET(request: Request) {
  let dataSource;
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ error: 'Usuário não fornecido' }, { status: 400 })
    }

    dataSource = await initializeDB()
    const clienteRepository = dataSource.getRepository(Cliente)

    const clientes = await clienteRepository.find({
      where: { user: { id: Number(userId) } },
      order: { nome: 'ASC' }
    })

    return NextResponse.json({ clientes })
  } catch (error) {
    console.error('Erro ao buscar clientes:', error)
    return NextResponse.json({ error: 'Erro ao buscar clientes' }, { status: 500 })
  } finally {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy()
    }
  }
}

export async function POST(request: Request) {
  let dataSource;
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    dataSource = await initializeDB()
    const clienteRepository = dataSource.getRepository(Cliente)
    const userRepository = dataSource.getRepository(User)

    const user = await userRepository.findOne({
      where: { id: Number(session.user.id) }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const data = await request.json()
    const cliente = clienteRepository.create({
      ...data,
      user
    })

    await clienteRepository.save(cliente)
    return NextResponse.json(cliente)
  } catch (error) {
    console.error('Erro ao criar cliente:', error)
    return NextResponse.json({ error: 'Erro ao criar cliente' }, { status: 500 })
  } finally {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy()
    }
  }
} 
import { getServerSession } from "next-auth";
import { User } from "@/src/entities/User";
import { getDataSource } from "@/src/lib/db";
import { NextResponse } from "next/server";
import { authOptions } from '@/app/api/auth/auth'
import { Confeitaria } from "@/src/entities/Confeitaria";

export async function POST(request: Request) {
  let dataSource;
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const data = await request.json();
    console.log('Dados recebidos:', data);

    dataSource = await initializeDB();
    const userRepository = dataSource.getRepository(User);
    const confeitariaRepository = dataSource.getRepository(Confeitaria);

    const user = await userRepository.findOne({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Deletar confeitaria existente do usuário
    const confeitariaExistente = await confeitariaRepository.findOne({
      where: { usuario: { id: user.id } }
    });
    
    if (confeitariaExistente) {
      await confeitariaRepository.remove(confeitariaExistente);
      console.log('Dados anteriores da confeitaria deletados');
    }

    // Cálculo do custo total mensal
    const custoTotalMensal =
      Number(data.folhaPagamentoTotal) +
      Number(data.custosFixos) +
      Number(data.proLabore) +
      (data.pagaComissao ? (Number(data.faturamentoDesejado) * (Number(data.porcentagemComissao) / 100)) : 0) +
      (Number(data.faturamentoDesejado) * (Number(data.taxaMaquininha) / 100));

    console.log('Custo total mensal calculado:', custoTotalMensal);

    // Cálculo do markup clássico (como fator)
    const comissao = data.pagaComissao ? (Number(data.porcentagemComissao) / 100) : 0;
    const taxaMaquininha = Number(data.taxaMaquininha) / 100;
    const imposto = Number(data.porcentagemImposto) / 100;
    const lucro = Number(data.porcentagemLucroDesejado) / 100;

    const despesasPercentuais = comissao + taxaMaquininha + imposto + lucro;

    if (despesasPercentuais >= 1) {
      return NextResponse.json(
        { error: 'As despesas somam 100% ou mais. Impossível calcular markup.' },
        { status: 400 }
      );
    }

    const markupFator = 1 / (1 - despesasPercentuais);
    console.log('Markup fator calculado:', markupFator);

    try {
      // Criar nova confeitaria
      const confeitaria = confeitariaRepository.create({
        ...data,
        markupIdeal: markupFator, // Salva como markupIdeal no banco
        user,
      });

      await confeitariaRepository.save(confeitaria);
      console.log('Confeitaria salva com sucesso');

      // Atualizar o markup do usuário
      user.markupIdeal = markupFator;
      await userRepository.save(user);
      console.log('Usuário atualizado com sucesso');

      return new NextResponse(
        JSON.stringify({
          success: true,
          markupIdeal: markupFator.toFixed(3),
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (saveError) {
      console.error('Erro ao salvar no banco:', saveError);
      throw saveError;
    }
  } catch (error) {
    console.error('Erro detalhado:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Erro ao salvar dados da confeitaria',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } finally {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getDataSource } from '@/src/lib/db'
import { Feedback, FeedbackStatus } from '@/src/entities/Feedback'

// Função para gerar código único
function generateUniqueCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const dataSource = await initializeDB()
    const { title, question, description, logoUrl, options } = await request.json()

    // Validações
    if (!title?.trim()) {
      return NextResponse.json({ error: 'Título é obrigatório' }, { status: 400 })
    }

    if (!question?.trim()) {
      return NextResponse.json({ error: 'Pergunta é obrigatória' }, { status: 400 })
    }

    if (!Array.isArray(options) || options.length < 2) {
      return NextResponse.json({ error: 'Adicione pelo menos 2 opções de resposta' }, { status: 400 })
    }

    const validOptions = options.filter(option => option.trim() !== '')
    if (validOptions.length < 2) {
      return NextResponse.json({ error: 'Adicione pelo menos 2 opções válidas' }, { status: 400 })
    }

    // Gerar código único
    let code: string
    let isUnique = false
    let attempts = 0

    while (!isUnique && attempts < 10) {
      code = generateUniqueCode()
      const existingFeedback = await dataSource
        .getRepository(Feedback)
        .findOne({ where: { code } })
      
      if (!existingFeedback) {
        isUnique = true
      }
      attempts++
    }

    if (!isUnique) {
      return NextResponse.json({ error: 'Erro ao gerar código único' }, { status: 500 })
    }

    // Criar questionário
    const feedback = new Feedback()
    feedback.title = title.trim()
    feedback.question = question.trim()
    feedback.description = description?.trim() || null
    feedback.logoUrl = logoUrl?.trim() || null
    feedback.options = validOptions
    feedback.code = code!
    feedback.status = FeedbackStatus.ACTIVE
    feedback.userId = parseInt(session.user.id) // Corrigir o tipo

    await dataSource.getRepository(Feedback).save(feedback)

    return NextResponse.json({
      message: 'Questionário criado com sucesso',
      feedback: {
        id: feedback.id,
        title: feedback.title,
        code: feedback.code,
        createdAt: feedback.createdAt
      }
    })

  } catch (error: any) {
    console.error('Erro ao criar questionário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const dataSource = await initializeDB()
    
    const feedbacks = await dataSource
      .getRepository(Feedback)
      .find({
        where: { userId: parseInt(session.user.id) },
        relations: ['responses'],
        order: { createdAt: 'DESC' }
      })

    const feedbacksWithStats = feedbacks.map((feedback: Feedback) => ({
      id: feedback.id,
      title: feedback.title,
      question: feedback.question,
      description: feedback.description,
      logoUrl: feedback.logoUrl,
      code: feedback.code,
      status: feedback.status,
      createdAt: feedback.createdAt,
      responsesCount: feedback.responses?.length || 0
    }))

    return NextResponse.json({ feedbacks: feedbacksWithStats })

  } catch (error: any) {
    console.error('Erro ao buscar questionários:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth'
import { getDataSource } from '../../../src/lib/db'
import { Ingredient } from '../../../src/entities/Ingredient'
import { User } from '../../../src/entities/User'
import { FichaTecnica } from '../../../src/entities/FichaTecnica'
import { Product } from '../../../src/entities/Product'

// GET /api/ingredientes
export async function GET() {
  let dataSource;
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    dataSource = await initializeDB()
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
    return NextResponse.json(
      { error: 'Erro ao buscar ingredientes' },
      { status: 500 }
    )
  } finally {
    if (dataSource?.isInitialized) await dataSource.destroy()
  }
}

// POST /api/ingredientes
export async function POST(request: NextRequest) {
  let dataSource;
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

    dataSource = await initializeDB()
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
    return NextResponse.json(
      { error: 'Erro ao criar ingrediente' },
      { status: 500 }
    )
  } finally {
    if (dataSource?.isInitialized) await dataSource.destroy()
  }
}

// PUT /api/ingredientes?id=123
export async function PUT(request: NextRequest) {
  let dataSource;
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

    dataSource = await initializeDB()
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
    return NextResponse.json(
      { error: 'Erro ao atualizar ingrediente' },
      { status: 500 }
    )
  } finally {
    if (dataSource?.isInitialized) await dataSource.destroy()
  }
}

// DELETE /api/ingredientes?id=123
export async function DELETE(request: Request) {
  let dataSource;

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

    dataSource = await initializeDB()

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
import { NextRequest, NextResponse } from 'next/server'
import { getDataSource } from '@/src/lib/db'
import { LinkTree } from '@/src/entities/LinkTree'
import { LinkTreeLink } from '@/src/entities/LinkTreeLink'

export async function GET(request: NextRequest) {
  let dataSource: any = null
  
  try {
    dataSource = await initializeDB()
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      )
    }

    const linkTreeRepository = dataSource.getRepository(LinkTree)
    const linkRepository = dataSource.getRepository(LinkTreeLink)

    const linkTrees = await linkTreeRepository.find({
      where: { userId: parseInt(userId) },
      order: { createdAt: 'DESC' }
    })

    // Buscar links para cada LinkTree
    const linkTreesWithLinks = await Promise.all(
      linkTrees.map(async (linkTree: any) => {
        const links = await linkRepository.find({
          where: { linkTreeId: linkTree.id },
          order: { position: 'ASC' }
        })
        return {
          ...linkTree,
          links
        }
      })
    )

    return NextResponse.json({
      linkTrees: linkTreesWithLinks
    })

  } catch (error: any) {
    console.error('Erro ao buscar LinkTrees:', error)
    
    if (error.message?.includes('Driver not Connected') || error.message?.includes('Connection terminated')) {
      return NextResponse.json(
        { error: 'Erro de conexão com o banco de dados', code: 'DB_CONNECTION_ERROR' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    if (dataSource) {
      try {
        await dataSource.destroy()
      } catch (error) {
        console.warn('Erro ao destruir conexão:', error)
      }
    }
  }
}

export async function POST(request: NextRequest) {
  let dataSource: any = null
  try {
    dataSource = await initializeDB()
    const linkTreeRepository = dataSource.getRepository(LinkTree)
    const linkTreeLinkRepository = dataSource.getRepository(LinkTreeLink)

    const body = await request.json()
    const { name, description, backgroundColor, textColor, accentColor, backgroundEffect, code, imageUrl, links, userId } = body

    if (!name || !userId || !links || !Array.isArray(links) || !code) {
      return NextResponse.json(
        { error: 'Dados inválidos. Nome, código, usuário e links são obrigatórios.' },
        { status: 400 }
      )
    }

    // Validar formato do código
    const codeRegex = /^[a-zA-Z0-9-]+$/
    if (!codeRegex.test(code)) {
      return NextResponse.json(
        { error: 'Código deve conter apenas letras, números e hífens' },
        { status: 400 }
      )
    }

    // Verificar se o código já existe
    const existingLinkTree = await linkTreeRepository.findOne({
      where: { code }
    })

    if (existingLinkTree) {
      return NextResponse.json(
        { error: 'Código já existe. Escolha outro código.' },
        { status: 400 }
      )
    }

    // Verifica se o usuário já tem 2 LinkTrees (limite máximo)
    const existingLinkTreesCount = await linkTreeRepository.count({
      where: { userId: parseInt(userId) }
    })

    if (existingLinkTreesCount >= 2) {
      return NextResponse.json(
        { error: 'Você já possui o limite máximo de 2 LinkTrees. Exclua um LinkTree existente para criar um novo.' },
        { status: 400 }
      )
    }

    // Criar o LinkTree
    const linkTree = linkTreeRepository.create({
      name,
      description,
      code,
      imageUrl: imageUrl || null,
      backgroundColor: backgroundColor || '#2D1810',
      textColor: textColor || '#ffffff',
      accentColor: accentColor || '#0B7A48',
      backgroundEffect: backgroundEffect || 'none',
      userId: parseInt(userId),
      isActive: true
    })

    const savedLinkTree = await linkTreeRepository.save(linkTree)

    // Criar os links
    const linkPromises = links.map((link: any, index: number) => {
      return linkTreeLinkRepository.save(
        linkTreeLinkRepository.create({
          title: link.title,
          url: link.url,
          icon: link.icon || '🔗',
          imageUrl: link.imageUrl || null,
          isActive: link.isActive !== false,
          position: index + 1,
          linkTreeId: savedLinkTree.id
        })
      )
    })

    await Promise.all(linkPromises)

    return NextResponse.json({
      message: 'LinkTree criado com sucesso',
      linkTree: savedLinkTree
    })

  } catch (error: any) {
    console.error('Erro ao criar LinkTree:', error)
    
    if (error.message?.includes('Driver not Connected') || error.message?.includes('Connection terminated')) {
      return NextResponse.json(
        { error: 'Erro de conexão com o banco de dados', code: 'DB_CONNECTION_ERROR' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    if (dataSource) {
      try {
        await dataSource.destroy()
      } catch (error) {
        console.warn('Erro ao destruir conexão:', error)
      }
    }
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import { getDataSource } from '@/src/lib/db'
import { Menu } from '@/src/entities/Menu'
import { MenuSection } from '@/src/entities/MenuSection'
import { MenuItem } from '@/src/entities/MenuItem'
import { User } from '@/src/entities/User'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, codigo, description, template, status, telefone, instagram, imageUrl, imageUrlBackground, sections, userId } = body
    const db = await initializeDB()

    // Busca o usuário (ajuste conforme autenticação depois)
    const user = await db.getRepository(User).findOneByOrFail({ id: userId })

    // Verifica se o usuário já tem 2 menus (limite máximo)
    const existingMenusCount = await db.getRepository(Menu).count({
      where: { user: { id: userId } }
    })

    if (existingMenusCount >= 2) {
      return NextResponse.json(
        { error: 'Você já possui o limite máximo de 2 menus online. Exclua um menu existente para criar um novo.' },
        { status: 400 }
      )
    }

    // Cria o menu
    const menu = new Menu()
    menu.name = name
    menu.codigo = codigo
    menu.description = description
    menu.template = template
    menu.status = status
    menu.telefone = telefone
    menu.instagram = instagram
    menu.imageUrl = imageUrl
    menu.imageUrlBackground = imageUrlBackground
    menu.user = user
    menu.sections = []

    // Cria as seções e itens
    for (const sectionData of sections) {
      // Remove id do payload se existir
      if ('id' in sectionData) delete sectionData.id
      const section = new MenuSection()
      section.title = sectionData.title
      section.description = sectionData.description
      section.imageUrl = sectionData.imageUrl
      section.position = sectionData.position
      section.menu = menu
      section.items = []

      for (const itemData of sectionData.items) {
        // Remove id do payload se existir
        if ('id' in itemData) delete itemData.id
        const item = new MenuItem()
        item.name = itemData.name
        item.description = itemData.description
        item.price = Number(itemData.price)
        item.available = itemData.available
        item.position = itemData.position
        item.section = section
        item.imageUrl = itemData.imageUrl
        section.items.push(item)
      }
      menu.sections.push(section)
    }

    await db.manager.save(menu)
    return NextResponse.json({ success: true, menuId: menu.id })
  } catch (error) {
    console.error('Erro ao salvar menu:', error)
    return NextResponse.json({ error: 'Erro ao salvar menu' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const db = await initializeDB()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ menus: [] })
    }
    const menus = await db.getRepository(Menu).find({
      where: { user: { id: Number(userId) } },
      order: { createdAt: 'DESC' },
    })
    const result = menus.map(menu => ({
      id: menu.id,
      name: menu.name,
      codigo: menu.codigo,
      status: menu.status,
      imageUrl: menu.imageUrl,
    }))
    return NextResponse.json({ menus: result })
  } catch (error) {
    console.error('Erro ao buscar menus:', error)
    return NextResponse.json({ menus: [] }, { status: 500 })
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import { getDataSource } from '@/src/lib/db'

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
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { Orcamento } from '../../../src/entities/Orcamento'
import { ItemOrcamento } from '../../../src/entities/ItemOrcamento'
import { getDataSource } from '@/src/lib/db'
import { HeaderOrcamento } from '../../../src/entities/HeaderOrcamento'
import { FooterOrcamento } from '../../../src/entities/FooterOrcamento'
import { User } from '../../../src/entities/User'

export async function GET(request: Request) {
  let dataSource;
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'Usuário não fornecido' }, { status: 400 })
    }

    dataSource = await initializeDB()
    const orcamentoRepository = dataSource.getRepository(Orcamento)
    const headerRepo = dataSource.getRepository(HeaderOrcamento)
    const footerRepo = dataSource.getRepository(FooterOrcamento)

    const orcamentos = await orcamentoRepository.find({
      where: { user: { id: Number(userId) } },
      relations: ['cliente', 'itens'],
      order: { createdAt: 'DESC' }
    })

    const header = await headerRepo.findOne({ where: { user: { id: Number(userId) } } })
    const footer = await footerRepo.findOne({ where: { user: { id: Number(userId) } } })

    return NextResponse.json({ orcamentos, header, footer })
  } catch (error) {
    console.error('Erro ao buscar orçamentos:', error)
    
    // Tratamento específico para erros de conexão
    if (error instanceof Error && (error.message.includes('Driver not Connected') || error.message.includes('Connection terminated'))) {
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

export async function POST(request: Request) {
  let dataSource;
  try {
    const data = await request.json()
    const { orcamento, itens, userId } = data

    if (!userId) {
      return NextResponse.json({ error: 'Usuário não fornecido' }, { status: 400 })
    }

    dataSource = await initializeDB()
    const orcamentoRepository = dataSource.getRepository(Orcamento)
    const itemOrcamentoRepository = dataSource.getRepository(ItemOrcamento)
    const userRepository = dataSource.getRepository(User)
    const clienteRepository = dataSource.getRepository(require('../../../src/entities/Cliente').Cliente)

    const user = await userRepository.findOne({
      where: { id: Number(userId) }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Buscar o cliente pelo ID
    const cliente = await clienteRepository.findOne({ where: { id: orcamento.clienteId } })
    if (!cliente) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }

    // Criar o orçamento com o objeto cliente
    const novoOrcamento = orcamentoRepository.create({
      ...orcamento,
      user,
      cliente
    })

    const savedOrcamento = await orcamentoRepository.save(novoOrcamento)

    // Criar os itens do orçamento
    const savedItens = await Promise.all(
      itens.map(async (item: any) => {
        const novoItem = itemOrcamentoRepository.create({
          ...item,
          orcamento: savedOrcamento
        })
        return itemOrcamentoRepository.save(novoItem)
      })
    )

    return NextResponse.json({
      orcamento: savedOrcamento,
      itens: savedItens
    })
  } catch (error) {
    console.error('Erro ao criar orçamento:', error)
    
    // Tratamento específico para erros de conexão
    if (error instanceof Error && (error.message.includes('Driver not Connected') || error.message.includes('Connection terminated'))) {
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
      error: 'Erro ao criar orçamento',
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

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { userId, header, footer } = body
    if (!userId || !header || !footer) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }
    const dataSource = await initializeDB()
    const userRepo = dataSource.getRepository(User)
    const headerRepo = dataSource.getRepository(HeaderOrcamento)
    const footerRepo = dataSource.getRepository(FooterOrcamento)
    const user = await userRepo.findOne({ where: { id: Number(userId) } })
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }
    // Atualizar Header
    let headerEntity = await headerRepo.findOne({ where: { user: { id: user.id } } })
    if (headerEntity) {
      Object.assign(headerEntity, header)
      headerEntity.user = user
      await headerRepo.save(headerEntity)
    }
    // Atualizar Footer
    let footerEntity = await footerRepo.findOne({ where: { user: { id: user.id } } })
    if (footerEntity) {
      Object.assign(footerEntity, footer)
      footerEntity.user = user
      await footerRepo.save(footerEntity)
    }
    return NextResponse.json({ header: headerEntity, footer: footerEntity })
  } catch (error) {
    console.error('Erro ao atualizar header/footer:', error)
    return NextResponse.json({ error: 'Erro ao atualizar header/footer' }, { status: 500 })
  }
} 
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth'
import { getDataSource } from '@/src/lib/db'
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
import { NextRequest, NextResponse } from 'next/server'
import { getDataSource } from '@/src/lib/db'
import { Subscription } from '@/src/entities/Subscription'
import { User } from '@/src/entities/User'

export async function GET(request: NextRequest) {
  let dataSource: any = null
  
  try {
    dataSource = await initializeDB()
    const subscriptionRepository = dataSource.getRepository(Subscription)
    const userRepository = dataSource.getRepository(User)
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Construir query
    const queryBuilder = subscriptionRepository
      .createQueryBuilder('subscription')
      .leftJoinAndSelect('subscription.user', 'user')
      .select([
        'subscription',
        'user.id',
        'user.name',
        'user.email'
      ])
    
    // Filtros
    if (userId) {
      queryBuilder.andWhere('subscription.userId = :userId', { userId: parseInt(userId) })
    }
    
    if (status) {
      queryBuilder.andWhere('subscription.status = :status', { status })
    }

    // Ordenação
    queryBuilder.orderBy('subscription.createdAt', 'DESC')

    // Paginação
    const offset = (page - 1) * limit
    queryBuilder.skip(offset).take(limit)

    // Executar query
    const [subscriptions, total] = await queryBuilder.getManyAndCount()

    // Calcular estatísticas
    const stats = await subscriptionRepository
      .createQueryBuilder('subscription')
      .select([
        'subscription.status',
        'COUNT(*) as count'
      ])
      .groupBy('subscription.status')
      .getRawMany()

    return NextResponse.json({
      subscriptions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      stats
    })

  } catch (error: any) {
    console.error('Erro ao buscar assinaturas:', error)
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    if (dataSource) {
      try {
        await dataSource.destroy()
      } catch (error) {
        console.warn('Erro ao destruir conexão:', error)
      }
    }
  }
}

export async function POST(request: NextRequest) {
  let dataSource: any = null
  
  try {
    dataSource = await initializeDB()
    const subscriptionRepository = dataSource.getRepository(Subscription)
    const userRepository = dataSource.getRepository(User)
    
    const body = await request.json()
    const {
      externalId,
      customerId,
      value,
      cycle,
      description,
      billingType,
      status,
      dateCreated,
      nextDueDate,
      endDate,
      externalReference,
      paymentLink,
      checkoutSession,
      creditCardNumber,
      creditCardBrand,
      creditCardToken,
      userId
    } = body

    // Validações
    if (!externalId || !value || !cycle || !billingType || !status || !userId) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: externalId, value, cycle, billingType, status, userId' },
        { status: 400 }
      )
    }

    // Verificar se o usuário existe
    const user = await userRepository.findOne({ where: { id: parseInt(userId) } })
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o usuário já tem uma assinatura
    const existingSubscription = await subscriptionRepository.findOne({
      where: { userId: parseInt(userId) }
    })

    if (existingSubscription) {
      return NextResponse.json(
        { error: 'Usuário já possui uma assinatura' },
        { status: 400 }
      )
    }

    // Verificar se o externalId já existe
    const existingExternalId = await subscriptionRepository.findOne({
      where: { externalId }
    })

    if (existingExternalId) {
      return NextResponse.json(
        { error: 'ExternalId já existe' },
        { status: 400 }
      )
    }

    // Criar assinatura
    const subscription = subscriptionRepository.create({
      externalId,
      customerId,
      value: parseFloat(value),
      cycle,
      description,
      billingType,
      status,
      dateCreated: dateCreated ? new Date(dateCreated) : null,
      nextDueDate: nextDueDate ? new Date(nextDueDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      externalReference,
      paymentLink,
      checkoutSession,
      creditCardNumber,
      creditCardBrand,
      creditCardToken,
      userId: parseInt(userId),
      deleted: false
    })

    const savedSubscription = await subscriptionRepository.save(subscription)

    return NextResponse.json({
      success: true,
      message: 'Assinatura criada com sucesso',
      subscription: savedSubscription
    })

  } catch (error: any) {
    console.error('Erro ao criar assinatura:', error)
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    if (dataSource) {
      try {
        await dataSource.destroy()
      } catch (error) {
        console.warn('Erro ao destruir conexão:', error)
      }
    }
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import { uploadFileToS3 } from '@/src/lib/s3'

// Configuração para aumentar limite de tamanho (nova sintaxe Next.js 13+)
export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const customPath = formData.get('path') as string

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      )
    }

    // Verificar se é uma imagem
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'O arquivo deve ser uma imagem' },
        { status: 400 }
      )
    }

    // Verificar tamanho (máximo 20MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'O arquivo deve ter no máximo 5MB' },
        { status: 400 }
      )
    }

    // Usar path customizado ou gerar um padrão
    const path = customPath || `uploads/${Date.now()}-${file.name}`

    // Fazer upload para S3
    const imageUrl = await uploadFileToS3(file, path)

    return NextResponse.json({ 
      url: imageUrl,
      message: 'Imagem enviada com sucesso'
    })

  } catch (error: any) {
    console.error('Erro ao fazer upload:', error)
    return NextResponse.json(
      { error: 'Erro ao fazer upload da imagem' },
      { status: 500 }
    )
  }
} 
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getDataSource } from '@/src/lib/db'
import { User, TipoPlano, UserStatus } from '@/src/entities/User'
import { Cupom, StatusCupom } from '@/src/entities/Cupom'
import { Subscription } from '@/src/entities/Subscription'
import { asaasService } from '@/src/services/AsaasService'
import bcrypt from 'bcryptjs'
import { DeepPartial } from 'typeorm'

const VALORES_PLANO = {
  BASICO: 39.50,
  PRO: 47.50
}

export async function POST(request: Request) {
  let dataSource;
  try {
    // Inicializa a conexão com o banco
    dataSource = await initializeDB()
    
    const data = await request.json()
    let descontoAplicado = 0;

    const userRepository = dataSource.getRepository(User)
    const cupomRepository = dataSource.getRepository(Cupom)
    const subscriptionRepository = dataSource.getRepository(Subscription)

    // Verifica se já existe usuário com este email
    const existingEmail = await userRepository.findOne({
      where: { email: data.email }
    })

    if (existingEmail) {
      return NextResponse.json({
        message: 'Já existe um usuário com este email',
        field: 'email'
      }, { status: 400 })
    }

    // Verifica se já existe usuário com este CPF/CNPJ
    const existingCpfCnpj = await userRepository.findOne({
      where: { cpfOuCnpj: data.cpfCnpj }
    })

    if (existingCpfCnpj) {
      return NextResponse.json({
        message: 'Já existe um usuário com este CPF/CNPJ',
        field: 'cpfCnpj'
      }, { status: 400 })
    }

    // Calcula o valor do plano
    let valorPlano = VALORES_PLANO[data.plano as keyof typeof VALORES_PLANO]
    let cupomAplicado = null

    // Se tem cupom, valida e aplica o desconto
    if (data.cupomDesconto) {
      const cupom = await cupomRepository.findOne({
        where: { codigo: data.cupomDesconto.toUpperCase() }
      })

      if (cupom && cupom.status === StatusCupom.ATIVO) {
        // Verifica se não atingiu o limite de usos
        if (!cupom.limiteUsos || cupom.quantidadeUsos < cupom.limiteUsos) {
          // Aplica o desconto
         // valorPlano = Number((valorPlano * (1 - cupom.desconto / 100)).toFixed(2))
         // cupomAplicado = cupom
          descontoAplicado = cupom.desconto

          // Atualiza a quantidade de usos do cupom
          await cupomRepository.update(cupom.id, {
            quantidadeUsos: cupom.quantidadeUsos + 1,
            // Se atingiu o limite, marca como inativo
            status: cupom.limiteUsos && cupom.quantidadeUsos + 1 >= cupom.limiteUsos 
              ? StatusCupom.INATIVO 
              : StatusCupom.ATIVO
          })
        }
      }
    }

    // Cria o cliente no Asaas
    const customerResponse = await asaasService.createCustomer({
      name: data.name,
      email: data.email,
      cpfCnpj: data.cpfCnpj.replace(/\D/g, '')
    })

    interface AsaasSubscriptionResponse {
      id: string
      customer: string
      value: number
      nextDueDate: string
      cycle: string
      description: string
      billingType: string
      status: string
      createdAt: string
      updatedAt: string
      endDate: string
    }
    // Cria a assinatura no Asaas
    const subscriptionResponse: AsaasSubscriptionResponse = await asaasService.createSubscription({
      customer: customerResponse.id,
      billingType: 'CREDIT_CARD',
      value: valorPlano,
      nextDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // 7 dias a partir de hoje
      cycle: 'MONTHLY',
      description: `${data.cupomDesconto?.toUpperCase().length > 0 ? `Cupom: ${data.cupomDesconto.toUpperCase()}` : ''} : Assinatura ${data.plano} - Doce Gestão`,
      creditCard: {
        holderName: data.cartao.nome,
        number: data.cartao.numero,
        expiryMonth: data.cartao.mes,
        expiryYear: data.cartao.ano,
        ccv: data.cartao.cvv
      },
      creditCardHolderInfo: {
        name: data.cartao.nome,
        email: data.email,
        cpfCnpj: data.cpfCnpj,
        postalCode: data.cep,
        addressNumber: data.numero,
        phone: data.telefone
      },
      maxPayments: 2,
      discount: {
        value: descontoAplicado,
        dueDateLimitDays: 1,
        type: 'PERCENTAGE'
      }
    })

    // Cria hash da senha
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Cria o usuário
    const userData: DeepPartial<User> = {
      name: data.name,
      email: data.email,
      cpfOuCnpj: data.cpfCnpj,
      password: hashedPassword,
      plano: data.plano as TipoPlano,
      valorPlano: valorPlano,
      status: UserStatus.ATIVO,
      cupomDesconto: data.cupomDesconto.toUpperCase(),
      idAssinatura: subscriptionResponse.id,
      idCustomer: customerResponse.id,
      telefone: data.telefone.replace(/\D/g, '')
    }

    const user = userRepository.create(userData)

    // Salva o usuário no banco
    const savedUser = await userRepository.save(user)

    // Grava a assinatura no banco de dados
    const subscriptionData: DeepPartial<Subscription> = {
      externalId: subscriptionResponse.id,
      customerId: customerResponse.id,
      value: valorPlano,
      cycle: 'MONTHLY',
      description: subscriptionResponse.description || `${data.cupomDesconto?.toUpperCase().length > 0 ? `Cupom: ${data.cupomDesconto.toUpperCase()}` : ''} : Assinatura ${data.plano} - Doce Gestão`,
      billingType: 'CREDIT_CARD',
      status: subscriptionResponse.status || 'ACTIVE',
      dateCreated: new Date(),
      nextDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: subscriptionResponse.endDate,
      externalReference: '',
      paymentLink: '',
      checkoutSession: '',
      creditCardNumber: data.cartao.numero.slice(-4), // Últimos 4 dígitos
      creditCardBrand: 'UNKNOWN',
      creditCardToken: '',
      userId: savedUser.id,
      deleted: false
    }

    const subscription = subscriptionRepository.create(subscriptionData)
    await subscriptionRepository.save(subscription)

    // Remove a senha do retorno
    const { password, ...userWithoutPassword } = savedUser

    return NextResponse.json({
      message: 'Usuário criado com sucesso',
      user: {
        ...userWithoutPassword,
        valorPlano,
        cupom: cupomAplicado ? {
          valorFinal: valorPlano
        } : null
      },
      subscription: {
        id: subscription.id,
        externalId: subscription.externalId,
        status: subscription.status,
        value: subscription.value,
        nextDueDate: subscription.nextDueDate
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao processar dados do registro:', error)
    return NextResponse.json(
      { message: 'Erro ao processar dados do registro' },
      { status: 500 }
    )
  } finally {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy()
    }
  }
}
