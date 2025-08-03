'use client'

import React from 'react'
import { Download } from 'lucide-react'

interface FeedbackResponse {
  id: number
  selectedOption: string
  textResponse: string | null
  clientName: string | null
  clientEmail: string | null
  createdAt: string
}

interface FeedbackExportButtonProps {
  feedback: {
    title: string
    question: string
    responses: FeedbackResponse[]
  }
}

export default function FeedbackExportButton({ feedback }: FeedbackExportButtonProps) {
  const exportToCSV = () => {
    if (feedback.responses.length === 0) {
      alert('Não há respostas para exportar')
      return
    }

    // Criar cabeçalho do CSV
    const headers = [
      'ID',
      'Opção Selecionada',
      'Comentário',
      'Nome do Cliente',
      'Email do Cliente',
      'Data da Resposta'
    ]

    // Criar linhas de dados
    const rows = feedback.responses.map(response => [
      response.id,
      response.selectedOption,
      response.textResponse || '',
      response.clientName || '',
      response.clientEmail || '',
      new Date(response.createdAt).toLocaleString('pt-BR')
    ])

    // Combinar cabeçalho e dados
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Criar e baixar arquivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `feedback-${feedback.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <button
      onClick={exportToCSV}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
      disabled={feedback.responses.length === 0}
    >
      <Download className="w-4 h-4" />
      Exportar CSV
    </button>
  )
} 