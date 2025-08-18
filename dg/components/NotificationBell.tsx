'use client'

import { useState, useEffect } from 'react'
import { Bell, X, ShoppingCart, User, Clock, Package, DollarSign } from 'lucide-react'
import { useSocketIO } from '@/hooks/useSocketIO'

export default function NotificationBell() {
  const { notifications, isConnected, clearNotifications } = useSocketIO()
  const [isOpen, setIsOpen] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)

  
  // Debug logs
  console.log('🔔 NotificationBell renderizado:', { 
    notificationsCount: notifications.length, 
    isConnected
  })
  
  console.log('🚨 NOTIFICATION BELL ESTÁ FUNCIONANDO!')
  
  // Marcar como não lida quando receber nova notificação
  useEffect(() => {
    // Só mostrar badge se há notificações E se está conectado
    if (notifications.length > 0 && isConnected) {
      setHasUnread(true)
      
      // Auto-ocultar após 10 segundos (mais tempo para ver)
      const timer = setTimeout(() => {
        setHasUnread(false)
      }, 10000)
      
      return () => clearTimeout(timer)
    } else {
      // Se não há notificações OU não está conectado, não mostrar badge
      setHasUnread(false)
    }
  }, [notifications, isConnected])

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
      case 'pendente': return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'em_andamento': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'em_entrega': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'finalizado': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
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

  return (
    <div className="relative">
      {/* Botão do sino */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
        title="Notificações"
      >
        <Bell className="h-6 w-6" />
        
        {/* Indicador de notificações não lidas */}
        {hasUnread && notifications.length > 0 && isConnected && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-medium animate-pulse">
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        )}
        
        {/* Indicador de conexão - só mostra quando há notificações */}
        {notifications.length > 0 && (
          <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        )}
      </button>

      {/* Dropdown de notificações */}
      {isOpen && (
        <div className="absolute left-1/2 transform -translate-x-1/2 min-[600px]:left-0 min-[600px]:transform-none mt-3 w-56 sm:w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 max-h-[300px] overflow-hidden backdrop-blur-sm">
          {/* Header */}
          <div className="flex items-center justify-between p-2 sm:p-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="font-semibold text-gray-900 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
              <div className="p-1 sm:p-1.5 bg-blue-100 rounded-lg">
                <Bell className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
              </div>
              <span className="hidden sm:inline">Notificações</span>
              <span className="sm:hidden">Notif.</span>
                             {notifications.length > 0 && (
                 <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full font-semibold shadow-sm">
                   {notifications.length}
                 </span>
               )}
            </h3>
            
            <div className="flex items-center gap-1.5 sm:gap-2">
              {notifications.length > 0 && (
                <button
                  onClick={clearNotifications}
                  className="text-[10px] sm:text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-1.5 py-1 sm:px-2 sm:py-1.5 rounded-lg transition-colors font-medium"
                >
                  <span className="hidden sm:inline">Limpar</span>
                  <span className="sm:hidden">Limpar</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 sm:p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Lista de notificações */}
          <div className="max-h-80 sm:max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
                           <div className="p-4 sm:p-6 text-center text-gray-500">
               <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                 <Bell className="h-4 w-4 sm:h-6 sm:w-6 text-gray-300" />
               </div>
               <p className="text-sm sm:text-base font-medium mb-1">Nenhuma notificação</p>
               <p className="text-[10px] sm:text-xs text-gray-400">Novos pedidos aparecerão aqui automaticamente</p>
             </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map((notification, index) => (
                                     <div key={index} className="p-2 sm:p-3 hover:bg-gray-50 transition-colors group">
                     <div className="flex items-start gap-2 sm:gap-3">
                       {/* Ícone */}
                       <div className="flex-shrink-0">
                         <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center shadow-sm border border-green-200">
                           <Package className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                         </div>
                       </div>
                      
                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0">
                                                 <div className="flex items-start justify-between gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                           <div className="flex-1 min-w-0">
                             <p className="text-xs sm:text-sm font-semibold text-gray-900 mb-0.5 truncate">
                               Pedido #{notification.data.codigo}
                             </p>
                             <div className="flex items-center gap-1 sm:gap-1.5">
                               <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-400" />
                               <span className="text-[10px] sm:text-xs text-gray-600 font-medium truncate">
                                 {notification.data.cliente.nome}
                               </span>
                             </div>
                           </div>
                           
                           <span className={`inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-[10px] font-semibold border flex-shrink-0 ${getStatusColor(notification.data.status)}`}>
                             <span className="hidden sm:inline">{getStatusLabel(notification.data.status)}</span>
                             <span className="sm:hidden">{getStatusLabel(notification.data.status).split(' ')[0]}</span>
                           </span>
                         </div>
                         
                         <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                           <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-gray-600">
                             <DollarSign className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-500" />
                             <span className="font-semibold text-gray-900">
                               R$ {notification.data.valorTotal.toFixed(2).replace('.', ',')}
                             </span>
                           </div>
                           
                           <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] text-gray-400">
                             <Clock className="h-2.5 w-2.5" />
                             <span className="hidden sm:inline">{formatTime(notification.timestamp)}</span>
                             <span className="sm:hidden">Agora</span>
                           </div>
                         </div>
                        
                                                 {/* Botão de ação */}
                         <button
                           onClick={() => {
                             window.location.href = '/dashboard/pedidos'
                             setIsOpen(false)
                           }}
                           className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] sm:text-xs font-medium py-1 sm:py-1.5 px-2 sm:px-3 rounded-lg transition-colors border border-blue-200 hover:border-blue-300"
                         >
                           <span className="hidden sm:inline">Ver detalhes do pedido</span>
                           <span className="sm:hidden">Ver pedido</span>
                         </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2 sm:p-3 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white text-center">
              <button
                onClick={() => {
                  window.location.href = '/dashboard/pedidos'
                  setIsOpen(false)
                }}
                className="text-[10px] sm:text-xs text-blue-600 hover:text-blue-800 font-semibold hover:bg-blue-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-colors"
              >
                <span className="hidden sm:inline">Ver todos os pedidos →</span>
                <span className="sm:hidden">Ver todos →</span>
              </button>
            </div>
          )}
        </div>
      )}


    </div>
  )
}
