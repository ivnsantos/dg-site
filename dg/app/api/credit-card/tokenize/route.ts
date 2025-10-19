import { NextRequest, NextResponse } from 'next/server'
import { AsaasService } from '@/src/services/AsaasService'

// Função para normalizar o ano de expiração
function normalizeExpiryYear(year: string): string {
  const yearStr = String(year).trim()
  
  // Se já tem 4 dígitos, retorna como está
  if (yearStr.length === 4) {
    return yearStr
  }
  
  // Se tem 2 dígitos, converte para 4
  if (yearStr.length === 2) {
    const yearNum = parseInt(yearStr)
    return `20${yearNum}`
  }
  
  // Se não conseguir normalizar, retorna o valor original
  return yearStr
}

export async function POST(request: NextRequest) {
  try {
    // Não requer autenticação - usado durante registro/assinatura

    const body = await request.json()
    const {
      creditCard,
      creditCardHolderInfo,
      customer,
      remoteIp
    } = body

    // Validar dados obrigatórios
    if (!creditCard || !creditCardHolderInfo || !customer || !remoteIp) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    // Validar dados do cartão
    if (!creditCard.holderName || !creditCard.number || !creditCard.expiryMonth || 
        !creditCard.expiryYear || !creditCard.ccv) {
      return NextResponse.json(
        { error: 'Dados do cartão incompletos' },
        { status: 400 }
      )
    }

    // Validar dados do portador
    if (!creditCardHolderInfo.name || !creditCardHolderInfo.email || 
        !creditCardHolderInfo.cpfCnpj || !creditCardHolderInfo.postalCode || 
        !creditCardHolderInfo.addressNumber || !creditCardHolderInfo.phone) {
      return NextResponse.json(
        { error: 'Dados do portador do cartão incompletos' },
        { status: 400 }
      )
    }

    // Normalizar dados
    const normalizedData = {
      creditCard: {
        holderName: creditCard.holderName.trim(),
        number: String(creditCard.number).replace(/\D/g, ''),
        expiryMonth: String(creditCard.expiryMonth).padStart(2, '0'),
        expiryYear: normalizeExpiryYear(String(creditCard.expiryYear)),
        ccv: String(creditCard.ccv).replace(/\D/g, '')
      },
      creditCardHolderInfo: {
        name: creditCardHolderInfo.name.trim(),
        email: creditCardHolderInfo.email.trim(),
        cpfCnpj: String(creditCardHolderInfo.cpfCnpj).replace(/\D/g, ''),
        postalCode: String(creditCardHolderInfo.postalCode).replace(/\D/g, ''),
        addressNumber: String(creditCardHolderInfo.addressNumber).trim(),
        phone: String(creditCardHolderInfo.phone).replace(/\D/g, '')
      },
      customer: String(customer).trim(),
      remoteIp: String(remoteIp).trim()
    }

    // Tokenizar cartão no Asaas
    const asaasService = new AsaasService()
    const tokenResponse = await asaasService.tokenizeCreditCard(normalizedData)

    return NextResponse.json({
      success: true,
      data: {
        creditCardNumber: tokenResponse.creditCardNumber,
        creditCardBrand: tokenResponse.creditCardBrand,
        creditCardToken: tokenResponse.creditCardToken
      }
    })

  } catch (error) {
    console.error('Erro ao tokenizar cartão:', error)
    
    // Tratar erros específicos do Asaas
    if (error instanceof Error) {
      if (error.message.includes('Invalid credit card')) {
        return NextResponse.json(
          { error: 'Cartão de crédito inválido' },
          { status: 400 }
        )
      }
      if (error.message.includes('Invalid customer')) {
        return NextResponse.json(
          { error: 'Cliente inválido' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
