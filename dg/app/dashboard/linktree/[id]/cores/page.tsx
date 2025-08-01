'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '../../../../../components/ui/button'
import { Input } from '../../../../../components/ui/input'
import { Label } from '../../../../../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card'
import LinkTreePreview from '../../../../../components/LinkTreePreview'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

interface LinkTree {
  id: number
  name: string
  description?: string
  isActive: boolean
  backgroundColor: string
  textColor: string
  accentColor: string
  links: {
    id: number
    title: string
    url: string
    icon?: string
    imageUrl?: string
    isActive: boolean
    position: number
  }[]
  userId: number
  createdAt: string
  updatedAt: string
}

export default function EditarCoresLinkTreePage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [linkTree, setLinkTree] = useState<LinkTree | null>(null)
  const [colors, setColors] = useState({
    backgroundColor: '#2D1810',
    textColor: '#ffffff',
    accentColor: '#0B7A48'
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
        setColors({
          backgroundColor: data.linkTree.backgroundColor || '#2D1810',
          textColor: data.linkTree.textColor || '#ffffff',
          accentColor: data.linkTree.accentColor || '#0B7A48'
        })
      } catch (error) {
        console.error('Erro ao carregar LinkTree:', error)
        toast.error('Erro ao carregar LinkTree')
      }
    }

    fetchLinkTree()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/linktree/${params.id}/update-colors`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(colors)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao atualizar cores')
      }

      toast.success('Cores atualizadas com sucesso!')
      router.push('/dashboard/linktree')
    } catch (error) {
      console.error('Erro ao atualizar cores:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar cores')
    } finally {
      setLoading(false)
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
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/dashboard/linktree')}
          className="flex items-center gap-2"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Editar Cores - {linkTree.name}</h1>
          <p className="text-muted-foreground mt-1">
            Personalize as cores do seu LinkTree
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Personalização de Cores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
                Personalização de Cores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="backgroundColor">Cor de Fundo</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      id="backgroundColor"
                      value={colors.backgroundColor}
                      onChange={(e) => setColors(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="w-12 h-10 rounded border cursor-pointer"
                    />
                    <Input
                      value={colors.backgroundColor}
                      onChange={(e) => setColors(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      placeholder="#2D1810"
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="textColor">Cor do Texto</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      id="textColor"
                      value={colors.textColor}
                      onChange={(e) => setColors(prev => ({ ...prev, textColor: e.target.value }))}
                      className="w-12 h-10 rounded border cursor-pointer"
                    />
                    <Input
                      value={colors.textColor}
                      onChange={(e) => setColors(prev => ({ ...prev, textColor: e.target.value }))}
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="accentColor">Cor de Destaque</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      id="accentColor"
                      value={colors.accentColor}
                      onChange={(e) => setColors(prev => ({ ...prev, accentColor: e.target.value }))}
                      className="w-12 h-10 rounded border cursor-pointer"
                    />
                    <Input
                      value={colors.accentColor}
                      onChange={(e) => setColors(prev => ({ ...prev, accentColor: e.target.value }))}
                      placeholder="#0B7A48"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
              
              {/* Preview */}
              <div className="mt-6">
                <LinkTreePreview
                  name={linkTree.name}
                  description={linkTree.description}
                  backgroundColor={colors.backgroundColor}
                  textColor={colors.textColor}
                  accentColor={colors.accentColor}
                  links={linkTree.links}
                  maxLinks={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botões de ação */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/linktree')}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#0B7A48] text-white"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Cores'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
} 