import { NextResponse } from 'next/server'
import { getDataSource } from '@/src/lib/db'
import { User } from '@/src/entities/User'

export async function POST(request: Request) {
  try {
    // Inicializa o banco de dados
    const dataSource = await getDataSource()
    
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ 
        message: 'Email é obrigatório' 
      }, { status: 400 })
    }

    const userRepository = dataSource.getRepository(User)
    
    // Busca o usuário pelo email
    const user = await userRepository.findOne({
      where: { email }
    })
    
    if (!user) {
      return NextResponse.json({ 
        message: 'Usuário não encontrado' 
      }, { status: 404 })
    }
    
    // Retorna o status de verificação
    return NextResponse.json({ 
      verified: user.verificationCode === true
    }, { status: 200 })
    
  } catch (error) {
    console.error('Erro ao verificar status de verificação:', error)
    return NextResponse.json({ 
      message: 'Erro ao processar a verificação do status' 
    }, { status: 500 })
  }
} 