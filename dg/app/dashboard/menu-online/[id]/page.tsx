'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '../../../../components/ui/button'
import { toast } from 'react-hot-toast'
import { uploadFile } from '../../../../src/lib/firebase'
import DoceGestaoLoading from '../../../../components/ui/DoceGestaoLoading'

export default function MenuDetalhePage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const [menu, setMenu] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [edit, setEdit] = useState(false)
  const [form, setForm] = useState<any>(null)

  useEffect(() => {
    fetch(`/api/menus/${id}`)
      .then(res => res.json())
      .then(data => {
        setMenu(data.menu)
        setForm(data.menu)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const handleChange = (field: string, value: any) => {
    setForm({ ...form, [field]: value })
  }

  // Seções e itens
  const handleSectionChange = (idx: number, field: string, value: any) => {
    const updated = [...form.sections]
    updated[idx][field] = value
    setForm({ ...form, sections: updated })
  }
  const handleRemoveSection = (idx: number) => {
    const updated = [...form.sections]
    updated.splice(idx, 1)
    setForm({ ...form, sections: updated })
  }
  const handleItemChange = (sectionIdx: number, itemIdx: number, field: string, value: any) => {
    const updated = [...form.sections]
    updated[sectionIdx].items[itemIdx][field] = value
    setForm({ ...form, sections: updated })
  }
  const handleRemoveItem = (sectionIdx: number, itemIdx: number) => {
    const updated = [...form.sections]
    updated[sectionIdx].items.splice(itemIdx, 1)
    setForm({ ...form, sections: updated })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Upload da imagem do menu principal
      let menuImageUrl = form.imageUrl
      if (form.imageFile) {
        const path = `menus/${Date.now()}-${form.imageFile.name}`
        menuImageUrl = await uploadFile(form.imageFile, path)
      }
      // Upload da imagem de fundo
      let menuImageBackgroundUrl = form.imageUrlBackground
      if (form.imageBackgroundFile) {
        const path = `menus/backgrounds/${Date.now()}-${form.imageBackgroundFile.name}`
        menuImageBackgroundUrl = await uploadFile(form.imageBackgroundFile, path)
      }
      // Upload das imagens das seções
      const sectionUploads = await Promise.all(
        form.sections.map(async (section: any, idx: number) => {
          let sectionImageUrl = section.imageUrl
          if (section.imageFile) {
            const path = `menus/sections/${Date.now()}-${section.imageFile.name}`
            sectionImageUrl = await uploadFile(section.imageFile, path)
          }
          // Upload das imagens dos itens
          const itemUploads = await Promise.all(
            section.items.map(async (item: any) => {
              let itemImageUrl = item.imageUrl
              if (item.imageFile) {
                const path = `menus/items/${Date.now()}-${item.imageFile.name}`
                itemImageUrl = await uploadFile(item.imageFile, path)
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
        ...form,
        imageUrl: menuImageUrl,
        imageFile: undefined,
        imageUrlBackground: menuImageBackgroundUrl,
        imageBackgroundFile: undefined,
        sections: sectionUploads,
      }
      // Chama a API para salvar no banco
      const response = await fetch(`/api/menus/${id}`, {
        method: 'PUT',
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

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja remover este menu?')) return
    const res = await fetch(`/api/menus/${id}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/dashboard/menu-online')
    }
  }

  // Adicionar nova seção
  const handleAddSection = () => {
    const updated = [...(form.sections || [])]
    updated.push({
      title: '',
      description: '',
      imageUrl: '',
      position: updated.length + 1,
      items: [],
    })
    setForm({ ...form, sections: updated })
  }
  // Adicionar novo item
  const handleAddItem = (sectionIdx: number) => {
    const updated = [...form.sections]
    updated[sectionIdx].items.push({
      name: '',
      description: '',
      price: '',
      available: true,
      position: updated[sectionIdx].items.length + 1,
    })
    setForm({ ...form, sections: updated })
  }

  // Upload de imagem da seção
  const handleSectionImage = (idx: number, file: File | null) => {
    const updated = [...form.sections]
    updated[idx].imageFile = file
    setForm({ ...form, sections: updated })
  }

  // Função para upload de imagem do item
  const handleItemImage = (sectionIdx: number, itemIdx: number, file: File | null) => {
    const updated = [...form.sections]
    updated[sectionIdx].items[itemIdx].imageFile = file
    setForm({ ...form, sections: updated })
  }

  if (loading) return <DoceGestaoLoading />
  if (!menu) return <div>Menu não encontrado.</div>

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push('/dashboard/menu-online')}>Voltar</Button>
          <h2 className="text-xl font-bold">Detalhes do Menu</h2>
        </div>
        {!edit && <Button onClick={() => setEdit(true)}>Editar</Button>}
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium mb-1">Nome</label>
          <input type="text" className="w-full border rounded px-3 py-2" value={form?.name || ''} onChange={e => handleChange('name', e.target.value)} disabled={!edit} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Código</label>
          <input type="text" className="w-full border rounded px-3 py-2" value={form?.codigo || ''} onChange={e => handleChange('codigo', e.target.value)} disabled={!edit} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Telefone</label>
          <input type="text" className="w-full border rounded px-3 py-2" value={form?.telefone || ''} onChange={e => handleChange('telefone', e.target.value)} disabled={!edit} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">URL do Instagram</label>
          <input type="text" className="w-full border rounded px-3 py-2" value={form?.instagram || ''} onChange={e => handleChange('instagram', e.target.value)} disabled={!edit} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Deixe uma mensagem para seus clientes</label>
          <textarea className="w-full border rounded px-3 py-2" value={form?.description || ''} onChange={e => handleChange('description', e.target.value)} disabled={!edit} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Template</label>
          <input type="text" className="w-full border rounded px-3 py-2" value={form?.template || ''} onChange={e => handleChange('template', e.target.value)} disabled={!edit} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select className="w-full border rounded px-3 py-2" value={form?.status || ''} onChange={e => handleChange('status', e.target.value)} disabled={!edit}>
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Imagem</label>
          {edit ? (
            <>
              <div className="flex items-center gap-4">
                <label htmlFor="menuImageUpload" className="cursor-pointer inline-flex items-center px-4 py-2 bg-[#0B7A48] text-white rounded-md hover:bg-[#0B7A48]/80 transition-colors">
                  {form?.imageUrl ? 'Alterar imagem' : 'Adicionar imagem'}
                  <input
                    type="file"
                    id="menuImageUpload"
                    accept="image/*"
                    className="hidden"
                    onChange={e => handleChange('imageFile', e.target.files?.[0] || null)}
                  />
                </label>
                {form?.imageFile && (
                  <span className="text-xs text-muted-foreground block">{form.imageFile.name}</span>
                )}
              </div>
              {form?.imageFile ? (
                <img
                  src={URL.createObjectURL(form.imageFile)}
                  alt="Preview da nova imagem do menu"
                  className="mt-2 rounded shadow max-h-32"
                  style={{ maxWidth: 200, objectFit: 'contain' }}
                />
              ) : form?.imageUrl && (
                <img
                  src={form.imageUrl}
                  alt="Imagem atual do menu"
                  className="mt-2 rounded shadow max-h-32"
                  style={{ maxWidth: 200, objectFit: 'contain' }}
                />
              )}
            </>
          ) : (
            form?.imageUrl && (
              <img
                src={form.imageUrl}
                alt="Imagem do menu"
                className="max-h-32 mb-2"
              />
            )
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Imagem de Fundo</label>
          {edit ? (
            <>
              <div className="flex items-center gap-4">
                <label htmlFor="menuBackgroundImageUpload" className="cursor-pointer inline-flex items-center px-4 py-2 bg-[#0B7A48] text-white rounded-md hover:bg-[#0B7A48]/80 transition-colors">
                  {form?.imageUrlBackground ? 'Alterar imagem de fundo' : 'Adicionar imagem de fundo'}
                  <input
                    type="file"
                    id="menuBackgroundImageUpload"
                    accept="image/*"
                    className="hidden"
                    onChange={e => handleChange('imageBackgroundFile', e.target.files?.[0] || null)}
                  />
                </label>
                {form?.imageBackgroundFile && (
                  <span className="text-xs text-muted-foreground block">{form.imageBackgroundFile.name}</span>
                )}
              </div>
              {form?.imageBackgroundFile ? (
                <img
                  src={URL.createObjectURL(form.imageBackgroundFile)}
                  alt="Preview da nova imagem de fundo"
                  className="mt-2 rounded shadow max-h-32"
                  style={{ maxWidth: 200, objectFit: 'contain' }}
                />
              ) : form?.imageUrlBackground && (
                <img
                  src={form.imageUrlBackground}
                  alt="Imagem de fundo atual"
                  className="mt-2 rounded shadow max-h-32"
                  style={{ maxWidth: 200, objectFit: 'contain' }}
                />
              )}
            </>
          ) : (
            form?.imageUrlBackground && (
              <img
                src={form.imageUrlBackground}
                alt="Imagem de fundo do menu"
                className="mt-2 rounded shadow max-h-32"
                style={{ maxWidth: 200, objectFit: 'contain' }}
              />
            )
          )}
        </div>
        {/* Seções e Itens */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Seções do Menu</h3>
            {edit && <Button type="button" onClick={handleAddSection} className="bg-[#0B7A48] text-white">Adicionar Seção</Button>}
          </div>
          {form?.sections?.length === 0 && (
            <div className="text-muted-foreground text-sm">Nenhuma seção cadastrada.</div>
          )}
          {form?.sections?.map((section: any, idx: number) => (
            <div key={idx} className="border-2 border-gray-200 rounded-lg p-4 mb-6 bg-gray-50 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium text-lg text-gray-800">Seção {idx + 1}: {section.title}</span>
                {edit && <Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveSection(idx)}>Remover Seção</Button>}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Título</label>
                  <input type="text" className="w-full border rounded px-2 py-1" value={section.title} onChange={e => handleSectionChange(idx, 'title', e.target.value)} disabled={!edit ? true : false} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Imagem</label>
                  {edit ? (
                    <>
                      <div className="flex items-center gap-4">
                        <label htmlFor={`sectionImageUpload-${idx}`} className="cursor-pointer inline-flex items-center px-3 py-1 bg-[#0B7A48] text-white rounded-md hover:bg-[#0B7A48]/80 transition-colors text-xs">
                          {section.imageUrl ? 'Alterar imagem' : 'Adicionar imagem'}
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
                      {section.imageFile ? (
                        <img
                          src={URL.createObjectURL(section.imageFile)}
                          alt="Preview da nova imagem da seção"
                          className="mt-2 rounded shadow max-h-20"
                          style={{ maxWidth: 120, objectFit: 'contain' }}
                        />
                      ) : section.imageUrl && (
                        <img
                          src={section.imageUrl}
                          alt="Imagem atual da seção"
                          className="mt-2 rounded shadow max-h-20"
                          style={{ maxWidth: 120, objectFit: 'contain' }}
                        />
                      )}
                    </>
                  ) : (
                    section.imageUrl && (
                      <img
                        src={section.imageUrl}
                        alt="Imagem da seção"
                        className="mt-2 rounded shadow max-h-20"
                        style={{ maxWidth: 120, objectFit: 'contain' }}
                      />
                    )
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium mb-1">Descrição</label>
                  <textarea className="w-full border rounded px-2 py-1" rows={2} value={section.description} onChange={e => handleSectionChange(idx, 'description', e.target.value)} disabled={!edit ? true : false} />
                </div>
              </div>

              {/* Itens da Seção */}
              <div className="ml-4 pl-4 border-l-2 border-gray-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-sm text-gray-700">Itens desta seção</span>
                  {edit && <Button type="button" size="sm" onClick={() => handleAddItem(idx)}>Adicionar Item</Button>}
                </div>
                {section.items.length === 0 && (
                  <div className="text-muted-foreground text-xs italic">Nenhum item nesta seção.</div>
                )}
                {section.items.map((item: any, itemIdx: number) => (
                  <div key={itemIdx} className="border rounded p-3 mb-3 bg-white shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm text-gray-700">Item {itemIdx + 1}</span>
                      {edit && <Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveItem(idx, itemIdx)}>Remover</Button>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">Nome</label>
                        <input type="text" className="w-full border rounded px-2 py-1" value={item.name} onChange={e => handleItemChange(idx, itemIdx, 'name', e.target.value)} disabled={!edit ? true : false} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Preço</label>
                        <input type="number" min="0" step="0.01" className="w-full border rounded px-2 py-1" value={item.price} onChange={e => handleItemChange(idx, itemIdx, 'price', e.target.value)} disabled={!edit ? true : false} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Disponível</label>
                        <select className="w-full border rounded px-2 py-1" value={item.available ? 'true' : 'false'} onChange={e => handleItemChange(idx, itemIdx, 'available', e.target.value === 'true')} disabled={!edit ? true : false}>
                          <option value="true">Sim</option>
                          <option value="false">Não</option>
                        </select>
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-xs font-medium mb-1">Descrição</label>
                        <textarea className="w-full border rounded px-2 py-1" rows={1} value={item.description} onChange={e => handleItemChange(idx, itemIdx, 'description', e.target.value)} disabled={!edit ? true : false} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Imagem do Item</label>
                      {edit ? (
                        <>
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
                          {item.imageFile ? (
                            <img
                              src={URL.createObjectURL(item.imageFile)}
                              alt="Preview da imagem do item"
                              className="mt-2 rounded shadow max-h-16"
                              style={{ maxWidth: 80, objectFit: 'contain' }}
                            />
                          ) : item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt="Imagem atual do item"
                              className="mt-2 rounded shadow max-h-16"
                              style={{ maxWidth: 80, objectFit: 'contain' }}
                            />
                          )}
                        </>
                      ) : (
                        item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt="Imagem do item"
                            className="mt-2 rounded shadow max-h-16"
                            style={{ maxWidth: 80, objectFit: 'contain' }}
                          />
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {edit && (
          <Button type="submit" className="bg-[#0B7A48] text-white w-full" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                Salvando...
              </span>
            ) : 'Salvar Alterações'}
          </Button>
        )}
      </form>
      <Button variant="destructive" className="mt-6 w-full" onClick={handleDelete}>Remover Menu</Button>
    </div>
  )
} 