import { NextRequest, NextResponse } from 'next/server'
import { Server as SocketIOServer } from 'socket.io'

// Armazenar instância do servidor Socket.IO
let io: SocketIOServer | null = null

// Contador de conexões ativas
let activeConnections = 0

// Função para obter ou criar o servidor Socket.IO
function getIO() {
  if (!io) {
    io = new SocketIOServer({
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    })
    
    // Eventos de conexão
    io.on('connection', (socket) => {
      activeConnections++
      console.log('🔌 Cliente conectado:', socket.id)
      console.log('📊 Total de conexões ativas:', activeConnections)
      
      // Cliente se juntou ao dashboard
      socket.on('join-dashboard', () => {
        socket.join('dashboard')
        console.log('📱 Cliente entrou no dashboard:', socket.id)
        console.log('📊 Conexões ativas no dashboard:', activeConnections)
      })
      
      // Cliente se desconectou
      socket.on('disconnect', () => {
        activeConnections--
        console.log('🔌 Cliente desconectado:', socket.id)
        console.log('📊 Total de conexões ativas:', activeConnections)
      })
    })
  }
  return io
}

// Função para enviar notificação para o dashboard
export function sendNotificationToDashboard(type: string, data: any) {
  const io = getIO()
  io.to('dashboard').emit('notification', { type, data, timestamp: new Date().toISOString() })
  console.log('📡 Notificação enviada para o dashboard:', { type, data })
  console.log('📊 Total de conexões ativas:', activeConnections)
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Socket.IO Server',
    status: {
      activeConnections,
      isRunning: io !== null
    }
  })
}
