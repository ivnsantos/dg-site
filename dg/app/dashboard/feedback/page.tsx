'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Plus, Eye, Copy, Trash2, ExternalLink, Calendar, MessageSquare, QrCode, Download } from 'lucide-react'
import QRCode from 'qrcode'

interface Feedback {
  id: number
  title: string
  question: string
  description: string | null
  code: string
  status: string
  createdAt: string
  responsesCount: number
}

export default function FeedbackPage() {
  const router = useRouter()
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeedbacks()
  }, [])

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch('/api/feedback')
      if (!response.ok) {
        throw new Error('Erro ao carregar questionários')
      }
      const data = await response.json()
      setFeedbacks(data.feedbacks)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar questionários')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este questionário?')) {
      return
    }

    try {
      const response = await fetch(`/api/feedback/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir questionário')
      }

      toast.success('Questionário excluído com sucesso')
      fetchFeedbacks()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir questionário')
    }
  }

  const copyLink = async (code: string) => {
    const link = `${window.location.origin}/feedback/${code}`
    try {
      await navigator.clipboard.writeText(link)
      toast.success('Link copiado para a área de transferência!')
    } catch (error) {
      toast.error('Erro ao copiar link')
    }
  }

  const generateQRCode = async (code: string, title: string) => {
    try {
      const link = `${window.location.origin}/feedback/${code}`
      const qrDataURL = await QRCode.toDataURL(link, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })

      // Criar um link de download
      const linkElement = document.createElement('a')
      linkElement.href = qrDataURL
      linkElement.download = `qrcode-${title}-${code}.png`
      document.body.appendChild(linkElement)
      linkElement.click()
      document.body.removeChild(linkElement)

      toast.success('QR Code baixado com sucesso!')
    } catch (error) {
      toast.error('Erro ao gerar QR Code')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Questionários de Feedback</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Gerencie seus questionários e visualize as respostas dos clientes
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/feedback/novo')}
          className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-[#8B4513] text-white rounded-lg font-medium hover:bg-[#A0522D] transition-colors w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Criar Questionário
        </button>
      </div>

      {feedbacks.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhum questionário criado
          </h3>
          <p className="text-gray-600 mb-6">
            Crie seu primeiro questionário para começar a coletar feedback dos clientes
          </p>
          <button
            onClick={() => router.push('/dashboard/feedback/novo')}
            className="flex items-center gap-2 px-6 py-3 bg-[#8B4513] text-white rounded-lg font-medium hover:bg-[#A0522D] transition-colors mx-auto"
          >
            <Plus className="w-4 h-4" />
            Criar Primeiro Questionário
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {feedbacks.map((feedback) => (
            <div
              key={feedback.id}
              className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    {feedback.title}
                  </h3>
                  <p className="text-gray-600 mb-2 text-sm sm:text-base">
                    {feedback.question}
                  </p>
                  {feedback.description && (
                    <p className="text-sm text-gray-500 mb-3">
                      {feedback.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    feedback.status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {feedback.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Criado em {formatDate(feedback.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{feedback.responsesCount} resposta{feedback.responsesCount !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>Código: {feedback.code}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 sm:gap-3">
                <button
                  onClick={() => router.push(`/dashboard/feedback/${feedback.id}`)}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                >
                  <Eye className="w-4 h-4" />
                  <span className="hidden sm:inline">Ver Respostas</span>
                  <span className="sm:hidden">Respostas</span>
                </button>
                
                <button
                  onClick={() => copyLink(feedback.code)}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm"
                >
                  <Copy className="w-4 h-4" />
                  <span className="hidden sm:inline">Copiar Link</span>
                  <span className="sm:hidden">Link</span>
                </button>
                
                <button
                  onClick={() => generateQRCode(feedback.code, feedback.title)}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors text-sm"
                >
                  <QrCode className="w-4 h-4" />
                  <span className="hidden sm:inline">QR Code</span>
                  <span className="sm:hidden">QR</span>
                </button>
                
                <button
                  onClick={() => router.push(`/feedback/${feedback.code}`)}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="hidden sm:inline">Visualizar</span>
                  <span className="sm:hidden">Ver</span>
                </button>
                
                <button
                  onClick={() => handleDelete(feedback.id)}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Excluir</span>
                  <span className="sm:hidden">Del</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 