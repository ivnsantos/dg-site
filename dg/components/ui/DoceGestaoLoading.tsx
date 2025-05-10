'use client'

export default function DoceGestaoLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F6F4]">
      <div className="text-center flex flex-col items-center gap-4">
        <img src="/images/logo.png" alt="Doce Gestão Logo" width={80} height={80} className="mx-auto animate-fade-in" />
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#0B7A48] mx-auto"></div>
        <p className="mt-2 text-[#0B7A48] text-lg font-semibold">Carregando...</p>
      </div>
    </div>
  )
} 