'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const formatarTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    let formattedValue = numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .substring(0, 15)
    return formattedValue
  }

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelefone(formatarTelefone(e.target.value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!email || !telefone) {
      setError('Por favor, preencha todos os campos')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/request-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          telefone: telefone.replace(/\D/g, '')
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao solicitar redefinição de senha')
      }

      setSuccess(true)
      
      // Redireciona para a tela de verificação do código após 2 segundos
      setTimeout(() => {
        router.push(`/forgot-password/verify?email=${encodeURIComponent(email)}`)
      }, 2000)

    } catch (error) {
      console.error('Erro ao solicitar redefinição:', error)
      setError(error instanceof Error ? error.message : 'Erro ao solicitar redefinição de senha')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#2D1810] relative">
      {/* Botão Voltar */}
      <Button
        onClick={() => router.push('/login')}
        variant="ghost"
        className="absolute top-4 left-4 text-white hover:bg-white/10"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Voltar para login
      </Button>

      {/* Seção Verde */}
      <div className="hidden md:flex md:w-1/2 bg-[#0B7A48] items-center justify-center p-8">
        <div className="text-white max-w-md space-y-8">
          <div className="flex justify-center mb-8">
            <Image
              src="/images/logo.png"
              alt="Doce Gestão Logo"
              width={110}
              height={110}
              className="animate-fade-in"
              priority
            />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter">Recuperação de Senha</h1>
            <p className="text-lg text-white/90">
              Não se preocupe, vamos ajudar você a recuperar o acesso à sua conta.
            </p>
          </div>
          <div className="bg-[#2D1810]/20 p-4 rounded-lg backdrop-blur-sm border border-white/10 mt-8">
            <h3 className="font-semibold text-white">Como funciona?</h3>
            <p className="text-sm text-white/80">
              Informe seu email e telefone cadastrados. Enviaremos um código por email para você redefinir sua senha.
            </p>
          </div>
        </div>
      </div>

      {/* Formulário de Recuperação */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-white mb-2">Esqueceu sua senha?</h2>
            <p className="text-gray-300">
              Digite seu email e telefone para receber um código de recuperação.
            </p>
          </div>

          {success ? (
            <div className="bg-[#0B7A48]/20 border-l-4 border-[#0B7A48] p-4 rounded-lg">
              <p className="text-[#0B7A48] font-medium">Código de recuperação enviado!</p>
              <p className="text-gray-300 text-sm mt-1">
                Verifique seu email para obter o código de 5 dígitos.
                Redirecionando para a próxima etapa...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-lg">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-300">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="telefone" className="text-sm font-medium text-gray-300">
                    Telefone
                  </label>
                  <Input
                    id="telefone"
                    type="text"
                    placeholder="(00) 00000-0000"
                    value={telefone}
                    onChange={handleTelefoneChange}
                    disabled={isLoading}
                    className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#0B7A48] hover:bg-[#0B7A48]/80 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processando...
                  </span>
                ) : (
                  'Solicitar código'
                )}
              </Button>

              <div className="text-center">
                <p className="text-gray-400 text-sm">
                  Lembrou sua senha?{' '}
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => router.push('/login')}
                    className="text-[#0B7A48] hover:text-[#0B7A48]/80 p-0 h-auto font-normal"
                  >
                    Voltar para o login
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