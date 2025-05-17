import { NextResponse } from 'next/server'
import { initializeDB } from '@/src/lib/db'
import { User } from '@/src/entities/User'

export async function POST(request: Request) {
  try {
    // Inicializa o banco de dados
    const dataSource = await initializeDB()
    
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
    
    // Verifica se o código é válido
    if (!user.resetPasswordToken || user.resetPasswordToken !== code) {
      return NextResponse.json({ 
        message: 'Código inválido ou expirado' 
      }, { status: 400 })
    }
    
    // Marca o telefone como verificado e limpa o código
    user.verificationCode = true
    user.resetPasswordToken = undefined
    
    await userRepository.save(user)
    
    return NextResponse.json({ 
      message: 'Telefone verificado com sucesso' 
    }, { status: 200 })
    
  } catch (error) {
    console.error('Erro ao verificar telefone:', error)
    return NextResponse.json({ 
      message: 'Erro ao processar a verificação do telefone' 
    }, { status: 500 })
  }
} 