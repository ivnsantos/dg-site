'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Plus, Trash2, Save, Upload, X } from 'lucide-react'

export default function NovoFeedbackPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    question: '',
    description: '',
    logoUrl: '',
    primaryColor: '#8B4513',
    secondaryColor: '#A0522D',
    options: ['', '', '', '', '']
  })

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData({ ...formData, options: newOptions })
  }

  const addOption = () => {
    if (formData.options.length < 5) {
      setFormData({
        ...formData,
        options: [...formData.options, '']
      })
    }
  }

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index)
      setFormData({ ...formData, options: newOptions })
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tamanho do arquivo (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB')
      return
    }

    // Validar tipo do arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas arquivos de imagem')
      return
    }

    setUploadingLogo(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao fazer upload da imagem')
      }

      const data = await response.json()
      setFormData(prev => ({ ...prev, logoUrl: data.url }))
      toast.success('Logo enviado com sucesso!')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer upload da imagem')
    } finally {
      setUploadingLogo(false)
    }
  }

  const removeLogo = () => {
    setFormData(prev => ({ ...prev, logoUrl: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('Título é obrigatório')
      return
    }

    if (!formData.question.trim()) {
      toast.error('Pergunta é obrigatória')
      return
    }

    const validOptions = formData.options.filter(option => option.trim() !== '')
    if (validOptions.length < 2) {
      toast.error('Adicione pelo menos 2 opções de resposta')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          question: formData.question.trim(),
          description: formData.description.trim(),
          logoUrl: formData.logoUrl,
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
          options: validOptions
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao criar questionário')
      }

      const data = await response.json()
      toast.success('Questionário criado com sucesso!')
      router.push('/dashboard/feedback')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar questionário')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Criar Questionário</h1>
          <p className="text-gray-600">
            Crie um questionário de feedback para seus clientes responderem
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título do Questionário *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B4513] focus:border-transparent"
              placeholder="Ex: Avaliação dos nossos produtos"
              maxLength={100}
            />
          </div>

          {/* Logo da Empresa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo da Questionário (opcional)
            </label>
            {formData.logoUrl ? (
              <div className="relative">
                <img
                  src={formData.logoUrl}
                  alt="Logo da empresa"
                  className="w-32 h-32 object-contain border border-gray-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeLogo}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#8B4513] transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                  disabled={uploadingLogo}
                />
                <label
                  htmlFor="logo-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  {uploadingLogo ? (
                    <div className="w-8 h-8 border-2 border-[#8B4513] border-t-transparent rounded-full animate-spin mb-2"></div>
                  ) : (
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  )}
                  <span className="text-sm text-gray-600">
                    {uploadingLogo ? 'Enviando...' : 'Clique para fazer upload do logo'}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    PNG, JPG até 5MB
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Cores do Questionário */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cores do Questionário (opcional)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Cor Primária
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B4513] focus:border-transparent text-sm"
                    placeholder="#8B4513"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Cor Secundária
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B4513] focus:border-transparent text-sm"
                    placeholder="#A0522D"
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              As cores serão aplicadas no fundo e elementos da página pública do questionário
            </p>
          </div>

          {/* Pergunta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pergunta *
            </label>
            <textarea
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B4513] focus:border-transparent"
              placeholder="Ex: Como você avalia a qualidade dos nossos produtos?"
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição (opcional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B4513] focus:border-transparent"
              placeholder="Adicione uma descrição para contextualizar o questionário"
              rows={2}
              maxLength={300}
            />
          </div>

          {/* Opções de Resposta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opções de Resposta * (mínimo 2, máximo 5)
            </label>
            <div className="space-y-3">
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B4513] focus:border-transparent"
                    placeholder={`Opção ${index + 1}`}
                    maxLength={100}
                  />
                  {formData.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {formData.options.length < 5 && (
              <button
                type="button"
                onClick={addOption}
                className="mt-3 flex items-center gap-2 text-[#8B4513] hover:text-[#A0522D] font-medium"
              >
                <Plus className="w-4 h-4" />
                Adicionar Opção
              </button>
            )}
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-[#8B4513] text-white rounded-lg font-medium hover:bg-[#A0522D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Criando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Criar Questionário
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 