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
          localStorage.setItem('couponPopupLastShown', Date.now().toString())
        }, 2000)

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
        <div className="relative bg-gradient-to-br from-[#8B4513] via-[#A0522D] to-[#8B4513] p-1 rounded-xl max-w-sm w-full animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-xl p-4 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full opacity-20"></div>
            <div className="absolute -bottom-3 -left-3 w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full opacity-20"></div>
            
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content */}
            <div className="relative z-10 text-center">
              {/* Icon */}
              <div className="mx-auto mb-3 w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                <Gift className="w-6 h-6 text-white" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                🎉 Oferta Especial!
              </h3>

              {/* Subtitle */}
              <p className="text-gray-600 mb-4 text-sm">
                Ganhe <span className="font-bold text-[#8B4513]">20% de desconto</span> no Plano PRO
              </p>

              {/* Coupon */}
              <div className="bg-gradient-to-r from-[#8B4513] to-[#A0522D] p-3 rounded-lg mb-4">
                <p className="text-white text-xs mb-1">Use o cupom:</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl font-bold text-white tracking-wider">DOCE20</span>
                  <button
                    onClick={handleCopy}
                    className="bg-white/20 hover:bg-white/30 p-1.5 rounded-md transition-colors"
                  >
                    {isCopied ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <Copy className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>
                {isCopied && (
                  <p className="text-white/90 text-xs mt-1 animate-in fade-in duration-200">
                    Cupom copiado! ✅
                  </p>
                )}
              </div>

              {/* Plano PRO Details */}
              <div className="bg-gradient-to-br from-[#8B4513]/10 to-[#A0522D]/10 p-3 rounded-lg mb-4 border border-[#8B4513]/20">
                <div className="flex items-center justify-center mb-2">
                  <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-black text-xs py-0.5 px-2 rounded-full font-bold mr-2">
                    PRO
                  </span>
                </div>
                
                {/* Preço original riscado */}
                <div className="text-center mb-2">
                  <span className="text-xs text-gray-500 line-through">R$ 47,89/mês</span>
                </div>
                
                {/* Preço com desconto em destaque */}
                <div className="text-center mb-2">
                  <div className="text-2xl font-bold text-[#8B4513]">R$ 38,31</div>
                  <div className="text-xs text-gray-600">por mês</div>
                </div>
              </div>

              {/* CTA Button */}
              <a
                href="/register"
                className="block w-full bg-gradient-to-r from-[#8B4513] to-[#A0522D] text-white py-2 px-4 rounded-lg font-semibold hover:from-[#A0522D] hover:to-[#8B4513] transition-all duration-300 transform hover:scale-105 text-sm"
              >
                Quero o Plano PRO com Desconto
              </a>

              {/* Terms */}
              <p className="text-xs text-gray-500 mt-3">
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