'use client'

import { useEffect, useState } from 'react'
import { ShoppingCart, User, Clock, X } from 'lucide-react'

interface OrderNotificationToastProps {
  notification: {
    type: string
    data: {
      codigo: string
      valorTotal: number
      status: string
      cliente: {
        nome: string
        telefone: string
      }
      createdAt: string
    }
    timestamp: string
  }
  onClose: () => void
}

export default function OrderNotificationToast({ notification, onClose }: OrderNotificationToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Auto-ocultar após 8 segundos
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Aguardar animação terminar
    }, 8000)

    return () => clearTimeout(timer)
  }, [onClose])

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Agora mesmo'
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h atrás`
    
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-500'
      case 'em_andamento': return 'bg-blue-500'
      case 'em_entrega': return 'bg-orange-500'
      case 'finalizado': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pendente': return 'Pendente'
      case 'em_andamento': return 'Em Andamento'
      case 'em_entrega': return 'Em Entrega'
      case 'finalizado': return 'Finalizado'
      default: return status
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-50 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 transform transition-all duration-300 animate-in slide-in-from-right-5">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <ShoppingCart className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">🍰 Novo Pedido!</h3>
            <p className="text-sm text-gray-600">Recebido automaticamente</p>
          </div>
        </div>
        
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(onClose, 300)
          }}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Conteúdo */}
      <div className="p-4 space-y-3">
        {/* Código e Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">
              #{notification.data.codigo}
            </span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(notification.data.status)} text-white`}>
              {getStatusLabel(notification.data.status)}
            </span>
          </div>
          
          <span className="text-2xl font-bold text-green-600">
            R$ {notification.data.valorTotal.toFixed(2).replace('.', ',')}
          </span>
        </div>

        {/* Cliente */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <User className="h-4 w-4 text-gray-500" />
          <div>
            <p className="font-medium text-gray-900">{notification.data.cliente.nome}</p>
            <p className="text-sm text-gray-600">{notification.data.cliente.telefone}</p>
          </div>
        </div>

        {/* Tempo */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>{formatTime(notification.timestamp)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <button
          onClick={() => window.location.href = '/dashboard/pedidos'}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          Ver Pedido →
        </button>
      </div>
    </div>
  )
}
