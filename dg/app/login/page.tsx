'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import WhatsAppFloat from '@/components/WhatsAppFloat'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      console.log('Iniciando processo de login...')
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      console.log('Resultado do login:', result)

      if (result?.error) {
        console.error('Erro de login:', result.error)
        if (result.error === 'Usuário não encontrado' || result.error === 'Senha incorreta') {
          setError('Email ou senha incorretos')
        } else {
          setError(result.error)
        }
        setIsLoading(false)
        return
      }

      if (result?.ok) {
        console.log('Login bem-sucedido, redirecionando para dashboard...')
        // Mantém o loading ativo durante o redirecionamento
        router.push('/dashboard')
        return
      }
    } catch (err) {
      console.error('Erro no login:', err)
      setError('Ocorreu um erro ao tentar fazer login. Tente novamente.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#2D1810] relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-[#2D1810]/95 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center space-y-6">
            {/* Logo animado */}
            <div className="relative">
              <Image
                src="/images/logo.png"
                alt="Doce Gestão Logo"
                width={120}
                height={120}
                className="animate-pulse"
                priority
              />
              {/* Efeito de brilho */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            </div>
            
            {/* Texto de carregamento */}
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-white">Doce Gestão</h3>
              <p className="text-[#0B7A48] font-medium">Entrando no sistema...</p>
            </div>
            
            {/* Spinner personalizado */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-[#0B7A48]/30 rounded-full"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-[#0B7A48] rounded-full border-t-transparent animate-spin"></div>
              </div>
            </div>
            
            {/* Dots animados */}
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 bg-[#0B7A48] rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-[#0B7A48] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-[#0B7A48] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Botão Voltar */}
      <Button
        onClick={() => router.push('/')}
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
              alt="Doce Gestão Logo"
              width={110}
              height={110}
              className="animate-fade-in"
              priority
            />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter">Doce Gestão Financeira</h1>
            <p className="text-lg text-white/90">
              Gerencie suas receitas e finanças de forma eficiente e inteligente.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-8">
            <div className="bg-[#2D1810]/20 p-4 rounded-lg backdrop-blur-sm border border-white/10">
              <h3 className="font-semibold text-white">Controle Total</h3>
              <p className="text-sm text-white/80">Gerencie todas suas receitas em um só lugar</p>
            </div>
            <div className="bg-[#2D1810]/20 p-4 rounded-lg backdrop-blur-sm border border-white/10">
              <h3 className="font-semibold text-white">Facilidade</h3>
              <p className="text-sm text-white/80">Gerencie suas finanças de forma fácil e eficiente</p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário de Login */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <div className="md:hidden flex justify-center mb-8">
              <Image
                src="/images/logo.png"
                alt="Doce Gestão Logo"
                width={120}
                height={120}
                className="animate-fade-in"
                priority
              />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Bem-vindo de volta
            </h2>
            <p className="text-gray-300">
              Entre com suas credenciais para acessar
            </p>
          </div>

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
                <label htmlFor="password" className="text-sm font-medium text-gray-300">
                  Senha
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
                <div className="text-right">
                  <Button
                    onClick={() => router.push('/forgot-password')}
                    variant="link"
                    className="text-[#0B7A48] hover:text-[#0B7A48]/80 font-medium px-0 h-auto text-sm"
                  >
                    Esqueceu sua senha?
                  </Button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#0B7A48] text-white hover:bg-[#0B7A48]/80 transition-colors"
              disabled={isLoading}
            >
              Entrar
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-300">
                Não tem uma conta?{' '}
                <Button
                  onClick={() => router.push('/register')}
                  variant="link"
                  className="text-[#0B7A48] hover:text-[#0B7A48]/80 font-medium px-1.5 h-auto"
                >
                  Criar conta aqui
                </Button>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* WhatsApp Float Button */}
      <WhatsAppFloat position="right" />

    </div>
  )
} 