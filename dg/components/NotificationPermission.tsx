'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff } from 'lucide-react'

export default function NotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // Verificar se o navegador suporta notificações
    setIsSupported('Notification' in window)
    
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    if (!('Notification' in window)) return

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      
      if (result === 'granted') {
        console.log('✅ Permissão de notificações concedida!')
      } else {
        console.log('❌ Permissão de notificações negada')
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error)
    }
  }

  if (!isSupported) {
    return null
  }

  if (permission === 'granted') {
    return (
      <div className="flex items-center text-green-600">
        <Bell className="h-4 w-4" />
      </div>
    )
  }

  if (permission === 'denied') {
    return (
      <button
        onClick={() => window.open('chrome://settings/content/notifications', '_blank')}
        className="flex items-center text-red-600 hover:text-red-700 transition-colors"
        title="Notificações bloqueadas - Clique para permitir"
      >
        <BellOff className="h-4 w-4" />
      </button>
    )
  }

  return (
    <button
      onClick={requestPermission}
      className="flex items-center text-gray-400 hover:text-blue-600 transition-colors"
      title="Clique para ativar notificações"
    >
      <Bell className="h-4 w-4" />
    </button>
  )
}
