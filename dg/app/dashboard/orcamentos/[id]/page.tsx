'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '../../../../components/ui/button'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import DoceGestaoLoading from '../../../../components/ui/DoceGestaoLoading'
import Link from 'next/link'

interface ItemOrcamento {
  id: number
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

interface Orcamento {
  id: number
  numero: string
  codigo: string
  cliente: Cliente
  dataValidade: string
  valorTotal: number
  observacoes?: string
  status: string
  itens: ItemOrcamento[]
  createdAt: string
  updatedAt: string
}

export default function OrcamentoDetalhePage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const [orcamento, setOrcamento] = useState<Orcamento | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/orcamentos/${id}`)
      .then(res => res.json())
      .then(data => {
        setOrcamento(data.orcamento)
        setLoading(false)
      })
      .catch(() => {
        toast.error('Erro ao carregar orçamento')
        setLoading(false)
      })
  }, [id])

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este orçamento?')) return

    try {
      const response = await fetch(`/api/orcamentos/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Erro ao excluir orçamento')

      toast.success('Orçamento excluído com sucesso!')
      router.push('/dashboard/orcamentos')
    } catch (error) {
      toast.error('Erro ao excluir orçamento')
    }
  }

  if (loading) {
    return <DoceGestaoLoading />
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
        <h1 className="text-2xl font-bold">Orçamento #{orcamento.numero}</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/orcamentos')}
          >
            Voltar
          </Button>
          <Link href={`/orcamento/${id}`} target="_blank">
            <Button 
              variant="outline"
              className="bg-[#E6F4ED] text-[#0B7A48] hover:bg-[#E6F4ED]/80"
            >
              Ver Orçamento Público
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/orcamentos/${id}/editar`)}
          >
            Editar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            Excluir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Informações do Cliente</h2>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="font-medium">{orcamento.cliente.nome}</p>
              {orcamento.cliente.telefone && (
                <p className="text-sm text-muted-foreground">
                  Telefone: {orcamento.cliente.telefone}
                </p>
              )}
              {orcamento.cliente.endereco && (
                <p className="text-sm text-muted-foreground">
                  Endereço: {orcamento.cliente.endereco}
                </p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Detalhes do Orçamento</h2>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Código</p>
                  <p className="font-medium">{orcamento.codigo}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className={`font-medium ${
                    orcamento.status === 'PENDENTE' ? 'text-yellow-600' :
                    orcamento.status === 'APROVADO' ? 'text-green-600' :
                    'text-red-600'
                  }`}>
                    {orcamento.status}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data de Validade</p>
                  <p className="font-medium">
                    {format(new Date(orcamento.dataValidade), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="font-medium">R$ {Number(orcamento.valorTotal).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {orcamento.observacoes && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Observações</h2>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-muted-foreground">{orcamento.observacoes}</p>
              </div>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Itens do Orçamento</h2>
          <div className="space-y-4">
            {orcamento.itens.map((item, idx) => (
              <div key={item.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">{item.descricao}</p>
                    {item.observacoes && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.observacoes}
                      </p>
                    )}
                  </div>
                  <p className="font-medium">R$ {Number(item.valorTotal).toFixed(2)}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <p>Quantidade: {item.quantidade}</p>
                  <p>Valor Unitário: R$ {Number(item.valorUnitario).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>Criado em: {format(new Date(orcamento.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
        <p>Última atualização: {format(new Date(orcamento.updatedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
      </div>
    </div>
  )
} 