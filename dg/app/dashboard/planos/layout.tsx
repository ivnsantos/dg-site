'use client'

import { useSession } from 'next-auth/react'
import { UserStatus } from '@/src/entities/User'

export default function PlanosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const isInactive = session?.user?.status === UserStatus.INATIVO || !session?.user?.plano

  // Se o usuário estiver inativo, mostra apenas o conteúdo sem layout
  if (isInactive) {
    return (
      <div className="min-h-screen bg-background">
        <main className="h-full">
          {children}
        </main>
      </div>
    )
  }

  // Se o usuário estiver ativo, mostra o conteúdo com o layout padrão
  return children
} 