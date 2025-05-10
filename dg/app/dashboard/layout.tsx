'use client'

import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { redirect } from 'next/navigation'
import { UserStatus } from '@/src/entities/User'
import { Sidebar } from './components/Sidebar'
import PhoneVerificationModal from '@/components/PhoneVerificationModal'
import { toast } from 'react-hot-toast'
import { uploadFile } from '@/src/lib/firebase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  if (status === 'loading') {
    return <div>Carregando...</div>
  }

  if (!session) {
    redirect('/login')
  }

  const isInactive = session?.user?.status === UserStatus.INATIVO || !session?.user?.plano
  const isPlansPage = pathname === '/dashboard/planos'

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      // Gera um nome único para o arquivo
      const timestamp = Date.now()
      const filename = `${timestamp}-${file.name}`
      const path = `uploads/${filename}`

      // Faz o upload para o Firebase Storage
      const downloadURL = await uploadFile(file, path)
      
      console.log('URL da imagem no Firebase:', downloadURL)
      toast.success('Imagem enviada com sucesso!')
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      toast.error('Erro ao enviar imagem')
    }
  }

  // Se estiver inativo e na página de planos, mostra apenas o conteúdo
  if (isInactive && isPlansPage) {
    return children
  }

  // Layout padrão com sidebar
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="min-h-screen lg:pl-64 pt-16 lg:pt-0">
        <div className="container mx-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
      
      {/* Modal de verificação de telefone */}
      <PhoneVerificationModal />
    </div>
  )
} 