'use client'

import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  return (
    <Button
      onClick={() => signOut({ callbackUrl: '/login' })}
      variant="outline"
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      Sair
    </Button>
  )
} 