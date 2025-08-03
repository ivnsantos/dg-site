import { getServerSession } from "next-auth"
import { User } from "@/src/entities/User"
import { getDataSource } from "@/src/lib/db"
import { NextResponse } from "next/server"
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { Confeitaria } from "@/src/entities/Confeitaria"

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

    // Deletar confeitaria existente do usuário
    const confeitariaExistente = await confeitariaRepository.findOne({
      where: { usuario: { id: user.id } }
    })
    
    if (confeitariaExistente) {
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

    try {
      // Criar nova confeitaria
      const confeitaria = confeitariaRepository.create({
        ...data,
        markupIdeal: markupFator, // Salva como markupIdeal no banco
        user,
      })

      await confeitariaRepository.save(confeitaria)
      console.log('Confeitaria salva com sucesso')

      // Atualizar o markup do usuário
      user.markupIdeal = markupFator
      await userRepository.save(user)
      console.log('Usuário atualizado com sucesso')

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
