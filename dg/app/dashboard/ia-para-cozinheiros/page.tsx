'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  SparklesIcon, 
  ChevronRightIcon, 
  RocketLaunchIcon, 
  CheckCircleIcon,
  BeakerIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

export default function IAParaCozinheirosPage() {
  const [messageInput, setMessageInput] = useState('')

  return (
    <div className="min-h-screen py-4 px-3 sm:py-6 sm:px-4 bg-[#F9FAFB]">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">IA para Cozinheiros</h1>
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
              Em breve
              <SparklesIcon className="h-3 w-3" />
            </span>
          </div>
          <Button 
            onClick={() => window.history.back()}
            variant="outline"
            size="sm"
          >
            Voltar
          </Button>
        </div>

        <Card className="p-3 sm:p-4 shadow-lg border border-gray-200 rounded-xl overflow-hidden mb-6">
          <div className="flex items-center gap-3 mb-4 border-b pb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="font-semibold text-gray-800">Assistente culinário com IA</div>
              <div className="text-xs text-gray-500">Demonstração de funcionalidades</div>
            </div>
          </div>

          <div className="max-h-[500px] overflow-y-auto mb-4 p-2 sm:p-6">
            <div className="bg-gradient-to-br from-slate-50 to-purple-50 text-gray-800 rounded-lg p-4 sm:p-6 text-center border border-purple-100">
              <h3 className="text-lg sm:text-xl font-bold mb-4 text-purple-700">Bem-vindo ao Assistente de IA para Cozinheiros!</h3>
              <p className="mb-4 text-sm sm:text-base">
                Estamos desenvolvendo uma ferramenta poderosa para auxiliar você em sua jornada culinária.
                Em breve, este assistente de IA estará disponível para ajudar você!
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex gap-2">
              <div className="flex-1 bg-gray-100 text-gray-400 rounded-lg px-4 py-2 text-sm">
                Digite sua mensagem (disponível em breve)...
              </div>
              <Button disabled className="bg-gray-200 text-gray-400">
                <ChevronRightIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 shadow-sm hover:shadow-md transition-all">
            <div className="bg-blue-500 w-10 h-10 rounded-full flex items-center justify-center mb-3">
              <BeakerIcon className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-blue-700 mb-2">Receitas Personalizadas</h3>
            <p className="text-sm text-blue-600">Crie receitas personalizadas com base nos ingredientes que você tem disponíveis.</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200 shadow-sm hover:shadow-md transition-all">
            <div className="bg-green-500 w-10 h-10 rounded-full flex items-center justify-center mb-3">
              <CurrencyDollarIcon className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-green-700 mb-2">Otimização de Custos</h3>
            <p className="text-sm text-green-600">Economize dinheiro com sugestões de alternativas para reduzir custos sem perder qualidade.</p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200 shadow-sm hover:shadow-md transition-all">
            <div className="bg-amber-500 w-10 h-10 rounded-full flex items-center justify-center mb-3">
              <ShoppingCartIcon className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-amber-700 mb-2">Restrições Alimentares</h3>
            <p className="text-sm text-amber-600">Adapte receitas para diferentes restrições alimentares como vegano, sem glúten e muito mais.</p>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200 shadow-sm hover:shadow-md transition-all">
            <div className="bg-indigo-500 w-10 h-10 rounded-full flex items-center justify-center mb-3">
              <ChartBarIcon className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-indigo-700 mb-2">Tendências de Mercado</h3>
            <p className="text-sm text-indigo-600">Acompanhe as receitas e produtos mais buscados para se destacar no mercado.</p>
          </div>

          <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-4 border border-rose-200 shadow-sm hover:shadow-md transition-all">
            <div className="bg-rose-500 w-10 h-10 rounded-full flex items-center justify-center mb-3">
              <ClockIcon className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-rose-700 mb-2">Gestão de Tempo</h3>
            <p className="text-sm text-rose-600">Organize seu tempo de preparo e receba sugestões para otimizar sua produção.</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200 shadow-sm hover:shadow-md transition-all">
            <div className="bg-purple-500 w-10 h-10 rounded-full flex items-center justify-center mb-3">
              <RocketLaunchIcon className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-purple-700 mb-2">Plano de Lançamento</h3>
            <p className="text-sm text-purple-600">
              <span className="block mb-1">1. Criação de receitas e custos</span>
              <span className="block mb-1">2. Personalização avançada</span>
              <span className="block">3. Análise de tendências</span>
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-slate-50 via-purple-50 to-pink-50 rounded-xl p-4 sm:p-6 border border-purple-100 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-12 h-12 rounded-full flex items-center justify-center shrink-0">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                Fique por dentro!
              </h2>
              <p className="text-sm text-gray-600">
                Nossa IA para Cozinheiros está em desenvolvimento ativo. Queremos criar uma ferramenta 
                que realmente entenda suas necessidades e ajude a levar seu negócio culinário para o próximo nível.
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <Button className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              Me avise quando estiver disponível
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 