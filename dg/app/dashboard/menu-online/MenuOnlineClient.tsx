'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

interface Menu {
  id: number
  name: string
  description?: string
  isActive: boolean
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

    fetch(`/api/menu-online?userId=${userId}`)
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
        <Button 
          className="bg-[#0B7A48] text-white"
          onClick={() => router.push('/dashboard/menu-online/novo')}
        >
          Adicionar Menu
        </Button>
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
            const fullLink = typeof window !== 'undefined' ? `${window.location.origin}/menu/${menu.id}` : `/menu/${menu.id}`;
            return (
              <div key={menu.id} className="bg-white rounded-2xl shadow-md p-6 flex flex-col md:flex-row items-center md:items-stretch justify-between gap-6 transition-all hover:shadow-lg border border-gray-100 group">
                <div className="flex-1 flex flex-col gap-2 justify-center md:justify-start md:items-start items-center text-center md:text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-xl text-primary">{menu.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${menu.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{menu.isActive ? 'Ativo' : 'Inativo'}</span>
                  </div>
                  <div className="text-xs text-muted-foreground break-all">
                    <span className="font-semibold">Link:</span> <a href={fullLink} target="_blank" rel="noopener noreferrer" className="underline text-blue-700 font-mono">{fullLink}</a>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center gap-2 md:px-8">
                  <div className="bg-white rounded-xl border border-gray-200 shadow p-2 flex items-center justify-center">
                    {/* QRCodeCanvas component was removed, so this will be empty or a placeholder */}
                    {/* <QRCodeCanvas id={`qrcode-dashboard-${menu.id}`} value={fullLink} size={90} /> */}
                  </div>
                  <button
                    className="px-3 py-1 bg-[#0B7A48] text-white rounded text-xs font-semibold hover:bg-[#0B7A48]/90 shadow"
                    onClick={() => {
                      // const canvas = document.getElementById(`qrcode-dashboard-${menu.id}`) as HTMLCanvasElement;
                      // if (canvas) {
                      //   const url = canvas.toDataURL('image/png');
                      //   const a = document.createElement('a');
                      //   a.href = url;
                      //   a.download = `qrcode-menu-${menu.codigo}.png`;
                      //   a.click();
                      // }
                    }}
                  >
                    Baixar QR Code
                  </button>
                  <span className="text-[11px] text-muted-foreground">QR Code</span>
                </div>
                <div className="flex flex-col items-end justify-between w-full md:w-auto md:justify-center">
                  <Button variant="outline" className="border-gray-300 text-primary font-medium hover:bg-[#0B7A48]/10 transition">Ver detalhes</Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
} 