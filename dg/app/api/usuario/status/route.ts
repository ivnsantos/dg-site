import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/auth'
import { initializeDB } from '@/src/lib/db'
import { User } from '@/src/entities/User'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const dataSource = await initializeDB()
    const userRepository = dataSource.getRepository(User)

    const user = await userRepository.findOne({
      where: { id: Number(session.user.id) }
    })

    await dataSource.destroy()

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