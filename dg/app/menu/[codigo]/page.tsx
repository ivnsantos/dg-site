'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { QRCodeCanvas } from 'qrcode.react'

interface MenuItem {
  id: number
  name: string
  description: string
  price: number | string
  available: boolean
  position: number
  imageUrl?: string
}

interface MenuSection {
  id: number
  title: string
  description: string
  imageUrl: string
  position: number
  items: MenuItem[]
}

interface Menu {
  id: number
  name: string
  description: string
  imageUrl: string
  imageUrlBackground?: string
  telefone?: string
  instagram?: string
  template: string
  status: string
  sections: MenuSection[]
}

export default function MenuPublicoPage() {
  const params = useParams()
  const codigo = params?.codigo as string
  const [menu, setMenu] = useState<Menu | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!codigo) return

    fetch(`/api/menus/public/${codigo}`)
      .then(res => {
        if (!res.ok) throw new Error('Menu não encontrado')
        return res.json()
      })
      .then(data => {
        setMenu(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [codigo])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F6F4]">
        <div className="text-center flex flex-col items-center gap-4">
          <img src="/images/logo.png" alt="Doce Gestão Logo" width={80} height={80} className="mx-auto animate-fade-in" />
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#0B7A48] mx-auto"></div>
          <p className="mt-2 text-[#0B7A48] text-lg font-semibold">Carregando...</p>
        </div>
      </div>
    )
  }

  if (error || !menu) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Menu não encontrado</h1>
          <p className="text-gray-600">O menu que você está procurando não existe ou não está disponível.</p>
        </div>
      </div>
    )
  }

  if (menu.status !== 'Ativo') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600 mb-2">Menu Indisponível</h1>
          <p className="text-gray-600">Este menu está temporariamente indisponível.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex justify-center items-start bg-background p-0">
      <div className="w-full max-w-2xl flex flex-col items-center">
        {/* Header com imagem de fundo e logo */}
        <div className="w-full relative mb-6">
          {menu.imageUrlBackground && (
            <div className="w-full h-56 md:h-72 overflow-hidden rounded-b-2xl bg-muted relative">
              <Image
                src={menu.imageUrlBackground}
                alt="Fundo do menu"
                fill
                className="object-cover w-full h-full"
                priority
              />
            </div>
          )}
          {menu.imageUrl && (
            <div className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-1/2 z-20 w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
              <Image
                src={menu.imageUrl}
                alt="Logo da empresa"
                width={128}
                height={128}
                className="object-cover w-32 h-32 rounded-full"
              />
            </div>
          )}
        </div>
        <div className="mt-20 w-full flex flex-col items-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="text-3xl md:text-4xl font-bold text-primary text-center flex items-center gap-2">{menu.name}
              <img src="/images/verified-badge-profile-icon-png.webp" alt="Verificado" className="w-7 h-7 object-contain ml-1" />
            </h1>
          </div>
          {(menu.telefone || menu.instagram) && (
            <div className="flex items-center justify-center gap-3 text-base font-normal mb-1 text-primary">
              {menu.telefone && (
                <span className="flex items-center gap-1">
                  <a
                    href={`https://wa.me/${menu.telefone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:underline"
                  >
                    <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={2} stroke='currentColor' className='w-5 h-5 text-green-600'><path strokeLinecap='round' strokeLinejoin='round' d='M2.25 6.75c0-1.243 1.007-2.25 2.25-2.25h15a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75z' /><path strokeLinecap='round' strokeLinejoin='round' d='M6.75 9.75h.008v.008H6.75V9.75zm0 4.5h.008v.008H6.75v-.008zm5.25-4.5h.008v.008h-.008V9.75zm0 4.5h.008v.008h-.008v-.008zm5.25-4.5h.008v.008h-.008V9.75zm0 4.5h.008v.008h-.008v-.008z' /></svg>
                    <span>{menu.telefone}</span>
                  </a>
                </span>
              )}
              {menu.instagram && (
                <span className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-pink-500"><rect width="20" height="20" x="2" y="2" rx="5" /><circle cx="12" cy="12" r="3.5" /><circle cx="17" cy="7" r="1.5" /></svg>
                  <a href={`https://instagram.com/${menu.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="hover:underline">{menu.instagram}</a>
                </span>
              )}
            </div>
          )}
          {menu.description && (
            <div className="flex justify-center w-full mb-1 mt-1">
              <blockquote className="border-l-4 border-[#0B7A48] bg-[#F3F6F4] text-gray-700 italic rounded-r-2xl px-5 py-3 shadow-sm max-w-xl text-left">
                {menu.description}
              </blockquote>
            </div>
          )}
        </div>
        <div className="w-full flex flex-col gap-8 px-2 mt-4">
          {menu.sections.map((section) => (
            <div key={section.id} className="bg-card rounded-2xl shadow-md flex flex-col px-6 py-6 gap-3 border border-border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="uppercase text-base text-primary font-bold tracking-wide">{section.title}</h3>
                {section.imageUrl && (
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted ml-2 flex-shrink-0">
                    <Image
                      src={section.imageUrl}
                      alt={section.title}
                      width={80}
                      height={80}
                      className="object-cover w-20 h-20 rounded-xl"
                    />
                  </div>
                )}
              </div>
              {section.description && (
                <div className="text-sm text-muted-foreground mb-2">{section.description}</div>
              )}
              <div className="divide-y divide-border">
                {section.items.map((item) => (
                  <div key={item.id} className="flex items-center py-4 text-foreground text-base gap-4">
                    {item.imageUrl && (
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-muted flex-shrink-0">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          width={56}
                          height={56}
                          className="object-cover w-14 h-14 rounded-full"
                        />
                      </div>
                    )}
                    <div className="flex-1 flex flex-col">
                      <span className="font-semibold">{item.name}</span>
                      {item.description && (
                        <span className="text-sm text-muted-foreground mt-0.5">{item.description}</span>
                      )}
                    </div>
                    <span className="ml-4 font-bold">R$ {Number(item.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* Footer Doce Gestão */}
        <footer className="w-full flex flex-col items-center justify-center py-8 mt-16 border-t border-gray-200 bg-white/80">
          <span className="text-sm text-gray-500">Feito com ♥ por <a href="https://docegestao.com.br" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#0B7A48] hover:underline">Doce Gestão</a></span>
        </footer>
      </div>
    </div>
  )
} 