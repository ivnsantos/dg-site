import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { initializeDB } from '@/src/lib/db'
import { User } from '@/src/entities/User'

export async function GET(request: NextRequest) {
  let dataSource: any = null
  
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    dataSource = await initializeDB()
    const userRepository = dataSource.getRepository(User)
    
    const user = await userRepository.findOne({
      where: { email: session.user.email },
      select: [
        'id',
        'name',
        'email',
        'status',
        'plano',
        'valorPlano',
        'cupomDesconto',
        'idAssinatura',
        'idCustomer',
        'telefone',
        'createdAt',
        'updatedAt'
      ]
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: {
        ...user,
        isActive: user.status === 'ATIVO'
      }
    })

  } catch (error: any) {
    console.error('Erro ao buscar dados do usuário:', error)
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    if (dataSource) {
      try {
        await dataSource.destroy()
      } catch (error) {
        console.warn('Erro ao destruir conexão:', error)
      }
    }
  }
} 