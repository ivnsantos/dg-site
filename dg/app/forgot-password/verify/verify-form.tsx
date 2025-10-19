'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

export function VerifyForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutos em segundos

  useEffect(() => {
    // Pega o email da URL
    const emailParam = searchParams?.get('email')
    if (emailParam) {
      setEmail(emailParam)
    } else {
      router.push('/forgot-password')
    }

    // Configura o timer regressivo
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer)
          return 0
        }
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [searchParams, router])

  // Formata o tempo restante como MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Permitir apenas números e limitar a 5 dígitos
    const value = e.target.value.replace(/\D/g, '').substring(0, 5)
    setCode(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (code.length !== 5) {
      setError('O código deve ter 5 dígitos')
      setIsLoading(false)
      return
    }

    if (timeLeft === 0) {
      setError('O código expirou. Por favor, solicite um novo código.')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          code
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Código inválido ou expirado')
      }

      setSuccess(true)
      
      // Redireciona para a tela de nova senha após 2 segundos
      setTimeout(() => {
        router.push(`/forgot-password/reset?email=${encodeURIComponent(email)}&token=${encodeURIComponent(code)}`)
      }, 2000)

    } catch (error) {
      console.error('Erro ao verificar código:', error)
      setError(error instanceof Error ? error.message : 'Erro ao verificar código')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao reenviar código')
      }

      // Reseta o timer
      setTimeLeft(300)
      setCode('')
      
      // Mostra mensagem de sucesso
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao reenviar código')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#2D1810] relative">
      {/* Botão Voltar */}
      <Button
        onClick={() => router.push('/forgot-password')}
        variant="ghost"
        className="absolute top-4 left-4 text-white hover:bg-white/10"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Voltar
      </Button>

      {/* Seção Verde */}
      <div className="hidden md:flex md:w-1/2 bg-[#0B7A48] items-center justify-center p-8">
        <div className="text-white max-w-md space-y-8">
          <div className="flex justify-center mb-8">
            <Image
              src="/images/logo.png"
              alt="Confeitech Logo"
              width={110}
              height={110}
              className="animate-fade-in"
              priority
            />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter">Verificar Código</h1>
            <p className="text-lg text-white/90">
              Digite o código de 5 dígitos enviado para seu email.
            </p>
          </div>
          <div className="bg-[#2D1810]/20 p-4 rounded-lg backdrop-blur-sm border border-white/10 mt-8">
            <h3 className="font-semibold text-white">Não recebeu o código?</h3>
            <p className="text-sm text-white/80">
              Verifique sua caixa de entrada e pasta de spam. O código expira em 5 minutos.
            </p>
          </div>
        </div>
      </div>

      {/* Formulário de Verificação */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-white mb-2">Verificar Código</h2>
            <p className="text-gray-300">
              Digite o código de 5 dígitos enviado para <span className="font-medium text-white">{email}</span>
            </p>
          </div>

          {success ? (
            <div className="bg-[#0B7A48]/20 border-l-4 border-[#0B7A48] p-4 rounded-lg">
              <p className="text-[#0B7A48] font-medium">Código verificado com sucesso!</p>
              <p className="text-gray-300 text-sm mt-1">
                Redirecionando para definir sua nova senha...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-lg">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="code" className="text-sm font-medium text-gray-300">
                  Código de 5 dígitos
                </label>
                <Input
                  id="code"
                  type="text"
                  placeholder="12345"
                  value={code}
                  onChange={handleCodeChange}
                  disabled={isLoading}
                  className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-center text-xl tracking-widest"
                  maxLength={5}
                  autoFocus
                />
              </div>

              <div className="text-center text-gray-300">
                <p>
                  O código expira em: <span className={`font-semibold ${timeLeft < 60 ? 'text-red-400' : 'text-white'}`}>
                    {formatTime(timeLeft)}
                  </span>
                </p>
                {timeLeft === 0 && (
                  <p className="text-red-400 text-sm mt-1">
                    O código expirou. Solicite um novo.
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-[#0B7A48] hover:bg-[#0B7A48]/80 text-white"
                disabled={isLoading || code.length !== 5 || timeLeft === 0}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verificando...
                  </span>
                ) : (
                  'Verificar Código'
                )}
              </Button>

              <div className="text-center space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResendCode}
                  disabled={isLoading || timeLeft > 0}
                  className="w-full border-white/20 text-white hover:bg-white/10"
                >
                  {isLoading ? 'Reenviando...' : 'Reenviar Código'}
                </Button>
                
                <p className="text-gray-400 text-sm">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => router.push('/forgot-password')}
                    className="text-[#0B7A48] hover:text-[#0B7A48]/80 p-0 h-auto font-normal"
                  >
                    Voltar para recuperação de senha
                  </Button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
} 