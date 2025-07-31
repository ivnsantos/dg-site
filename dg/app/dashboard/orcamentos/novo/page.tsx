'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../../../../components/ui/button'
import { toast } from 'react-hot-toast'
import { uploadFile } from '../../../../src/lib/firebase'
import DoceGestaoLoading from '../../../../components/ui/DoceGestaoLoading'
import { useSession } from 'next-auth/react'

interface Cliente {
  id: number
  nome: string
  telefone?: string
  endereco?: string
}

interface ItemOrcamentoForm {
  descricao: string
  quantidade: number
  valorUnitario: number
  valorTotal: number
  observacoes?: string
}

interface OrcamentoForm {
  numero: string
  codigo: string
  clienteId: number
  dataValidade: string
  valorTotal: number
  observacoes?: string
  status: string
  itens: ItemOrcamentoForm[]
}

export const dynamic = 'force-dynamic'

export default function NovoOrcamentoPage() {
  const { data: session } = useSession()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [orcamento, setOrcamento] = useState<OrcamentoForm>({
    numero: '',
    codigo: '',
    clienteId: 0,
    dataValidade: '',
    valorTotal: 0,
    status: 'PENDENTE',
    itens: []
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedClienteId, setSelectedClienteId] = useState<number | null>(null)
  const [showNewClienteForm, setShowNewClienteForm] = useState(false)
  const [newCliente, setNewCliente] = useState<Cliente>({ id: 0, nome: '', telefone: '', endereco: '' })

  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false)
      return
    }

    const userId = session.user.id
    
    fetch(`/api/clientes?userId=${userId}`)
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
        console.error('Erro ao carregar clientes:', error)
        toast.error(error.message || 'Erro ao carregar clientes')
        setLoading(false)
      })
  }, [session])

  const handleChange = (field: keyof OrcamentoForm, value: any) => {
    setOrcamento({ ...orcamento, [field]: value } as OrcamentoForm)
  }

  const handleItemChange = (idx: number, field: keyof ItemOrcamentoForm, value: any) => {
    const updated = [...orcamento.itens]
    updated[idx][field] = value
    if (field === 'quantidade' || field === 'valorUnitario') {
      updated[idx].valorTotal = updated[idx].quantidade * updated[idx].valorUnitario
    }
    setOrcamento({ ...orcamento, itens: updated })
  }

  const addItem = () => {
    setOrcamento({
      ...orcamento,
      itens: [
        ...orcamento.itens,
        {
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
    const updated = [...orcamento.itens]
    updated.splice(idx, 1)
    setOrcamento({ ...orcamento, itens: updated })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/orcamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orcamento,
          itens: orcamento.itens,
          userId: session?.user?.id // Trocar para o usuário logado
        }),
      })

      if (!response.ok) throw new Error('Erro ao criar orçamento')

      toast.success('Orçamento criado com sucesso!')
      router.push('/dashboard/orcamentos')
    } catch (error) {
      toast.error('Erro ao criar orçamento')
      setLoading(false) // Apenas seta loading como false em caso de erro, pois em caso de sucesso haverá redirecionamento
    }
  }

  // Função para criar novo cliente
  const handleCreateCliente = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newCliente, userId: session?.user?.id })
      })
      if (!response.ok) throw new Error('Erro ao criar cliente')
      const data = await response.json()
      const cliente = data.cliente || data
      setClientes([...clientes, cliente])
      setSelectedClienteId(cliente.id)
      setShowNewClienteForm(false)
      toast.success('Cliente criado com sucesso!')
    } catch {
      toast.error('Erro ao criar cliente')
    }
  }

  return (
    <div>
      {loading ? (
        <DoceGestaoLoading />
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Novo Orçamento</h1>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/orcamentos')}
            >
              Voltar
            </Button>
          </div>

          {/* Wizard de etapas */}
          <div className="flex gap-4 mb-8">
            <div className={`flex-1 py-2 px-4 rounded-lg text-center font-semibold ${step === 1 ? 'bg-[#0B7A48] text-white' : 'bg-gray-100 text-gray-500'}`}>1. Cliente</div>
            <div className={`flex-1 py-2 px-4 rounded-lg text-center font-semibold ${step === 2 ? 'bg-[#0B7A48] text-white' : 'bg-gray-100 text-gray-500'}`}>2. Dados do Orçamento</div>
            <div className={`flex-1 py-2 px-4 rounded-lg text-center font-semibold ${step === 3 ? 'bg-[#0B7A48] text-white' : 'bg-gray-100 text-gray-500'}`}>3. Itens do Orçamento</div>
          </div>

          {step === 1 && (
            <div className="space-y-8">
              <h2 className="text-lg font-semibold">Selecione ou cadastre o cliente</h2>
              <div className="space-y-4">
                <label className="text-sm font-medium">Cliente</label>
                <select
                  className="w-full p-2 border rounded"
                  value={selectedClienteId || ''}
                  onChange={e => setSelectedClienteId(Number(e.target.value))}
                >
                  <option value="">Selecione um cliente</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
                  ))}
                </select>
                <Button type="button" variant="outline" onClick={() => setShowNewClienteForm(!showNewClienteForm)}>
                  {showNewClienteForm ? 'Cancelar' : 'Cadastrar novo cliente'}
                </Button>
                {showNewClienteForm && (
                  <form onSubmit={handleCreateCliente} className="space-y-2 bg-gray-50 p-4 rounded">
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      placeholder="Nome do cliente"
                      value={newCliente.nome}
                      onChange={e => setNewCliente({ ...newCliente, nome: e.target.value })}
                      required
                    />
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      placeholder="Telefone"
                      value={newCliente.telefone}
                      onChange={e => setNewCliente({ ...newCliente, telefone: e.target.value })}
                    />
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      placeholder="Endereço"
                      value={newCliente.endereco}
                      onChange={e => setNewCliente({ ...newCliente, endereco: e.target.value })}
                    />
                    <Button type="submit" className="bg-[#0B7A48] text-white w-full">Salvar Cliente</Button>
                  </form>
                )}
              </div>
              <div className="flex justify-between gap-4">
                <Button type="button" className="bg-[#0B7A48] text-white" disabled={!selectedClienteId} onClick={() => setStep(2)}>Avançar</Button>
              </div>
            </div>
          )}

          {step === 2 && (
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
                    value={orcamento.dataValidade}
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
                  <div key={idx} className="border rounded p-4 mb-4 bg-gray-50">
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
                  onClick={() => setStep(1)}
                >
                  Voltar para Cliente
                </Button>
                <Button
                  type="submit"
                  className="bg-[#0B7A48] text-white"
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Salvar Orçamento'}
                </Button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  )
} 