'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { PlusIcon, LinkIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Badge } from '../../../components/ui/badge'

interface LinkTree {
  id: number
  name: string
  description?: string
  isActive: boolean
  backgroundColor: string
  textColor: string
  accentColor: string
  links: LinkTreeLink[]
  userId: number
  createdAt: string
  updatedAt: string
  code: string
}

interface LinkTreeLink {
  id: number
  title: string
  url: string
  icon?: string
  imageUrl?: string
  isActive: boolean
  position: number
}

export default function LinkTreePage() {
  const { data: session } = useSession()
  const [linkTrees, setLinkTrees] = useState<LinkTree[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false)
      return
    }

    const userId = session.user.id

    fetch(`/api/linktree?userId=${userId}`)
      .then(res => {
        if (!res.ok) {
          if (res.status === 503) {
            throw new Error('Erro de conexão. Tente novamente em alguns segundos.')
          }
          throw new Error('Erro ao carregar LinkTrees')
        }
        return res.json()
      })
      .then(data => {
        setLinkTrees(data.linkTrees || [])
        setLoading(false)
      })
      .catch((error) => {
        console.error('Erro ao carregar LinkTrees:', error)
        toast.error(error.message || 'Erro ao carregar LinkTrees')
        setLoading(false)
      })
  }, [session])

  const handleToggleStatus = async (linkTreeId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/linktree/${linkTreeId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isActive: !currentStatus
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar status')
      }

      // Atualiza o estado local
      setLinkTrees(prev => prev.map(lt => 
        lt.id === linkTreeId 
          ? { ...lt, isActive: !currentStatus }
          : lt
      ))

      toast.success('Status atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      toast.error('Erro ao atualizar status')
    }
  }

  const handleDelete = async (linkTreeId: number) => {
    if (!confirm('Tem certeza que deseja excluir este LinkTree?')) {
      return
    }

    try {
      const response = await fetch(`/api/linktree/${linkTreeId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir LinkTree')
      }

      // Remove do estado local
      setLinkTrees(prev => prev.filter(lt => lt.id !== linkTreeId))
      toast.success('LinkTree excluído com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir LinkTree:', error)
      toast.error('Erro ao excluir LinkTree')
    }
  }

  const renderIconOrImage = (link: LinkTreeLink) => {
    if (link.imageUrl) {
      return (
        <img 
          src={link.imageUrl} 
          alt={link.title}
          className="w-4 h-4 object-contain"
        />
      )
    }
    return <span className="text-sm">{link.icon || '🔗'}</span>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">LinkTree</h1>
          <p className="text-muted-foreground mt-1">
            Crie e gerencie seus LinkTrees para compartilhar todos os seus links importantes
          </p>
        </div>
        <Button 
          className="bg-[#0B7A48] text-white"
          onClick={() => router.push('/dashboard/linktree/novo')}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Criar LinkTree
        </Button>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground">Carregando LinkTrees...</div>
      ) : linkTrees.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <LinkIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum LinkTree criado</h3>
            <p className="text-muted-foreground mb-4">
              Crie seu primeiro LinkTree para compartilhar todos os seus links importantes em um só lugar.
            </p>
            <Button 
              className="bg-[#0B7A48] text-white"
              onClick={() => router.push('/dashboard/linktree/novo')}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Criar Primeiro LinkTree
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {linkTrees.map(linkTree => {
            const fullLink = typeof window !== 'undefined' 
              ? `${window.location.origin}/linktree/${linkTree.code}` 
              : `/linktree/${linkTree.code}`;
            
            return (
              <Card key={linkTree.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{linkTree.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Código: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">{linkTree.code}</span>
                          </p>
                          {linkTree.description && (
                            <p className="text-sm text-gray-600 mt-1">{linkTree.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={linkTree.isActive ? "default" : "secondary"}>
                            {linkTree.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                      </div>

                      <div className="mt-3 text-sm text-gray-600">
                        <p>Link: <span className="font-mono text-xs">/linktree/{linkTree.code}</span></p>
                        <p>{linkTree.links.length} links • Criado em {new Date(linkTree.createdAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                      
                      {/* Preview das cores */}
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Cores:</span>
                        <div className="flex items-center gap-1">
                          <div 
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: linkTree.backgroundColor }}
                            title={`Fundo: ${linkTree.backgroundColor}`}
                          />
                          <div 
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: linkTree.textColor }}
                            title={`Texto: ${linkTree.textColor}`}
                          />
                          <div 
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: linkTree.accentColor }}
                            title={`Destaque: ${linkTree.accentColor}`}
                          />
                        </div>
                      </div>
                      
                      {/* Preview dos links */}
                      {linkTree.links.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {linkTree.links.slice(0, 5).map((link, linkIndex) => (
                            <div key={linkIndex} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs">
                              {renderIconOrImage(link)}
                              <span className="text-gray-600">{link.title}</span>
                            </div>
                          ))}
                          {linkTree.links.length > 5 && (
                            <div className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">
                              +{linkTree.links.length - 5} mais
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(fullLink, '_blank')}
                        className="flex items-center gap-1"
                      >
                        <EyeIcon className="h-4 w-4" />
                        Visualizar
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/linktree/${linkTree.id}/editar`)}
                        className="flex items-center gap-1"
                      >
                        <PencilIcon className="h-4 w-4" />
                        Editar
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/linktree/${linkTree.id}/cores`)}
                        className="flex items-center gap-1"
                        title="Editar cores"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                        </svg>
                        Cores
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(linkTree.id, linkTree.isActive)}
                        className={`flex items-center gap-1 ${
                          linkTree.isActive 
                            ? 'text-orange-600 hover:text-orange-700' 
                            : 'text-green-600 hover:text-green-700'
                        }`}
                      >
                        {linkTree.isActive ? 'Desativar' : 'Ativar'}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(linkTree.id)}
                        className="text-red-600 hover:text-red-700 flex items-center gap-1"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
} 