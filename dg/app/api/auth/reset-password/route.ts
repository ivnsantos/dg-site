import { NextResponse } from 'next/server'
import { AppDataSource, initializeDB } from '@/src/lib/db'
import { User } from '@/src/entities/User'
import * as bcrypt from 'bcrypt'

export async function POST(request: Request) {
  try {
    // Inicializa o banco de dados
    await initializeDB()
    
    const body = await request.json()
    const { email, token, password } = body

    if (!email || !token || !password) {
      return NextResponse.json({ 
        message: 'Email, token e senha são obrigatórios' 
      }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ 
        message: 'A senha deve ter pelo menos 6 caracteres' 
      }, { status: 400 })
    }

    const userRepository = AppDataSource.getRepository(User)
    
    // Busca o usuário pelo email
    const user = await userRepository.findOne({
      where: { email }
    })
    
    if (!user || user.resetPasswordToken !== token) {
      return NextResponse.json({ 
        message: 'Token inválido ou expirado' 
      }, { status: 400 })
    }
    
    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Atualiza a senha e limpa o token de redefinição
    user.password = hashedPassword
    user.resetPasswordToken = undefined
    
    await userRepository.save(user)
    
    return NextResponse.json({ 
      message: 'Senha alterada com sucesso' 
    }, { status: 200 })
    
  } catch (error) {
    console.error('Erro ao redefinir senha:', error)
    return NextResponse.json({ 
      message: 'Erro ao processar a redefinição de senha' 
    }, { status: 500 })
  }
} 