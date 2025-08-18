'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, User, MapPin, Package, CreditCard, Calendar, Phone, Mail } from 'lucide-react'
import DoceGestaoLoading from '@/components/ui/DoceGestaoLoading'

interface PedidoDetalhado {
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
    email?: string
    enderecos: Array<{
      id: number
      logradouro: string
      numero: string
      complemento?: string
      bairro: string
      cidade: string
      estado: string
      cep: string
      ativo: boolean
    }>
  }
  itens: Array<{
    id: number
    nomeProduto: string
    quantidade: number
    precoUnitario: number
    precoTotal: number
    observacao: string
  }>
}

export default function PedidoDetalhadoPage() {
  const params = useParams()
  const router = useRouter()
  const [pedido, setPedido] = useState<PedidoDetalhado | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchPedidoDetalhado(params.id as string)
    }
  }, [params.id])

  const fetchPedidoDetalhado = async (pedidoId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/pedidos-dg/${pedidoId}`)
      const data = await response.json()
      
      if (response.ok) {
        setPedido(data.pedido)
      } else {
        alert(`Erro ao buscar pedido: ${data.error}`)
      }
    } catch (error) {
      console.error('Erro ao buscar pedido:', error)
      alert('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  const updatePedidoStatus = async (novoStatus: string) => {
    if (!pedido) return
    
    try {
      const response = await fetch(`/api/pedidos-dg/${pedido.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: novoStatus }),
      })

      if (response.ok) {
        setPedido({ ...pedido, status: novoStatus })
      } else {
        alert('Erro ao atualizar status do pedido')
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      alert('Erro ao conectar com o servidor')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'em_andamento': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'em_entrega': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'finalizado': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <DoceGestaoLoading message="Carregando detalhes do pedido..." size="lg" />
      </div>
    )
  }

  if (!pedido) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-500">Pedido não encontrado</p>
          <Button onClick={() => router.back()} className="mt-4">
            Voltar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedido #{pedido.codigo}</h1>
          <p className="text-gray-500">Detalhes completos do pedido</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status e Ações */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  Status do Pedido
                </CardTitle>
                <Badge className={getStatusColor(pedido.status)}>
                  {pedido.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Alterar Status:</span>
                <Select value={pedido.status} onValueChange={updatePedidoStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="em_entrega">Em Entrega</SelectItem>
                    <SelectItem value="finalizado">Finalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Data de Criação:</span>
                  <p className="font-medium">{formatDate(pedido.createdAt)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Forma de Pagamento:</span>
                  <p className="font-medium capitalize">{pedido.formaPagamento}</p>
                </div>
                <div>
                  <span className="text-gray-500">Forma de Entrega:</span>
                  <p className="font-medium">
                    {pedido.formaEntrega === 'entrega' ? 'Entrega em Domicílio' : 'Retirada no Local'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Valor Total:</span>
                  <p className="font-bold text-lg">{formatPrice(pedido.valorTotal)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Itens do Pedido */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-gray-500" />
                Itens do Pedido ({pedido.itens.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pedido.itens.map((item, index) => (
                  <div key={item.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.nomeProduto}</h4>
                      {item.observacao && (
                        <p className="text-sm text-gray-600 mt-1 italic">"{item.observacao}"</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Qtd: {item.quantidade}</p>
                      <p className="text-sm text-gray-600">Unit: {formatPrice(item.precoUnitario)}</p>
                      <p className="font-semibold text-gray-900">{formatPrice(item.precoTotal)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {pedido.observacoes && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h4 className="font-medium text-blue-900 mb-2">Observações Gerais</h4>
                  <p className="text-blue-800">{pedido.observacoes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Informações do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-500" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Nome</p>
                <p className="font-medium">{pedido.cliente.nome}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Telefone</p>
                <p className="font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {pedido.cliente.telefone}
                </p>
              </div>
              
              {pedido.cliente.email && (
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {pedido.cliente.email}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Endereços */}
          {pedido.cliente.enderecos && pedido.cliente.enderecos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  Endereços ({pedido.cliente.enderecos.filter(e => e.ativo).length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pedido.cliente.enderecos
                    .filter(endereco => endereco.ativo)
                    .map((endereco, index) => (
                      <div key={endereco.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                        <p className="font-medium text-gray-900">
                          {endereco.logradouro}, {endereco.numero}
                        </p>
                        {endereco.complemento && (
                          <p className="text-gray-600">{endereco.complemento}</p>
                        )}
                        <p className="text-gray-600">
                          {endereco.bairro} - {endereco.cidade}/{endereco.estado}
                        </p>
                        <p className="text-gray-500">{endereco.cep}</p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resumo Financeiro */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-gray-500" />
                Resumo Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatPrice(pedido.valorTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Forma de Pagamento:</span>
                  <span className="font-medium capitalize">{pedido.formaPagamento}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-lg">Total:</span>
                    <span className="font-bold text-xl text-green-600">
                      {formatPrice(pedido.valorTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
