import { getServerSession } from "next-auth"
import { User } from "@/src/entities/User"
import { getDataSource } from "@/src/lib/db"
import { NextResponse } from "next/server"
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { Confeitaria } from "@/src/entities/Confeitaria"

export async function GET(request: Request) {
  try {
    
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const dataSource = await getDataSource()
    const userRepository = dataSource.getRepository(User)
    const confeitariaRepository = dataSource.getRepository(Confeitaria)

    const user = await userRepository.findOne({
      where: { email: session.user.email },
    })
    console.log('👤 Usuário encontrado:', !!user, 'ID:', user?.id)

    if (!user) {
      console.log('❌ Usuário não encontrado')
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }
    
    // Buscar confeitaria específica do usuário (seguindo o padrão do projeto)
    const confeitaria = await confeitariaRepository.findOne({
      where: { usuario: { id: user.id } },
      relations: ['usuario']
    })
    
    if (confeitaria) {
      console.log('📊 Dados da confeitaria:', {
        id: confeitaria.id,
        nome: confeitaria.nome,
        markupIdeal: confeitaria.markupIdeal
      })
    }
    
    if (!confeitaria) {
      
      return NextResponse.json({ 
        error: 'Confeitaria não encontrada',
        message: 'Você ainda não configurou os dados da sua confeitaria. Use o formulário para criar a primeira configuração.'
      }, { status: 404 })
    }

    return NextResponse.json({
      confeitaria: {
        nome: confeitaria.nome,
        endereco: confeitaria.endereco,
        logo: confeitaria.logo,
        horarioFuncionamento: confeitaria.horarioFuncionamento,
        horasTrabalhoDiarias: confeitaria.horasTrabalhoDiarias,
        quantidadeFuncionarios: confeitaria.quantidadeFuncionarios,
        folhaPagamentoTotal: confeitaria.folhaPagamentoTotal,
        faturamentoMedio: confeitaria.faturamentoMedio,
        faturamentoDesejado: confeitaria.faturamentoDesejado,
        regimeTributario: confeitaria.regimeTributario,
        porcentagemImposto: confeitaria.porcentagemImposto,
        custosFixos: confeitaria.custosFixos,
        proLabore: confeitaria.proLabore,
        diasTrabalhadosMes: confeitaria.diasTrabalhadosMes,
        pagaComissao: confeitaria.pagaComissao,
        porcentagemComissao: confeitaria.porcentagemComissao,
        taxaMaquininha: confeitaria.taxaMaquininha,
        porcentagemLucroDesejado: confeitaria.porcentagemLucroDesejado,
        markupIdeal: confeitaria.markupIdeal
      }
    })

  } catch (error) {
    
    if (error instanceof Error && error.message.includes('Driver not Connected')) {
      return NextResponse.json({ 
        error: 'Erro de conexão com o banco de dados. Tente novamente em alguns segundos.',
        code: 'DB_CONNECTION_ERROR'
      }, { status: 503 })
    }
    
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const data = await request.json()
    console.log('Dados recebidos:', data)

    const dataSource = await getDataSource()
    const userRepository = dataSource.getRepository(User)
    const confeitariaRepository = dataSource.getRepository(Confeitaria)

    const user = await userRepository.findOne({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Verificar se já existe confeitaria para o usuário
    const confeitariaExistente = await confeitariaRepository.findOne({
      where: { usuario: { id: user.id } }
    })
    
    let markupAnterior = null
    let markupAlterado = false
    
    if (confeitariaExistente) {
      markupAnterior = confeitariaExistente.markupIdeal
      console.log('Markup anterior encontrado:', markupAnterior)
      
      // Deletar confeitaria existente para recriar
      await confeitariaRepository.remove(confeitariaExistente)
      console.log('Dados anteriores da confeitaria deletados')
    }

    // Cálculo do custo total mensal
    const custoTotalMensal =
      Number(data.folhaPagamentoTotal) +
      Number(data.custosFixos) +
      Number(data.proLabore) +
      (data.pagaComissao ? (Number(data.faturamentoDesejado) * (Number(data.porcentagemComissao) / 100)) : 0) +
      (Number(data.faturamentoDesejado) * (Number(data.taxaMaquininha) / 100))

    console.log('Custo total mensal calculado:', custoTotalMensal)

    // Cálculo do markup clássico (como fator)
    const comissao = data.pagaComissao ? (Number(data.porcentagemComissao) / 100) : 0
    const taxaMaquininha = Number(data.taxaMaquininha) / 100
    const imposto = Number(data.porcentagemImposto) / 100
    const lucro = Number(data.porcentagemLucroDesejado) / 100

    const despesasPercentuais = comissao + taxaMaquininha + imposto + lucro

    if (despesasPercentuais >= 1) {
      return NextResponse.json(
        { error: 'As despesas somam 100% ou mais. Impossível calcular markup.' },
        { status: 400 }
      )
    }

    const markupFator = 1 / (1 - despesasPercentuais)
    console.log('Markup fator calculado:', markupFator)
    
    // Verificar se o markup foi alterado
    if (markupAnterior && Math.abs(markupAnterior - markupFator) > 0.001) {
      markupAlterado = true
      console.log('Markup alterado de', markupAnterior, 'para', markupFator)
    }

    try {
      // Criar nova confeitaria
      const confeitaria = confeitariaRepository.create({
        ...data,
        markupIdeal: markupFator, // Salva como markupIdeal no banco
        usuario: user,
      })

      await confeitariaRepository.save(confeitaria)
      console.log('Confeitaria salva com sucesso')

      // Atualizar o markup do usuário
      user.markupIdeal = markupFator
      await userRepository.save(user)
      console.log('Usuário atualizado com sucesso')
      
      // Se o markup foi alterado, atualizar todos os produtos do usuário
      let produtosAtualizados = 0
      if (markupAlterado) {
        console.log('🔄 Atualizando produtos com novo markup...')
        
        const productRepository = dataSource.getRepository(require('@/src/entities/Product').Product)
        const produtos = await productRepository.find({
          where: { user: { id: user.id } }
        })
        
        if (produtos.length > 0) {
          console.log(`📦 Encontrados ${produtos.length} produtos para atualizar`)
          
          for (const produto of produtos) {
            // Recalcular preço sugerido com novo markup
            const novoPrecoSugerido = produto.totalCost * markupFator
            produto.suggestedPrice = novoPrecoSugerido
            
            // Recalcular margem de lucro
            if (produto.sellingPrice > 0) {
              produto.profitMargin = ((produto.sellingPrice - produto.totalCost) / produto.totalCost) * 100
            }
            
            await productRepository.save(produto)
          }
          
          produtosAtualizados = produtos.length
          console.log('✅ Todos os produtos foram atualizados com o novo markup')
        }
      }

      return new NextResponse(
        JSON.stringify({
          success: true,
          markupIdeal: markupFator.toFixed(3),
          markupAlterado,
          produtosAtualizados,
          message: markupAlterado 
            ? `Markup atualizado! ${produtosAtualizados} produtos foram atualizados com o novo markup.`
            : 'Configuração salva com sucesso!'
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    } catch (saveError) {
      console.error('Erro ao salvar no banco:', saveError)
      throw saveError
    }
  } catch (error) {
    console.error('Erro detalhado:', error)
    
    if (error instanceof Error && error.message.includes('Driver not Connected')) {
      return NextResponse.json({ 
        error: 'Erro de conexão com o banco de dados. Tente novamente em alguns segundos.',
        code: 'DB_CONNECTION_ERROR'
      }, { status: 503 })
    }
    
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
    )
  }
}
