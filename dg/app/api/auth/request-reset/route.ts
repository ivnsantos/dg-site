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
    const { email, telefone } = body

    if (!email || !telefone) {
      return NextResponse.json({ 
        message: 'Email e telefone são obrigatórios' 
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
        message: 'Se o email estiver cadastrado, você receberá um código de recuperação' 
      }, { status: 200 })
    }
    
    // Verifica se o telefone corresponde ao do usuário
    const telefoneNormalizado = telefone.replace(/\D/g, '')
    const userTelefoneNormalizado = user.telefone?.replace(/\D/g, '')
    
    if (telefoneNormalizado !== userTelefoneNormalizado) {
      return NextResponse.json({ 
        message: 'Telefone não corresponde ao cadastrado para este email' 
      }, { status: 400 })
    }
    
    // Gera um código de 5 dígitos
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
    console.log(`Código de recuperação para ${email}: ${resetCode}`)
    
    return NextResponse.json({ 
      message: 'Código de recuperação enviado com sucesso',
      emailSent: emailResult.success 
    }, { status: 200 })
    
  } catch (error) {
    console.error('Erro ao solicitar redefinição de senha:', error)
    return NextResponse.json({ 
      message: 'Erro ao processar a solicitação de redefinição de senha' 
    }, { status: 500 })
  }
} 