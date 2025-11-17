'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '../../../../../components/ui/button'
import { toast } from 'react-hot-toast'
import { uploadFileViaAPI } from '../../../../../src/lib/s3'
import { validateImage } from '../../../../../src/lib/imageValidation'
import ErrorModal from '../../../../../components/ui/ErrorModal'
import { useErrorModal } from '../../../../../src/hooks/useErrorModal'
import DoceGestaoLoading from '../../../../../components/ui/DoceGestaoLoading'

export default function EditarMenuPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const [menu, setMenu] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<any>(null)
  const { modalState, showError, hideError } = useErrorModal()

  useEffect(() => {
    if (!id) return
    
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
      let menuImageUrl = form.imageUrl
      if (form.imageFile) {
        try {
          const path = `menus/${Date.now()}-${form.imageFile.name}`
          menuImageUrl = await uploadFileViaAPI(form.imageFile, path)
        } catch (uploadError: any) {
          throw new Error(`Erro ao fazer upload da imagem principal: ${uploadError.message || 'Erro desconhecido'}`)
        }
      }

      let menuImageBackgroundUrl = form.imageUrlBackground
      if (form.imageBackgroundFile) {
        try {
          const path = `menus/backgrounds/${Date.now()}-${form.imageBackgroundFile.name}`
          menuImageBackgroundUrl = await uploadFileViaAPI(form.imageBackgroundFile, path)
        } catch (uploadError: any) {
          throw new Error(`Erro ao fazer upload da imagem de fundo: ${uploadError.message || 'Erro desconhecido'}`)
        }
      }

      const sectionUploads = await Promise.all(
        form.sections.map(async (section: any, idx: number) => {
          let sectionImageUrl = section.imageUrl
          if (section.imageFile) {
            try {
              const path = `menus/sections/${Date.now()}-${section.imageFile.name}`
              sectionImageUrl = await uploadFileViaAPI(section.imageFile, path)
            } catch (uploadError: any) {
              throw new Error(`Erro ao fazer upload da imagem da seção "${section.name || section.title || `Seção ${idx + 1}`}": ${uploadError.message || 'Erro desconhecido'}`)
            }
          }

          const itemUploads = await Promise.all(
            section.items.map(async (item: any, itemIdx: number) => {
              let itemImageUrl = item.imageUrl
              if (item.imageFile) {
                try {
                  const path = `menus/items/${Date.now()}-${item.imageFile.name}`
                  itemImageUrl = await uploadFileViaAPI(item.imageFile, path)
                } catch (uploadError: any) {
                  throw new Error(`Erro ao fazer upload da imagem do item "${item.name || `Item ${itemIdx + 1}`}" da seção "${section.name || section.title || `Seção ${idx + 1}`}": ${uploadError.message || 'Erro desconhecido'}`)
                }
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
        imageUrlBackground: menuImageBackgroundUrl,
        imageFile: undefined,
        imageBackgroundFile: undefined,
        sections: sectionUploads,
      }

      const response = await fetch(`/api/menus/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar menu')
      }

      toast.success('Menu atualizado com sucesso!')
      router.push('/dashboard/menu-online')
    } catch (error: any) {
      console.error('Erro ao atualizar menu:', error)
      
      // Mensagem de erro mais clara e específica
      let errorTitle = 'Erro ao Atualizar Menu'
      let errorMessage = error.message || 'Erro ao atualizar menu'
      
      // Identificar o tipo de erro e ajustar a mensagem
      if (errorMessage.includes('upload')) {
        errorTitle = 'Erro no Upload de Imagem'
        // A mensagem já vem específica do upload
      } else if (errorMessage.includes('conexão') || errorMessage.includes('internet') || errorMessage.includes('Network')) {
        errorTitle = 'Erro de Conexão'
        errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.'
      } else if (errorMessage.includes('tamanho') || errorMessage.includes('grande') || errorMessage.includes('5MB')) {
        errorTitle = 'Imagem Muito Grande'
        errorMessage = 'Uma ou mais imagens são muito grandes. Por favor, use imagens com no máximo 5MB cada.'
      } else if (errorMessage.includes('formato') || errorMessage.includes('tipo') || errorMessage.includes('imagem válida')) {
        errorTitle = 'Formato de Imagem Inválido'
        errorMessage = 'Uma ou mais imagens estão em formato inválido. Use apenas arquivos de imagem (JPG, PNG, etc.).'
      } else if (errorMessage.includes('permissão') || errorMessage.includes('autorizado')) {
        errorTitle = 'Erro de Permissão'
        errorMessage = 'Você não tem permissão para realizar esta ação. Entre em contato com o suporte.'
      }
      
      toast.error(errorMessage)
      showError(errorMessage, errorTitle)
    } finally {
      setLoading(false)
    }
  }

  const handleMenuImage = (file: File | null) => {
    if (!file) {
      setForm({ ...form, imageFile: null })
      return
    }

    const validation = validateImage(file)
    if (!validation.isValid) {
      toast.error(validation.error || 'Erro na validação da imagem')
      showError(validation.error || 'Erro na validação da imagem')
      return
    }

    setForm({ ...form, imageFile: file })
  }

  const handleMenuBackgroundImage = (file: File | null) => {
    if (!file) {
      setForm({ ...form, imageBackgroundFile: null })
      return
    }

    const validation = validateImage(file)
    if (!validation.isValid) {
      toast.error(validation.error || 'Erro na validação da imagem')
      showError(validation.error || 'Erro na validação da imagem')
      return
    }

    setForm({ ...form, imageBackgroundFile: file })
  }

  const handleSectionImage = (idx: number, file: File | null) => {
    if (!file) {
      const updated = [...form.sections]
      updated[idx].imageFile = null
      setForm({ ...form, sections: updated })
      return
    }

    const validation = validateImage(file)
    if (!validation.isValid) {
      toast.error(validation.error || 'Erro na validação da imagem')
      showError(validation.error || 'Erro na validação da imagem')
      return
    }

    const updated = [...form.sections]
    updated[idx].imageFile = file
    setForm({ ...form, sections: updated })
  }

  const handleItemImage = (sectionIdx: number, itemIdx: number, file: File | null) => {
    if (!file) {
      const updated = [...form.sections]
      updated[sectionIdx].items[itemIdx].imageFile = null
      setForm({ ...form, sections: updated })
      return
    }

    const validation = validateImage(file)
    if (!validation.isValid) {
      toast.error(validation.error || 'Erro na validação da imagem')
      showError(validation.error || 'Erro na validação da imagem')
      return
    }

    const updated = [...form.sections]
    updated[sectionIdx].items[itemIdx].imageFile = file
    setForm({ ...form, sections: updated })
  }

  const handleAddSection = () => {
    const newSection = {
      id: Date.now(),
      name: '',
      description: '',
      imageUrl: '',
      position: form.sections.length + 1,
      items: [],
    }
    setForm({ ...form, sections: [...form.sections, newSection] })
  }

  const handleAddItem = (sectionIdx: number) => {
    const newItem = {
      id: Date.now(),
      name: '',
      description: '',
      price: 0,
      available: true,
      position: form.sections[sectionIdx].items.length + 1,
      imageUrl: '',
    }
    const updated = [...form.sections]
    updated[sectionIdx].items.push(newItem)
    setForm({ ...form, sections: updated })
  }

  if (loading) {
    return <DoceGestaoLoading />
  }

  if (!menu) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Menu não encontrado</h1>
        <p className="text-gray-600 mb-4">O menu que você está procurando não existe.</p>
        <Button onClick={() => router.push('/dashboard/menu-online')}>
          Voltar para Menus
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Editar Menu</h1>
        <Button 
          variant="outline"
          onClick={() => router.push('/dashboard/menu-online')}
        >
          Voltar
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações básicas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Informações Básicas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome do Menu</label>
              <input
                type="text"
                value={form?.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={form?.status || 'Ativo'}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Valor do Frete (R$)</label>
              <input
                type="text"
                value={form?.valorFrete !== undefined && form.valorFrete !== null ? `R$ ${Number(form.valorFrete).toFixed(2).replace('.', ',')}` : ''}
                onChange={(e) => {
                  // Remove tudo exceto números
                  const numbers = e.target.value.replace(/\D/g, '')
                  // Converte para centavos e depois para reais
                  const value = numbers ? parseFloat(numbers) / 100 : 0
                  handleChange('valorFrete', value)
                }}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="R$ 0,00"
              />
              <p className="text-xs text-gray-500 mt-1">
                Digite apenas números (ex: 1500 = R$ 15,00)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Faz Entregas</label>
              <select
                value={form?.fazEntregas ? 'true' : 'false'}
                onChange={(e) => handleChange('fazEntregas', e.target.value === 'true')}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Define se o menu oferece opção de entrega
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Código</label>
              <input
                type="text"
                value={form?.codigo || ''}
                onChange={(e) => handleChange('codigo', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Descrição</label>
              <textarea
                value={form?.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Imagens */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Imagens</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Logo do Menu</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleMenuImage(e.target.files?.[0] || null)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              {form?.imageUrl && (
                <div className="mt-2">
                  <img src={form.imageUrl} alt="Logo atual" className="w-20 h-20 object-cover rounded" />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Imagem de Fundo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleMenuBackgroundImage(e.target.files?.[0] || null)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              {form?.imageUrlBackground && (
                <div className="mt-2">
                  <img src={form.imageUrlBackground} alt="Fundo atual" className="w-20 h-20 object-cover rounded" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Seções */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Seções do Menu</h2>
            <Button type="button" onClick={handleAddSection}>
              Adicionar Seção
            </Button>
          </div>
          
          {form?.sections?.map((section: any, sectionIdx: number) => (
            <div key={section.id} className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Seção {sectionIdx + 1}</h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleRemoveSection(sectionIdx)}
                >
                  Remover
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome da Seção</label>
                  <input
                    type="text"
                    value={section.name || ''}
                    onChange={(e) => handleSectionChange(sectionIdx, 'name', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Imagem da Seção</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleSectionImage(sectionIdx, e.target.files?.[0] || null)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  {section.imageUrl && (
                    <div className="mt-2">
                      <img src={section.imageUrl} alt="Imagem da seção" className="w-16 h-16 object-cover rounded" />
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Descrição da Seção</label>
                  <textarea
                    value={section.description || ''}
                    onChange={(e) => handleSectionChange(sectionIdx, 'description', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={2}
                  />
                </div>
              </div>

              {/* Itens da seção */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Itens da Seção</h4>
                  <Button 
                    type="button" 
                    size="sm"
                    onClick={() => handleAddItem(sectionIdx)}
                  >
                    Adicionar Item
                  </Button>
                </div>
                
                {section.items?.map((item: any, itemIdx: number) => (
                  <div key={item.id} className="border border-gray-100 rounded p-3">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium">Item {itemIdx + 1}</h5>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRemoveItem(sectionIdx, itemIdx)}
                      >
                        Remover
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Nome</label>
                        <input
                          type="text"
                          value={item.name || ''}
                          onChange={(e) => handleItemChange(sectionIdx, itemIdx, 'name', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Preço</label>
                        <input
                          type="text"
                          value={item.price ? `R$ ${Number(item.price).toFixed(2).replace('.', ',')}` : ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '')
                            const priceInCents = parseInt(value) || 0
                            const priceInReais = priceInCents / 100
                            handleItemChange(sectionIdx, itemIdx, 'price', priceInReais)
                          }}
                          placeholder="R$ 0,00"
                          className="w-full p-2 border border-gray-300 rounded-md text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Disponível</label>
                        <select
                          value={item.available ? 'true' : 'false'}
                          onChange={(e) => handleItemChange(sectionIdx, itemIdx, 'available', e.target.value === 'true')}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="true">Sim</option>
                          <option value="false">Não</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Descrição</label>
                        <textarea
                          value={item.description || ''}
                          onChange={(e) => handleItemChange(sectionIdx, itemIdx, 'description', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Imagem</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleItemImage(sectionIdx, itemIdx, e.target.files?.[0] || null)}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        />
                        {item.imageUrl && (
                          <div className="mt-2">
                            <img src={item.imageUrl} alt="Imagem do item" className="w-12 h-12 object-cover rounded" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Botões de ação */}
        <div className="flex items-center justify-between">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => router.push('/dashboard/menu-online')}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            className="bg-[#0B7A48] text-white"
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>

      <ErrorModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onClose={hideError}
      />
    </div>
  )
} 