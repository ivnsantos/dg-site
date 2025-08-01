'use client'

import React, { useState } from 'react'
import { Button } from '../../../../components/ui/button'
import { uploadFileViaAPI } from '../../../../src/lib/s3'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface MenuItemForm {
  name: string
  description: string
  price: string
  available: boolean
  imageFile?: File | null
  imageUrl?: string
}

interface MenuSectionForm {
  title: string
  description: string
  imageFile?: File | null
  position: number
  items: MenuItemForm[]
  imageUrl?: string
}

interface MenuForm {
  name: string
  codigo: string
  description: string
  template: string
  status: string
  telefone: string
  instagram: string
  imageFile?: File | null
  imageUrl?: string
  imageBackgroundFile?: File | null
  imageUrlBackground?: string
}

export const dynamic = 'force-dynamic'

export default function NovoMenuPage() {
  const [menu, setMenu] = useState<MenuForm>({
    name: '',
    codigo: '',
    description: '',
    template: 'default',
    status: 'Ativo',
    telefone: '',
    instagram: '',
    imageFile: null,
    imageUrl: '',
    imageBackgroundFile: null,
    imageUrlBackground: '',
  })
  const [sections, setSections] = useState<MenuSectionForm[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const addSection = () => {
    setSections([
      ...sections,
      {
        title: '',
        description: '',
        imageFile: null,
        position: sections.length + 1,
        items: [],
        imageUrl: '',
      },
    ])
  }

  const removeSection = (idx: number) => {
    setSections(sections.filter((_, i) => i !== idx))
  }

  const updateSection = <K extends keyof MenuSectionForm>(idx: number, field: K, value: MenuSectionForm[K]) => {
    const updated = [...sections]
    updated[idx][field] = value
    setSections(updated)
  }

  const handleSectionImage = (idx: number, file: File | null) => {
    updateSection(idx, 'imageFile', file)
  }

  const addItem = (sectionIdx: number) => {
    const updated = [...sections]
    updated[sectionIdx].items.push({
      name: '',
      description: '',
      price: '',
      available: true,
      imageFile: null,
      imageUrl: '',
    })
    setSections(updated)
  }

  const removeItem = (sectionIdx: number, itemIdx: number) => {
    const updated = [...sections]
    updated[sectionIdx].items.splice(itemIdx, 1)
    setSections(updated)
  }

  const updateItem = <K extends keyof MenuItemForm>(sectionIdx: number, itemIdx: number, field: K, value: MenuItemForm[K]) => {
    const updated = [...sections]
    updated[sectionIdx].items[itemIdx][field] = value
    setSections(updated)
  }

  const handleItemImage = (sectionIdx: number, itemIdx: number, file: File | null) => {
    const updated = [...sections]
    updated[sectionIdx].items[itemIdx].imageFile = file
    setSections(updated)
  }

  const handleMenuChange = <K extends keyof MenuForm>(field: K, value: MenuForm[K]) => {
    setMenu({ ...menu, [field]: value })
  }

  const handleMenuImage = (file: File | null) => {
    setMenu({ ...menu, imageFile: file })
  }

  const handleMenuBackgroundImage = (file: File | null) => {
    setMenu({ ...menu, imageBackgroundFile: file })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Upload da imagem do menu principal
      let menuImageUrl = ''
      if (menu.imageFile) {
        const path = `menus/${Date.now()}-${menu.imageFile.name}`
        menuImageUrl = await uploadFileViaAPI(menu.imageFile, path)
      }
      // Upload da imagem de fundo
      let menuImageBackgroundUrl = ''
      if (menu.imageBackgroundFile) {
        const path = `menus/backgrounds/${Date.now()}-${menu.imageBackgroundFile.name}`
        menuImageBackgroundUrl = await uploadFileViaAPI(menu.imageBackgroundFile, path)
      }
      // Upload das imagens das seções
      const sectionUploads = await Promise.all(
        sections.map(async (section, idx) => {
          let sectionImageUrl = ''
          if (section.imageFile) {
            const path = `menus/sections/${Date.now()}-${section.imageFile.name}`
            sectionImageUrl = await uploadFileViaAPI(section.imageFile, path)
          }
          // Upload das imagens dos itens
          const itemUploads = await Promise.all(
            section.items.map(async (item) => {
              let itemImageUrl = ''
              if (item.imageFile) {
                const path = `menus/items/${Date.now()}-${item.imageFile.name}`
                itemImageUrl = await uploadFileViaAPI(item.imageFile, path)
              }
              return {
                ...item,
                imageUrl: itemImageUrl,
                imageFile: undefined,
              }
            })
          )
          return {
            ...section,
            imageUrl: sectionImageUrl,
            imageFile: undefined,
            items: itemUploads,
          }
        })
      )
      const payload = {
        ...menu,
        imageUrl: menuImageUrl,
        imageFile: undefined,
        imageUrlBackground: menuImageBackgroundUrl,
        imageBackgroundFile: undefined,
        sections: sectionUploads,
        userId: 1, // Trocar para o id do usuário logado
      }
      // Chama a API para salvar no banco
      const response = await fetch('/api/menus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error('Erro ao salvar menu')
      toast.success('Menu salvo com sucesso!')
      router.push('/dashboard/menu-online')
    } catch (err) {
      console.error('Erro ao salvar menu:', err)
      toast.error('Erro ao salvar menu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
      <button
        type="button"
        className="mb-4 text-sm text-[#0B7A48] hover:underline flex items-center gap-1"
        onClick={() => router.push('/dashboard/menu-online')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Voltar
      </button>
      <h2 className="text-xl font-bold mb-6">Novo Menu</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium mb-1">Nome</label>
          <input type="text" className="w-full border rounded px-3 py-2" required value={menu.name} onChange={e => handleMenuChange('name', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Customize o link do menu</label>
          <input type="text" className="w-full border rounded px-3 py-2" required value={menu.codigo} onChange={e => handleMenuChange('codigo', e.target.value)} />
          <span className="text-xs text-muted-foreground">Esse será o link para acessar seu menu online: <br/> <b>https://seudominio.com/menu/<span className='font-mono'>{menu.codigo || 'seu-codigo'}</span></b></span>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Deixe uma mensagem para seus clientes</label>
          <textarea className="w-full border rounded px-3 py-2" rows={3} value={menu.description} onChange={e => handleMenuChange('description', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Template</label>
          <select className="w-full border rounded px-3 py-2" value={menu.template} onChange={e => handleMenuChange('template', e.target.value)}>
            <option value="default">Padrão</option>
            <option value="minimal">Minimalista</option>
            <option value="classic">Clássico</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Telefone</label>
          <input type="text" className="w-full border rounded px-3 py-2" value={menu.telefone} onChange={e => handleMenuChange('telefone', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Url do Instagram</label>
          <input type="text" className="w-full border rounded px-3 py-2" value={menu.instagram} onChange={e => handleMenuChange('instagram', e.target.value)} placeholder="Ex: @meuperfil" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Logo</label>
          <div className="flex items-center gap-4">
            <label htmlFor="menuImageUpload" className="cursor-pointer inline-flex items-center px-4 py-2 bg-[#0B7A48] text-white rounded-md hover:bg-[#0B7A48]/80 transition-colors">
              Escolher imagem
              <input
                type="file"
                id="menuImageUpload"
                accept="image/*"
                className="hidden"
                onChange={e => handleMenuImage(e.target.files?.[0] || null)}
              />
            </label>
            {menu.imageFile && (
              <span className="text-xs text-muted-foreground block">{menu.imageFile.name}</span>
            )}
          </div>
          {menu.imageFile && (
            <img
              src={URL.createObjectURL(menu.imageFile)}
              alt="Preview da imagem do menu"
              className="mt-2 rounded shadow max-h-32"
              style={{ maxWidth: 200, objectFit: 'contain' }}
            />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Imagem de Fundo</label>
          <div className="flex items-center gap-4">
            <label htmlFor="menuBackgroundImageUpload" className="cursor-pointer inline-flex items-center px-4 py-2 bg-[#0B7A48] text-white rounded-md hover:bg-[#0B7A48]/80 transition-colors">
              Escolher imagem de fundo
              <input
                type="file"
                id="menuBackgroundImageUpload"
                accept="image/*"
                className="hidden"
                onChange={e => handleMenuBackgroundImage(e.target.files?.[0] || null)}
              />
            </label>
            {menu.imageBackgroundFile && (
              <span className="text-xs text-muted-foreground block">{menu.imageBackgroundFile.name}</span>
            )}
          </div>
          {menu.imageBackgroundFile && (
            <img
              src={URL.createObjectURL(menu.imageBackgroundFile)}
              alt="Preview da imagem de fundo do menu"
              className="mt-2 rounded shadow max-h-32"
              style={{ maxWidth: 200, objectFit: 'contain' }}
            />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select className="w-full border rounded px-3 py-2" value={menu.status} onChange={e => handleMenuChange('status', e.target.value)}>
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
          </select>
        </div>
        <div className="mt-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Seções do Menu</h3>
            <Button type="button" onClick={addSection} className="bg-[#0B7A48] text-white">Adicionar Seção</Button>
          </div>
          {sections.length === 0 && (
            <div className="text-muted-foreground text-sm">Nenhuma seção adicionada.</div>
          )}
          {sections.map((section, idx) => (
            <div key={idx} className="border rounded p-4 mb-4 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Seção {idx + 1}</span>
                <Button type="button" variant="destructive" size="sm" onClick={() => removeSection(idx)}>Remover</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Título</label>
                  <input type="text" className="w-full border rounded px-2 py-1" value={section.title} onChange={e => updateSection(idx, 'title', e.target.value)} required />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Imagem</label>
                  <div className="flex items-center gap-4">
                    <label htmlFor={`sectionImageUpload-${idx}`} className="cursor-pointer inline-flex items-center px-3 py-1 bg-[#0B7A48] text-white rounded-md hover:bg-[#0B7A48]/80 transition-colors text-xs">
                      Escolher imagem
                      <input
                        type="file"
                        id={`sectionImageUpload-${idx}`}
                        accept="image/*"
                        className="hidden"
                        onChange={e => handleSectionImage(idx, e.target.files?.[0] || null)}
                      />
                    </label>
                    {section.imageFile && (
                      <span className="text-xs text-muted-foreground block">{section.imageFile.name}</span>
                    )}
                  </div>
                  {section.imageFile && (
                    <img
                      src={URL.createObjectURL(section.imageFile)}
                      alt="Preview da imagem da seção"
                      className="mt-2 rounded shadow max-h-24"
                      style={{ maxWidth: 120, objectFit: 'contain' }}
                    />
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium mb-1">Descrição</label>
                  <textarea className="w-full border rounded px-2 py-1" rows={2} value={section.description} onChange={e => updateSection(idx, 'description', e.target.value)} />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">Itens</span>
                  <Button type="button" size="sm" onClick={() => addItem(idx)}>Adicionar Item</Button>
                </div>
                {section.items.length === 0 && (
                  <div className="text-muted-foreground text-xs">Nenhum item nesta seção.</div>
                )}
                {section.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="border rounded p-2 mb-2 bg-white">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-xs">Item {itemIdx + 1}</span>
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeItem(idx, itemIdx)}>Remover</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-medium mb-1">Nome</label>
                        <input type="text" className="w-full border rounded px-2 py-1" value={item.name} onChange={e => updateItem(idx, itemIdx, 'name', e.target.value)} required />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Preço</label>
                        <input type="number" min="0" step="0.01" className="w-full border rounded px-2 py-1" value={item.price} onChange={e => updateItem(idx, itemIdx, 'price', e.target.value)} required />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Disponível</label>
                        <select className="w-full border rounded px-2 py-1" value={item.available ? 'true' : 'false'} onChange={e => updateItem(idx, itemIdx, 'available', e.target.value === 'true')}>
                          <option value="true">Sim</option>
                          <option value="false">Não</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Imagem do Item</label>
                        <div className="flex items-center gap-4">
                          <label htmlFor={`itemImageUpload-${idx}-${itemIdx}`} className="cursor-pointer inline-flex items-center px-3 py-1 bg-[#0B7A48] text-white rounded-md hover:bg-[#0B7A48]/80 transition-colors text-xs">
                            Escolher imagem
                            <input
                              type="file"
                              id={`itemImageUpload-${idx}-${itemIdx}`}
                              accept="image/*"
                              className="hidden"
                              onChange={e => handleItemImage(idx, itemIdx, e.target.files?.[0] || null)}
                            />
                          </label>
                          {item.imageFile && (
                            <span className="text-xs text-muted-foreground block">{item.imageFile.name}</span>
                          )}
                        </div>
                        {item.imageFile && (
                          <img
                            src={URL.createObjectURL(item.imageFile)}
                            alt="Preview da imagem do item"
                            className="mt-2 rounded shadow max-h-16"
                            style={{ maxWidth: 80, objectFit: 'contain' }}
                          />
                        )}
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-xs font-medium mb-1">Descrição</label>
                        <textarea className="w-full border rounded px-2 py-1" rows={1} value={item.description} onChange={e => updateItem(idx, itemIdx, 'description', e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <Button type="submit" className="bg-[#0B7A48] text-white w-full" disabled={loading}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              Salvando...
            </span>
          ) : 'Salvar Menu'}
        </Button>
      </form>
    </div>
  )
} 