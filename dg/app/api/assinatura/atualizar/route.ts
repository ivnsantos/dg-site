import { NextResponse } from 'next/server'
import { initializeDB } from '@/src/lib/db'
import { User, UserStatus } from '@/src/entities/User'
import { AsaasService } from '@/src/services/AsaasService'

export async function POST(request: Request) {
  try {
    console.log("Iniciando processamento da requisição...")
    
    const body = await request.json()
    console.log("Dados recebidos:", body)
    
    const { 
      userId, 
      plano, 
      valorPlano,
      cartao,
      cep,
      numero,
      telefone,
      email
    } = body

    if (!userId || !plano || !valorPlano || !cartao || !cep || !numero || !telefone || !email) {
      console.log("Dados inválidos:", { userId, plano, valorPlano, cartao, cep, numero, telefone, email })
      return NextResponse.json(
        { message: 'Dados inválidos' },
        { status: 400 }
      )
    }

    console.log("Conectando ao banco de dados...")
    const connection = await initializeDB()
    const userRepository = connection.getRepository(User)
    const asaasService = new AsaasService()

    console.log("Buscando usuário:", userId)
    const user = await userRepository.findOne({
      where: { id: userId }
    })

    if (!user) {
      console.log("Usuário não encontrado:", userId)
      return NextResponse.json(
        { message: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    if (!user.cpfOuCnpj) {
      console.log("CPF/CNPJ não cadastrado para o usuário:", userId)
      return NextResponse.json(
        { message: 'CPF/CNPJ não cadastrado' },
        { status: 400 }
      )
    }

    try {
      console.log("Criando assinatura no Asaas...")
      const subscriptionResponse = await asaasService.createSubscription({
        customer: user.idCustomer,
        billingType: 'CREDIT_CARD',
        value: valorPlano,
        nextDueDate: new Date().toISOString().split('T')[0],
        cycle: 'MONTHLY',
        description: `Assinatura ${plano} - Doce Gestão`,
        creditCard: {
          holderName: cartao.nome,
          number: cartao.numero.replace(/\D/g, ''),
          expiryMonth: cartao.mes,
          expiryYear: cartao.ano,
          ccv: cartao.cvv
        },
        creditCardHolderInfo: {
          name: cartao.nome,
          email: email,
          cpfCnpj: user.cpfOuCnpj.replace(/\D/g, ''),
          postalCode: cep.replace(/\D/g, ''),
          addressNumber: numero,
          phone: telefone.replace(/\D/g, '')
        }
      })

      console.log("Assinatura criada com sucesso:", subscriptionResponse)

      console.log("Atualizando dados do usuário...")
      user.plano = plano
      user.status = UserStatus.ATIVO
      user.valorPlano = valorPlano
      user.idAssinatura = subscriptionResponse.id

      await userRepository.save(user)
      await connection.destroy()

      console.log("Processo finalizado com sucesso")
      return NextResponse.json({
        message: 'Assinatura criada com sucesso',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          status: user.status,
          plano: user.plano
        }
      })
    } catch (asaasError) {
      console.error('Erro ao criar assinatura no Asaas:', asaasError)
      return NextResponse.json(
        { message: 'Erro ao processar pagamento' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Erro ao atualizar plano:', error)
    return NextResponse.json(
      { message: 'Erro ao atualizar plano' },
      { status: 500 }
    )
  }
} 