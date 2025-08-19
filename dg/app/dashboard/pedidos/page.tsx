'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import DoceGestaoLoading from '@/components/ui/DoceGestaoLoading'
import { useSocketIO } from '@/hooks/useSocketIO'
import { Package } from 'lucide-react'

interface Pedido {
  id: number
  codigo: string
  valorTotal: number
  status: string
  formaEntrega: string
  formaPagamento: string
  observacoes: string
  createdAt: string
  cliente: {
    id: number
    nome: string
    telefone: string
  }
  itens?: Array<{
    id: number
    nomeProduto: string
    quantidade: number
    precoUnitario: number
    precoTotal: number
    observacao: string
  }>
}

interface Menu {
  id: number
  name: string
  codigo: string
}

export default function PedidosPage() {
  const router = useRouter()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [menus, setMenus] = useState<Menu[]>([])
  const [selectedMenu, setSelectedMenu] = useState<string>('')
  const [loading, setLoading] = useState(false)
  
  // Hook de Socket.IO para atualização automática
  const { notifications } = useSocketIO()
  
  // Filtros
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [entregaFilter, setEntregaFilter] = useState<string>('todos')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [dataInicio, setDataInicio] = useState<string>('')
  const [dataFim, setDataFim] = useState<string>('')

  // Buscar menus disponíveis
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        console.log('🔍 Buscando todos os menus...')
        
        const response = await fetch('/api/menus')
        const data = await response.json()
        
        console.log('📡 Resposta da API de menus:', data)
        
        if (response.ok && data.success) {
          setMenus(data.menus || [])
          console.log('✅ Menus carregados:', data.menus?.length || 0)
          
          if (data.menus && data.menus.length > 0) {
            setSelectedMenu(data.menus[0].id.toString())
            console.log('🎯 Menu selecionado:', data.menus[0].id)
          } else {
            console.log('⚠️ Nenhum menu encontrado')
          }
        } else {
          console.error('❌ Erro na API de menus:', data)
          alert(`Erro ao buscar menus: ${data.error || 'Erro desconhecido'}`)
        }
      } catch (error) {
        console.error('💥 Erro ao buscar menus:', error)
        alert('Erro ao conectar com o servidor')
      }
    }

    fetchMenus()
  }, [])

  // Buscar pedidos quando menu for selecionado
  useEffect(() => {
    if (selectedMenu) {
      fetchPedidos()
    }
  }, [selectedMenu])

  // Atualizar pedidos automaticamente quando receber notificação de novo pedido
  useEffect(() => {
    if (notifications.length > 0 && selectedMenu) {
      // Verificar se a notificação é para o menu atual
      const latestNotification = notifications[0]
      if (latestNotification.type === 'novo_pedido' && 
          latestNotification.data.menuId?.toString() === selectedMenu) {
        console.log('🔄 Atualizando pedidos automaticamente...')
        fetchPedidos()
      }
    }
  }, [notifications, selectedMenu])

  const fetchPedidos = async () => {
    if (!selectedMenu) return
    
    setLoading(true)
    try {
      console.log('🔍 Buscando pedidos para menuId:', selectedMenu)
      
      const response = await fetch(`/api/pedidos-dg?menuId=${selectedMenu}`)
      const data = await response.json()
      
      console.log('📡 Resposta da API de pedidos:', data)
      
      if (response.ok) {
        setPedidos(data.pedidos || [])
        console.log('✅ Pedidos carregados:', data.pedidos?.length || 0)
        
        // Mostrar informações de debug se disponível
        if (data.debug) {
          console.log('🐛 Debug info:', data.debug)
        }
      } else {
        console.error('❌ Erro na API de pedidos:', data)
        alert(`Erro ao buscar pedidos: ${data.error}`)
      }
    } catch (error) {
      console.error('💥 Erro ao buscar pedidos:', error)
      alert('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-50 text-yellow-700 border border-yellow-200'
      case 'em_andamento': return 'bg-blue-50 text-blue-700 border border-blue-200'
      case 'em_entrega': return 'bg-orange-50 text-orange-700 border border-orange-200'
      case 'finalizado': return 'bg-green-50 text-green-700 border border-green-200'
      default: return 'bg-gray-50 text-gray-700 border border-gray-200'
    }
  }

  const getCardBackgroundColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-50/40'
      case 'em_andamento': return 'bg-blue-50/40'
      case 'em_entrega': return 'bg-orange-50/40'
      case 'finalizado': return 'bg-green-50/40'
      default: return 'bg-gray-50/40'
    }
  }

  const getStatusBannerColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'border-t-yellow-400'
      case 'em_andamento': return 'border-t-blue-400'
      case 'em_entrega': return 'border-t-orange-400'
      case 'finalizado': return 'border-t-green-400'
      default: return 'border-t-gray-400'
    }
  }

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-500'
      case 'em_andamento': return 'bg-blue-500'
      case 'em_entrega': return 'bg-orange-500'
      case 'finalizado': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusButtonStyle = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100 hover:border-yellow-300 focus:ring-yellow-500'
      case 'em_andamento': return 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 focus:ring-blue-500'
      case 'em_entrega': return 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100 hover:border-orange-300 focus:ring-orange-500'
      case 'finalizado': return 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300 focus:ring-green-500'
      default: return 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300 focus:ring-gray-500'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pendente': return 'PENDENTE'
      case 'em_andamento': return 'EM ANDAMENTO'
      case 'em_entrega': return 'EM ENTREGA'
      case 'finalizado': return 'FINALIZADO'
      default: return status.toUpperCase()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (price: number | string | null | undefined) => {
    if (price === null || price === undefined) return 'R$ 0,00'
    const numPrice = Number(price)
    if (isNaN(numPrice)) return 'R$ 0,00'
    return `R$ ${numPrice.toFixed(2).replace('.', ',')}`
  }

  const updatePedidoStatus = async (pedidoId: number, novoStatus: string) => {
    try {
      const response = await fetch(`/api/pedidos-dg/${pedidoId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: novoStatus }),
      })

      if (response.ok) {
        // Atualizar o estado local
        setPedidos(pedidos.map(pedido => 
          pedido.id === pedidoId 
            ? { ...pedido, status: novoStatus }
            : pedido
        ))
      } else {
        alert('Erro ao atualizar status do pedido')
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      alert('Erro ao conectar com o servidor')
    }
  }

  // Função para filtrar pedidos
  const getFilteredPedidos = () => {
    return pedidos.filter(pedido => {
      // Filtro por status
      if (statusFilter !== 'todos' && pedido.status !== statusFilter) {
        return false
      }
      
      // Filtro por entrega
      if (entregaFilter !== 'todos' && pedido.formaEntrega !== entregaFilter) {
        return false
      }
      
      // Filtro por data
      if (dataInicio || dataFim) {
        const dataPedido = new Date(pedido.createdAt)
        
        if (dataInicio) {
          const inicio = new Date(dataInicio)
          if (dataPedido < inicio) return false
        }
        
        if (dataFim) {
          const fim = new Date(dataFim)
          fim.setHours(23, 59, 59, 999) // Incluir todo o dia
          if (dataPedido > fim) return false
        }
      }
      
      // Filtro por busca (código, cliente, telefone)
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        return (
          pedido.codigo.toLowerCase().includes(searchLower) ||
          pedido.cliente.nome.toLowerCase().includes(searchLower) ||
          pedido.cliente.telefone.includes(searchTerm)
        )
      }
      
      return true
    })
  }

  const filteredPedidos = getFilteredPedidos()

  // Verificar se não há menus cadastrados
  if (!menus || menus.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-gray-500 mt-2">Gerencie todos os pedidos dos seus menus</p>
        </div>
        
        <div className="text-center max-w-md mx-auto py-16">
          <div className="mb-6">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum Menu Cadastrado
            </h2>
            <p className="text-gray-600">
              Você precisa primeiro cadastrar um Menu Online para ter pedidos
            </p>
          </div>
          
          <Button 
            onClick={() => router.push('/dashboard/menu-online/novo')}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Criar Menu Online
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pedidos</h1>
        <p className="text-gray-500 mt-2">Gerencie todos os pedidos dos seus menus</p>
      </div>

             {/* Filtros Minimalistas */}
       <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50/50 rounded-lg border border-gray-100">
         {/* Menu */}
         <div className="flex items-center gap-2">
           <span className="text-sm text-gray-600">Menu:</span>
           <Select value={selectedMenu} onValueChange={setSelectedMenu}>
             <SelectTrigger className="w-48 h-9">
               <SelectValue placeholder="Selecionar menu" />
             </SelectTrigger>
             <SelectContent>
               {menus.map((menu) => (
                 <SelectItem key={menu.id} value={menu.id.toString()}>
                   {menu.name} ({menu.codigo})
                 </SelectItem>
               ))}
             </SelectContent>
           </Select>
         </div>

         {/* Status */}
         <div className="flex items-center gap-2">
           <span className="text-sm text-gray-600">Status:</span>
           <Select value={statusFilter} onValueChange={setStatusFilter}>
             <SelectTrigger className="w-36 h-9">
               <SelectValue placeholder="Status" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="todos">Todos</SelectItem>
               <SelectItem value="pendente">Pendente</SelectItem>
               <SelectItem value="em_andamento">Em Andamento</SelectItem>
               <SelectItem value="em_entrega">Em Entrega</SelectItem>
               <SelectItem value="finalizado">Finalizado</SelectItem>
             </SelectContent>
           </Select>
         </div>

         {/* Entrega */}
         <div className="flex items-center gap-2">
           <span className="text-sm text-gray-600">Entrega:</span>
           <Select value={entregaFilter} onValueChange={setEntregaFilter}>
             <SelectTrigger className="w-28 h-9">
               <SelectValue placeholder="Tipo" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="todos">Todos</SelectItem>
               <SelectItem value="entrega">Entrega</SelectItem>
               <SelectItem value="retirada">Retirada</SelectItem>
             </SelectContent>
           </Select>
         </div>

                   {/* Busca */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Buscar:</span>
            <input
              type="text"
              placeholder="Código, cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-40 h-9 px-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Data Início */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">De:</span>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-36 h-9 px-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Data Fim */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Até:</span>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-36 h-9 px-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

                   {/* Botão Limpar */}
          {(statusFilter !== 'todos' || entregaFilter !== 'todos' || searchTerm || dataInicio || dataFim) && (
            <button
              onClick={() => {
                setStatusFilter('todos')
                setEntregaFilter('todos')
                setSearchTerm('')
                setDataInicio('')
                setDataFim('')
              }}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Limpar filtros
            </button>
          )}
       </div>

                       {/* Estatísticas Minimalistas */}
        <div className="flex items-center gap-6 mb-6 text-sm text-gray-600">
          <span>Total: <span className="font-semibold text-gray-900">{pedidos.length}</span></span>
          <span>Pendentes: <span className="font-semibold text-yellow-600">{pedidos.filter(p => p.status === 'pendente').length}</span></span>
          <span>Em Processo: <span className="font-semibold text-blue-600">{pedidos.filter(p => p.status === 'em_andamento' || p.status === 'em_entrega').length}</span></span>
          <span>Finalizados: <span className="font-semibold text-green-600">{pedidos.filter(p => p.status === 'finalizado').length}</span></span>
        </div>

                   {/* Contador Minimalista */}
          <div className="text-sm text-gray-500 mb-4">
            Mostrando {filteredPedidos.length} de {pedidos.length} pedidos
            {(statusFilter !== 'todos' || entregaFilter !== 'todos' || searchTerm || dataInicio || dataFim) && (
              <span className="text-blue-600"> • Filtros ativos</span>
            )}
          </div>

             {/* Lista de Pedidos */}
               {loading ? (
          <div className="py-12">
            <DoceGestaoLoading message="Carregando pedidos..." size="md" />
          </div>
                ) : (
                                           <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
             {filteredPedidos.length === 0 ? (
               <Card className="border border-gray-200 col-span-full">
                 <CardContent className="text-center py-12">
                   <p className="text-gray-500">
                     {pedidos.length === 0 
                       ? 'Nenhum pedido encontrado para este menu.'
                       : 'Nenhum pedido encontrado com os filtros aplicados.'
                     }
                   </p>
                   {pedidos.length > 0 && (
                     <Button 
                       variant="outline" 
                       className="mt-4"
                       onClick={() => {
                         setStatusFilter('todos')
                         setEntregaFilter('todos')
                         setSearchTerm('')
                       }}
                     >
                       Limpar Filtros
                     </Button>
                   )}
                 </CardContent>
               </Card>
             ) : (
                                                       filteredPedidos.map((pedido) => (
                                <Card 
                                  key={pedido.id} 
                                  className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden"
                                  onClick={() => window.open(`/dashboard/pedidos/${pedido.id}`, '_blank')}
                                >
                                   {/* Header com gradiente sutil */}
                                   <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
                                     <div className="flex items-center justify-between">
                                       <div className="flex items-center gap-2">
                                         <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></div>
                                         <span className="text-xs font-medium text-gray-600">#{pedido.codigo}</span>
                                       </div>
                                       
                                                                               <div onClick={(e) => e.stopPropagation()}>
                                          <Select 
                                            value={pedido.status} 
                                            onValueChange={(novoStatus) => updatePedidoStatus(pedido.id, novoStatus)}
                                          >
                                           <SelectTrigger className={`w-32 h-8 text-xs border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-opacity-50 ${getStatusButtonStyle(pedido.status)}`}>
                                             <SelectValue>
                                               <div className="flex items-center gap-2">
                                                 <div className={`w-2.5 h-2.5 rounded-full ${getStatusDotColor(pedido.status)} shadow-sm`}></div>
                                                 <span className="font-medium text-gray-700">{getStatusLabel(pedido.status)}</span>
                                               </div>
                                             </SelectValue>
                                           </SelectTrigger>
                                           <SelectContent className="border-0 shadow-lg rounded-lg">
                                             <SelectItem value="pendente" className="hover:bg-yellow-50 focus:bg-yellow-50">
                                               <div className="flex items-center gap-3 py-2">
                                                 <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm"></div>
                                                 <span className="font-medium">PENDENTE</span>
                                               </div>
                                             </SelectItem>
                                             <SelectItem value="em_andamento" className="hover:bg-blue-50 focus:bg-blue-50">
                                               <div className="flex items-center gap-3 py-2">
                                                 <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></div>
                                                 <span className="font-medium">EM ANDAMENTO</span>
                                               </div>
                                             </SelectItem>
                                             <SelectItem value="em_entrega" className="hover:bg-orange-50 focus:bg-orange-50">
                                               <div className="flex items-center gap-3 py-2">
                                                 <div className="w-3 h-3 rounded-full bg-orange-500 shadow-sm"></div>
                                                 <span className="font-medium">EM ENTREGA</span>
                                               </div>
                                             </SelectItem>
                                             <SelectItem value="finalizado" className="hover:bg-green-50 focus:bg-green-50">
                                               <div className="flex items-center gap-3 py-2">
                                                 <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
                                                 <span className="font-medium">FINALIZADO</span>
                                               </div>
                                             </SelectItem>
                                           </SelectContent>
                                         </Select>
                                       </div>
                                     </div>
                                   </div>
                                   
                                                                       <CardContent className="p-5">
                                      {/* Informações principais em grid */}
                                      <div className="grid grid-cols-2 gap-4 mb-5">
                                       <div className="space-y-2">
                                         <div className="flex items-center gap-2">
                                           <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                           <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Cliente</span>
                                         </div>
                                         <p className="font-semibold text-gray-900 text-sm truncate">{pedido.cliente.nome}</p>
                                       </div>
                                       
                                       <div className="space-y-2">
                                         <div className="flex items-center gap-2">
                                           <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                                           <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Total</span>
                                         </div>
                                         <p className="font-bold text-gray-900 text-lg">{formatPrice(pedido.valorTotal)}</p>
                                       </div>
                                     </div>
                                     
                                                                           {/* Informações secundárias */}
                                                                             <div className="space-y-3 mb-5">
                                         <div className="flex items-center justify-between text-xs py-1">
                                           <span className="text-gray-500">📱 Telefone</span>
                                           <span className="font-medium text-gray-700">{pedido.cliente.telefone}</span>
                                         </div>
                                         
                                         <div className="flex items-center justify-between text-xs py-1">
                                         <span className="text-gray-500">🚚 Entrega</span>
                                         <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                           pedido.formaEntrega === 'entrega' 
                                             ? 'bg-green-100 text-green-700' 
                                             : 'bg-gray-100 text-gray-600'
                                         }`}>
                                           {pedido.formaEntrega === 'entrega' ? 'Sim' : 'Não'}
                                         </span>
                                       </div>
                                     </div>
                                     
                                     {/* Footer com indicador de clique */}
                                     <div className="pt-3 border-t border-gray-100">
                                       <div className="flex items-center justify-center gap-2 text-xs text-gray-400 group-hover:text-blue-500 transition-colors">
                                         <span>Clique para ver detalhes</span>
                                         <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                         </svg>
                                       </div>
                                     </div>
                                   </CardContent>
                               </Card>
                             ))
          )}
        </div>
      )}
    </div>
  )
}
