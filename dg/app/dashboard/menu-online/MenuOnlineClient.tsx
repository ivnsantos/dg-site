'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '../../../components/ui/button'
import { QRCodeCanvas } from 'qrcode.react'
import { toast } from 'react-hot-toast'

interface Menu {
  id: number
  name: string
  description?: string
  codigo: string
  status: string
  imageUrl?: string
  sections: MenuSection[]
}

interface MenuSection {
  id: number
  name: string
  items: MenuItem[]
}

interface MenuItem {
  id: number
  name: string
  description?: string
  price: number
  imageUrl?: string
}

export default function MenuOnlineClient() {
  const { data: session } = useSession()
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false)
      return
    }

    const userId = session.user.id

    fetch(`/api/menus?userId=${userId}`)
      .then(res => {
        if (!res.ok) {
          if (res.status === 503) {
            throw new Error('Erro de conexão. Tente novamente em alguns segundos.')
          }
          throw new Error('Erro ao carregar menus')
        }
        return res.json()
      })
      .then(data => {
        setMenus(data.menus || [])
        setLoading(false)
      })
      .catch((error) => {
        console.error('Erro ao carregar menus:', error)
        toast.error(error.message || 'Erro ao carregar menus')
        setLoading(false)
      })
  }, [session])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Menus Online</h1>
        <div className="flex items-center gap-3">
          {menus.length >= 2 && (
            <div className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-md border border-amber-200">
              Limite de 2 menus atingido
            </div>
          )}
          <Button 
            className="bg-[#0B7A48] text-white"
            onClick={() => router.push('/dashboard/menu-online/novo')}
            disabled={menus.length >= 2}
          >
            Adicionar Menu
          </Button>
        </div>
      </div>
      {loading ? (
        <div className="text-center text-muted-foreground">Carregando menus...</div>
      ) : menus.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-muted-foreground">
          Nenhum menu cadastrado ainda.
        </div>
      ) : (
        <div className="grid gap-6">
          {menus.map(menu => {
            const fullLink = typeof window !== 'undefined' ? `${window.location.origin}/menu/${menu.codigo}` : `/menu/${menu.codigo}`;
            const totalItems = menu.sections?.reduce((acc, section) => acc + (section.items?.length || 0), 0) || 0;
            const sectionsCount = menu.sections?.length || 0;
            
            return (
              <div key={menu.id} className="bg-white rounded-2xl shadow-md p-6 transition-all hover:shadow-lg border border-gray-100 group">
                {/* Header com nome e status */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-2xl text-primary">{menu.name}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${menu.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {menu.status === 'Ativo' ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    {menu.description && (
                      <p className="text-sm text-muted-foreground mb-3 max-w-2xl">{menu.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        {sectionsCount} seções
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        {totalItems} itens
                      </span>
                    </div>
                  </div>
                  
                  {/* Botões de ação */}
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-gray-300 text-primary font-medium hover:bg-[#0B7A48]/10 transition"
                      onClick={() => router.push(`/dashboard/menu-online/editar/${menu.id}`)}
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-gray-300 text-primary font-medium hover:bg-[#0B7A48]/10 transition"
                      onClick={() => {
                        navigator.clipboard.writeText(fullLink);
                        toast.success('Link copiado para a área de transferência!');
                      }}
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copiar Link
                    </Button>
                  </div>
                </div>

                {/* Conteúdo principal */}
                <div className="flex flex-col lg:flex-row items-start gap-6">
                  {/* Informações do menu */}
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">Link do Menu</h4>
                      <div className="flex items-center gap-2">
                        <a 
                          href={fullLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:text-blue-800 font-mono text-sm break-all underline"
                        >
                          {fullLink}
                        </a>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(fullLink);
                            toast.success('Link copiado!');
                          }}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {/* Seções do menu */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-gray-700">Seções do Menu</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {menu.sections?.slice(0, 4).map((section, index) => (
                          <div key={section.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="w-2 h-2 bg-[#0B7A48] rounded-full"></div>
                            <span>{section.name}</span>
                            <span className="text-gray-400">({section.items?.length || 0} itens)</span>
                          </div>
                        ))}
                        {sectionsCount > 4 && (
                          <div className="text-xs text-muted-foreground">
                            +{sectionsCount - 4} mais seções
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="flex flex-col items-center gap-3 bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-sm text-gray-700">QR Code</h4>
                    <div className="bg-white rounded-xl border border-gray-200 shadow p-2 flex items-center justify-center">
                      <QRCodeCanvas id={`qrcode-dashboard-${menu.id}`} value={fullLink} size={100} />
                    </div>
                    <button
                      className="px-4 py-2 bg-[#0B7A48] text-white rounded-lg text-sm font-semibold hover:bg-[#0B7A48]/90 shadow transition"
                      onClick={() => {
                        const canvas = document.getElementById(`qrcode-dashboard-${menu.id}`) as HTMLCanvasElement;
                        if (canvas) {
                          const url = canvas.toDataURL('image/png');
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `qrcode-menu-${menu.codigo}.png`;
                          a.click();
                          toast.success('QR Code baixado com sucesso!');
                        }
                      }}
                    >
                      <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Baixar QR Code
                    </button>
                  </div>
                </div>

                {/* Footer com ações */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Código: {menu.codigo}</span>
                    {menu.imageUrl && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Com imagem
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-gray-300 text-primary font-medium hover:bg-[#0B7A48]/10 transition"
                      onClick={() => window.open(fullLink, '_blank')}
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Visualizar
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
} 