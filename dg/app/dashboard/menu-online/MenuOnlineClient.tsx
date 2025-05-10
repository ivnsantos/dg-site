'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '../../../components/ui/button'
import { QRCodeCanvas } from 'qrcode.react'

interface MenuList {
  id: number
  name: string
  codigo: string
  status: string
  imageUrl?: string
}

export default function MenuOnlineClient() {
  const [menus, setMenus] = useState<MenuList[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Trocar userId para o usuário logado
    const userId = 1
    fetch(`/api/menus?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        setMenus(data.menus || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Menus Online</h1>
        <Link href="/dashboard/menu-online/novo">
          <Button className="bg-[#0B7A48] text-white">Adicionar Menu</Button>
        </Link>
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
            return (
              <div key={menu.id} className="bg-white rounded-2xl shadow-md p-6 flex flex-col md:flex-row items-center md:items-stretch justify-between gap-6 transition-all hover:shadow-lg border border-gray-100 group">
                <div className="flex-1 flex flex-col gap-2 justify-center md:justify-start md:items-start items-center text-center md:text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-xl text-primary">{menu.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${menu.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{menu.status}</span>
                  </div>
                  <div className="text-xs text-muted-foreground break-all">
                    <span className="font-semibold">Link:</span> <a href={fullLink} target="_blank" rel="noopener noreferrer" className="underline text-blue-700 font-mono">{fullLink}</a>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center gap-2 md:px-8">
                  <div className="bg-white rounded-xl border border-gray-200 shadow p-2 flex items-center justify-center">
                    <QRCodeCanvas id={`qrcode-dashboard-${menu.id}`} value={fullLink} size={90} />
                  </div>
                  <button
                    className="px-3 py-1 bg-[#0B7A48] text-white rounded text-xs font-semibold hover:bg-[#0B7A48]/90 shadow"
                    onClick={() => {
                      const canvas = document.getElementById(`qrcode-dashboard-${menu.id}`) as HTMLCanvasElement;
                      if (canvas) {
                        const url = canvas.toDataURL('image/png');
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `qrcode-menu-${menu.codigo}.png`;
                        a.click();
                      }
                    }}
                  >
                    Baixar QR Code
                  </button>
                  <span className="text-[11px] text-muted-foreground">QR Code</span>
                </div>
                <div className="flex flex-col items-end justify-between w-full md:w-auto md:justify-center">
                  <Link href={`/dashboard/menu-online/${menu.id}`}>
                    <Button variant="outline" className="border-gray-300 text-primary font-medium hover:bg-[#0B7A48]/10 transition">Ver detalhes</Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
} 