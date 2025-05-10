'use client'

import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'

export function MarkupAlert() {
  const router = useRouter()

  return (
    <div className="mb-8 bg-[#0B7A48]/10 border border-[#0B7A48] p-6 rounded-lg">
      <div className="flex items-start gap-4">
        <div className="min-w-[24px] mt-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#0B7A48]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[#0B7A48] mb-2">Configure seu Markup</h3>
          <p className="text-[#374151] mb-4">
            Para aproveitar ao máximo o sistema e obter cálculos precisos de custos e preços, 
            configure seu markup ideal. Isso nos ajudará a fornecer recomendações mais precisas para seu negócio.
          </p>
          <Button
            onClick={() => router.push('/dashboard/usuarios')}
            className="bg-[#0B7A48] hover:bg-[#0B7A48]/90 text-white font-medium px-6 py-2 rounded-lg transition-colors"
          >
            Configurar Markup
          </Button>
        </div>
      </div>
    </div>
  )
} 