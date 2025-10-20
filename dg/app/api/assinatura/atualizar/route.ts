import { NextResponse } from 'next/server'
import { getDataSource } from '@/src/lib/db'
import { User, UserStatus } from '@/src/entities/User'
import { Subscription } from '@/src/entities/Subscription'
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
    const dataSource = await getDataSource()
    const userRepository = dataSource.getRepository(User)
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
      // Tokenizar cartão de crédito
      console.log("Tokenizando cartão de crédito...")
      const tokenResponse = await asaasService.tokenizeCreditCard({
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
        },
        customer: user.idCustomer,
        remoteIp: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1'
      })

      console.log("Cartão tokenizado com sucesso:", tokenResponse)

      console.log("Criando assinatura no Asaas...")
      const subscriptionResponse = await asaasService.createSubscription({
        customer: user.idCustomer,
        billingType: 'CREDIT_CARD',
        value: valorPlano,
        nextDueDate: new Date().toISOString().split('T')[0],
        cycle: 'MONTHLY',
        description: `Assinatura ${plano} - Confeitech`,
        maxPayments: 2,
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

      // Criar ou atualizar registro da assinatura na tabela subscriptions
      const subscriptionRepository = dataSource.getRepository(Subscription)
      let subscriptionRecord = await subscriptionRepository.findOne({
        where: { userId: user.id }
      })

      if (!subscriptionRecord) {
        subscriptionRecord = new Subscription()
        subscriptionRecord.userId = user.id
      }

      subscriptionRecord.externalId = subscriptionResponse.id
      subscriptionRecord.customerId = user.idCustomer
      subscriptionRecord.value = valorPlano
      subscriptionRecord.cycle = 'MONTHLY'
      subscriptionRecord.description = `Assinatura ${plano} - Confeitech`
      subscriptionRecord.billingType = 'CREDIT_CARD'
      subscriptionRecord.status = subscriptionResponse.status
      subscriptionRecord.dateCreated = new Date(subscriptionResponse.dateCreated)
      subscriptionRecord.nextDueDate = new Date(subscriptionResponse.nextDueDate)
      subscriptionRecord.endDate = subscriptionResponse.endDate ? new Date(subscriptionResponse.endDate) : undefined
      
      // Salvar dados do cartão tokenizado
      subscriptionRecord.creditCardNumber = tokenResponse.creditCardNumber
      subscriptionRecord.creditCardBrand = tokenResponse.creditCardBrand
      subscriptionRecord.creditCardToken = tokenResponse.creditCardToken

      await subscriptionRepository.save(subscriptionRecord)

      console.log("Processo finalizado com sucesso")
      return NextResponse.json({
        message: 'Assinatura criada com sucesso',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          plano: user.plano,
          valorPlano: user.valorPlano,
          status: user.status
        },
        subscription: {
          id: subscriptionResponse.id,
          status: subscriptionResponse.status
        }
      })

    } catch (asaasError) {
      console.error("Erro ao criar assinatura no Asaas:", asaasError)
      return NextResponse.json(
        { 
          message: 'Erro ao criar assinatura no Asaas',
          details: asaasError instanceof Error ? asaasError.message : 'Erro desconhecido'
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Erro ao processar atualização de assinatura:', error)
    
    if (error instanceof Error && error.message.includes('Driver not Connected')) {
      return NextResponse.json({ 
        error: 'Erro de conexão com o banco de dados. Tente novamente em alguns segundos.',
        code: 'DB_CONNECTION_ERROR'
      }, { status: 503 })
    }
    
    return NextResponse.json(
      { 
        message: 'Erro ao processar atualização de assinatura',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
} 