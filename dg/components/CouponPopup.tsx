'use client'

import { useState, useEffect } from 'react'
import { X, Gift, Copy, Check } from 'lucide-react'

export default function CouponPopup() {
  const [isVisible, setIsVisible] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    // Verificar se o popup já foi mostrado recentemente
    const checkPopupFrequency = () => {
      const lastShown = localStorage.getItem('couponPopupLastShown')
      const now = Date.now()
      const thirtyMinutes = 30 * 60 * 1000 // 30 minutos em millisegundos

      // Se nunca foi mostrado ou se passou mais de 30 minutos
      if (!lastShown || (now - parseInt(lastShown)) > thirtyMinutes) {
        // Mostrar o popup após 6 segundos
        const timer = setTimeout(() => {
          setIsVisible(true)
          // Salvar o timestamp atual
          localStorage.setItem('couponPopupLastShown', now.toString())
        }, 6000)

        return () => clearTimeout(timer)
      }
    }

    checkPopupFrequency()
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText('DOCE20')
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  const handleClose = () => {
    setIsVisible(false)
  }

  // Função para resetar o controle de frequência (útil para desenvolvimento)
  const resetPopupFrequency = () => {
    localStorage.removeItem('couponPopupLastShown')
    console.log('Controle de frequência do popup resetado')
  }

  // Expor a função globalmente para desenvolvimento
  if (typeof window !== 'undefined') {
    (window as any).resetCouponPopup = resetPopupFrequency
  }

  // Verificar se o popup está bloqueado pelo controle de frequência
  const isPopupBlocked = () => {
    const lastShown = localStorage.getItem('couponPopupLastShown')
    if (!lastShown) return false
    
    const now = Date.now()
    const thirtyMinutes = 30 * 60 * 1000
    return (now - parseInt(lastShown)) <= thirtyMinutes
  }

  if (!isVisible) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        {/* Popup */}
        <div className="relative bg-gradient-to-br from-[#0B7A48] via-[#0ea65f] to-[#0B7A48] p-1 rounded-2xl max-w-md w-full animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-2xl p-6 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-20"></div>
            <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full opacity-20"></div>
            
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="relative z-10 text-center">
              {/* Icon */}
              <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Gift className="w-8 h-8 text-white" />
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                🎉 Oferta Especial!
              </h3>

              {/* Subtitle */}
              <p className="text-gray-600 mb-6">
                Ganhe <span className="font-bold text-[#0B7A48]">20% de desconto</span> no Plano PRO
              </p>

              {/* Coupon */}
              <div className="bg-gradient-to-r from-[#0B7A48] to-[#0ea65f] p-4 rounded-xl mb-6">
                <p className="text-white text-sm mb-2">Use o cupom:</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl font-bold text-white tracking-wider">DOCE20</span>
                  <button
                    onClick={handleCopy}
                    className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                  >
                    {isCopied ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <Copy className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>
                {isCopied && (
                  <p className="text-white/90 text-sm mt-2 animate-in fade-in duration-200">
                    Cupom copiado! ✅
                  </p>
                )}
              </div>

              {/* Plano PRO Details */}
              <div className="bg-gradient-to-br from-[#0B7A48]/10 to-[#0ea65f]/10 p-4 rounded-xl mb-6 border border-[#0B7A48]/20">
                <div className="flex items-center justify-center mb-3">
                  <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-sm py-1 px-3 rounded-full font-bold mr-2">
                    PRO
                  </span>
                </div>
                
                {/* Preço original riscado */}
                <div className="text-center mb-2">
                  <span className="text-sm text-gray-500 line-through">R$ 47,89/mês</span>
                </div>
                
                {/* Preço com desconto em destaque */}
                <div className="text-center mb-3">
                  <div className="text-2xl font-bold text-[#0B7A48]">R$ 38,31</div>
                  <div className="text-sm text-gray-600">por mês</div>
                </div>
            
              </div>

              {/* Benefits */}
              <div className="space-y-3 mb-6 text-left">
                <div className="flex items-start text-sm text-gray-700">
                  <span className="text-[#0B7A48] mr-2 mt-0.5">✓</span>
                  <span><strong>Controle completo</strong> de ingredientes e estoque</span>
                </div>
                <div className="flex items-start text-sm text-gray-700">
                  <span className="text-[#0B7A48] mr-2 mt-0.5">✓</span>
                  <span><strong>Gerenciamento ilimitado</strong> de todas as receitas</span>
                </div>
                <div className="flex items-start text-sm text-gray-700">
                  <span className="text-[#0B7A48] mr-2 mt-0.5">✓</span>
                  <span><strong>Calculadora avançada</strong> de preços e custos</span>
                </div>
                <div className="flex items-start text-sm text-gray-700">
                  <span className="text-[#0B7A48] mr-2 mt-0.5">✓</span>
                  <span><strong>Menu Online</strong> profissional ilimitado</span>
                </div>
                <div className="flex items-start text-sm text-gray-700">
                  <span className="text-[#0B7A48] mr-2 mt-0.5">✓</span>
                  <span><strong>Orçamentos digitais</strong> para clientes</span>
                </div>
                <div className="flex items-start text-sm text-gray-700">
                  <span className="text-[#0B7A48] mr-2 mt-0.5">✓</span>
                  <span><strong>LinkTree personalizado</strong> para Instagram</span>
                </div>
                <div className="flex items-start text-sm text-gray-700">
                  <span className="text-[#0B7A48] mr-2 mt-0.5">✓</span>
                  <span><strong>Controle de clientes</strong> e histórico</span>is
                </div>
              </div>

              {/* CTA Button */}
              <a
                href="/register"
                className="block w-full bg-gradient-to-r from-[#0B7A48] to-[#0ea65f] text-white py-3 px-6 rounded-xl font-semibold hover:from-[#0ea65f] hover:to-[#0B7A48] transition-all duration-300 transform hover:scale-105"
              >
                Quero o Plano PRO com Desconto
              </a>

              {/* Terms */}
              <p className="text-xs text-gray-500 mt-4">
                * Oferta válida por tempo limitado. Desconto aplicado apenas no Plano PRO. 
                Não pode ser combinada com outras promoções.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 