'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CreditCard } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from "@/components/ui/use-toast"
import { signOut } from "next-auth/react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useState } from "react"

interface AssinaturaCardProps {
  plano: string
  valorPlano: number
}

export function AssinaturaCard({ plano, valorPlano }: AssinaturaCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [dialogAberto, setDialogAberto] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleCancelar = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/assinatura/cancelar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao cancelar assinatura')
      }

      // Faz logout imediatamente após o cancelamento
      await signOut({ 
        redirect: false
      })

      // Mostra o toast e redireciona
      toast({
        title: "Assinatura cancelada",
        description: "Sua assinatura foi cancelada com sucesso.",
        variant: "default",
      })

      // Redireciona para a página inicial
      window.location.href = '/'

    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error)
      toast({
        title: "Erro ao cancelar",
        description: error instanceof Error ? error.message : "Não foi possível cancelar sua assinatura. Tente novamente.",
        variant: "destructive",
      })
      setLoading(false)
      setDialogAberto(false)
    }
  }

  return (
    <>
      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cancelar Assinatura</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar sua assinatura? Você perderá acesso a todas as funcionalidades do sistema e será deslogado imediatamente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogAberto(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleCancelar}
              disabled={loading}
            >
              {loading ? 'Cancelando...' : 'Sim, cancelar assinatura'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-[#0B7A48]" />
            <h2 className="text-lg font-medium text-gray-900">Assinatura</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:bg-red-50 hover:text-red-700 text-xs font-medium"
            onClick={() => setDialogAberto(true)}
          >
            Cancelar
          </Button>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-gray-600">Plano {plano}</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-semibold text-[#0B7A48]">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorPlano)}
            </span>
            <span className="text-sm text-gray-500">/mês</span>
          </div>
        </div>
      </Card>
    </>
  )
} 