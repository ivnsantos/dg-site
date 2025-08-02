import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '../../api/auth/[...nextauth]/route'
import { initializeDB } from '@/src/lib/db'
import { User } from '@/src/entities/User'
import IngredientesClient from './IngredientesClient'
import { MarkupRequired } from '../components/MarkupRequired'

export const dynamic = 'force-dynamic'

export default async function IngredientesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Inicializa o banco de dados
  const dataSource = await initializeDB()
  
  // Busca dados do usuário no banco
  const userRepository = dataSource.getRepository(User)
  const user = await userRepository.findOne({
    where: { email: session.user.email }
  })

  if (!user) {
    redirect('/login')
  }

  // Verifica se o markup está configurado
  if (!user.markupIdeal) {
    return (
      <MarkupRequired
        title="Markup Não Configurado"
        description="Para cadastrar ingredientes e obter cálculos precisos de custos, você precisa configurar seu markup ideal primeiro."
      />
    )
  }

  return <IngredientesClient />
} 