'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '../../../../../components/ui/button'
import { Input } from '../../../../../components/ui/input'
import { Label } from '../../../../../components/ui/label'
import { Textarea } from '../../../../../components/ui/textarea'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

interface Orcamento {
  id: number
  numero: string
  codigo: string
  clienteId: number
  dataValidade: string
  valorTotal: number
  observacoes?: string
  status: string
  itens: ItemOrcamento[]
}

interface ItemOrcamento {
  id?: number
  descricao: string
  quantidade: number
  valorUnitario: number
  valorTotal: number
  observacoes?: string
}

interface Cliente {
  id: number
  nome: string
  telefone?: string
  endereco?: string
}

export default function EditarOrcamentoPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const [orcamento, setOrcamento] = useState<Orcamento | null>(null)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false)
      return
    }

    const userId = session.user.id

    // Buscar orçamento
    fetch(`/api/orcamentos/${params.id}`)
      .then(res => {
        if (!res.ok) {
          if (res.status === 503) {
            throw new Error('Erro de conexão. Tente novamente em alguns segundos.')
          }
          throw new Error('Erro ao carregar orçamento')
        }
        return res.json()
      })
      .then(data => {
        setOrcamento(data.orcamento)
        
        // Buscar clientes
        return fetch(`/api/clientes?userId=${userId}`)
      })
      .then(res => {
        if (!res.ok) {
          if (res.status === 503) {
            throw new Error('Erro de conexão. Tente novamente em alguns segundos.')
          }
          throw new Error('Erro ao carregar clientes')
        }
        return res.json()
      })
      .then(data => {
        setClientes(data.clientes || [])
        setLoading(false)
      })
      .catch((error) => {
        console.error('Erro ao carregar dados:', error)
        toast.error(error.message || 'Erro ao carregar dados')
        setLoading(false)
      })
  }, [params.id, session])

  const handleChange = (field: keyof Orcamento, value: any) => {
    if (!orcamento) return
    setOrcamento({ ...orcamento, [field]: value })
  }

  const handleItemChange = (idx: number, field: keyof ItemOrcamento, value: any) => {
    if (!orcamento) return
    const updated = [...orcamento.itens]
    updated[idx][field] = value
    if (field === 'quantidade' || field === 'valorUnitario') {
      updated[idx].valorTotal = updated[idx].quantidade * updated[idx].valorUnitario
    }
    setOrcamento({ ...orcamento, itens: updated })
  }

  const addItem = () => {
    if (!orcamento) return
    setOrcamento({
      ...orcamento,
      itens: [
        ...orcamento.itens,
        {
          id: 0,
          descricao: '',
          quantidade: 1,
          valorUnitario: 0,
          valorTotal: 0,
          observacoes: ''
        }
      ]
    })
  }

  const removeItem = (idx: number) => {
    if (!orcamento) return
    const updated = [...orcamento.itens]
    updated.splice(idx, 1)
    setOrcamento({ ...orcamento, itens: updated })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orcamento) return

    setLoading(true)

    try {
      const response = await fetch(`/api/orcamentos/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...orcamento,
          clienteId: orcamento.clienteId,
          userId: session?.user?.id
        }),
      })

      if (!response.ok) throw new Error('Erro ao atualizar orçamento')

      toast.success('Orçamento atualizado com sucesso!')
      router.push(`/dashboard/orcamentos/${params.id}`)
    } catch (error) {
      toast.error('Erro ao atualizar orçamento')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <p>Carregando orçamento...</p>
      </div>
    )
  }

  if (!orcamento) {
    return (
      <div className="text-center text-muted-foreground">
        Orçamento não encontrado
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Editar Orçamento #{orcamento.numero}</h1>
        <Button
          variant="outline"
          onClick={() => router.push(`/dashboard/orcamentos/${params.id}`)}
        >
          Voltar
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Número do Orçamento</label>
            <input
              type="text"
              value={orcamento.numero}
              onChange={(e) => handleChange('numero', e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Código</label>
            <input
              type="text"
              value={orcamento.codigo}
              onChange={(e) => handleChange('codigo', e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Cliente</label>
            <select
              value={orcamento.clienteId}
              onChange={(e) => handleChange('clienteId', Number(e.target.value))}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Selecione um cliente</option>
              {clientes.map(cliente => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Data de Validade</label>
            <input
              type="date"
              value={orcamento.dataValidade.split('T')[0]}
              onChange={(e) => handleChange('dataValidade', e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <select
              value={orcamento.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full p-2 border rounded"
              required
            >
              <option value="PENDENTE">Pendente</option>
              <option value="APROVADO">Aprovado</option>
              <option value="REJEITADO">Rejeitado</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Observações</label>
            <textarea
              value={orcamento.observacoes}
              onChange={(e) => handleChange('observacoes', e.target.value)}
              className="w-full p-2 border rounded"
              rows={3}
            />
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Itens do Orçamento</h2>
            <Button type="button" onClick={addItem} className="bg-[#0B7A48] text-white">
              Adicionar Item
            </Button>
          </div>

          {orcamento.itens.map((item, idx) => (
            <div key={item.id} className="border rounded p-4 mb-4 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium">Item {idx + 1}</span>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeItem(idx)}
                >
                  Remover
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Descrição</label>
                  <input
                    type="text"
                    value={item.descricao}
                    onChange={(e) => handleItemChange(idx, 'descricao', e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantidade</label>
                  <input
                    type="number"
                    value={item.quantidade}
                    onChange={(e) => handleItemChange(idx, 'quantidade', Number(e.target.value))}
                    className="w-full p-2 border rounded"
                    min="1"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Valor Unitário</label>
                  <input
                    type="number"
                    value={item.valorUnitario}
                    onChange={(e) => handleItemChange(idx, 'valorUnitario', Number(e.target.value))}
                    className="w-full p-2 border rounded"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Valor Total</label>
                  <input
                    type="number"
                    value={item.valorTotal}
                    className="w-full p-2 border rounded bg-gray-100"
                    readOnly
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Observações</label>
                  <textarea
                    value={item.observacoes}
                    onChange={(e) => handleItemChange(idx, 'observacoes', e.target.value)}
                    className="w-full p-2 border rounded"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/dashboard/orcamentos/${params.id}`)}
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
    </div>
  )
} 