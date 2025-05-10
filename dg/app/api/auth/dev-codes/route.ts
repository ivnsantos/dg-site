import { NextResponse } from 'next/server'
import { AppDataSource, initializeDB } from '@/src/lib/db'
import { User } from '@/src/entities/User'
import { Not, IsNull } from 'typeorm'

// ⚠️ ATENÇÃO: Esta API é apenas para ambiente de desenvolvimento
// Não deve ser acessível em produção, pois expõe informações sensíveis

export async function GET(request: Request) {
  // Verifica se estamos em ambiente de desenvolvimento
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({
      message: 'Esta API não está disponível em produção'
    }, { status: 403 })
  }

  try {
    // Inicializa o banco de dados
    await initializeDB()
    
    const userRepository = AppDataSource.getRepository(User)
    
    // Busca usuários com tokens de recuperação ativos
    const users = await userRepository.find({
      select: ['id', 'email', 'telefone', 'resetPasswordToken'],
      where: {
        resetPasswordToken: Not(IsNull())
      }
    })
    
    // Retorna apenas os dados necessários
    const activeTokens = users.map(user => ({
      email: user.email,
      telefone: user.telefone?.replace(/\d(?=\d{4})/g, "*"), // Oculta parte do telefone
      code: user.resetPasswordToken
    }))
    
    return NextResponse.json({
      message: 'Códigos de recuperação ativos',
      count: activeTokens.length,
      tokens: activeTokens
    }, { status: 200 })
    
  } catch (error) {
    console.error('Erro ao buscar códigos de recuperação:', error)
    return NextResponse.json({ 
      message: 'Erro ao processar a busca de códigos de recuperação' 
    }, { status: 500 })
  }
} 