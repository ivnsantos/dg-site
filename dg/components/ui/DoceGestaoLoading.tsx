import Image from 'next/image'

interface DoceGestaoLoadingProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  fullScreen?: boolean
}

export default function DoceGestaoLoading({ 
  message = "Carregando...", 
  size = 'md',
  fullScreen = false 
}: DoceGestaoLoadingProps) {
  const sizeClasses = {
    sm: {
      logo: 60,
      spinner: 'w-6 h-6',
      text: 'text-base',
      subtitle: 'text-xs'
    },
    md: {
      logo: 100,
      spinner: 'w-10 h-10',
      text: 'text-xl',
      subtitle: 'text-sm'
    },
    lg: {
      logo: 140,
      spinner: 'w-14 h-14',
      text: 'text-2xl',
      subtitle: 'text-base'
    }
  }

  const currentSize = sizeClasses[size]

  const LoadingContent = () => (
    <div className="flex flex-col items-center justify-center space-y-5">
      {/* Logo animado */}
      <div className="relative flex justify-center">
        <Image
          src="/images/logo.png"
          alt="Doce Gestão Logo"
          width={currentSize.logo}
          height={currentSize.logo}
          className="animate-pulse"
          priority
        />
        {/* Efeito de brilho */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
      </div>
      
      {/* Texto de carregamento */}
      <div className="space-y-2">
        <h3 className={`font-bold text-white ${currentSize.text}`}>Doce Gestão</h3>
        <p className={`text-[#0B7A48] font-medium ${currentSize.subtitle}`}>{message}</p>
      </div>
      
      {/* Spinner personalizado */}
      <div className="flex justify-center">
        <div className="relative">
          <div className={`border-4 border-[#0B7A48]/30 rounded-full ${currentSize.spinner}`}></div>
          <div className={`absolute top-0 left-0 border-4 border-[#0B7A48] rounded-full border-t-transparent animate-spin ${currentSize.spinner}`}></div>
        </div>
      </div>
      
      {/* Dots animados */}
      <div className="flex justify-center space-x-2">
        <div className="w-2 h-2 bg-[#0B7A48] rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-[#0B7A48] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-[#0B7A48] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-[#2D1810]/95 backdrop-blur-sm z-50 flex items-center justify-center">
        <LoadingContent />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-8 w-full">
      <LoadingContent />
    </div>
  )
} 