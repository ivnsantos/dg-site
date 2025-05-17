import { NextResponse } from 'next/server'
import { initializeDB } from '@/src/lib/db'
import { User } from '@/src/entities/User'
import { smsService } from '@/src/services/SmsService'

export async function POST(request: Request) {
  let dataSource;
  try {
    // Inicializa o banco de dados
    dataSource = await initializeDB()
    
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

    // Verifica se o telefone está disponível
    if (!user.telefone) {
      return NextResponse.json({ 
        message: 'Telefone não cadastrado. Entre em contato com o suporte.' 
      }, { status: 400 })
    }

    // Verifica se o telefone já foi validado
    if (user.verificationCode === true) {
      return NextResponse.json({ 
        message: 'Telefone já foi verificado anteriormente' 
      }, { status: 200 })
    }
    
    // Gera um código de 5 dígitos
    const verificationCode = Math.floor(10000 + Math.random() * 90000).toString()
    
    // Salva o código no campo resetPasswordToken
    user.resetPasswordToken = verificationCode
    
    await userRepository.save(user)
    
    // Envia o código por SMS
    const smsResult = await smsService.sendVerificationCode(user.telefone, verificationCode)
    
    // Por segurança, mostramos o código no console durante o desenvolvimento
    console.log(`Código de verificação para ${email} (${user.telefone}): ${verificationCode}`)
    
    return NextResponse.json({ 
      message: 'Código de verificação enviado com sucesso',
      smsSent: smsResult.success
    }, { status: 200 })
    
  } catch (error) {
    console.error('Erro ao enviar código de verificação:', error)
    return NextResponse.json({ 
      message: 'Erro ao processar o envio do código de verificação' 
    }, { status: 500 })
  } finally {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy()
    }
  }
} 