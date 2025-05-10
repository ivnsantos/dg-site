import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '../../api/auth/[...nextauth]/route'
import { AppDataSource, initializeDB } from '@/src/lib/db'
import { User } from '@/src/entities/User'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { UserCircle, Calculator, Pencil, CheckCircle } from 'lucide-react'
import { AssinaturaCard } from './components/AssinaturaCard'
import { MarkupSection } from './components/MarkupSection'

export default async function UsuariosPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Inicializa o banco de dados
  const connection = await initializeDB()

  // Busca dados do usuário no banco
  const userRepository = connection.getRepository(User)
  const user = await userRepository.findOne({
    where: { email: session.user.email }
  })

  if (!user) {
    redirect('/login')
  }

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
                {user.verificationCode && (
                  <div className="flex items-center ml-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-xs text-green-600 font-medium">Verificado</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-900">-</p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Status</p>
            <p className="text-gray-900">{user.status}</p>
          </div>
        </div>
      </Card>

      {/* Markup */}
      <MarkupSection markupIdeal={user.markupIdeal} />

      {/* Assinatura */}
      <AssinaturaCard plano={user.plano} valorPlano={user.valorPlano} />
    </div>
  )
} 