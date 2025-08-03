'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { ArrowLeft, BarChart3, Calendar, MessageSquare, User, Mail, PieChart as PieChartIcon } from 'lucide-react'
import FeedbackChart from '../../../../components/FeedbackChart'
import FeedbackExportButton from '../../../../components/FeedbackExportButton'

interface FeedbackResponse {
  id: number
  selectedOption: string
  textResponse: string | null
  clientName: string | null
  clientEmail: string | null
  createdAt: string
}

interface FeedbackStats {
  option: string
  count: number
  percentage: number
}

interface Feedback {
  id: number
  title: string
  question: string
  description: string | null
  code: string
  status: string
  options: string[]
  createdAt: string
  responses: FeedbackResponse[]
  stats: FeedbackStats[]
  totalResponses: number
}

export default function FeedbackDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'charts' | 'responses'>('charts')

  useEffect(() => {
    fetchFeedback()
  }, [params.id])

  const fetchFeedback = async () => {
    try {
      const response = await fetch(`/api/feedback/${params.id}`)
      if (!response.ok) {
        throw new Error('Erro ao carregar questionário')
      }
      const data = await response.json()
      setFeedback(data.feedback)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar questionário')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const copyLink = async () => {
    if (!feedback) return
    const link = `${window.location.origin}/feedback/${feedback.code}`
    try {
      await navigator.clipboard.writeText(link)
      toast.success('Link copiado para a área de transferência!')
    } catch (error) {
      toast.error('Erro ao copiar link')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
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

  if (!feedback) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Questionário não encontrado
          </h1>
          <p className="text-gray-600 mb-4">
            O questionário pode ter sido removido ou você não tem permissão para visualizá-lo.
          </p>
          <button
            onClick={() => router.push('/dashboard/feedback')}
            className="px-6 py-3 bg-[#8B4513] text-white rounded-lg font-medium hover:bg-[#A0522D] transition-colors"
          >
            Voltar para Questionários
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push('/dashboard/feedback')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {feedback.title}
          </h1>
          <p className="text-gray-600">
            Visualizando respostas e estatísticas do questionário
          </p>
        </div>
        <div className="flex gap-2">
          <FeedbackExportButton feedback={feedback} />
          <button
            onClick={copyLink}
            className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
          >
            Copiar Link
          </button>
        </div>
      </div>

      {/* Informações do Questionário */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total de Respostas</p>
              <p className="text-2xl font-bold text-gray-900">{feedback.totalResponses}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Criado em</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(feedback.createdAt)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Código</p>
              <p className="text-sm font-medium text-gray-900">{feedback.code}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Pergunta:</h3>
          <p className="text-gray-700 mb-2">{feedback.question}</p>
          {feedback.description && (
            <p className="text-sm text-gray-500">{feedback.description}</p>
          )}
        </div>
      </div>

      {/* Tabs de Navegação */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('charts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'charts'
                  ? 'border-[#8B4513] text-[#8B4513]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <PieChartIcon className="w-4 h-4" />
                Gráficos e Estatísticas
              </div>
            </button>
            <button
              onClick={() => setActiveTab('responses')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'responses'
                  ? 'border-[#8B4513] text-[#8B4513]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Respostas Detalhadas
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'charts' ? (
            <>
              {/* Gráficos */}
              {feedback.totalResponses > 0 ? (
                <FeedbackChart 
                  stats={feedback.stats} 
                  totalResponses={feedback.totalResponses}
                  responses={feedback.responses}
                />
              ) : (
                <div className="text-center py-12">
                  <PieChartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Nenhuma resposta para exibir
                  </h3>
                  <p className="text-gray-600">
                    Compartilhe o link do questionário para começar a receber respostas e visualizar os gráficos.
                  </p>
                </div>
              )}

              {/* Estatísticas Simples */}
              {feedback.totalResponses > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas das Respostas</h3>
                  <div className="space-y-4">
                    {feedback.stats.map((stat, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700">{stat.option}</span>
                            <span className="text-sm text-gray-500">{stat.count} respostas ({stat.percentage}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-[#8B4513] h-2 rounded-full transition-all duration-300"
                              style={{ width: `${stat.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Lista de Respostas */}
              {feedback.responses.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Nenhuma resposta ainda
                  </h3>
                  <p className="text-gray-600">
                    Compartilhe o link do questionário para começar a receber respostas.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {feedback.responses.map((response) => (
                    <div key={response.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 bg-[#8B4513] text-white text-sm rounded-full">
                              {response.selectedOption}
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatDate(response.createdAt)}
                            </span>
                          </div>
                          
                          {response.textResponse && (
                            <p className="text-gray-700 mb-3">
                              <span className="font-medium">Comentário:</span> {response.textResponse}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {(response.clientName || response.clientEmail) && (
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {response.clientName && (
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              <span>{response.clientName}</span>
                            </div>
                          )}
                          {response.clientEmail && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              <span>{response.clientEmail}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
} 