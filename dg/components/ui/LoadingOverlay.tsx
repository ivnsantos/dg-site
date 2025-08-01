interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
  subMessage?: string
}

export default function LoadingOverlay({ 
  isLoading, 
  message = "Processando...", 
  subMessage = "Aguarde enquanto processamos suas informações" 
}: LoadingOverlayProps) {
  if (!isLoading) return null

  return (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B7A48] mx-auto mb-4"></div>
        <p className="text-lg font-medium text-gray-700">{message}</p>
        <p className="text-sm text-gray-500 mt-2">{subMessage}</p>
      </div>
    </div>
  )
} 