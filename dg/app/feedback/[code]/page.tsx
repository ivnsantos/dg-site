'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Send, CheckCircle } from 'lucide-react'
import Image from 'next/image'

interface Feedback {
  id: number
  title: string
  question: string
  description: string | null
  logoUrl: string | null
  primaryColor: string | null
  secondaryColor: string | null
  options: string[]
  status: string
}

export default function FeedbackPublicPage() {
  const params = useParams()
  const code = params.code as string
  
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  
  const [formData, setFormData] = useState({
    selectedOption: '',
    textResponse: '',
    clientName: ''
  })

  useEffect(() => {
    fetchFeedback()
  }, [code])

  const fetchFeedback = async () => {
    try {
      const response = await fetch(`/api/feedback/public/${code}`)
      if (!response.ok) {
        throw new Error('Questionário não encontrado')
      }
      const data = await response.json()
      setFeedback(data.feedback)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar questionário')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.selectedOption) {
      toast.error('Selecione uma opção')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/feedback/response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedbackCode: code,
          selectedOption: formData.selectedOption,
          textResponse: formData.textResponse,
          clientName: formData.clientName.trim() || null
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao enviar resposta')
      }

      toast.success('Resposta enviada com sucesso!')
      setSubmitted(true)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar resposta')
    } finally {
      setSubmitting(false)
    }
  }

  // Componente de Loading com Logo da Doce Gestão
  const LoadingComponent = () => (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: `linear-gradient(to bottom right, #8B451310, #A0522D10)`
      }}
    >
      <div className="text-center">
        <div className="animate-pulse mb-4">
          <Image
            src="/images/logo.png"
            alt="Doce Gestão"
            width={80}
            height={80}
            className="mx-auto"
          />
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-24 mx-auto"></div>
        </div>
      </div>
    </div>
  )

  // Componente de Footer
  const Footer = () => (
    <div className="text-center mt-6 pt-4">
      <a 
        href="/" 
        className="flex items-center justify-center gap-2 hover:opacity-80 transition-opacity"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src="/images/logo.png"
          alt="Doce Gestão"
          width={20}
          height={20}
        />
        <p className="text-xs text-gray-500">
          Criado com Doce Gestão
        </p>
      </a>
    </div>
  )

  if (loading) {
    return <LoadingComponent />
  }

  if (!feedback) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{
        background: `linear-gradient(to bottom right, #8B451310, #A0522D10)`
      }}>
        <div className="text-center max-w-sm mx-auto">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Questionário não encontrado
          </h1>
          <p className="text-sm text-gray-600">
            O link pode estar incorreto ou o questionário foi removido.
          </p>
        </div>
        <Footer />
      </div>
    )
  }

  if (feedback.status !== 'ACTIVE') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{
        background: `linear-gradient(to bottom right, #8B451310, #A0522D10)`
      }}>
        <div className="text-center max-w-sm mx-auto">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Questionário inativo
          </h1>
          <p className="text-sm text-gray-600">
            Este questionário não está mais disponível para respostas.
          </p>
        </div>
        <Footer />
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{
        background: `linear-gradient(to bottom right, ${feedback.primaryColor || '#8B4513'}10, ${feedback.secondaryColor || '#A0522D'}10)`
      }}>
        <div className="bg-white rounded-xl p-6 max-w-sm w-full text-center shadow-lg">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Obrigado!
          </h1>
          <p className="text-sm text-gray-600">
            Sua resposta foi enviada com sucesso. Agradecemos seu feedback!
          </p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{
      background: `linear-gradient(to bottom right, ${feedback.primaryColor || '#8B4513'}10, ${feedback.secondaryColor || '#A0522D'}10)`
    }}>
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
        {/* Header com Logo e Título */}
        <div className="text-center mb-6">
          {feedback.logoUrl && (
            <div className="mb-4">
              <img
                src={feedback.logoUrl}
                alt="Logo da empresa"
                className="w-16 h-16 object-contain mx-auto rounded-lg"
              />
            </div>
          )}
          <h1 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
            {feedback.title}
          </h1>
          {feedback.description && (
            <p className="text-sm text-gray-600 mb-3 leading-relaxed">
              {feedback.description}
            </p>
          )}
          <p className="text-base text-gray-700 font-medium leading-relaxed">
            {feedback.question}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Opções de Resposta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Selecione uma opção:
            </label>
            <div className="space-y-2">
              {feedback.options.map((option, index) => (
                <label
                  key={index}
                  className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="radio"
                    name="selectedOption"
                    value={option}
                    checked={formData.selectedOption === option}
                    onChange={(e) => setFormData({ ...formData, selectedOption: e.target.value })}
                    className="w-4 h-4 border-gray-300 focus:ring-2"
                    style={{
                      color: feedback.primaryColor || '#8B4513',
                      '--tw-ring-color': feedback.primaryColor || '#8B4513'
                    } as React.CSSProperties}
                  />
                  <span className="ml-3 text-sm text-gray-700 leading-relaxed">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Nome (Opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seu nome (opcional):
            </label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-sm"
              style={{
                '--tw-ring-color': feedback.primaryColor || '#8B4513'
              } as React.CSSProperties}
              placeholder="Digite seu nome se quiser se identificar"
              maxLength={100}
            />
          </div>

          {/* Comentário Adicional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comentário adicional (opcional):
            </label>
            <textarea
              value={formData.textResponse}
              onChange={(e) => setFormData({ ...formData, textResponse: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-sm"
              style={{
                '--tw-ring-color': feedback.primaryColor || '#8B4513'
              } as React.CSSProperties}
              placeholder="Adicione um comentário ou sugestão..."
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Botão de Envio */}
          <button
            type="submit"
            disabled={submitting || !formData.selectedOption}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            style={{
              backgroundColor: feedback.primaryColor || '#8B4513'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = feedback.secondaryColor || '#A0522D'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = feedback.primaryColor || '#8B4513'
            }}
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Enviar Resposta
              </>
            )}
          </button>
        </form>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  )
} 