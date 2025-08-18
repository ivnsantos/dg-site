import { useEffect, useRef, useState } from 'react'

interface Notification {
  type: string
  data: any
  timestamp: string
}

interface UseNotificationsReturn {
  notifications: Notification[]
  isConnected: boolean
  clearNotifications: () => void
  showToast: boolean
  setShowToast: (show: boolean) => void
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)

  console.log('🚨 HOOK useNotifications EXECUTADO!')

  useEffect(() => {
    console.log('🚀 Iniciando conexão SSE...')

    // Criar conexão SSE
    const eventSource = new EventSource('/api/notifications')
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      setIsConnected(true)
      console.log('🔌 Conectado ao sistema de notificações')
    }

    eventSource.onmessage = (event) => {
      try {
        const notification: Notification = JSON.parse(event.data)

        // Filtrar apenas notificações de novo pedido
        if (notification.type === 'novo_pedido') {
          setNotifications(prev => [notification, ...prev.slice(0, 9)]) // Manter apenas as últimas 10

          // Mostrar toast de notificação
          setShowToast(true)

          // Mostrar notificação do navegador se permitido
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('🍰 Novo Pedido!', {
              body: `Pedido ${notification.data.codigo} recebido de ${notification.data.cliente.nome}`,
              icon: '/images/logo.png',
              tag: 'novo_pedido'
            })
          }
        }
      } catch (error) {
        console.error('Erro ao processar notificação:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('Erro na conexão SSE:', error)
      setIsConnected(false)

      // Tentar reconectar após 5 segundos
      setTimeout(() => {
        if (eventSourceRef.current) {
          eventSourceRef.current.close()
          eventSourceRef.current = null
        }
      }, 5000)
    }

    // Limpar conexão ao desmontar
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
    }
  }, [])

  const clearNotifications = () => {
    setNotifications([])
  }

  return {
    notifications,
    isConnected,
    clearNotifications,
    showToast,
    setShowToast
  }
}
