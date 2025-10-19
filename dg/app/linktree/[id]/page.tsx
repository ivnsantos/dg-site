'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'

interface LinkTree {
  id: number
  name: string
  description?: string
  imageUrl?: string
  isActive: boolean
  backgroundColor: string
  textColor: string
  accentColor: string
  backgroundEffect: string
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
  const params = useParams()
  const id = params?.id as string
  const [linkTree, setLinkTree] = useState<LinkTree | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    fetch(`/api/linktree/${id}`)
      .then(res => {
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('LinkTree não encontrado')
          }
          throw new Error('Erro ao carregar LinkTree')
        }
        return res.json()
      })
      .then(data => {
        setLinkTree(data.linkTree)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Erro ao carregar LinkTree:', error)
        toast.error(error.message || 'Erro ao carregar LinkTree')
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-slate-600 font-medium text-lg">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!linkTree) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-slate-200 flex items-center justify-center">
            <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-4">LinkTree não encontrado</h1>
          <p className="text-slate-600 text-lg">O LinkTree que você está procurando não existe.</p>
        </div>
      </div>
    )
  }

  if (!linkTree.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-slate-200 flex items-center justify-center">
            <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-4">LinkTree Inativo</h1>
          <p className="text-slate-600 text-lg">Este LinkTree está temporariamente indisponível.</p>
        </div>
      </div>
    )
  }

  const activeLinks = linkTree.links.filter(link => link.isActive).sort((a, b) => a.position - b.position)

  // Função para gerar o estilo de fundo baseado no efeito
  const getBackgroundStyle = () => {
    switch (linkTree.backgroundEffect) {
      case 'hearts':
        return {
          backgroundColor: linkTree.backgroundColor,
          position: 'relative' as const
        }
      case 'dots':
        return {
          backgroundColor: linkTree.backgroundColor,
          position: 'relative' as const
        }
      case 'lines':
        return {
          backgroundColor: linkTree.backgroundColor,
          position: 'relative' as const
        }
      case 'stars':
        return {
          backgroundColor: linkTree.backgroundColor,
          position: 'relative' as const
        }
      default:
        return { backgroundColor: linkTree.backgroundColor }
    }
  }

  return (
    <div 
      className="min-h-screen py-8 sm:py-16 px-4 sm:px-6 relative flex flex-col"
      style={{
        ...getBackgroundStyle(),
      }}
    >
      {/* Efeitos visuais para corações */}
      {linkTree.backgroundEffect === 'hearts' && (
        <div className="absolute inset-0 pointer-events-none">
          <svg className="absolute top-10 left-10 w-8 h-8 animate-pulse" fill={linkTree.accentColor} viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <svg className="absolute top-20 right-20 w-6 h-6 animate-pulse delay-300" fill={linkTree.textColor} viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <svg className="absolute bottom-20 left-20 w-4 h-4 animate-pulse delay-500" fill={linkTree.accentColor} viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <svg className="absolute bottom-10 right-10 w-3 h-3 animate-pulse delay-700" fill={linkTree.textColor} viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <svg className="absolute top-1/3 left-1/3 w-2 h-2 animate-pulse delay-1000" fill={linkTree.accentColor} viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <svg className="absolute top-2/3 right-1/4 w-5 h-5 animate-pulse delay-1200" fill={linkTree.textColor} viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
      )}
      
      {/* Efeitos visuais para bolinhas */}
      {linkTree.backgroundEffect === 'dots' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-8 h-8 rounded-full animate-bounce" style={{ backgroundColor: linkTree.accentColor }}></div>
          <div className="absolute top-20 right-20 w-6 h-6 rounded-full animate-bounce delay-300" style={{ backgroundColor: linkTree.textColor }}></div>
          <div className="absolute bottom-20 left-20 w-4 h-4 rounded-full animate-bounce delay-500" style={{ backgroundColor: linkTree.accentColor }}></div>
          <div className="absolute bottom-10 right-10 w-3 h-3 rounded-full animate-bounce delay-700" style={{ backgroundColor: linkTree.textColor }}></div>
          <div className="absolute top-1/3 left-1/3 w-2 h-2 rounded-full animate-bounce delay-1000" style={{ backgroundColor: linkTree.accentColor }}></div>
          <div className="absolute top-2/3 right-1/3 w-1 h-1 rounded-full animate-bounce delay-1200" style={{ backgroundColor: linkTree.textColor }}></div>
          <div className="absolute top-1/4 right-1/3 w-5 h-5 rounded-full animate-pulse delay-1500" style={{ backgroundColor: linkTree.accentColor }}></div>
          <div className="absolute bottom-1/4 left-1/4 w-3 h-3 rounded-full animate-pulse delay-1800" style={{ backgroundColor: linkTree.textColor }}></div>
        </div>
      )}
      
      {/* Efeitos visuais para traços */}
      {linkTree.backgroundEffect === 'lines' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-16 h-1 rounded-full animate-pulse" style={{ backgroundColor: linkTree.accentColor }}></div>
          <div className="absolute top-20 right-20 w-12 h-1 rounded-full animate-pulse delay-300" style={{ backgroundColor: linkTree.textColor }}></div>
          <div className="absolute bottom-20 left-20 w-8 h-1 rounded-full animate-pulse delay-500" style={{ backgroundColor: linkTree.accentColor }}></div>
          <div className="absolute bottom-10 right-10 w-6 h-1 rounded-full animate-pulse delay-700" style={{ backgroundColor: linkTree.textColor }}></div>
          <div className="absolute top-1/3 left-1/4 w-4 h-1 rounded-full animate-pulse delay-1000" style={{ backgroundColor: linkTree.accentColor }}></div>
          <div className="absolute top-2/3 right-1/4 w-3 h-1 rounded-full animate-pulse delay-1200" style={{ backgroundColor: linkTree.textColor }}></div>
          <div className="absolute top-1/4 right-1/3 w-10 h-0.5 rounded-full animate-pulse delay-1500" style={{ backgroundColor: linkTree.accentColor }}></div>
          <div className="absolute bottom-1/4 left-1/4 w-5 h-0.5 rounded-full animate-pulse delay-1800" style={{ backgroundColor: linkTree.textColor }}></div>
        </div>
      )}
      
      {/* Efeitos visuais para estrelinhas */}
      {linkTree.backgroundEffect === 'stars' && (
        <div className="absolute inset-0 pointer-events-none">
          <svg className="absolute top-10 left-10 w-8 h-8 animate-pulse" fill={linkTree.accentColor} viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <svg className="absolute top-20 right-20 w-6 h-6 animate-pulse delay-300" fill={linkTree.textColor} viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <svg className="absolute bottom-20 left-20 w-4 h-4 animate-pulse delay-500" fill={linkTree.accentColor} viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <svg className="absolute bottom-10 right-10 w-3 h-3 animate-pulse delay-700" fill={linkTree.textColor} viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <svg className="absolute top-1/3 left-1/3 w-2 h-2 animate-pulse delay-1000" fill={linkTree.accentColor} viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <svg className="absolute top-2/3 right-1/3 w-1 h-1 animate-pulse delay-1200" fill={linkTree.textColor} viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <svg className="absolute top-1/4 right-1/3 w-5 h-5 animate-bounce delay-1500" fill={linkTree.accentColor} viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <svg className="absolute bottom-1/4 left-1/4 w-3 h-3 animate-bounce delay-1800" fill={linkTree.textColor} viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
      )}

      {/* Efeito de Partículas Flutuantes para fundos sem efeito específico */}
      {(!linkTree.backgroundEffect || linkTree.backgroundEffect === 'none') && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-20 w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: linkTree.accentColor }}></div>
          <div className="absolute top-40 right-40 w-1 h-1 rounded-full animate-pulse delay-500" style={{ backgroundColor: linkTree.textColor }}></div>
          <div className="absolute bottom-40 left-40 w-3 h-3 rounded-full animate-pulse delay-1000" style={{ backgroundColor: linkTree.accentColor }}></div>
          <div className="absolute bottom-20 right-20 w-1 h-1 rounded-full animate-pulse delay-1500" style={{ backgroundColor: linkTree.textColor }}></div>
          <div className="absolute top-1/2 left-1/3 w-2 h-2 rounded-full animate-pulse delay-2000" style={{ backgroundColor: linkTree.accentColor }}></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 rounded-full animate-pulse delay-2500" style={{ backgroundColor: linkTree.textColor }}></div>
        </div>
      )}

      {/* Botão de Compartilhamento */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: linkTree.name,
                text: linkTree.description || `Confira o LinkTree de ${linkTree.name}`,
                url: window.location.href
              })
            } else {
              // Fallback para copiar o link
              navigator.clipboard.writeText(window.location.href)
              toast.success('Link copiado para a área de transferência!')
            }
          }}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg"
          style={{
            backgroundColor: linkTree.backgroundColor + '80',
            color: linkTree.accentColor,
            border: `2px solid ${linkTree.accentColor}40`
          }}
          title="Compartilhar LinkTree"
        >
          <svg 
            className="w-5 h-5 sm:w-6 sm:h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
        </button>
      </div>

      {/* <div className="max-w-lg sm:max-w-2xl mx-auto flex-1 flex flex-col"> */}
        {/* Container com efeito de vidro */}
        {/* <div 
          className="backdrop-blur-sm bg-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20"
          style={{
            boxShadow: `0 25px 50px -12px ${linkTree.backgroundColor}40, 0 0 0 1px ${linkTree.accentColor}20`
          }}
        > */}
          {/* Profile Section */}
          <div className="text-center mb-8 sm:mb-12">
            {linkTree.imageUrl ? (
              <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-6 rounded-full overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <img
                  src={linkTree.imageUrl}
                  alt={linkTree.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div 
                className="w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-6 rounded-full flex items-center justify-center text-3xl sm:text-4xl font-bold shadow-2xl transform hover:scale-105 transition-transform duration-300"
                style={{ 
                  backgroundColor: linkTree.accentColor,
                  color: '#fff'
                }}
              >
                {linkTree.name.charAt(0).toUpperCase()}
              </div>
            )}
            
            <h1 
              className="text-xl sm:text-2xl font-bold mb-3 tracking-tight"
              style={{ color: linkTree.textColor }}
            >
              {linkTree.name}
            </h1>
            
            {linkTree.description && (
              <p 
                className="text-sm sm:text-base leading-relaxed max-w-md mx-auto px-4"
                style={{ color: linkTree.textColor + 'CC' }}
              >
                {linkTree.description}
              </p>
            )}
          </div>

    

          {/* Links */}
          <div className="space-y-3 mb-8 flex-1">
            {activeLinks.length > 0 ? (
              activeLinks.map((link, index) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full group"
                >
                  <div 
                    className="w-full py-4 px-12 sm:py-5 sm:px-16 rounded-xl transition-all duration-200 hover:scale-[1.02] border backdrop-blur-sm"
                    style={{
                      backgroundColor: linkTree.backgroundColor + '20',
                      borderColor: linkTree.accentColor + '30',
                      color: linkTree.textColor,
                      boxShadow: `0 4px 6px -1px ${linkTree.backgroundColor}20`
                    }}
                  >
                    <div className="flex items-center gap-5">
                      {link.imageUrl ? (
                        <div 
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: linkTree.accentColor + '20' }}
                        >
                          <img 
                            src={link.imageUrl} 
                            alt={link.title}
                            className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded-full"
                          />
                        </div>
                      ) : (
                        <div 
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-xl sm:text-2xl flex-shrink-0"
                          style={{ backgroundColor: linkTree.accentColor + '20' }}
                        >
                          {link.icon || '🔗'}
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <span 
                          className="font-medium text-base sm:text-lg block"
                          style={{ color: linkTree.textColor }}
                        >
                          {link.title}
                        </span>
                      </div>
                      
                      <svg 
                        className="w-5 h-5 sm:w-6 sm:h-6 opacity-60 flex-shrink-0"
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        style={{ color: linkTree.textColor }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </div>
                </a>
              ))
            ) : (
              <div 
                className="text-center p-8 rounded-lg border-2 border-dashed backdrop-blur-sm"
                style={{ 
                  backgroundColor: linkTree.backgroundColor + '10',
                  borderColor: linkTree.accentColor + '30',
                  color: linkTree.textColor + '80'
                }}
              >
                <div 
                  className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: linkTree.accentColor + '20' }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: linkTree.accentColor }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <p className="text-sm font-medium">Nenhum link disponível</p>
              </div>
            )}
          </div>
        {/* </div> */}
      {/* </div> */}

      {/* Footer - Sempre na parte inferior */}
      <div className="text-center mt-auto pt-6">
        <div 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm"
          style={{
            backgroundColor: linkTree.backgroundColor + '30',
            color: linkTree.textColor + 'CC',
            border: `1px solid ${linkTree.accentColor}20`
          }}
        >
          <img 
            src="/images/logo.png" 
            alt="Confeitech" 
            className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
          />
          <span className="text-xs sm:text-sm font-medium">Criado com Confeitech</span>
        </div>
      </div>
    </div>
  )
} 