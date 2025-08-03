'use client'

import { useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Sidebar } from './components/Sidebar'
import EmailVerificationModal from '@/components/EmailVerificationModal'
import WhatsAppFloat from '@/components/WhatsAppFloat'
import { toast } from 'react-hot-toast'
import { uploadFileViaAPI } from '@/src/lib/s3'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [userStatus, setUserStatus] = useState<string | null>(null)

  // Verificar status do usuário
  useEffect(() => {
    const checkUserStatus = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/users/me')
          if (response.ok) {
            const userData = await response.json()
            setUserStatus(userData.status)
            
            // Se o usuário estiver inativo, redirecionar
            if (userData.status === 'INATIVO' && pathname !== '/assinatura-inativa') {
              router.push('/assinatura-inativa')
            }
          }
        } catch (error) {
          console.error('Erro ao verificar status do usuário:', error)
        }
      }
    }

    if (status === 'authenticated') {
      checkUserStatus()
    }
  }, [session, status, pathname, router])

  if (status === 'loading') {
    return <div>Carregando...</div>
  }

  if (!session) {
    redirect('/login')
  }

  // Se o usuário estiver inativo e não estiver na página de assinatura inativa
  if (userStatus === 'INATIVO' && pathname !== '/assinatura-inativa') {
    return null // O useEffect vai redirecionar
  }

  const isInactive = session?.user?.status.toString() === 'INATIVO' || !session?.user?.plano
  const isPlansPage = pathname === '/dashboard/planos'
  
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      // Gera um nome único para o arquivo
      const timestamp = Date.now()
      const filename = `${timestamp}-${file.name}`
      const path = `uploads/${filename}`

      // Faz o upload para o S3/Cloudflare R2
      const downloadURL = await uploadFileViaAPI(file, path)
      
      console.log('URL da imagem no S3:', downloadURL)
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
        <div className="container mx-auto p-4 lg:p-6">
          {children}
        </div>
      </main>
      
      {/* Modal de verificação de email */}
      <EmailVerificationModal />
      
      {/* WhatsApp Float Button */}
      <WhatsAppFloat position="left" />
    </div>
  )
} 