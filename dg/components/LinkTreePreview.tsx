'use client'

import React from 'react'

interface LinkTreePreviewProps {
  name: string
  description?: string
  imageUrl?: string
  backgroundColor: string
  textColor: string
  accentColor: string
  backgroundEffect?: string
  links: Array<{
    title: string
    icon?: string
    imageUrl?: string
  }>
  maxLinks?: number
}

export default function LinkTreePreview({
  name,
  description,
  imageUrl,
  backgroundColor,
  textColor,
  accentColor,
  backgroundEffect = 'none',
  links,
  maxLinks = 3
}: LinkTreePreviewProps) {
  // Função para gerar o estilo de fundo baseado no efeito
  const getBackgroundStyle = () => {
    switch (backgroundEffect) {
      case 'hearts':
        return {
          backgroundColor,
          position: 'relative' as const
        }
      case 'dots':
        return {
          backgroundColor,
          position: 'relative' as const
        }
      case 'lines':
        return {
          backgroundColor,
          position: 'relative' as const
        }
      case 'stars':
        return {
          backgroundColor,
          position: 'relative' as const
        }
      default:
        return { backgroundColor }
    }
  }

  return (
    <div className="p-6 rounded-2xl border-2 shadow-lg relative overflow-hidden" style={getBackgroundStyle()}>
      {/* Efeitos visuais para corações */}
      {backgroundEffect === 'hearts' && (
        <div className="absolute inset-0 opacity-25 pointer-events-none">
          <svg className="absolute top-2 left-2 w-6 h-6" fill={accentColor} viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <svg className="absolute top-4 right-4 w-4 h-4" fill={textColor} viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <svg className="absolute bottom-3 left-5 w-3 h-3" fill={accentColor} viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <svg className="absolute bottom-2 right-2 w-2 h-2" fill={textColor} viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
      )}
      
      {/* Efeitos visuais para bolinhas */}
      {backgroundEffect === 'dots' && (
        <div className="absolute inset-0 opacity-25 pointer-events-none">
          <div className="absolute top-2 left-2 w-6 h-6 rounded-full animate-pulse" style={{ backgroundColor: accentColor }}></div>
          <div className="absolute top-4 right-4 w-4 h-4 rounded-full animate-pulse delay-75" style={{ backgroundColor: textColor }}></div>
          <div className="absolute bottom-3 left-5 w-3 h-3 rounded-full animate-pulse delay-150" style={{ backgroundColor: accentColor }}></div>
          <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full animate-pulse delay-200" style={{ backgroundColor: textColor }}></div>
          <div className="absolute top-1/2 left-1/3 w-1 h-1 rounded-full animate-pulse delay-300" style={{ backgroundColor: accentColor }}></div>
        </div>
      )}
      
      {/* Efeitos visuais para traços */}
      {backgroundEffect === 'lines' && (
        <div className="absolute inset-0 opacity-25 pointer-events-none">
          <div className="absolute top-2 left-2 w-8 h-0.5 rounded-full" style={{ backgroundColor: accentColor }}></div>
          <div className="absolute top-4 right-2 w-6 h-0.5 rounded-full" style={{ backgroundColor: textColor }}></div>
          <div className="absolute bottom-3 left-3 w-4 h-0.5 rounded-full" style={{ backgroundColor: accentColor }}></div>
          <div className="absolute bottom-2 right-3 w-3 h-0.5 rounded-full" style={{ backgroundColor: textColor }}></div>
          <div className="absolute top-1/2 left-1/4 w-2 h-0.5 rounded-full" style={{ backgroundColor: accentColor }}></div>
        </div>
      )}
      
      {/* Efeitos visuais para estrelinhas */}
      {backgroundEffect === 'stars' && (
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <svg className="absolute top-2 left-2 w-6 h-6" fill={accentColor} viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <svg className="absolute top-4 right-4 w-4 h-4" fill={textColor} viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <svg className="absolute bottom-3 left-5 w-3 h-3" fill={accentColor} viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <svg className="absolute bottom-2 right-2 w-2 h-2" fill={textColor} viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
      )}

      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-4">
          {imageUrl ? (
            <div className="relative">
              <img
                src={imageUrl}
                alt={name}
                className="w-14 h-14 rounded-full object-cover border-2 shadow-lg"
                style={{ borderColor: accentColor + '40' }}
              />
            </div>
          ) : (
            <div 
              className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg border-2"
              style={{ 
                backgroundColor: accentColor, 
                color: '#fff',
                borderColor: accentColor + '40'
              }}
            >
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h4 className="font-bold text-lg" style={{ color: textColor }}>
              {name || 'Nome do LinkTree'}
            </h4>
            <p className="text-sm leading-relaxed" style={{ color: textColor + 'CC' }}>
              {description || 'Descrição do seu LinkTree'}
            </p>
          </div>
        </div>
        <div className="space-y-3">
          {links.length > 0 ? (
            links.slice(0, maxLinks).map((link, index) => (
              <div 
                key={index}
                className="p-4 rounded-xl border-2 text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
                style={{ 
                  backgroundColor: backgroundColor + '15',
                  borderColor: accentColor + '30',
                  color: textColor
                }}
              >
                <div className="flex items-center justify-center gap-3">
                  {link.imageUrl ? (
                    <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center">
                      <img 
                        src={link.imageUrl} 
                        alt={link.title}
                        className="w-5 h-5 object-cover rounded-full"
                      />
                    </div>
                  ) : (
                    <span className="text-xl">{link.icon || '🔗'}</span>
                  )}
                  <span className="font-semibold text-base">{link.title || 'Título do Link'}</span>
                </div>
              </div>
            ))
          ) : (
            <div 
              className="p-4 rounded-xl border-2 border-dashed text-center"
              style={{ 
                backgroundColor: backgroundColor + '10',
                borderColor: accentColor + '20',
                color: textColor + '80'
              }}
            >
              <span className="text-sm font-medium">Adicione links para ver o preview</span>
            </div>
          )}
          {links.length > maxLinks && (
            <div 
              className="p-3 rounded-xl border-2 text-center"
              style={{ 
                backgroundColor: backgroundColor + '15',
                borderColor: accentColor + '30',
                color: textColor + '80'
              }}
            >
              <span className="text-sm font-medium">+{links.length - maxLinks} links</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 