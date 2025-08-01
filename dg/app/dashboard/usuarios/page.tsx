import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '../../api/auth/[...nextauth]/route'
import { initializeDB } from '@/src/lib/db'
import { User, UserStatus } from '@/src/entities/User'
import { Subscription } from '@/src/entities/Subscription'
import { Card } from "@/components/ui/card"
import { UserCircle, Calculator } from 'lucide-react'
import { MarkupSection } from './components/MarkupSection'
import { AssinaturaManagementCard } from './components/AssinaturaManagementCard'

export const dynamic = 'force-dynamic'

export default async function UsuariosPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Inicializa o banco de dados
  const connection = await initializeDB()

  // Busca dados do usuário no banco
  const userRepository = connection.getRepository(User)
  const subscriptionRepository = connection.getRepository(Subscription)
  
  const user = await userRepository.findOne({
    where: { email: session.user.email }
  })

  if (!user) {
    redirect('/login')
  }

  // Busca dados da assinatura
  const subscription = await subscriptionRepository.findOne({
    where: { userId: user.id }
  })

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Minha Conta</h1>
      </div>

      {/* Dados Pessoais */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <UserCircle className="h-6 w-6 text-[#0B7A48]" />
            <h2 className="text-xl font-semibold text-gray-900">Dados Pessoais</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Nome</p>
            <p className="text-gray-900">{user.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Email</p>
            <p className="text-gray-900">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">CPF/CNPJ</p>
            <p className="text-gray-900">{user.cpfOuCnpj}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Telefone</p>
            {user.telefone ? (
              <div className="flex items-center">
                <p className="text-gray-900">{user.telefone}</p>
 
              </div>
            ) : (
              <p className="text-gray-900">-</p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Status</p>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                user.status === UserStatus.ATIVO 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {user.status}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Markup */}
      <MarkupSection markupIdeal={user.markupIdeal} />

      {/* Card de Assinatura - Layout Compacto */}
      <AssinaturaManagementCard 
        plano={user.plano} 
        valorPlano={user.valorPlano}
        subscription={subscription ? {
          id: subscription.id,
          externalId: subscription.externalId,
          value: subscription.value,
          cycle: subscription.cycle,
          status: subscription.status,
          billingType: subscription.billingType,
          nextDueDate: subscription.nextDueDate,
          description: subscription.description,
          isActive: subscription.isActive(),
          isOverdue: subscription.isOverdue(),
          isExpired: subscription.isExpired(),
          daysUntilNextDue: subscription.getDaysUntilNextDue(),
          formattedValue: subscription.getFormattedValue(),
          formattedNextDueDate: subscription.getFormattedNextDueDate()
        } : undefined}
      />
    </div>
  )
} 