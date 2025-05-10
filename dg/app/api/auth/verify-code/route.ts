import { NextResponse } from 'next/server'
import { AppDataSource, initializeDB } from '@/src/lib/db'
import { User } from '@/src/entities/User'

export async function POST(request: Request) {
  try {
    // Inicializa o banco de dados
    await initializeDB()
    
    const body = await request.json()
    const { email, code } = body

    if (!email || !code) {
      return NextResponse.json({ 
        message: 'Email e código são obrigatórios' 
      }, { status: 400 })
    }

    if (code.length !== 5 || !/^\d+$/.test(code)) {
      return NextResponse.json({ 
        message: 'O código deve ter 5 dígitos' 
      }, { status: 400 })
    }

    const userRepository = AppDataSource.getRepository(User)
    
    // Busca o usuário pelo email
    const user = await userRepository.findOne({
      where: { email }
    })
    
    if (!user || user.resetPasswordToken !== code) {
      return NextResponse.json({ 
        message: 'Código inválido ou expirado' 
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      message: 'Código verificado com sucesso' 
    }, { status: 200 })
    
  } catch (error) {
    console.error('Erro ao verificar código:', error)
    return NextResponse.json({ 
      message: 'Erro ao processar a verificação do código' 
    }, { status: 500 })
  }
} 