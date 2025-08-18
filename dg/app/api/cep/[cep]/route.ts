import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { cep: string } }
) {
  try {
    const { cep } = params
    
    if (!cep || cep.length !== 8) {
      return NextResponse.json(
        { error: 'CEP inválido' },
        { status: 400 }
      )
    }

    console.log('Buscando CEP:', cep)

    // Buscar CEP na API do ViaCEP
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
    
    if (!response.ok) {
      console.error('Erro na API ViaCEP:', response.status)
      return NextResponse.json(
        { error: 'Erro ao consultar CEP' },
        { status: 500 }
      )
    }
    
    const data = await response.json()
    console.log('Resposta ViaCEP:', data)

    if (data.erro) {
      return NextResponse.json(
        { error: 'CEP não encontrado' },
        { status: 404 }
      )
    }

    if (!data.logradouro || !data.bairro || !data.localidade || !data.uf) {
      return NextResponse.json(
        { error: 'Dados do CEP incompletos' },
        { status: 500 }
      )
    }

    const endereco = {
      cep: data.cep,
      endereco: data.logradouro,
      numero: '',
      bairro: data.bairro,
      cidade: data.localidade,
      estado: data.uf
    }

    console.log('Endereço encontrado:', endereco)

    return NextResponse.json(endereco)

  } catch (error) {
    console.error('Erro ao buscar CEP:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 