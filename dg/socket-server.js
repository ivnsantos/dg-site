const { createServer } = require('http')
const { Server } = require('socket.io')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res)
  })

  // Criar servidor Socket.IO
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  })

  // Contador de conexões ativas
  let activeConnections = 0

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

  // Função global para enviar notificações
  global.sendNotificationToDashboard = (type, data) => {
    console.log('📡 Enviando notificação via Socket.IO:', { type, data })
    console.log('📊 Total de conexões ativas:', activeConnections)
    
    io.to('dashboard').emit('notification', { 
      type, 
      data, 
      timestamp: new Date().toISOString() 
    })
    
    console.log('✅ Notificação enviada com sucesso!')
  }

  const port = process.env.PORT || 3000
  server.listen(port, () => {
    console.log(`🚀 Servidor rodando na porta ${port}`)
    console.log('🎧 Socket.IO está ativo e escutando conexões...')
  })
})
