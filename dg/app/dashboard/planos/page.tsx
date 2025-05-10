'use client'

import { useState, useEffect, forwardRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { TipoPlano, UserStatus } from '@/src/entities/User'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { IMaskInput } from 'react-imask'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const planos = [
  {
    id: TipoPlano.BASICO,
    nome: 'Plano Básico',
    preco: 39.50,
    recursos: [
      'Controle de ingredientes',
      'Controle apenas de UMA receita',
      'Custo e precificação da receita',
      'Plataforma amigável, fácil de entender',
      'Suas receitas salvas em ambiente seguro'
    ]
  },
  {
    id: TipoPlano.PRO,
    nome: 'Plano PRO',
    preco: 47.50,
    recursos: [
      'Controle completo de ingredientes e estoque',
      'Gerenciamento de TODAS as receitas',
      'Calculadora avançada de preços e custos',
      'Simulador de orçamentos',
      'Atualização automática de preços',
      'Sistema de apoio à decisão',
      'Interface intuitiva e amigável',
      'IA para cozinheiros - Em breve',
      'Tendencia culinaria -  Em breve',
      'Produtos em alta -  Em breve',
      'Receitas mais buscadas -  Em breve',
      'Cursos -  Em breve'
    ]
  }
]

const formSchema = z.object({
  cartao: z.object({
    nome: z.string().min(1, 'Nome é obrigatório'),
    numero: z.string().min(16, 'Número do cartão inválido'),
    mes: z.string().min(2, 'Mês inválido'),
    ano: z.string().min(2, 'Ano inválido'),
    cvv: z.string().min(3, 'CVV inválido')
  }),
  cep: z.string().min(8, 'CEP inválido'),
  numero: z.string().min(1, 'Número é obrigatório'),
  telefone: z.string().min(10, 'Telefone inválido')
})

type FormData = z.infer<typeof formSchema>

const CustomIMaskInput = forwardRef((props: any, ref: any) => (
  <IMaskInput
    {...props}
    inputRef={ref}
  />
))
CustomIMaskInput.displayName = 'CustomIMaskInput'

export const dynamic = 'force-dynamic'

export default function PlanosPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login')
    },
  })

  const router = useRouter()
  const [planoSelecionado, setPlanoSelecionado] = useState<TipoPlano | null>(null)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cartao: {
        nome: '',
        numero: '',
        mes: '',
        ano: '',
        cvv: ''
      },
      cep: '',
      numero: '',
      telefone: ''
    }
  })

  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        setError(null)
        const response = await fetch('/api/usuario/status')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao buscar status do usuário')
        }

        setUserStatus(data.status)
        
        // Redireciona usuários ativos para o dashboard
        if (data.status === UserStatus.ATIVO) {
          router.push('/dashboard')
          return
        }
      } catch (error) {
        console.error('Erro ao buscar status:', error)
        setError(error instanceof Error ? error.message : 'Erro ao verificar status do usuário')
        toast.error('Erro ao verificar status do usuário')
      }
    }

    if (session?.user) {
      fetchUserStatus()
    }
  }, [session, router])

  if (status === 'loading' || (userStatus === null && !error)) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  }

  // Não renderiza nada enquanto redireciona
  if (userStatus === UserStatus.ATIVO) {
    return null
  }

  const isInactive = userStatus === UserStatus.INATIVO

  const onSubmit = async (formData: FormData) => {
    if (!planoSelecionado || !session?.user) {
      toast.error('Selecione um plano para continuar')
      return
    }

    try {
      setLoading(true)
      const planoEscolhido = planos.find(p => p.id === planoSelecionado)
      
      const response = await fetch('/api/assinatura/atualizar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          plano: planoSelecionado,
          valorPlano: planoEscolhido?.preco,
          cartao: formData.cartao,
          cep: formData.cep.replace(/\D/g, ''),
          numero: formData.numero,
          telefone: formData.telefone.replace(/\D/g, ''),
          email: session.user.email,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao atualizar plano')
      }

      toast.success('Assinatura realizada com sucesso! Você precisa fazer login novamente para ativar seu plano.')
      
      // Aguarda um momento antes de redirecionar
      setTimeout(async () => {
        await signOut({ 
          callbackUrl: '/login'
        })
      }, 1500)
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao realizar assinatura')
    } finally {
      setLoading(false)
    }
  }

  const handlePlanoClick = (plano: TipoPlano) => {
    setPlanoSelecionado(plano)
    setShowForm(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Olá,</span>
              <span className="font-medium">{session?.user?.name}</span>
            </div>
            <Button
              variant="ghost"
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              Sair do sistema
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isInactive && (
          <div className="max-w-3xl mx-auto mb-8">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-center">
                Sua conta está inativa. Por favor, escolha um plano para continuar usando o sistema.
              </p>
            </div>
          </div>
        )}
        
        <div className="max-w-3xl mx-auto mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-3">Escolha seu plano</h1>
          <p className="text-lg text-muted-foreground">
            Selecione o plano que melhor atende às suas necessidades
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {planos.map((plano) => (
            <Card 
              key={plano.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                planoSelecionado === plano.id
                  ? 'ring-2 ring-primary shadow-lg'
                  : 'hover:ring-2 hover:ring-primary/50'
              }`}
              onClick={() => handlePlanoClick(plano.id)}
            >
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl mb-4">{plano.nome}</CardTitle>
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-bold text-primary">
                    {plano.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                  <span className="text-sm text-muted-foreground">/mês</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plano.recursos.map((recurso) => (
                    <li key={recurso} className="flex items-center gap-2">
                      <svg
                        className="h-5 w-5 text-primary flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-muted-foreground">{recurso}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full" 
                  variant={planoSelecionado === plano.id ? "default" : "outline"}
                >
                  {planoSelecionado === plano.id ? "Plano Selecionado" : "Selecionar Plano"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {showForm && (
          <Card className="mt-12 max-w-3xl mx-auto bg-white shadow-lg">
            <CardHeader className="text-center border-b bg-gray-50">
              <CardTitle className="text-2xl">Dados do pagamento</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Preencha os dados abaixo para confirmar sua assinatura
              </p>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Seção do Cartão */}
                <div>
                  <h3 className="text-lg font-medium mb-6 pb-2 border-b">Dados do Cartão</h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="cartao.nome" className="text-sm font-medium text-gray-700">
                        Nome no cartão
                      </Label>
                      <Controller
                        name="cartao.nome"
                        control={control}
                        render={({ field }) => (
                          <Input 
                            id="cartao.nome" 
                            placeholder="Nome como está no cartão"
                            className="h-11 bg-background border-gray-300 text-gray-900 focus:border-primary"
                            {...field} 
                          />
                        )}
                      />
                      {errors.cartao?.nome && (
                        <p className="text-sm text-destructive">{errors.cartao.nome.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cartao.numero" className="text-sm font-medium text-gray-700">
                        Número do cartão
                      </Label>
                      <Controller
                        name="cartao.numero"
                        control={control}
                        render={({ field }) => (
                          <CustomIMaskInput
                            {...field}
                            id="cartao.numero"
                            placeholder="0000 0000 0000 0000"
                            mask="0000 0000 0000 0000"
                            className="flex h-11 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-gray-900 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        )}
                      />
                      {errors.cartao?.numero && (
                        <p className="text-sm text-destructive">{errors.cartao.numero.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cartao.mes" className="text-sm font-medium text-gray-700">
                          Mês
                        </Label>
                        <Controller
                          name="cartao.mes"
                          control={control}
                          render={({ field }) => (
                            <CustomIMaskInput
                              {...field}
                              id="cartao.mes"
                              placeholder="MM"
                              mask="00"
                              className="flex h-11 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-gray-900 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          )}
                        />
                        {errors.cartao?.mes && (
                          <p className="text-sm text-destructive">{errors.cartao.mes.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cartao.ano" className="text-sm font-medium text-gray-700">
                          Ano
                        </Label>
                        <Controller
                          name="cartao.ano"
                          control={control}
                          render={({ field }) => (
                            <CustomIMaskInput
                              {...field}
                              id="cartao.ano"
                              placeholder="AA"
                              mask="00"
                              className="flex h-11 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-gray-900 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          )}
                        />
                        {errors.cartao?.ano && (
                          <p className="text-sm text-destructive">{errors.cartao.ano.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cartao.cvv" className="text-sm font-medium text-gray-700">
                          CVV
                        </Label>
                        <Controller
                          name="cartao.cvv"
                          control={control}
                          render={({ field }) => (
                            <CustomIMaskInput
                              {...field}
                              id="cartao.cvv"
                              placeholder="000"
                              mask="000"
                              className="flex h-11 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-gray-900 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          )}
                        />
                        {errors.cartao?.cvv && (
                          <p className="text-sm text-destructive">{errors.cartao.cvv.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seção de Endereço e Contato */}
                <div>
                  <h3 className="text-lg font-medium mb-6 pb-2 border-b">Endereço e Contato</h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="cep" className="text-sm font-medium text-gray-700">
                          CEP
                        </Label>
                        <Controller
                          name="cep"
                          control={control}
                          render={({ field }) => (
                            <CustomIMaskInput
                              {...field}
                              id="cep"
                              placeholder="00000-000"
                              mask="00000-000"
                              className="flex h-11 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-gray-900 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          )}
                        />
                        {errors.cep && (
                          <p className="text-sm text-destructive">{errors.cep.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="numero" className="text-sm font-medium text-gray-700">
                          Número
                        </Label>
                        <Controller
                          name="numero"
                          control={control}
                          render={({ field }) => (
                            <Input 
                              id="numero" 
                              placeholder="123"
                              className="h-11 bg-background border-gray-300 text-gray-900 focus:border-primary"
                              {...field} 
                            />
                          )}
                        />
                        {errors.numero && (
                          <p className="text-sm text-destructive">{errors.numero.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telefone" className="text-sm font-medium text-gray-700">
                        Telefone
                      </Label>
                      <Controller
                        name="telefone"
                        control={control}
                        render={({ field }) => (
                          <CustomIMaskInput
                            {...field}
                            id="telefone"
                            placeholder="(00) 00000-0000"
                            mask="(00) 00000-0000"
                            className="flex h-11 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-gray-900 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        )}
                      />
                      {errors.telefone && (
                        <p className="text-sm text-destructive">{errors.telefone.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90" 
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? 'Processando...' : 'Confirmar assinatura'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 