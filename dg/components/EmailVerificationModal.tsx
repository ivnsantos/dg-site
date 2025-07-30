'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { AlertCircle, Check, LogOut } from 'lucide-react'

export default function EmailVerificationModal() {
  const { data: session, update } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<'send' | 'verify'>('send')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutos
  const [isVerified, setIsVerified] = useState(false) // Estado local para controle
  
  // Verifica o status de verificação no banco de dados
  const checkVerificationStatus = async () => {
    if (!session?.user?.email) return false
    
    try {
      const response = await fetch('/api/auth/check-verification-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: session.user.email
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        return data.verified === true
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error)
    }
    
    return false
  }
  
  // Controla a abertura do modal com base na verificação de email
  useEffect(() => {
    const checkStatus = async () => {
      if (session?.user?.email) {
        const isVerifiedInDB = await checkVerificationStatus()
        
        if (isVerifiedInDB) {
          setIsOpen(false)
          setIsVerified(true)
        } else if (session.user.phoneVerified === false && !isVerified) {
          setIsOpen(true)
        } else {
          setIsOpen(false)
        }
      }
    }
    
    checkStatus()
  }, [session, isVerified])
  
  // Timer para o código expirar
  useEffect(() => {
    if (step !== 'verify') return
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [step])
  
  // Formatar tempo no formato MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  // Enviar código de verificação
  const handleSendCode = async () => {
    setError('')
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/phone-verification/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: session?.user?.email
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Erro ao enviar código')
      }
      
      // Avança para o próximo passo
      setStep('verify')
      // Reseta o timer
      setTimeLeft(300)
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao enviar código de verificação')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Validar o código inserido
  const handleVerifyCode = async () => {
    if (code.length !== 5) {
      setError('O código deve ter 5 dígitos')
      return
    }
    
    if (timeLeft === 0) {
      setError('O código expirou. Por favor, solicite um novo código.')
      return
    }
    
    setError('')
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/phone-verification/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: session?.user?.email,
          code
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Código inválido')
      }
      
      // Marca como verificado com sucesso
      setSuccess(true)
      setIsVerified(true) // Marca como verificado localmente
      
      // Atualiza o estado da sessão
      await update({
        ...session,
        user: {
          ...session?.user,
          phoneVerified: true
        }
      })
      
      // Fecha o modal após alguns segundos
      setTimeout(() => {
        setIsOpen(false)
        // Reseta os estados
        setSuccess(false)
        setStep('send')
        setCode('')
        setError('')
        setTimeLeft(300)
      }, 2000)
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao verificar código')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Handler para digitar apenas números no código
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    setCode(value.substring(0, 5))
  }
  
  // Não pode fechar o modal se o email não estiver verificado
  const handleOpenChange = (open: boolean) => {
    if (session?.user?.phoneVerified === false && !isVerified) {
      // Não permite fechar o modal se não estiver verificado
      return
    }
    setIsOpen(open)
  }

  // Função para fazer logout
  const handleLogout = () => {
    signOut({ callbackUrl: '/login' })
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Verificação de Email
          </DialogTitle>
          <DialogDescription>
            Para sua segurança, precisamos verificar seu endereço de email.
          </DialogDescription>
        </DialogHeader>
        
        {success ? (
          <div className="py-6 flex flex-col items-center">
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full mb-4">
              <Check className="h-8 w-8 text-green-600 dark:text-green-500" />
            </div>
            <h3 className="text-lg font-medium mb-2">Email verificado!</h3>
            <p className="text-center text-muted-foreground">
              Seu email foi verificado com sucesso. Você já pode utilizar o sistema.
            </p>
          </div>
        ) : (
          <>
            {step === 'send' ? (
              <div className="py-4">
                <p className="mb-4">
                  Enviaremos um código de verificação para o email cadastrado em sua conta.
                </p>
                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={handleSendCode} 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Enviando...' : 'Enviar código por email'}
                  </Button>
                  
                  <Button 
                    onClick={handleLogout} 
                    variant="outline" 
                    className="w-full flex items-center justify-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair do sistema
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-4 space-y-4">
                <p>
                  Digite abaixo o código de 5 dígitos enviado para seu email.
                </p>
                
                <div>
                  <Input
                    placeholder="12345"
                    value={code}
                    onChange={handleCodeChange}
                    maxLength={5}
                    className="text-center text-xl tracking-widest"
                  />
                  <div className="text-xs text-muted-foreground text-center mt-2">
                    O código expira em <span className={`font-semibold ${timeLeft < 60 ? 'text-red-500' : ''}`}>
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setStep('send')
                      setCode('')
                    }}
                    disabled={isLoading}
                  >
                    Voltar
                  </Button>
                  <Button 
                    className="flex-1" 
                    onClick={handleVerifyCode}
                    disabled={isLoading || code.length !== 5 || timeLeft === 0}
                  >
                    {isLoading ? 'Verificando...' : 'Verificar'}
                  </Button>
                </div>
                
                <Button 
                  onClick={handleLogout} 
                  variant="outline" 
                  className="w-full flex items-center justify-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut className="h-4 w-4" />
                  Sair do sistema
                </Button>
                
                {timeLeft === 0 && (
                  <Button 
                    onClick={handleSendCode} 
                    variant="outline" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Enviando...' : 'Solicitar novo código'}
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
} 