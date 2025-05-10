'use client'

import React from 'react'

export default function OrcamentoPublicoPage() {
  // Exemplo de dados (pode ser substituído por props ou fetch)
  const dados = {
    numero: '01234',
    data: '15/11/2027',
    cliente: {
      nome: 'Jaqueline Silva',
      telefone: '(12) 3456-7890',
      endereco: 'Rua Alegre, 123 - Cidade Brasileira',
    },
    itens: [
      { servico: 'Bolo de brigadeiro para 50 pessoas', valor: 200 },
      { servico: 'Pack 200 Brigadeiros', valor: 100 },
    ],
    total: 300,
    pagamento: 'Pix ou Kix no cartão de crédito',
    validade: 'Este orçamento é válido por 30 dias.'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#BFE6DE] py-8 px-2">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-0 border border-[#BFE6DE] flex flex-col">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 border-b border-[#BFE6DE] bg-white rounded-t-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col items-start">
            <img src="/images/logo.png" alt="Logo Doce Gestão" className="h-14 w-auto mb-2" />
            <div className="text-sm text-[#0B7A48] font-semibold tracking-wide mb-2">confeitaria</div>
          </div>
          <div className="flex flex-col gap-1 text-xs md:text-base font-medium text-[#0B7A48] items-end mt-4 md:mt-0">
            <div className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-[#0B7A48] mr-1"></span> (12) 3456-7890</div>
            <div className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-[#0B7A48] mr-1"></span> doces@docesgestao.com.br</div>
            <div className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-[#0B7A48] mr-1"></span> Rua X, 123 - Cidade</div>
          </div>
        </div>
        {/* Bloco do orçamento */}
        <div className="mx-auto w-full max-w-xl bg-white rounded-xl shadow-inner mt-0 p-8 border border-[#E6F4ED] z-10 relative">
          <div className="mb-6">
            <div className="text-lg font-bold text-[#0B7A48] tracking-wide mb-1">ORÇAMENTO Nº{dados.numero}</div>
            <div className="text-base text-gray-500 font-semibold mb-4">DATA: {dados.data}</div>
            <div className="text-[#0B7A48] font-bold uppercase text-sm mb-1">Cliente:</div>
            <div className="font-semibold text-lg text-gray-900">{dados.cliente.nome}</div>
            <div className="text-gray-700 text-base">{dados.cliente.telefone}</div>
            <div className="text-gray-700 text-base mb-4">{dados.cliente.endereco}</div>
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
                {dados.itens.map((item, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-[#E6F4ED]' : ''}>
                    <td className="py-3 px-2 text-base border-b border-[#E6F4ED]">{item.servico}</td>
                    <td className="py-3 px-2 text-right font-semibold text-base border-b border-[#E6F4ED]">R$ {item.valor.toFixed(2)}</td>
                  </tr>
                ))}
                <tr>
                  <td className="pt-4 pr-2 text-right font-bold text-lg border-none" colSpan={1}>TOTAL:</td>
                  <td className="pt-4 pl-2 text-right font-bold text-[#0B7A48] text-lg border-none">R$ {dados.total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Pagamento */}
          <div className="mb-3 mt-6">
            <div className="text-[#0B7A48] font-bold uppercase text-sm mb-1">Forma de pagamento</div>
            <div className="text-gray-800 text-base">{dados.pagamento}</div>
          </div>
          {/* Termos */}
          <div className="mb-2">
            <div className="text-[#0B7A48] font-bold uppercase text-sm mb-1">Termos e condições</div>
            <div className="text-gray-800 text-base">{dados.validade}</div>
          </div>
        </div>
        {/* Footer */}
        <div className="flex items-center justify-center px-8 py-3 mt-2">
          <img src="/images/logo.png" alt="Logo Doce Gestão" className="h-8 w-auto opacity-60" />
        </div>
      </div>
    </div>
  )
} 