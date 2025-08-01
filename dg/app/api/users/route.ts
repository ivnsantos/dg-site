export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { initializeDB } from '@/src/lib/db'
import { User, TipoPlano, UserStatus } from '@/src/entities/User'
import { Cupom, StatusCupom } from '@/src/entities/Cupom'
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

    // Cria a assinatura no Asaas
    const subscriptionResponse = await asaasService.createSubscription({
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
    await userRepository.save(user)

    // Remove a senha do retorno
    const { password, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'Usuário criado com sucesso',
      user: {
        ...userWithoutPassword,
        valorPlano,
        cupom: cupomAplicado ? {
          codigo: cupomAplicado.codigo,
          desconto: cupomAplicado.desconto,
          valorFinal: valorPlano
        } : null
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