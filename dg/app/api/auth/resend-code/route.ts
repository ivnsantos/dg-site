export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { initializeDB } from '@/src/lib/db'
import { User } from '@/src/entities/User'
import { emailService } from '@/src/services/EmailService'

export async function POST(request: Request) {
  try {
    // Inicializa o banco de dados
    const dataSource = await initializeDB()
    
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
      // Por segurança, não informamos que o usuário não existe
      return NextResponse.json({ 
        message: 'Se o email estiver cadastrado, você receberá um novo código de recuperação' 
      }, { status: 200 })
    }

    // Verificar se o telefone está disponível
    if (!user.telefone) {
      return NextResponse.json({ 
        message: 'Não foi possível enviar o código por email. Entre em contato com o suporte.' 
      }, { status: 400 })
    }
    
    // Gera um novo código de 5 dígitos
    const resetCode = Math.floor(10000 + Math.random() * 90000).toString()
    
    // Atualiza o token de redefinição de senha do usuário
    user.resetPasswordToken = resetCode
    
    await userRepository.save(user)
    
    // Envia o código por email
    const emailResult = await emailService.sendVerificationCode(email, resetCode, user.name)
    
    // Se o email falhar, fazemos log mas não retornamos erro ao usuário
    if (!emailResult.success) {
      console.error('Falha ao enviar email:', emailResult.error)
    }
    
    // Por segurança, mostramos o código no console durante o desenvolvimento
    console.log(`Novo código de recuperação para ${email}: ${resetCode}`)
    
    return NextResponse.json({ 
      message: 'Novo código de recuperação enviado com sucesso',
      emailSent: emailResult.success
    }, { status: 200 })
    
  } catch (error) {
    console.error('Erro ao reenviar código de recuperação:', error)
    return NextResponse.json({ 
      message: 'Erro ao processar o reenvio do código de recuperação' 
    }, { status: 500 })
  }
} 