'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { AlertTriangle, Settings } from 'lucide-react'

interface MarkupRequiredProps {
  title: string
  description: string
}

export function MarkupRequired({ title, description }: MarkupRequiredProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
          <CardTitle className="text-xl text-gray-900">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            {description}
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => router.push('/dashboard/usuarios')}
              className="w-full bg-[#0B7A48] hover:bg-[#0B7A48]/90 text-white"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurar Markup
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              Voltar ao Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 