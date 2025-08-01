'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CreditCard, Calendar, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { signOut } from "next-auth/react"

interface AssinaturaManagementCardProps {
  plano: string
  valorPlano: number
  subscription?: {
    id: number
    externalId: string
    value: number
    cycle: string
    status: string
    billingType: string
    nextDueDate?: Date
    description?: string
    isActive: boolean
    isOverdue: boolean
    isExpired: boolean
    daysUntilNextDue: number
    formattedValue: string
    formattedNextDueDate: string
  }
}

export function AssinaturaManagementCard({ plano, valorPlano, subscription }: AssinaturaManagementCardProps) {
  const [dialogAberto, setDialogAberto] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'INACTIVE':
        return 'bg-red-100 text-red-800'
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-[#0B7A48]" />
            <h2 className="text-lg font-medium text-gray-900">Gerenciar Assinatura</h2>
          </div>
          {subscription && (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
              {subscription.status}
            </span>
          )}
        </div>
        
        {subscription ? (
          <div className="space-y-4">
            {/* Informações principais */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <span className="text-gray-600">Plano {plano}</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-semibold text-[#0B7A48]">
                    {subscription.formattedValue}
                  </span>
                  <span className="text-sm text-gray-500">/{subscription.cycle.toLowerCase()}</span>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                onClick={() => setDialogAberto(true)}
              >
                Cancelar Assinatura
              </Button>
            </div>

            {/* Detalhes da assinatura */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Próximo Vencimento</p>
                  <p className="text-sm font-medium">{subscription.formattedNextDueDate}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Dias até Vencimento</p>
                <p className={`text-sm font-medium ${
                  subscription.daysUntilNextDue <= 7 
                    ? 'text-red-600' 
                    : subscription.daysUntilNextDue <= 15 
                    ? 'text-yellow-600' 
                    : 'text-green-600'
                }`}>
                  {subscription.daysUntilNextDue} dias
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Tipo de Cobrança</p>
                <p className="text-sm font-medium">{subscription.billingType}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">ID da Assinatura</p>
                <p className="text-sm font-mono text-gray-700">{subscription.externalId}</p>
              </div>
            </div>

            {/* Alertas */}
            {subscription.isOverdue && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <p className="text-red-800 text-sm font-medium">
                    Assinatura em atraso há {Math.abs(subscription.daysUntilNextDue)} dias
                  </p>
                </div>
              </div>
            )}

            {subscription.isExpired && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <p className="text-red-800 text-sm font-medium">
                    Assinatura expirada
                  </p>
                </div>
              </div>
            )}

            {!subscription.isOverdue && !subscription.isExpired && subscription.daysUntilNextDue <= 7 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <p className="text-yellow-800 text-sm font-medium">
                    Vencimento próximo - {subscription.daysUntilNextDue} dias
                  </p>
                </div>
              </div>
            )}

            {subscription.description && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Descrição</p>
                <p className="text-sm text-gray-900">{subscription.description}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Plano {plano}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-semibold text-[#0B7A48]">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorPlano)}
                </span>
                <span className="text-sm text-gray-500">/mês</span>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
              onClick={() => setDialogAberto(true)}
            >
              Cancelar Assinatura
            </Button>
          </div>
        )}
      </Card>
    </>
  )
} 