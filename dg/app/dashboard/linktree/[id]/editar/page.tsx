'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '../../../../../components/ui/button'
import { Input } from '../../../../../components/ui/input'
import { Label } from '../../../../../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card'
import IconImageSelector from '../../../../../components/IconImageSelector'
import LoadingOverlay from '../../../../../components/ui/LoadingOverlay'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { ArrowLeftIcon, PlusIcon, TrashIcon, LinkIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { uploadFileViaAPI } from '../../../../../src/lib/s3'

interface LinkTree {
  id: number
  name: string
  description?: string
  imageUrl?: string
  imageFile?: File | null
  isActive: boolean
  backgroundColor: string
  textColor: string
  accentColor: string
  backgroundEffect: string
  links: LinkForm[]
  userId: number
  createdAt: string
  updatedAt: string
}

interface LinkForm {
  id?: number
  title: string
  url: string
  icon: string
  imageUrl: string
  isActive: boolean
}

export default function EditarLinkTreePage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [linkTree, setLinkTree] = useState<LinkTree | null>(null)
  const [formData, setFormData] = useState<LinkTree>({
    id: 0,
    name: '',
    description: '',
    imageUrl: '',
    imageFile: null,
    isActive: true,
    backgroundColor: '#2D1810',
    textColor: '#ffffff',
    accentColor: '#0B7A48',
    backgroundEffect: 'none',
    links: [],
    userId: 0,
    createdAt: '',
    updatedAt: ''
  })

  useEffect(() => {
    if (!params.id) return

    const fetchLinkTree = async () => {
      try {
        const response = await fetch(`/api/linktree/${params.id}`)
        if (!response.ok) {
          throw new Error('Erro ao carregar LinkTree')
        }
        const data = await response.json()
        setLinkTree(data.linkTree)
        setFormData(data.linkTree)
      } catch (error) {
        console.error('Erro ao carregar LinkTree:', error)
        toast.error('Erro ao carregar LinkTree')
      }
    }

    fetchLinkTree()
  }, [params.id])

  const addLink = () => {
    setFormData(prev => ({
      ...prev,
      links: [
        ...prev.links,
        {
          title: '',
          url: '',
          icon: '🔗',
          imageUrl: '',
          isActive: true
        }
      ]
    }))
  }

  const removeLink = (index: number) => {
    if (formData.links.length <= 1) {
      toast.error('Você deve ter pelo menos um link')
      return
    }
    
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
    
    if (!formData.name.trim()) {
      toast.error('Nome do LinkTree é obrigatório')
      return
    }

    if (formData.links.some(link => !link.title.trim() || !link.url.trim())) {
      toast.error('Todos os links devem ter título e URL')
      return
    }

    setSaving(true)

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

      const response = await fetch(`/api/linktree/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          imageUrl,
          userId: session?.user?.id
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao atualizar LinkTree')
      }

      toast.success('LinkTree atualizado com sucesso!')
      router.push('/dashboard/linktree')
    } catch (error) {
      console.error('Erro ao atualizar LinkTree:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar LinkTree')
    } finally {
      setSaving(false)
    }
  }

  if (!linkTree) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B7A48] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto relative">
      {/* Overlay de Loading */}
      <LoadingOverlay 
        isLoading={saving}
        message="Salvando alterações..."
        subMessage="Aguarde enquanto processamos suas informações"
      />

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/dashboard/linktree')}
          className="flex items-center gap-2"
          disabled={saving}
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Editar LinkTree</h1>
          <p className="text-muted-foreground mt-1">
            Edite seu LinkTree e personalize seus links
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Informações básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Informações do LinkTree
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do LinkTree *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Meus Links Pessoais"
                  className="mt-1"
                  disabled={saving}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Uma breve descrição do seu LinkTree"
                  className="mt-1"
                  disabled={saving}
                />
              </div>

              {/* Upload de Imagem */}
              <div>
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
                        disabled={saving}
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
            </CardContent>
          </Card>

          {/* Links */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Links</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLink}
                  className="flex items-center gap-2"
                  disabled={saving}
                >
                  <PlusIcon className="h-4 w-4" />
                  Adicionar Link
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.links.map((link, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Link {index + 1}</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeLink(index)}
                        className="text-red-600 hover:text-red-700"
                        disabled={saving}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`title-${index}`}>Título *</Label>
                        <Input
                          id={`title-${index}`}
                          value={link.title}
                          onChange={(e) => updateLink(index, 'title', e.target.value)}
                          placeholder="Ex: Instagram"
                          className="mt-1"
                          disabled={saving}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`url-${index}`}>URL *</Label>
                        <Input
                          id={`url-${index}`}
                          value={link.url}
                          onChange={(e) => updateLink(index, 'url', e.target.value)}
                          placeholder="https://instagram.com/seuperfil"
                          className="mt-1"
                          disabled={saving}
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
              </div>
            </CardContent>
          </Card>

          {/* Botões de ação */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/linktree')}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#0B7A48] text-white"
              disabled={saving}
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Salvando...
                </span>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
} 