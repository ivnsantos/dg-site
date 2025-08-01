import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { initializeDB } from './db'
import { User, UserStatus } from '@/src/entities/User'

export interface AuthenticatedUser {
  id: number
  name: string
  email: string
  status: UserStatus
  plano: string
  isActive: boolean
}

/**
 * Verifica se o usuário está autenticado e ativo
 * @returns Promise<AuthenticatedUser | null>
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return null
    }

    const dataSource = await initializeDB()
    const userRepository = dataSource.getRepository(User)
    
    const user = await userRepository.findOne({
      where: { email: session.user.email }
    })

    if (!user) {
      return null
    }

    // Verificar se o usuário está ativo
    const isActive = user.status === UserStatus.ATIVO

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      plano: user.plano,
      isActive
    }

  } catch (error) {
    console.error('Erro ao verificar usuário autenticado:', error)
    return null
  }
}

/**
 * Verifica se o usuário tem acesso à plataforma
 * @returns Promise<boolean>
 */
export async function hasPlatformAccess(): Promise<boolean> {
  const user = await getAuthenticatedUser()
  return user?.isActive === true
}

/**
 * Middleware para verificar acesso à plataforma
 * Redireciona para página de assinatura inativa se necessário
 */
export async function checkPlatformAccess() {
  const user = await getAuthenticatedUser()
  
  if (!user) {
    return { redirect: '/login' }
  }
  
  if (!user.isActive) {
    return { redirect: '/assinatura-inativa' }
  }
  
  return { user }
} 