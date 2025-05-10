'use client'

import { Button } from "@/components/ui/button"
import { Pencil } from 'lucide-react'

interface ConfigurarMarkupButtonProps {
  onClick: () => void
}

export function ConfigurarMarkupButton({ onClick }: ConfigurarMarkupButtonProps) {
  return (
    <Button
      variant="outline"
      className="text-[#0B7A48] border-[#0B7A48] hover:bg-[#0B7A48]/10"
      onClick={onClick}
    >
      <Pencil className="h-4 w-4 mr-2" />
      Configurar
    </Button>
  )
} 