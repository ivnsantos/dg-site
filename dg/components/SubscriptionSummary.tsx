'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, CreditCard, AlertTriangle, CheckCircle } from 'lucide-react'

interface SubscriptionSummaryProps {
  subscription: {
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
  userPlano: string
}

export function SubscriptionSummary({ subscription, userPlano }: SubscriptionSummaryProps) {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'INACTIVE':
      case 'CANCELLED':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-[#0B7A48]" />
            Assinatura {userPlano}
          </CardTitle>
          <Badge className={getStatusColor(subscription.status)}>
            <div className="flex items-center gap-1">
              {getStatusIcon(subscription.status)}
              {subscription.status}
            </div>
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Valor e Ciclo */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Valor</p>
            <p className="text-2xl font-bold text-[#0B7A48]">
              {subscription.formattedValue}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Ciclo</p>
            <p className="font-medium">{subscription.cycle}</p>
          </div>
        </div>

        {/* Próximo Vencimento */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Próximo Vencimento</span>
          </div>
          <span className="text-sm font-medium">
            {subscription.formattedNextDueDate}
          </span>
        </div>

        {/* Dias até Vencimento */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Dias até Vencimento</span>
          <span className={`text-sm font-medium ${
            subscription.daysUntilNextDue <= 7 
              ? 'text-red-600' 
              : subscription.daysUntilNextDue <= 15 
              ? 'text-yellow-600' 
              : 'text-green-600'
          }`}>
            {subscription.daysUntilNextDue} dias
          </span>
        </div>

        {/* Tipo de Cobrança */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Tipo de Cobrança</span>
          <span className="text-sm font-medium">{subscription.billingType}</span>
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

        {/* ID da Assinatura */}
        <div className="pt-2 border-t">
          <p className="text-xs text-gray-500">ID da Assinatura</p>
          <p className="text-xs font-mono text-gray-700">{subscription.externalId}</p>
        </div>
      </CardContent>
    </Card>
  )
} 