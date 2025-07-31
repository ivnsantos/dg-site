'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '../../../components/ui/button'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import DoceGestaoLoading from '../../../components/ui/DoceGestaoLoading'
import { toast } from 'sonner'

interface OrcamentoList {
  id: number
  numero: string
  codigo: string
  cliente: {
    nome: string
  }
  dataValidade: string
  valorTotal: number
  status: string
  itens?: { valorTotal: string }[]
}

export default function OrcamentosClient() {
  const [orcamentos, setOrcamentos] = useState<OrcamentoList[]>([])
  const [loading, setLoading] = useState(true)
  const [headerLoading, setHeaderLoading] = useState(true)
  const [header, setHeader] = useState<any>(null)
  const [footer, setFooter] = useState<any>(null)
  const router = useRouter()
  const { data: session } = useSession()

  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false)
      setHeaderLoading(false)
      return
    }

    const userId = session.user.id

    // Buscar orçamentos
    fetch(`/api/orcamentos?userId=${userId}`)
      .then(res => {
        if (!res.ok) {
          if (res.status === 503) {
            throw new Error('Erro de conexão. Tente novamente em alguns segundos.')
          }
          throw new Error('Erro ao carregar orçamentos')
        }
        return res.json()
      })
      .then(data => {
        setOrcamentos(data.orcamentos || [])
        setLoading(false)
      })
      .catch((error) => {
        console.error('Erro ao carregar orçamentos:', error)
        toast.error(error.message || 'Erro ao carregar orçamentos')
        setLoading(false)
      })

    // Buscar header/footer
    fetch(`/api/orcamentos/configuracao?userId=${userId}`)
      .then(res => {
        if (!res.ok) {
          if (res.status === 503) {
            throw new Error('Erro de conexão. Tente novamente em alguns segundos.')
          }
          throw new Error('Erro ao carregar configurações')
        }
        return res.json()
      })
      .then(data => {
        setHeader(data.header)
        setFooter(data.footer)
        setHeaderLoading(false)
      })
      .catch((error) => {
        console.error('Erro ao carregar configurações:', error)
        toast.error(error.message || 'Erro ao carregar configurações')
        setHeaderLoading(false)
      })
  }, [session])

  const headerFooterCadastrados = header && footer

  return (
    <div>
      {/* Header/Footer do orçamento */}
      <div className="mb-6">
        {headerLoading ? (
          <div className="bg-white rounded-lg shadow p-4 border border-[#BFE6DE] h-32 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B7A48]"></div>
          </div>
        ) : headerFooterCadastrados ? (
          <div className="bg-white rounded-lg shadow p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-[#BFE6DE] hover:shadow-md transition-shadow">
            <div className="flex items-center gap-5">
              {header.logotipoUrl ? (
                <img src={header.logotipoUrl} alt="Logo" className="h-16 w-16 object-cover rounded-full border-2 border-[#E6F4ED]" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-[#E6F4ED] flex items-center justify-center">
                  <span className="text-[#0B7A48] text-xl font-bold">{header.nomeFantasia?.charAt(0) || "O"}</span>
                </div>
              )}
              <div>
                <div className="text-xl font-bold text-[#0B7A48]">{header.nomeFantasia}</div>
                <div className="text-sm text-gray-500 flex flex-col sm:flex-row sm:gap-3">
                  {header.telefone && <span>{header.telefone}</span>}
                  {header.instagram && <span className="text-[#0B7A48]">{header.instagram}</span>}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 text-sm md:text-base font-medium text-[#0B7A48] items-start md:items-end mt-2 md:mt-0 bg-[#F8FCFA] p-3 rounded-lg border border-[#E6F4ED]">
              <div><span className="font-semibold">Forma de pagamento:</span> {footer.formaPagamento}</div>
              {footer.pix && <div><span className="font-semibold">Pix:</span> {footer.pix}</div>}
              <Button
                onClick={() => router.push('/dashboard/orcamentos/configuracao')}
                className="mt-2 bg-[#0B7A48] text-white hover:bg-[#0B7A48]/90 transition-colors"
              >
                Editar Configurações
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="text-yellow-800 font-medium">Você precisa cadastrar o cabeçalho e rodapé do orçamento antes de criar orçamentos.</div>
            <Button
              onClick={() => router.push('/dashboard/orcamentos/configuracao')}
              className="bg-[#0B7A48] text-white hover:bg-[#0B7A48]/90 transition-colors"
            >
              Configurar Orçamento
            </Button>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Orçamentos</h1>
        <Link href="/dashboard/orcamentos/novo">
          <Button className="bg-[#0B7A48] text-white" disabled={!headerFooterCadastrados}>Novo Orçamento</Button>
        </Link>
      </div>
      {loading ? (
        <DoceGestaoLoading />
      ) : orcamentos.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-muted-foreground">
          Nenhum orçamento cadastrado ainda.
        </div>
      ) : (
        <div className="grid gap-6">
          {orcamentos.map(orcamento => (
            <div key={orcamento.id} className="bg-white rounded-2xl shadow-md p-6 flex flex-col md:flex-row items-center md:items-stretch justify-between gap-6 transition-all hover:shadow-lg border border-gray-100 group">
              <div className="flex-1 flex flex-col gap-2 justify-center md:justify-start md:items-start items-center text-center md:text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-xl text-primary">Orçamento #{orcamento.numero}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    orcamento.status === 'PENDENTE' ? 'bg-yellow-100 text-yellow-700' :
                    orcamento.status === 'APROVADO' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>{orcamento.status}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold">Cliente:</span> {orcamento.cliente.nome}
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold">Validade:</span> {format(new Date(orcamento.dataValidade), 'dd/MM/yyyy', { locale: ptBR })}
                </div>
                <div className="text-sm text-muted-foreground">
                  <span>
                    Valor Total: R$ {
                      orcamento.itens && orcamento.itens.length > 0
                        ? orcamento.itens.reduce((total, item) => total + Number(item.valorTotal || 0), 0).toFixed(2)
                        : (Number(orcamento.valorTotal) || 0).toFixed(2)
                    }
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Link href={`/dashboard/orcamentos/${orcamento.id}`}>
                  <Button variant="outline" className="w-full">Ver Detalhes</Button>
                </Link>
                <Link href={`/orcamento/${orcamento.id}`} target="_blank">
                  <Button variant="outline" className="w-full bg-[#E6F4ED] text-[#0B7A48] hover:bg-[#E6F4ED]/80">
                    Ver Orçamento Público
                  </Button>
                </Link>
                <Link href={`/dashboard/orcamentos/${orcamento.id}/editar`}>
                  <Button className="w-full">Editar</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 