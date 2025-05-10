import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { initializeDB } from '@/src/lib/db'
import { User } from '@/src/entities/User'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const connection = await initializeDB()
    const userRepository = connection.getRepository(User)

    const user = await userRepository.findOne({
      where: { id: session.user.id }
    })

    await connection.destroy()

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      status: user.status,
      plano: user.plano
    })
  } catch (error) {
    console.error('Erro ao verificar status do usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar status do usuário' },
      { status: 500 }
    )
  }
} 