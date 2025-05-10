'use client'

import { Card } from "@/components/ui/card"
import { Calculator } from 'lucide-react'
import { ConfiguracaoMarkupForm } from './ConfiguracaoMarkupForm'
import { ConfigurarMarkupButton } from './ConfigurarMarkupButton'
import { useState } from 'react'

interface MarkupSectionProps {
  markupIdeal?: number
}

export function MarkupSection({ markupIdeal }: MarkupSectionProps) {
  const [showForm, setShowForm] = useState(false)

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calculator className="h-6 w-6 text-[#0B7A48]" />
          <h2 className="text-xl font-semibold text-gray-900">Markup</h2>
        </div>
        <ConfigurarMarkupButton onClick={() => setShowForm(!showForm)} />
      </div>

      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        {markupIdeal ? (
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">Seu Markup Atual</p>
            <p className="text-3xl font-bold text-[#0B7A48]">{markupIdeal}%</p>
            <p className="text-sm text-gray-500 mt-2">
              Este valor é usado para calcular os preços sugeridos dos seus produtos
            </p>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <p>Você ainda não configurou seu markup</p>
            <p className="text-sm mt-1">
              Configure para obter sugestões de preços mais precisas
            </p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="mt-6">
          <ConfiguracaoMarkupForm />
        </div>
      )}
    </Card>
  )
} 