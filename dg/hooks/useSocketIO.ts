import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface Notification {
  type: string
  data: any
  timestamp: string
}

export function useSocketIO() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    console.log('🚀 Iniciando Socket.IO...')
    
    // Criar conexão Socket.IO
    const newSocket = io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
      autoConnect: true
    })

    // Eventos de conexão
    newSocket.on('connect', () => {
      console.log('🔌 Conectado ao Socket.IO:', newSocket.id)
      setIsConnected(true)
      
      // Entrar no dashboard
      console.log('📱 Enviando join-dashboard...')
      newSocket.emit('join-dashboard')
      console.log('✅ join-dashboard enviado!')
    })

    newSocket.on('disconnect', () => {
      console.log('🔌 Desconectado do Socket.IO')
      setIsConnected(false)
    })

    // Receber notificações
    newSocket.on('notification', (notification: Notification) => {
      console.log('📱 Notificação recebida:', notification)
      
      if (notification.type === 'novo_pedido') {
        setNotifications(prev => [notification, ...prev.slice(0, 9)])
        
        // Mostrar notificação do navegador
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🍰 Novo Pedido!', {
            body: `Pedido ${notification.data.codigo} recebido de ${notification.data.cliente.nome}`,
            icon: '/images/logo.png'
          })
        }
      }
    })

    setSocket(newSocket)

    // Limpar conexão ao desmontar
    return () => {
      console.log('🧹 Limpando conexão Socket.IO...')
      newSocket.close()
    }
  }, [])

  const clearNotifications = () => {
    setNotifications([])
  }

  return {
    socket,
    isConnected,
    notifications,
    clearNotifications
  }
}
