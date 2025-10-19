'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import DoceGestaoLoading from '../../../components/ui/DoceGestaoLoading'
import PDFGeneratorDirect from '../../../components/PDFGeneratorDirect'

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

interface HeaderConfig {
  nomeFantasia: string
  logotipoUrl?: string
  telefone?: string
  instagram?: string
}

interface FooterConfig {
  formaPagamento: string
  pix?: string
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

export default function OrcamentoPublicoPage() {
  const params = useParams()
  const id = params?.id as string
  const [orcamento, setOrcamento] = useState<Orcamento | null>(null)
  const [header, setHeader] = useState<HeaderConfig | null>(null)
  const [footer, setFooter] = useState<FooterConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    // Buscar o orçamento e configurações em uma única chamada
    fetch(`/api/orcamentos/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Orçamento não encontrado')
        return res.json()
      })
      .then(data => {
        console.log('Dados do orçamento:', data) // Debug
        setOrcamento(data.orcamento)
        
        // Se não tiver header/footer, usar dados padrão
        if (data.header && data.footer) {
          setHeader(data.header)
          setFooter(data.footer)
        } else {
          // Dados padrão se não houver configuração
          setHeader({
            nomeFantasia: 'Confeitaria',
            telefone: '',
            instagram: ''
          })
          setFooter({
            formaPagamento: 'Pix ou cartão de crédito',
            pix: ''
          })
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Erro ao carregar orçamento:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return <DoceGestaoLoading />
  }

  if (error || !orcamento || !header || !footer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F6F4]">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Orçamento não encontrado</h1>
          <p className="text-gray-600 mb-6">O orçamento que você está procurando não existe ou não está disponível.</p>
          <a href="/" className="inline-block px-6 py-3 bg-[#0B7A48] text-white rounded-md hover:bg-[#0B7A48]/90 transition-colors">
            Voltar para o início
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#BFE6DE] py-8 px-2">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-0 border border-[#BFE6DE] flex flex-col" id="orcamento-pdf">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 border-b border-[#BFE6DE] bg-white rounded-t-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            {header.logotipoUrl ? (
              <img 
                src={header.logotipoUrl} 
                alt={header.nomeFantasia} 
                className="h-24 w-24 object-cover rounded-full border-2 border-[#E6F4ED] shadow-sm" 
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-[#E6F4ED] flex items-center justify-center shadow-sm">
                <span className="text-[#0B7A48] text-3xl font-bold">{header.nomeFantasia?.charAt(0) || "D"}</span>
              </div>
            )}
            <div className="flex flex-col">
              <div className="text-lg text-[#0B7A48] font-bold">{header.nomeFantasia}</div>
              <div className="text-sm text-gray-500">Orçamento</div>
            </div>
          </div>
          <div className="flex flex-col gap-3 text-sm md:text-base font-medium text-[#0B7A48] items-end mt-4 md:mt-0">
            <div className="mb-2">
              <PDFGeneratorDirect 
                orcamento={orcamento}
                header={header}
                footer={footer}
                filename={`orcamento-${orcamento.numero}.pdf`}
                className="text-xs px-3 py-1"
              />
            </div>
            {header.telefone && (
              <div className="flex items-center gap-2">
                <a href={`https://wa.me/${header.telefone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                  <img 
                    src="/images/WhatsApp.webp" 
                    alt="WhatsApp" 
                    className="w-5 h-5 object-contain"
                  />
                </a>
                <span>{header.telefone}</span>
              </div>
            )}
            {header.instagram && (
              <div className="flex items-center gap-2">
                <a href={`https://instagram.com/${header.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer">
                  <img 
                    src="/images/instagram.webp" 
                    alt="Instagram" 
                    className="w-5 h-5 object-contain"
                  />
                </a>
                <span>{header.instagram}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Bloco do orçamento */}
        <div className="mx-auto w-full max-w-xl bg-white rounded-xl shadow-inner mt-0 p-8 border border-[#E6F4ED] z-10 relative">
          <div className="mb-6">
            <div className="text-lg font-bold text-[#0B7A48] tracking-wide mb-1">ORÇAMENTO Nº{orcamento.numero}</div>
            <div className="text-base text-gray-500 font-semibold mb-4">
              DATA: {format(new Date(orcamento.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
            </div>
            <div className="text-[#0B7A48] font-bold uppercase text-sm mb-1">Cliente:</div>
            <div className="font-semibold text-lg text-gray-900">{orcamento.cliente.nome}</div>
            {orcamento.cliente.telefone && (
              <div className="text-gray-700 text-base">{orcamento.cliente.telefone}</div>
            )}
            {orcamento.cliente.endereco && (
              <div className="text-gray-700 text-base mb-4">{orcamento.cliente.endereco}</div>
            )}
          </div>
          
          {/* Tabela de serviços */}
          <div className="mb-8 overflow-x-auto">
            <table className="w-full min-w-[320px] border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="text-left text-[#0B7A48] font-bold border-b-2 border-[#0B7A48] py-2 px-2 text-base bg-[#F8FAF9]">Serviço</th>
                  <th className="text-right text-[#0B7A48] font-bold border-b-2 border-[#0B7A48] py-2 px-2 text-base bg-[#F8FAF9] w-40">Valor</th>
                </tr>
              </thead>
              <tbody>
                {orcamento.itens.map((item, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-[#E6F4ED]' : ''}>
                    <td className="py-3 px-2 text-base border-b border-[#E6F4ED]">
                      <div className="font-medium">{item.descricao}</div>
                      {item.observacoes && (
                        <div className="text-sm text-gray-600 mt-1">{item.observacoes}</div>
                      )}
                      <div className="text-sm text-gray-500 mt-1">
                        {item.quantidade} x R$ {Number(item.valorUnitario).toFixed(2)}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right font-semibold text-base border-b border-[#E6F4ED]">
                      R$ {Number(item.valorTotal).toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="pt-4 pr-2 text-right font-bold text-lg border-none" colSpan={1}>TOTAL:</td>
                  <td className="pt-4 pl-2 text-right font-bold text-[#0B7A48] text-lg border-none">
                    R$ {orcamento.itens.reduce((sum, item) => sum + Number(item.valorTotal), 0).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Pagamento */}
          <div className="mb-3 mt-6">
            <div className="text-[#0B7A48] font-bold uppercase text-sm mb-1">Forma de pagamento</div>
            <div className="text-gray-800 text-base">{footer.formaPagamento}</div>
            {footer.pix && (
              <div className="text-gray-800 text-base mt-1">
                <span className="font-medium">Pix:</span> {footer.pix}
              </div>
            )}
          </div>
          
          {/* Observações */}
          {orcamento.observacoes && (
            <div className="mb-3 mt-6 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="text-[#0B7A48] font-bold uppercase text-sm mb-1">Observações</div>
              <div className="text-gray-800 text-base">{orcamento.observacoes}</div>
            </div>
          )}
          
          {/* Validade */}
          <div className="mb-2 mt-6">
            <div className="text-[#0B7A48] font-bold uppercase text-sm mb-1">Validade</div>
            <div className="text-gray-800 text-base">
              Este orçamento é válido até {format(new Date(orcamento.dataValidade), 'dd/MM/yyyy', { locale: ptBR })}
            </div>
          </div>

          {/* Status */}
          <div className="mt-6 pt-4 border-t border-dashed border-gray-200">
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              orcamento.status === 'PENDENTE' ? 'bg-yellow-100 text-yellow-800' :
              orcamento.status === 'APROVADO' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {orcamento.status === 'PENDENTE' ? 'Aguardando Aprovação' :
              orcamento.status === 'APROVADO' ? 'Orçamento Aprovado' :
              'Orçamento Rejeitado'}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="w-full flex flex-col items-center justify-center py-3 mt-4 border-t border-gray-200 bg-[#0B7A48] rounded-b-2xl text-white">
         
          <span className="text-xs mt-1">© {new Date().getFullYear()} Confeitech. Todos os direitos reservados.</span>
        </footer>
      </div>
    </div>
  )
} 