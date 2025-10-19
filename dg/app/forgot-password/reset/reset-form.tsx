'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from 'next/image'
import { ArrowLeft, Check, Eye, EyeOff } from 'lucide-react'

export function ResetForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    // Pega o email e token da URL
    const emailParam = searchParams?.get('email')
    const tokenParam = searchParams?.get('token')
    
    if (!emailParam || !tokenParam) {
      router.push('/forgot-password')
      return
    }
    
    setEmail(emailParam)
    setToken(tokenParam)
  }, [searchParams, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Validação da senha
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          token,
          password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao redefinir a senha')
      }

      setSuccess(true)
      
      // Redireciona para a tela de login após 3 segundos
      setTimeout(() => {
        router.push('/login')
      }, 3000)

    } catch (error) {
      console.error('Erro ao redefinir senha:', error)
      setError(error instanceof Error ? error.message : 'Erro ao redefinir a senha')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#2D1810] relative">
      {/* Botão Voltar */}
      <Button
        onClick={() => router.push('/forgot-password/verify?email=' + encodeURIComponent(email))}
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
            <h1 className="text-4xl font-bold tracking-tighter">Nova Senha</h1>
            <p className="text-lg text-white/90">
              Você está na etapa final! Defina uma nova senha segura para sua conta.
            </p>
          </div>
          <div className="bg-[#2D1810]/20 p-4 rounded-lg backdrop-blur-sm border border-white/10 mt-8">
            <h3 className="font-semibold text-white">Dica de segurança</h3>
            <p className="text-sm text-white/80">
              Use uma senha forte com letras maiúsculas, minúsculas, números e caracteres especiais.
            </p>
          </div>
        </div>
      </div>

      {/* Formulário de Redefinição */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <div className="md:hidden flex justify-center mb-8">
              <Image
                src="/images/logo.png"
                alt="Confeitech Logo"
                width={120}
                height={120}
                className="animate-fade-in"
                priority
              />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Defina sua nova senha
            </h2>
            <p className="text-gray-300">
              Crie uma senha segura para sua conta
            </p>
          </div>

          {success ? (
            <div className="bg-[#0B7A48]/20 border-l-4 border-[#0B7A48] p-4 rounded-lg text-center">
              <div className="flex justify-center mb-3">
                <div className="bg-[#0B7A48] rounded-full p-2">
                  <Check className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-[#0B7A48] font-medium">Senha alterada com sucesso!</p>
              <p className="text-gray-300 text-sm mt-1">
                Sua senha foi atualizada. Redirecionando para a tela de login...
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
                  <label htmlFor="password" className="text-sm font-medium text-gray-300">
                    Nova senha
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10"
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300">
                    Confirme sua nova senha
                  </label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite novamente a senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    minLength={6}
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
                    Alterando senha...
                  </span>
                ) : (
                  'Alterar senha'
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
} 