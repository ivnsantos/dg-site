'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'

interface LinkTree {
  id: number
  name: string
  description?: string
  code: string
  isActive: boolean
  backgroundColor: string
  textColor: string
  accentColor: string
  links: LinkTreeLink[]
  userId: number
  createdAt: string
  updatedAt: string
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

export default function LinkTreePublicPage() {
  const { code } = useParams()
  const [linkTree, setLinkTree] = useState<LinkTree | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLinkTree = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/linktree/code/${code}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('LinkTree não encontrado')
          } else {
            setError('Erro ao carregar LinkTree')
          }
          return
        }

        const data = await response.json()
        setLinkTree(data.linkTree)
      } catch (error) {
        console.error('Erro ao buscar LinkTree:', error)
        setError('Erro ao carregar LinkTree')
      } finally {
        setLoading(false)
      }
    }

    if (code) {
      fetchLinkTree()
    }
  }, [code])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B7A48] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (error || !linkTree) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">LinkTree não encontrado</h1>
          <p className="text-gray-600">O LinkTree que você está procurando não existe ou foi desativado.</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen py-8 px-4"
      style={{ backgroundColor: linkTree.backgroundColor }}
    >
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 
            className="text-3xl font-bold mb-2"
            style={{ color: linkTree.textColor }}
          >
            {linkTree.name}
          </h1>
          {linkTree.description && (
            <p 
              className="text-lg opacity-90"
              style={{ color: linkTree.textColor }}
            >
              {linkTree.description}
            </p>
          )}
        </div>

        {/* Links */}
        <div className="space-y-4">
          {linkTree.links.length > 0 ? (
            linkTree.links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full backdrop-blur-sm border rounded-xl p-4 text-center hover:scale-105 transition-all duration-300 group"
                style={{
                  backgroundColor: linkTree.backgroundColor + '20',
                  borderColor: linkTree.accentColor + '40',
                  color: linkTree.textColor
                }}
              >
                <div className="flex items-center justify-center gap-3">
                  {link.imageUrl ? (
                    <img 
                      src={link.imageUrl} 
                      alt={link.title}
                      className="w-6 h-6 object-contain"
                    />
                  ) : (
                    <span className="text-2xl">{link.icon || '🔗'}</span>
                  )}
                  <span className="font-semibold text-lg group-hover:transition-colors duration-300" style={{ color: linkTree.textColor }}>
                    {link.title}
                  </span>
                </div>
              </a>
            ))
          ) : (
            <div 
              className="text-center p-8 rounded-xl border"
              style={{
                backgroundColor: linkTree.backgroundColor + '20',
                borderColor: linkTree.accentColor + '40',
                color: linkTree.textColor + '80'
              }}
            >
              <p>Nenhum link disponível</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p 
            className="text-sm opacity-70"
            style={{ color: linkTree.textColor }}
          >
            Criado com Doce Gestão
          </p>
        </div>
      </div>
    </div>
  )
} 