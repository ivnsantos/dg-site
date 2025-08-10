import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getDataSource } from '@/src/lib/db'
import { User, TipoPlano, UserStatus } from '@/src/entities/User'
import { Subscription } from '@/src/entities/Subscription'
import { Cupom, StatusCupom } from '@/src/entities/Cupom'
import bcrypt from 'bcrypt'
import { AsaasService } from '@/src/services/AsaasService'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const dataSource = await getDataSource()
    const userRepository = dataSource.getRepository(User)
    const subscriptionRepository = dataSource.getRepository(Subscription)

    const user = await userRepository.findOne({
      where: { id: Number(session.user.id) },
      select: ['id', 'name', 'email', 'plano', 'status', 'valorPlano', 'markupIdeal', 'createdAt']
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Buscar assinatura do usuário
    const subscription = await subscriptionRepository.findOne({
      where: { userId: user.id },
      order: { createdAt: 'DESC' }
    })

    return NextResponse.json({
      user,
      subscription
    })
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error)
    
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

// Registro de usuário + criação de cliente/assinatura no Asaas
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      name,
      email,
      cpfCnpj,
      password,
      plano,
      cupomDesconto,
      cartao,
      telefone,
      cep,
      numero
    } = body || {}

    if (!name || !email || !cpfCnpj || !password || !plano || !cartao?.nome || !cartao?.numero || !cartao?.mes || !cartao?.ano || !cartao?.cvv || !telefone || !cep || !numero) {
      return NextResponse.json({ message: 'Dados inválidos' }, { status: 400 })
    }

    const dataSource = await getDataSource()
    const userRepository = dataSource.getRepository(User)
    const cupomRepository = dataSource.getRepository(Cupom)

    // Normalizar dados
    const cpfLimpo = String(cpfCnpj).replace(/\D/g, '')
    const telefoneLimpo = String(telefone || '').replace(/\D/g, '')

    // Evitar duplicidade por email/CPF
    const existingByEmail = await userRepository.findOne({ where: { email } })
    if (existingByEmail) {
      return NextResponse.json({ message: 'E-mail já cadastrado' }, { status: 409 })
    }

    const existingByCpf = await userRepository.findOne({ where: { cpfOuCnpj: cpfLimpo } })
    if (existingByCpf) {
      return NextResponse.json({ message: 'CPF/CNPJ já cadastrado' }, { status: 409 })
    }

    // Validar cupom se fornecido
    let cupomValido = null
    if (cupomDesconto) {
      try {
        cupomValido = await cupomRepository.findOne({
          where: { codigo: cupomDesconto.toUpperCase() }
        })

        if (!cupomValido) {
          return NextResponse.json({ message: 'Cupom não encontrado' }, { status: 400 })
        }

        if (cupomValido.status !== StatusCupom.ATIVO) {
          return NextResponse.json({ message: 'Cupom inativo' }, { status: 400 })
        }

        if (cupomValido.dataExpiracao && new Date() > new Date(cupomValido.dataExpiracao)) {
          return NextResponse.json({ message: 'Cupom expirado' }, { status: 400 })
        }

        if (cupomValido.limiteUsos && cupomValido.quantidadeUsos >= cupomValido.limiteUsos) {
          return NextResponse.json({ message: 'Cupom atingiu o limite de usos' }, { status: 400 })
        }
      } catch (cupomError) {
        console.error('Erro ao validar cupom:', cupomError)
        return NextResponse.json({ message: 'Erro ao validar cupom' }, { status: 500 })
      }
    }

    // Integração com Asaas (somente se tudo der certo, criamos o usuário)
    let customer
    let subscription
    let asaas: AsaasService
    try {
      asaas = new AsaasService()
      customer = await asaas.createCustomer({
        name,
        cpfCnpj: cpfLimpo,
        email,
        notificationDisabled: false
      })

      const planoEscolhido = (plano === 'PRO' ? TipoPlano.PRO : TipoPlano.BASICO)
      const valorPlano = planoEscolhido === TipoPlano.PRO ? 29.89 : 26.99

      const descricaoAssinatura = `Assinatura ${planoEscolhido} - Doce Gestão: ${cupomValido ? ` (cupom: ${cupomValido.codigo} - ${cupomValido.desconto}% de desconto)` : ''}`
      
      subscription = await asaas.createSubscription({
        customer: customer.id,
        billingType: 'CREDIT_CARD',
        value: valorPlano, // Mantém o valor original do plano
        nextDueDate: new Date().toISOString().split('T')[0],
        cycle: 'MONTHLY',
        description: descricaoAssinatura,
        maxPayments: 2,
        creditCard: {
          holderName: cartao.nome,
          number: String(cartao.numero).replace(/\D/g, ''),
          expiryMonth: cartao.mes,
          expiryYear: cartao.ano,
          ccv: cartao.cvv
        },
        creditCardHolderInfo: {
          name: cartao.nome,
          email,
          cpfCnpj: cpfLimpo,
          postalCode: String(cep).replace(/\D/g, ''),
          addressNumber: String(numero),
          phone: telefoneLimpo || ''
        },
        discount: cupomValido ? {
          value: cupomValido.desconto, // Usa a porcentagem de desconto do cupom validado
          dueDateLimitDays: 1,
          type: 'PERCENTAGE'
        } : undefined
      })

      // Sucesso no Asaas → criar o usuário agora
      const hashedPassword = await bcrypt.hash(password, 10)
      const user = new User()
      user.name = name
      user.email = email
      user.password = hashedPassword
      user.cpfOuCnpj = cpfLimpo
      user.telefone = telefoneLimpo
      user.cupomDesconto = cupomValido ? cupomValido.codigo : ''
      user.plano = planoEscolhido
      user.status = UserStatus.ATIVO
      user.idCustomer = customer.id
      user.idAssinatura = subscription.id
      user.valorPlano = valorPlano

      const savedUser = await userRepository.save(user)

      // Atualizar uso do cupom após salvar o usuário com sucesso
      if (cupomValido) {
        try {
          cupomValido.quantidadeUsos = (cupomValido.quantidadeUsos || 0) + 1
          
          // Se atingiu o limite de usos, marcar como inativo
          if (cupomValido.limiteUsos && cupomValido.quantidadeUsos >= cupomValido.limiteUsos) {
            cupomValido.status = StatusCupom.INATIVO
          }
          
          await cupomRepository.save(cupomValido)
        } catch (cupomUpdateError) {
          console.error('Erro ao atualizar uso do cupom:', cupomUpdateError)
          // Não falha o registro se não conseguir atualizar o cupom
        }
      }

      return NextResponse.json({
        success: true,
        user: {
          id: savedUser.id,
          name: savedUser.name,
          email: savedUser.email,
          plano: savedUser.plano,
          status: savedUser.status
        },
        subscription: {
          id: subscription.id,
          status: subscription.status
        }
      })
    } catch (asaasErr: any) {
      const message =
      asaasErr instanceof Error
        ? asaasErr.message
        : String((asaasErr as any)?.message ?? asaasErr)
  
    return NextResponse.json({ message }, { status: 400 })
    }

  } catch (error: any) {
    console.error('Erro no registro/assinatura:', error)
    // Tratar violação de chave única (email/cpf)
    if (error?.code === '23505') {
      const detail: string = error?.detail || ''
      const isCpf = detail.includes('cpf_ou_cnpj')
      const isEmail = detail.includes('email')
      const message = isCpf ? 'CPF/CNPJ já cadastrado' : isEmail ? 'E-mail já cadastrado' : 'Registro duplicado'
      return NextResponse.json({ message, details: detail }, { status: 409 })
    }
    return NextResponse.json(
      { message: 'Erro ao processar registro', details: error?.message || 'Erro desconhecido' },
      { status: 500 }
    )
  }
}