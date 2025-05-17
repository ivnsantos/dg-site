import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/app/api/auth/auth'
import { User } from '../../../../src/entities/User'
import { initializeDB } from '../../../../src/lib/db' 

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { markupIdeal } = await request.json()

    if (!markupIdeal || isNaN(markupIdeal)) {
      return NextResponse.json({ error: 'Markup inválido' }, { status: 400 })
    }

    const dataSource = await initializeDB()
    const userRepository = dataSource.getRepository(User)

    const user = await userRepository.findOne({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    user.markupIdeal = markupIdeal
    await userRepository.save(user)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao salvar markup:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar markup' },
      { status: 500 }
    )
  }
} 