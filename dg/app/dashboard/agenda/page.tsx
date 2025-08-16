'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, PlusIcon, ArrowLeftIcon, CalendarDaysIcon, StickyNoteIcon, PackageIcon, FilterIcon, XIcon, Pencil, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from "@/components/ui/use-toast"
import DoceGestaoLoading from "@/components/ui/DoceGestaoLoading"

interface AgendaItem {
  id: number
  type: 'anotacao' | 'encomenda'
  title: string
  description?: string
  startDate: string
  endDate: string
  priority: 'baixa' | 'media' | 'alta'
  status: 'pendente' | 'em_andamento' | 'concluido'
  userId: number
  createdAt: string
  updatedAt: string
}

export default function AgendaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [items, setItems] = useState<AgendaItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<AgendaItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    type: 'anotacao' as 'anotacao' | 'encomenda',
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    priority: 'media' as 'baixa' | 'media' | 'alta',
    status: 'pendente' as 'pendente' | 'em_andamento' | 'concluido'
  })

  // Filtros
  const [filters, setFilters] = useState({
    searchTerm: '',
    type: 'todos' as 'todos' | 'anotacao' | 'encomenda',
    priority: 'todos' as 'todos' | 'baixa' | 'media' | 'alta',
    status: 'todos' as 'todos' | 'pendente' | 'em_andamento' | 'concluido',
    dateRange: 'todos' as 'todos' | 'hoje' | 'semana' | 'mes'
  })
  const [showFilters, setShowFilters] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())
  const formRef = useRef<HTMLDivElement>(null)

  const scrollToForm = () => {
    setTimeout(() => {
      formRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      })
    }, 100)
  }

  // Scroll automático para o formulário quando estiver editando
  useEffect(() => {
    if (showForm && editingItem && formRef.current) {
      scrollToForm()
    }
  }, [showForm, editingItem])

  const toggleExpanded = (itemId: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const TruncatedText = ({ text, itemId }: { text: string, itemId: number }) => {
    if (!text || text.trim().length === 0) {
      return null
    }

    const isExpanded = expandedItems.has(itemId)
    const shouldTruncate = text.length > 100
    
    if (!shouldTruncate) {
      return <p className="text-gray-600 mb-3">{text}</p>
    }

    return (
      <div className="mb-3">
        <p className="text-gray-600">
          {isExpanded ? text : `${text.substring(0, 100)}`}
        </p>
        <button
          onClick={() => toggleExpanded(itemId)}
          className="text-[#0B7A48] hover:text-[#0B7A48]/80 text-sm font-medium mt-1 transition-colors"
        >
          {isExpanded ? 'Ver menos' : 'Ver mais...'}
        </button>
      </div>
    )
  }

  // Carregar dados da agenda da API
  useEffect(() => {
    const loadAgendaItems = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/agenda')
        if (response.ok) {
          const data = await response.json()
          setItems(data.agendaItems || [])
        } else {
          console.error('Erro ao carregar agenda:', response.statusText)
        }
      } catch (error) {
        console.error('Erro ao carregar agenda:', error)
        toast({
          title: "Erro ao carregar agenda",
          description: "Não foi possível carregar os itens da agenda",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadAgendaItems()
  }, [toast])

  // Tela de loading
  if (loading) {
    return <DoceGestaoLoading />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.startDate || !formData.endDate) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título, data inicial e data final",
        variant: "destructive",
      })
      return
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast({
        title: "Data inválida",
        description: "A data final não pode ser anterior à data inicial",
        variant: "destructive",
      })
      return
    }

    try {
      if (editingItem) {
        // Editar item existente
        const response = await fetch(`/api/agenda/${editingItem.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        })

        if (response.ok) {
          const data = await response.json()
          setItems(prev => prev.map(item => 
            item.id === editingItem.id 
              ? data.agendaItem
              : item
          ))
          toast({
            title: "Item atualizado",
            description: "Anotação/encomenda atualizada com sucesso",
          })
        } else {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Erro ao atualizar item')
        }
      } else {
        // Criar novo item
        const response = await fetch('/api/agenda', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        })

        if (response.ok) {
          const data = await response.json()
          setItems(prev => [...prev, data.agendaItem])
          toast({
            title: "Item criado",
            description: "Anotação/encomenda criada com sucesso",
          })
        } else {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Erro ao criar item')
        }
      }

      setShowForm(false)
      setEditingItem(null)
      setFormData({
        type: 'anotacao',
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        priority: 'media',
        status: 'pendente'
      })
    } catch (error) {
      console.error('Erro ao salvar item:', error)
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Não foi possível salvar o item",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (item: AgendaItem) => {
    setEditingItem(item)
    setFormData({
      type: item.type,
      title: item.title,
      description: item.description || '',
      startDate: item.startDate,
      endDate: item.endDate,
      priority: item.priority,
      status: item.status
    })
    setShowForm(true)
    scrollToForm()
  }

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este item?')) {
      try {
        const response = await fetch(`/api/agenda/${id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          setItems(prev => prev.filter(item => item.id !== id))
          toast({
            title: "Item excluído",
            description: "Anotação/encomenda removida com sucesso",
          })
        } else {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Erro ao excluir item')
        }
      } catch (error) {
        console.error('Erro ao excluir item:', error)
        toast({
          title: "Erro ao excluir",
          description: error instanceof Error ? error.message : "Não foi possível excluir o item",
          variant: "destructive",
        })
      }
    }
  }

  const handleStatusChange = async (itemId: number, newStatus: 'pendente' | 'em_andamento' | 'concluido') => {
    try {
      const response = await fetch(`/api/agenda/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...items.find(item => item.id === itemId),
          status: newStatus
        })
      })

      if (response.ok) {
        const data = await response.json()
        setItems(prev => prev.map(item => 
          item.id === itemId 
            ? data.agendaItem
            : item
        ))
        toast({
          title: "Status atualizado",
          description: `Status alterado para ${newStatus}`,
        })
      } else {
        throw new Error('Erro ao atualizar status')
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível alterar o status do item",
        variant: "destructive",
      })
    }
  }

  const getStatusButton = (item: AgendaItem) => {
    const statusOptions = [
      { value: 'pendente', label: 'Pendente', color: 'bg-gray-100 text-gray-800 border-gray-200' },
      { value: 'em_andamento', label: 'Em Andamento', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      { value: 'concluido', label: 'Concluído', color: 'bg-green-100 text-green-800 border-green-200' }
    ]

    return (
      <div className="flex flex-wrap gap-1 sm:flex-nowrap">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleStatusChange(item.id, option.value as 'pendente' | 'em_andamento' | 'concluido')}
            className={`px-2 py-1 text-xs rounded-full border transition-all flex-shrink-0 ${
              item.status === option.value
                ? `${option.color} font-semibold`
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
            title={`Marcar como ${option.label}`}
          >
            {option.label}
          </button>
        ))}
      </div>
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'bg-red-100 text-red-800 border border-red-200'
      case 'media': return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
      case 'baixa': return 'bg-green-100 text-green-800 border border-green-200'
      default: return 'bg-gray-100 text-gray-800 border border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    return type === 'anotacao' ? <StickyNoteIcon className="h-4 w-4" /> : <PackageIcon className="h-4 w-4" />
  }

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('pt-BR')
  }

  // Função para calcular dias restantes (só mostra se for menos de 2 semanas)
  const getDaysRemaining = (dateString: string) => {
    const targetDate = new Date(dateString)
    const today = new Date()
    
    // Normalizar para comparar apenas dia/mês/ano
    const normalizedTarget = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
    const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    
    const diffTime = normalizedTarget.getTime() - normalizedToday.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    // Só retorna se for menos de 14 dias (2 semanas) e for no futuro
    if (diffDays > 0 && diffDays <= 14) {
      if (diffDays === 1) return '1 dia'
      return `${diffDays} dias`
    }
    
    return null
  }

  // Função para filtrar itens
  const filteredItems = items.filter(item => {
    // Filtro por termo de busca
    if (filters.searchTerm && !item.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) && 
        !(item.description || '').toLowerCase().includes(filters.searchTerm.toLowerCase())) {
      return false
    }

    // Filtro por tipo
    if (filters.type !== 'todos' && item.type !== filters.type) {
      return false
    }

    // Filtro por prioridade
    if (filters.priority !== 'todos' && item.priority !== filters.priority) {
      return false
    }

    // Filtro por status
    if (filters.status !== 'todos' && item.status !== filters.status) {
      return false
    }

    // Filtro por período
    if (filters.dateRange !== 'todos') {
      const today = new Date()
      const itemEndDate = new Date(item.endDate)
      
      switch (filters.dateRange) {
        case 'hoje':
          if (itemEndDate.toDateString() !== today.toDateString()) return false
          break
        case 'semana':
          const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
          if (itemEndDate > weekFromNow) return false
          break
        case 'mes':
          const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
          if (itemEndDate > monthFromNow) return false
          break
      }
    }

    return true
  })

  // Função para limpar filtros
  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      type: 'todos',
      priority: 'todos',
      status: 'todos',
      dateRange: 'todos'
    })
  }

  // Verificar se há filtros ativos
  const hasActiveFilters = filters.searchTerm || 
    filters.type !== 'todos' || 
    filters.priority !== 'todos' || 
    filters.status !== 'todos' || 
    filters.dateRange !== 'todos'

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="max-w-7xl mx-auto p-4">
                 {/* Header */}
         <div className="mb-6">
           {/* Botão Voltar separado */}
           <div className="mb-4">
             <Button
               variant="ghost"
               size="sm"
               onClick={() => router.back()}
               className="text-gray-600 hover:text-gray-800"
             >
               <ArrowLeftIcon className="h-4 w-4 mr-2" />
               Voltar
             </Button>
           </div>
           
           {/* Título e Botão Novo Item */}
           <div className="flex items-center justify-between">
             <div>
               <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
               <p className="text-gray-600 text-sm">Gerencie suas anotações e encomendas</p>
             </div>
             
             <Button
               onClick={() => {
                 setShowForm(true)
                 scrollToForm()
               }}
               className="bg-[#0B7A48] hover:bg-[#0B7A48]/90 text-white"
             >
               <PlusIcon className="h-4 w-4 mr-2" />
               Novo Item
             </Button>
           </div>
         </div>

        {/* Formulário */}
        {showForm && (
          <Card className="mb-6" ref={formRef}>
            <CardHeader>
              <CardTitle>
                {editingItem ? 'Editar Item' : 'Novo Item'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Tipo</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: 'anotacao' | 'encomenda') => 
                        setFormData(prev => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="anotacao">Anotação</SelectItem>
                        <SelectItem value="encomenda">Encomenda</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="title" className="text-sm font-medium text-gray-900">Título *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Digite o título do item"
                      className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="description" className="text-sm font-medium text-gray-900">Descrição</Label>
                    <div className="relative">
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Digite a descrição (opcional)"
                        className="mt-1 border-gray-300 focus:border-blue-500 focus:border-blue-500 focus:ring-blue-500 resize-none"
                        rows={4}
                        maxLength={1000}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-2">
                        {formData.description && formData.description.length > 800 && (
                          <span className={`text-xs font-medium ${
                            formData.description.length > 950 ? 'text-red-500' : 'text-yellow-500'
                          }`}>
                            {formData.description.length > 950 ? '⚠️' : '⚠️'}
                          </span>
                        )}
                        {formData.description && formData.description.length > 800 && (
                          <span className={`text-xs ${
                            formData.description.length > 950 ? 'text-red-500' : 'text-yellow-500'
                          }`}>
                            {formData.description.length > 950 
                              ? `Atenção! Restam apenas ${1000 - formData.description.length} caracteres.`
                              : `Restam ${1000 - formData.description.length} caracteres.`
                            }
                          </span>
                        )}
                      </div>
                      <span className={`text-xs font-medium ${
                        formData.description.length > 950 ? 'text-red-500' : 
                        formData.description.length > 800 ? 'text-yellow-500' : 'text-gray-400'
                      }`}>
                        {formData.description.length}/1000
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate" className="text-sm font-medium text-gray-900">Quando devo me preocupar *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="endDate" className="text-sm font-medium text-gray-900">Data limite *</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                        className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="priority" className="text-sm font-medium text-gray-900">Prioridade</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value: 'baixa' | 'media' | 'alta') => 
                          setFormData(prev => ({ ...prev, priority: value }))
                        }
                      >
                        <SelectTrigger className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baixa">Baixa</SelectItem>
                          <SelectItem value="media">Média</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="status" className="text-sm font-medium text-gray-900">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: 'pendente' | 'em_andamento' | 'concluido') => 
                          setFormData(prev => ({ ...prev, status: value }))
                        }
                      >
                        <SelectTrigger className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendente">Pendente</SelectItem>
                          <SelectItem value="em_andamento">Em Andamento</SelectItem>
                          <SelectItem value="concluido">Concluído</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="bg-[#0B7A48] hover:bg-[#0B7A48]/90">
                    {editingItem ? 'Atualizar' : 'Criar'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setEditingItem(null)
                      setFormData({
                        type: 'anotacao',
                        title: '',
                        description: '',
                        startDate: '',
                        endDate: '',
                        priority: 'media',
                        status: 'pendente'
                      })
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Botão de Filtros */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 ${hasActiveFilters ? 'border-blue-500 text-blue-600 bg-blue-50' : ''}`}
            >
              <FilterIcon className="h-4 w-4" />
              Filtros
              {hasActiveFilters && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-blue-500 text-white rounded-full">
                  {Object.values(filters).filter(v => v !== 'todos' && v !== '').length}
                </span>
              )}
            </Button>
            
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                <XIcon className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            )}
          </div>
          
          <div className="text-sm text-gray-600">
            {filteredItems.length} de {items.length} itens encontrados
          </div>
        </div>

        {/* Painel de Filtros (Expandível) */}
        {showFilters && (
          <Card className="mb-6 border-blue-200 bg-blue-50/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-blue-900">Filtros Ativos</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                >
                  <XIcon className="h-4 w-4 mr-1" />
                  Fechar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Busca por texto */}
                <div>
                  <Label htmlFor="search" className="text-sm font-medium text-blue-900">Buscar</Label>
                  <Input
                    id="search"
                    placeholder="Título ou descrição..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                    className="mt-1 border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* Filtro por tipo */}
                <div>
                  <Label htmlFor="typeFilter" className="text-sm font-medium text-blue-900">Tipo</Label>
                  <Select
                    value={filters.type}
                    onValueChange={(value: 'todos' | 'anotacao' | 'encomenda') => 
                      setFilters(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger className="mt-1 border-blue-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="anotacao">Anotações</SelectItem>
                      <SelectItem value="encomenda">Encomendas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro por prioridade */}
                <div>
                  <Label htmlFor="priorityFilter" className="text-sm font-medium text-blue-900">Prioridade</Label>
                  <Select
                    value={filters.priority}
                    onValueChange={(value: 'todos' | 'baixa' | 'media' | 'alta') => 
                      setFilters(prev => ({ ...prev, priority: value }))
                    }
                  >
                    <SelectTrigger className="mt-1 border-blue-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas</SelectItem>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro por status */}
                <div>
                  <Label htmlFor="statusFilter" className="text-sm font-medium text-blue-900">Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value: 'todos' | 'pendente' | 'em_andamento' | 'concluido') => 
                      setFilters(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger className="mt-1 border-blue-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="em_andamento">Em Andamento</SelectItem>
                      <SelectItem value="concluido">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro por período */}
                <div>
                  <Label htmlFor="dateFilter" className="text-sm font-medium text-blue-900">Período</Label>
                  <Select
                    value={filters.dateRange}
                    onValueChange={(value: 'todos' | 'hoje' | 'semana' | 'mes') => 
                      setFilters(prev => ({ ...prev, dateRange: value }))
                    }
                  >
                    <SelectTrigger className="mt-1 border-blue-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="hoje">Hoje</SelectItem>
                      <SelectItem value="semana">Esta Semana</SelectItem>
                      <SelectItem value="mes">Este Mês</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Itens */}
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <Card className="p-8 text-center">
              <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum item na agenda</h3>
                             <p className="text-gray-500 mb-4">
                 {items.length === 0 
                   ? "Comece criando suas primeiras anotações e encomendas"
                   : "Nenhum item encontrado com os filtros aplicados"
                 }
               </p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-[#0B7A48] hover:bg-[#0B7A48]/90 text-white"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Criar Primeiro Item
              </Button>
            </Card>
                     ) : (
             filteredItems.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-all">
                <CardContent className="p-6">
                                     <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                     <div className="flex-1">
                       <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                         <div className="flex items-center gap-2">
                           {getTypeIcon(item.type)}
                           <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                         </div>
                         <div className="flex flex-wrap items-center gap-2">
                           <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                             {item.priority}
                           </span>
                           {/* Status com mudança rápida */}
                           {getStatusButton(item)}
                         </div>
                       </div>
                       
                       {item.description && (
                         <TruncatedText text={item.description} itemId={item.id} />
                       )}
                       
                       <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                         <div className="flex items-center gap-2">
                           <CalendarIcon className="h-4 w-4 text-blue-500" />
                           <span className="text-gray-500">Começar:</span>
                           <span className="font-medium text-gray-900">{formatDate(item.startDate)}</span>
                           {getDaysRemaining(item.startDate) && (
                             <span className="text-blue-600 text-xs font-medium">
                               ({getDaysRemaining(item.startDate)})
                             </span>
                           )}
                         </div>
                         
                         <div className="flex items-center gap-2">
                           <CalendarIcon className="h-4 w-4 text-red-500" />
                           <span className="text-gray-500">Limite:</span>
                           <span className="font-medium text-gray-900">{formatDate(item.endDate)}</span>
                           {getDaysRemaining(item.endDate) && (
                             <span className="text-red-600 text-xs font-medium">
                               ({getDaysRemaining(item.endDate)})
                             </span>
                           )}
                         </div>
                         
                         <div className="flex items-center gap-1 text-xs text-gray-400">
                           <CalendarDaysIcon className="h-3 w-3" />
                           <span>Criado {formatDate(item.createdAt)}</span>
                         </div>
                       </div>
                     </div>
                     
                     <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            title="Editar item"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            title="Excluir item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                   </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 