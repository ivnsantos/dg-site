'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '../../../../components/ui/button'
import { Input } from '../../../../components/ui/input'
import { Label } from '../../../../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import IconImageSelector from '../../../../components/IconImageSelector'
import LinkTreePreview from '../../../../components/LinkTreePreview'
import LoadingOverlay from '../../../../components/ui/LoadingOverlay'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { ArrowLeftIcon, PlusIcon, TrashIcon, LinkIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { uploadFileViaAPI } from '../../../../src/lib/s3'

interface LinkTreeForm {
  name: string
  description: string
  code: string
  imageUrl: string
  imageFile?: File | null
  backgroundColor: string
  textColor: string
  accentColor: string
  backgroundEffect: string
  links: LinkForm[]
}

interface LinkForm {
  title: string
  url: string
  icon: string
  imageUrl: string
  isActive: boolean
}

export default function NovoLinkTreePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [checkingCode, setCheckingCode] = useState(false)
  const [codeAvailable, setCodeAvailable] = useState<boolean | null>(null)
  const [formData, setFormData] = useState<LinkTreeForm>({
    name: '',
    description: '',
    code: '',
    imageUrl: '',
    imageFile: null,
    backgroundColor: '#2D1810',
    textColor: '#ffffff',
    accentColor: '#0B7A48',
    backgroundEffect: 'none',
    links: [
      {
        title: '',
        url: '',
        icon: '🔗',
        imageUrl: '',
        isActive: true
      }
    ]
  })

  // Função para verificar se o código está disponível
  const checkCodeAvailability = async (code: string) => {
    if (!code || code.length < 3) {
      setCodeAvailable(null)
      return
    }

    // Validar formato
    const codeRegex = /^[a-zA-Z0-9-]+$/
    if (!codeRegex.test(code)) {
      setCodeAvailable(false)
      return
    }

    setCheckingCode(true)
    try {
      const response = await fetch('/api/linktree/check-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code })
      })

      const data = await response.json()
      setCodeAvailable(data.available)
    } catch (error) {
      console.error('Erro ao verificar código:', error)
      setCodeAvailable(false)
    } finally {
      setCheckingCode(false)
    }
  }

  // Debounce para verificar código
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      checkCodeAvailability(formData.code)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [formData.code])

  const addLink = () => {
    setFormData(prev => ({
      ...prev,
      links: [...prev.links, {
        title: '',
        url: '',
        icon: '🔗',
        imageUrl: '',
        isActive: true
      }]
    }))
  }

  const removeLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }))
  }

  const updateLink = (index: number, field: keyof LinkForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }))
  }

  const handleImageUpload = (file: File | null) => {
    if (file) {
      setFormData(prev => ({
        ...prev,
        imageFile: file,
        imageUrl: URL.createObjectURL(file)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        imageFile: null,
        imageUrl: ''
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session?.user?.id) {
      toast.error('Usuário não autenticado')
      return
    }

    // Validar se o código está disponível
    if (codeAvailable !== true) {
      toast.error('Código não está disponível')
      return
    }

    // Validar se todos os campos obrigatórios estão preenchidos
    if (!formData.name || !formData.code || formData.links.length === 0) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    // Validar se pelo menos um link tem título e URL
    const validLinks = formData.links.filter(link => link.title && link.url)
    if (validLinks.length === 0) {
      toast.error('Adicione pelo menos um link válido')
      return
    }

    setLoading(true)
    try {
      // Upload da imagem se houver
      let imageUrl = formData.imageUrl
      if (formData.imageFile) {
        try {
          const path = `linktrees/logos/${Date.now()}-${formData.imageFile.name}`
          imageUrl = await uploadFileViaAPI(formData.imageFile, path)
          toast.success('Imagem enviada com sucesso!')
        } catch (uploadError: any) {
          console.error('Erro no upload da imagem:', uploadError)
          toast.error(`Erro ao enviar imagem: ${uploadError.message}`)
          return
        }
      }

      const response = await fetch('/api/linktree', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          imageUrl,
          userId: session.user.id,
          links: validLinks
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar LinkTree')
      }

      toast.success('LinkTree criado com sucesso!')
      router.push('/dashboard/linktree')
    } catch (error: any) {
      console.error('Erro ao criar LinkTree:', error)
      toast.error(error.message || 'Erro ao criar LinkTree')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto relative">
      {/* Overlay de Loading */}
      <LoadingOverlay 
        isLoading={loading}
        message="Criando seu LinkTree..."
        subMessage="Aguarde enquanto processamos suas informações"
      />

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
          disabled={loading}
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Criar Novo LinkTree</h1>
          <p className="text-gray-600">Crie seu LinkTree personalizado</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Informações básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome do LinkTree *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Meus Links"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="code">Código Único *</Label>
                  <div className="relative">
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toLowerCase() }))}
                      placeholder="Ex: meus-links"
                      className={`pr-10 ${
                        codeAvailable === true ? 'border-green-500' : 
                        codeAvailable === false ? 'border-red-500' : ''
                      }`}
                      required
                      disabled={loading}
                    />
                    {checkingCode && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0B7A48]"></div>
                      </div>
                    )}
                    {!checkingCode && codeAvailable === true && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    {!checkingCode && codeAvailable === false && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Apenas letras, números e hífens. Será usado na URL: /linktree/code
                  </p>
                  {codeAvailable === true && (
                    <p className="text-xs text-green-600 mt-1">✓ Código disponível</p>
                  )}
                  {codeAvailable === false && (
                    <p className="text-xs text-red-600 mt-1">✗ Código já existe</p>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva seu LinkTree"
                  disabled={loading}
                />
              </div>

              {/* Upload de Imagem */}
              <div className="mt-4">
                <Label>Logo do LinkTree</Label>
                <div className="mt-2">
                  <div className="flex items-center gap-4">
                    {formData.imageUrl ? (
                      <div className="relative">
                        <img
                          src={formData.imageUrl}
                          alt="Preview"
                          className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => handleImageUpload(null)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                        <PhotoIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <input
                        type="file"
                        id="image"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null
                          handleImageUpload(file)
                        }}
                        className="hidden"
                        disabled={loading}
                      />
                      <label
                        htmlFor="image"
                        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <PhotoIcon className="w-4 h-4" />
                        {formData.imageUrl ? 'Trocar imagem' : 'Escolher imagem'}
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Recomendado: imagem quadrada de 512x512px
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personalização de Cores */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="backgroundColor">Cor de Fundo</Label>
                  <div className="flex gap-2">
                    <Input
                      id="backgroundColor"
                      type="color"
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="w-16 h-10 p-1"
                      disabled={loading}
                    />
                    <Input
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      placeholder="#2D1810"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="textColor">Cor do Texto</Label>
                  <div className="flex gap-2">
                    <Input
                      id="textColor"
                      type="color"
                      value={formData.textColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, textColor: e.target.value }))}
                      className="w-16 h-10 p-1"
                      disabled={loading}
                    />
                    <Input
                      value={formData.textColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, textColor: e.target.value }))}
                      placeholder="#ffffff"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="accentColor">Cor de Destaque</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={formData.accentColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, accentColor: e.target.value }))}
                      className="w-16 h-10 p-1"
                      disabled={loading}
                    />
                    <Input
                      value={formData.accentColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, accentColor: e.target.value }))}
                      placeholder="#0B7A48"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Seleção de Efeitos de Fundo */}
              <div className="mt-6">
                <Label className="text-sm font-medium text-gray-700 mb-3 block">Efeito de Fundo</Label>
                <div className="grid grid-cols-5 gap-4">
                  {/* Efeito Liso */}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, backgroundEffect: 'none' }))}
                    className={`group relative p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                      formData.backgroundEffect === 'none' 
                        ? 'border-blue-500 bg-blue-50 shadow-md scale-105' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                    disabled={loading}
                  >
                    <div 
                      className="w-full h-12 rounded-lg shadow-inner"
                      style={{ backgroundColor: formData.backgroundColor }}
                    ></div>
                    <p className="text-xs mt-2 text-gray-600 font-medium">Liso</p>
                    {formData.backgroundEffect === 'none' && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>

                  {/* Efeito Corações */}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, backgroundEffect: 'hearts' }))}
                    className={`group relative p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                      formData.backgroundEffect === 'hearts' 
                        ? 'border-blue-500 bg-blue-50 shadow-md scale-105' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                    disabled={loading}
                  >
                    <div 
                      className="w-full h-12 rounded-lg shadow-inner relative overflow-hidden"
                      style={{ backgroundColor: formData.backgroundColor }}
                    >
                      <div className="absolute inset-0 opacity-30">
                        <svg className="absolute top-1 left-2 w-3 h-3" fill={formData.accentColor} viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        <svg className="absolute top-3 right-3 w-2 h-2" fill={formData.textColor} viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        <svg className="absolute bottom-2 left-4 w-2 h-2" fill={formData.accentColor} viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs mt-2 text-gray-600 font-medium">Corações</p>
                    {formData.backgroundEffect === 'hearts' && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>

                  {/* Efeito Bolinhas */}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, backgroundEffect: 'dots' }))}
                    className={`group relative p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                      formData.backgroundEffect === 'dots' 
                        ? 'border-blue-500 bg-blue-50 shadow-md scale-105' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                    disabled={loading}
                  >
                    <div 
                      className="w-full h-12 rounded-lg shadow-inner relative overflow-hidden"
                      style={{ backgroundColor: formData.backgroundColor }}
                    >
                      <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-2 left-3 w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: formData.accentColor }}></div>
                        <div className="absolute top-4 right-4 w-2 h-2 rounded-full animate-pulse delay-75" style={{ backgroundColor: formData.textColor }}></div>
                        <div className="absolute bottom-3 left-5 w-2 h-2 rounded-full animate-pulse delay-150" style={{ backgroundColor: formData.accentColor }}></div>
                        <div className="absolute bottom-2 right-2 w-1 h-1 rounded-full animate-pulse delay-200" style={{ backgroundColor: formData.textColor }}></div>
                        <div className="absolute top-1/2 left-1/3 w-1 h-1 rounded-full animate-pulse delay-300" style={{ backgroundColor: formData.accentColor }}></div>
                      </div>
                    </div>
                    <p className="text-xs mt-2 text-gray-600 font-medium">Bolinhas</p>
                    {formData.backgroundEffect === 'dots' && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>

                  {/* Efeito Traços */}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, backgroundEffect: 'lines' }))}
                    className={`group relative p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                      formData.backgroundEffect === 'lines' 
                        ? 'border-blue-500 bg-blue-50 shadow-md scale-105' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                    disabled={loading}
                  >
                    <div 
                      className="w-full h-12 rounded-lg shadow-inner relative overflow-hidden"
                      style={{ backgroundColor: formData.backgroundColor }}
                    >
                      <div className="absolute inset-0 opacity-25">
                        <div className="absolute top-2 left-2 w-8 h-0.5 rounded-full" style={{ backgroundColor: formData.accentColor }}></div>
                        <div className="absolute top-4 right-2 w-6 h-0.5 rounded-full" style={{ backgroundColor: formData.textColor }}></div>
                        <div className="absolute bottom-3 left-3 w-4 h-0.5 rounded-full" style={{ backgroundColor: formData.accentColor }}></div>
                        <div className="absolute bottom-2 right-3 w-3 h-0.5 rounded-full" style={{ backgroundColor: formData.textColor }}></div>
                        <div className="absolute top-1/2 left-1/4 w-2 h-0.5 rounded-full" style={{ backgroundColor: formData.accentColor }}></div>
                      </div>
                    </div>
                    <p className="text-xs mt-2 text-gray-600 font-medium">Traços</p>
                    {formData.backgroundEffect === 'lines' && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>

                  {/* Efeito Estrelinhas */}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, backgroundEffect: 'stars' }))}
                    className={`group relative p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                      formData.backgroundEffect === 'stars' 
                        ? 'border-blue-500 bg-blue-50 shadow-md scale-105' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                    disabled={loading}
                  >
                    <div 
                      className="w-full h-12 rounded-lg shadow-inner relative overflow-hidden"
                      style={{ backgroundColor: formData.backgroundColor }}
                    >
                      <div className="absolute inset-0 opacity-30">
                        <svg className="absolute top-1 left-2 w-3 h-3" fill={formData.accentColor} viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <svg className="absolute top-3 right-3 w-2 h-2" fill={formData.textColor} viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <svg className="absolute bottom-2 left-4 w-2 h-2" fill={formData.accentColor} viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <svg className="absolute bottom-1 right-1 w-1 h-1" fill={formData.textColor} viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs mt-2 text-gray-600 font-medium">Estrelinhas</p>
                    {formData.backgroundEffect === 'stars' && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div className="mt-4">
                <Label className="block mb-2">Preview das Cores:</Label>
                <LinkTreePreview
                  name={formData.name}
                  description={formData.description}
                  imageUrl={formData.imageUrl}
                  backgroundColor={formData.backgroundColor}
                  textColor={formData.textColor}
                  accentColor={formData.accentColor}
                  backgroundEffect={formData.backgroundEffect}
                  links={formData.links}
                  maxLinks={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Links
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.links.map((link, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Link {index + 1}</h4>
                      {formData.links.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeLink(index)}
                          className="text-red-600 hover:text-red-700"
                          disabled={loading}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`title-${index}`}>Título *</Label>
                        <Input
                          id={`title-${index}`}
                          value={link.title}
                          onChange={(e) => updateLink(index, 'title', e.target.value)}
                          placeholder="Ex: Instagram"
                          required
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`url-${index}`}>URL *</Label>
                        <Input
                          id={`url-${index}`}
                          value={link.url}
                          onChange={(e) => updateLink(index, 'url', e.target.value)}
                          placeholder="https://instagram.com/seu-perfil"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Seleção de Ícone/Imagem */}
                    <div className="mt-4">
                      <IconImageSelector
                        selectedIcon={link.icon}
                        selectedImageUrl={link.imageUrl}
                        onIconChange={(icon) => updateLink(index, 'icon', icon)}
                        onImageUrlChange={(imageUrl) => updateLink(index, 'imageUrl', imageUrl)}
                      />
                    </div>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={addLink}
                  className="w-full"
                  disabled={loading}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Adicionar Link
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Botões de ação */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || codeAvailable !== true}
              className="flex-1 bg-[#0B7A48] hover:bg-[#0B7A48]/90"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Criando LinkTree...
                </span>
              ) : (
                'Criar LinkTree'
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
} 