import { NextRequest, NextResponse } from 'next/server'

// Armazenar conexões ativas
const connections = new Set<ReadableStreamDefaultController>()

export async function GET(request: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      // Adicionar nova conexão
      connections.add(controller)
      
      // Enviar mensagem inicial
      controller.enqueue(`data: ${JSON.stringify({ type: 'connected', message: 'Conectado ao sistema de notificações' })}\n\n`)
      
      // Remover conexão quando fechar
      request.signal.addEventListener('abort', () => {
        connections.delete(controller)
      })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  })
}

// Função para enviar notificação para todos os clientes conectados
export function sendNotificationToAll(type: string, data: any) {
  console.log('📡 sendNotificationToAll chamada com:', { type, data })
  console.log('🔗 Conexões ativas:', connections.size)
  
  const message = `data: ${JSON.stringify({ type, data, timestamp: new Date().toISOString() })}\n\n`
  console.log('📨 Mensagem formatada:', message)
  
  let index = 0
  connections.forEach(controller => {
    index++
    try {
      console.log(`📤 Enviando para conexão ${index}...`)
      controller.enqueue(message)
      console.log(`✅ Enviado para conexão ${index}`)
    } catch (error) {
      console.error(`❌ Erro ao enviar para conexão ${index}:`, error)
      // Remover conexão se der erro
      connections.delete(controller)
    }
  })
  
  console.log('🏁 Notificação enviada para todas as conexões')
}

// Função para enviar notificação para um usuário específico
export function sendNotificationToUser(userId: string, type: string, data: any) {
  const message = `data: ${JSON.stringify({ type, data, userId, timestamp: new Date().toISOString() })}\n\n`
  
  connections.forEach(controller => {
    try {
      controller.enqueue(message)
    } catch (error) {
      connections.delete(controller)
    }
  })
}
