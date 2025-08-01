'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CreditCard, Calendar, AlertTriangle, ChevronDown } from 'lucide-react'
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
  const [detalhesAbertos, setDetalhesAbertos] = useState(false)
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'ATIVO'
      case 'INACTIVE':
        return 'INATIVO'
      case 'CANCELLED':
        return 'CANCELADO'
      default:
        return status
    }
  }

  const getBillingTypeText = (billingType: string) => {
    switch (billingType) {
      case 'CREDIT_CARD':
        return 'Cartão de Crédito'
      case 'PIX':
        return 'PIX'
      case 'BOLETO':
        return 'Boleto'
      default:
        return billingType
    }
  }

  const getCycleText = (cycle: string) => {
    switch (cycle) {
      case 'MONTHLY':
        return 'mensal'
      case 'YEARLY':
        return 'anual'
      default:
        return cycle.toLowerCase()
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

      <Card className="p-6 bg-gradient-to-br from-white to-gray-50 border-0 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CreditCard className="h-5 w-5 text-[#0B7A48]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Gerenciar Assinatura</h2>
              <p className="text-sm text-gray-500">Controle sua assinatura</p>
            </div>
          </div>
          {subscription && (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
              {getStatusText(subscription.status)}
            </span>
          )}
        </div>
        
        {subscription ? (
          <div className="space-y-6">
            {/* Informações principais */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-[#0B7A48]">
                    {subscription.formattedValue}
                  </h3>
                  <p className="text-gray-600">Plano {plano} • {getCycleText(subscription.cycle)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Próximo vencimento</p>
                  <p className="font-semibold text-gray-900">{subscription.formattedNextDueDate}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    subscription.daysUntilNextDue <= 7 
                      ? 'bg-red-500' 
                      : subscription.daysUntilNextDue <= 15 
                      ? 'bg-yellow-500' 
                      : 'bg-green-500'
                  }`}></div>
                  <span className="text-sm text-gray-600">
                    {subscription.daysUntilNextDue} dias restantes
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:bg-gray-50 text-xs"
                    onClick={() => setDetalhesAbertos(!detalhesAbertos)}
                  >
                    {detalhesAbertos ? 'Ocultar' : 'Ver detalhes'}
                    <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${
                      detalhesAbertos ? 'rotate-180' : ''
                    }`} />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700 text-xs"
                    onClick={() => setDialogAberto(true)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>

            {/* Detalhes da assinatura - Colapsável */}
            {detalhesAbertos && (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <p className="text-sm text-gray-500">Tipo de Cobrança</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{getBillingTypeText(subscription.billingType)}</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <p className="text-sm text-gray-500 mb-2">ID da Assinatura</p>
                    <p className="text-sm font-mono text-gray-700">{subscription.externalId}</p>
                  </div>
                </div>

                {/* Alertas */}
                {subscription.isOverdue && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <p className="text-red-800 text-sm font-medium">
                        Assinatura em atraso há {Math.abs(subscription.daysUntilNextDue)} dias
                      </p>
                    </div>
                  </div>
                )}

                {subscription.isExpired && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <p className="text-red-800 text-sm font-medium">
                        Assinatura expirada
                      </p>
                    </div>
                  </div>
                )}

                {!subscription.isOverdue && !subscription.isExpired && subscription.daysUntilNextDue <= 7 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <p className="text-yellow-800 text-sm font-medium">
                        Vencimento próximo - {subscription.daysUntilNextDue} dias
                      </p>
                    </div>
                  </div>
                )}

                {subscription.description && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Descrição</p>
                    <p className="text-sm text-gray-900">{subscription.description}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#0B7A48]">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorPlano)}
                </h3>
                <p className="text-gray-600">Plano {plano} • mensal</p>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:bg-red-50 hover:text-red-700 text-xs"
                onClick={() => setDialogAberto(true)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </Card>
    </>
  )
} 