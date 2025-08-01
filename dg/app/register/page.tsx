'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import Image from 'next/image'
import { ArrowLeft, Check } from 'lucide-react'
import WhatsAppFloat from '@/components/WhatsAppFloat'

const PLANOS = [
  {
    id: 'BASICO',
    nome: 'Plano Básico',
    preco: 'R$ 40,99',
    recursos: [
      'Controle de ingredientes',
      'Controle apenas de UMA receita',
      'Custo e precificação da receita',
      'Plataforma amigável, fácil de entender',
      'Suas receitas salvas em ambiente seguro'
    ]
  },
  {
    id: 'PRO',
    nome: 'Plano PRO',
    preco: 'R$ 47,89',
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

export const dynamic = 'force-dynamic'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [cupomStatus, setCupomStatus] = useState('idle')
  const [cupomMessage, setCupomMessage] = useState('')
  const [descontoAplicado, setDescontoAplicado] = useState(0)
  const [success, setSuccess] = useState(false)
  const [cepValidado, setCepValidado] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpfCnpj: '',
    password: '',
    confirmPassword: '',
    plano: 'BASICO',
    cartao: {
      numero: '',
      nome: '',
      validade: '',
      cvv: ''
    },
    cupomDesconto: '',
    telefone: '',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const formatCpfCnpj = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')
    
    // Verifica se é CPF ou CNPJ pelo tamanho
    if (numbers.length <= 11) {
      // Formata como CPF: 000.000.000-00
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    } else {
      // Formata como CNPJ: 00.000.000/0000-00
      return numbers
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    if (name === 'name') {
      setFormData(prev => ({
        ...prev,
        name: value
      }))
      return
    }
    
    if (name === 'cpfCnpj') {
      // Limita o tamanho e aplica a formatação
      const numbers = value.replace(/\D/g, '')
      if (numbers.length <= 14) { // Máximo de 14 dígitos (CNPJ)
        setFormData(prev => ({
          ...prev,
          [name]: formatCpfCnpj(value)
        }))
      }
      return
    }
    
    if (name === 'telefone') {
      const numbers = value.replace(/\D/g, '')
      let formattedValue = numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .substring(0, 15)
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }))
      return
    }

    if (name === 'cep') {
      const numbers = value.replace(/\D/g, '')
      let formattedValue = numbers
        .replace(/(\d{5})(\d)/, '$1-$2')
        .substring(0, 9)
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }))
      
      // Quando o CEP tiver 8 dígitos, busca o endereço
      if (numbers.length === 8) {
        buscarEnderecoPorCep(numbers)
      }
      return
    }
    
    if (name === 'endereco') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
      return
    }
    
    if (name === 'numero') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
      return
    }
    
    if (name === 'complemento') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
      return
    }
    
    if (name === 'bairro') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
      return
    }
    
    if (name === 'email') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
      return
    }
    
    if (name === 'password') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
      return
    }
    
    if (name === 'confirmPassword') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
      return
    }
    
    if (name === 'plano') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
      return
    }
    
    if (name === 'cartao.numero') {
      const numbers = value.replace(/\D/g, '')
      let formattedValue = numbers
        .replace(/(\d{4})(\d)/, '$1 $2')
        .replace(/(\d{4})(\d)/, '$1 $2')
        .replace(/(\d{4})(\d)/, '$1 $2')
        .substring(0, 19)
      setFormData(prev => ({
        ...prev,
        cartao: {
          ...prev.cartao,
          numero: formattedValue
        }
      }))
      return
    }
    
    if (name === 'cartao.nome') {
      setFormData(prev => ({
        ...prev,
        cartao: {
          ...prev.cartao,
          nome: value
        }
      }))
      return
    }
    
    if (name === 'cartao.validade') {
      // Verificar se o usuário está apagando (backspace/delete)
      // Se o valor for menor que o valor anterior, está apagando
      const isDeletingChar = value.length < formData.cartao.validade.length;
      
      // Se estiver apagando e o valor atual tem formato MM/, remover a barra também
      if (isDeletingChar && formData.cartao.validade.endsWith('/') && value.length === 2) {
        setFormData(prev => ({
          ...prev,
          cartao: {
            ...prev.cartao,
            validade: value.substring(0, 2)
          }
        }));
        return;
      }
      
      const numbers = value.replace(/\D/g, '');
      let formattedValue = numbers;
      
      // Se tiver pelo menos 2 dígitos, insere a barra após o mês
      if (numbers.length >= 2) {
        formattedValue = numbers.substring(0, 2) + '/' + numbers.substring(2, 4);
        formattedValue = formattedValue.substring(0, 5);
        
        // Validação básica do mês (01-12)
        const month = parseInt(numbers.substring(0, 2));
        if (month > 12) {
          formattedValue = '12/' + formattedValue.substring(3, 5);
        }
        if (month === 0) {
          formattedValue = '01/' + formattedValue.substring(3, 5);
        }
      }

      setFormData(prev => ({
        ...prev,
        cartao: {
          ...prev.cartao,
          validade: formattedValue
        }
      }));
      return;
    }
    
    if (name === 'cartao.cvv') {
      const numbers = value.replace(/\D/g, '')
      setFormData(prev => ({
        ...prev,
        cartao: {
          ...prev.cartao,
          cvv: numbers.substring(0, 4)
        }
      }))
      return
    }
    
    if (name === 'cupomDesconto') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
      return
    }
  }

  // Função para buscar endereço pelo CEP
  const buscarEnderecoPorCep = async (cep: string) => {
    try {
      setLoading(true)
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await response.json()
      
      if (data.erro) {
        setError('CEP não encontrado')
        return
      }
      
      // Preenche os campos de endereço com os dados retornados da API
      setFormData(prev => ({
        ...prev,
        endereco: data.logradouro || prev.endereco,
        bairro: data.bairro || prev.bairro,
        complemento: prev.complemento || data.complemento || ''
      }))
      
      setError('')
      // Define que o CEP foi validado, permitindo mostrar o restante do formulário
      setCepValidado(true)
    } catch (err) {
      console.error('Erro ao buscar CEP:', err)
      setError('Erro ao buscar o CEP, por favor tente novamente')
    } finally {
      setLoading(false)
    }
  }

  const validateCpfCnpj = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length !== 11 && numbers.length !== 14) {
      return 'CPF ou CNPJ inválido'
    }
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (step === 1) {
      const cpfCnpjError = validateCpfCnpj(formData.cpfCnpj)
      if (cpfCnpjError) {
        setError(cpfCnpjError)
        return
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('As senhas não coincidem')
        return
      }

      if (formData.password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres')
        return
      }

      // Validar campos obrigatórios
      if (!formData.name || !formData.email || !formData.cpfCnpj || 
          !formData.telefone || !formData.cep || !formData.endereco || 
          !formData.numero || !formData.bairro) {
        setError('Por favor, preencha todos os campos obrigatórios')
        return
      }

      setError('')
      setStep(2)
      return
    }

    if (step === 2) {
      setError('')
      setStep(3)
      return
    }

    if (step === 3) {
      setError('')
      setLoading(true)

      try {
        const [mes, ano] = formData.cartao.validade.split('/')
        
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            cpfCnpj: formData.cpfCnpj,
            password: formData.password,
            plano: formData.plano,
            cupomDesconto: formData.cupomDesconto,
            // Dados do cartão
            cartao: {
              nome: formData.cartao.nome,
              numero: formData.cartao.numero.replace(/\s/g, ''),
              mes,
              ano,
              cvv: formData.cartao.cvv
            },
            // Dados de endereço
            telefone: formData.telefone.replace(/\D/g, ''),
            cep: formData.cep.replace(/\D/g, ''),
            endereco: formData.endereco,
            numero: formData.numero,
            complemento: formData.complemento || '',
            bairro: formData.bairro
          })
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Erro ao criar usuário')
        }

        // Mostra mensagem de sucesso
        setSuccess(true)
        setError('')
        
        // Redireciona para o login após 2 segundos
        setTimeout(() => {
          router.push('/login')
        }, 2500)

      } catch (error) {
        console.error('Erro ao processar registro:', error)
        setError(error instanceof Error ? error.message : 'Erro ao processar registro')
      } finally {
        setLoading(false)
      }
    }
  }

  const handlePlanoChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      plano: value
    }))
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-300">Nome completo</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Digite seu nome completo"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-300">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="seu@email.com"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpfCnpj" className="text-sm font-medium text-gray-300">CPF ou CNPJ</Label>
              <Input
                id="cpfCnpj"
                name="cpfCnpj"
                value={formData.cpfCnpj}
                onChange={handleChange}
                required
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone" className="text-sm font-medium text-gray-300">Telefone</Label>
              <Input
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cep" className="text-sm font-medium text-gray-300">CEP</Label>
              <Input
                id="cep"
                name="cep"
                value={formData.cep}
                onChange={handleChange}
                placeholder="00000-000"
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
              />
              <p className="text-xs text-gray-400">Digite seu CEP para buscarmos seu endereço automaticamente</p>
            </div>

            {cepValidado && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="endereco" className="text-sm font-medium text-gray-300">Endereço</Label>
                  <Input
                    id="endereco"
                    name="endereco"
                    value={formData.endereco}
                    onChange={handleChange}
                    required
                    placeholder="Rua, Avenida, etc"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numero" className="text-sm font-medium text-gray-300">Número</Label>
                    <Input
                      id="numero"
                      name="numero"
                      value={formData.numero}
                      onChange={handleChange}
                      required
                      placeholder="123"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="complemento" className="text-sm font-medium text-gray-300">Complemento</Label>
                    <Input
                      id="complemento"
                      name="complemento"
                      value={formData.complemento}
                      onChange={handleChange}
                      placeholder="Apto, Sala, etc"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bairro" className="text-sm font-medium text-gray-300">Bairro</Label>
                  <Input
                    id="bairro"
                    name="bairro"
                    value={formData.bairro}
                    onChange={handleChange}
                    required
                    placeholder="Nome do bairro"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-300">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Mínimo 6 caracteres"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300">Confirme sua senha</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Digite a senha novamente"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                minLength={6}
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white text-center">Escolha seu plano</h3>
            <RadioGroup
              value={formData.plano}
              onValueChange={handlePlanoChange}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {PLANOS.map((plano) => (
                <div key={plano.id} className="relative">
                  <RadioGroupItem
                    value={plano.id}
                    id={plano.id}
                    className="sr-only"
                  />
                  {plano.id === 'PRO' && (
                    <div className="absolute -top-2 -right-2 bg-[#0B7A48] text-white px-4 py-1 rounded-lg transform rotate-12 shadow-lg z-10">
                      <span className="text-sm font-bold">MAIS ASSINADO</span>
                    </div>
                  )}
                  <Label
                    htmlFor={plano.id}
                    className={`block p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${formData.plano === plano.id
                        ? 'border-[#0B7A48] bg-[#0B7A48]/10'
                        : 'border-white/20 hover:border-white/40'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-medium text-white flex items-center">
                          {plano.nome}
                          {plano.id === 'PRO' && (
                            <span className="ml-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-sm py-1 px-2 rounded-full font-bold">
                              PRO
                            </span>
                          )}
                        </h4>
                        <p className="text-2xl font-bold text-[#0B7A48] mt-2">{plano.preco}</p>
                        {plano.id === 'PRO' && (
                          <p className="text-[#0B7A48] font-semibold mt-1">Para confeiteiros TOPs</p>
                        )}
                      </div>
                      {formData.plano === plano.id && (
                        <Check className="h-5 w-5 text-[#0B7A48]" />
                      )}
                    </div>
                    <ul className="mt-4 space-y-2">
                      {plano.recursos.map((recurso, index) => (
                        <li key={index} className="text-sm text-gray-300 flex items-center">
                          <Check className="h-4 w-4 text-[#0B7A48] mr-2" />
                          {recurso}
                        </li>
                      ))}
                    </ul>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white text-center">Dados do Pagamento</h3>
            
            {/* Mensagem de período gratuito */}
            <div className="bg-[#0B7A48]/20 p-4 rounded-lg border border-[#0B7A48]/30 mb-6">
              <div className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#0B7A48] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-[#0B7A48] font-semibold">7 dias grátis!</h4>
                  <p className="text-sm text-gray-300">Você terá 7 dias para experimentar o sistema sem compromisso. A primeira cobrança só será realizada após este período.</p>
                </div>
              </div>
            </div>
            
            {/* Resumo do plano escolhido */}
            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 mb-8">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-white">
                    {PLANOS.find(p => p.id === formData.plano)?.nome}
                    {formData.plano === 'PRO' && (
                      <span className="ml-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-sm py-1 px-2 rounded-full font-bold">
                        PRO
                      </span>
                    )}
                  </h4>
                  <p className="text-sm text-gray-300 mt-1">Cobrança mensal</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {PLANOS.find(p => p.id === formData.plano)?.preco}
                  </div>
                  <p className="text-sm text-gray-300">por mês</p>
                </div>
              </div>
              
              {/* Campo de Cupom */}
              <div className="border-t border-white/10 pt-4 mt-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      id="cupomDesconto"
                      name="cupomDesconto"
                      type="text"
                      placeholder="Tem um cupom de desconto?"
                      value={formData.cupomDesconto || ''}
                      onChange={handleChange}
                      className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-400 uppercase"
                      maxLength={20}
                    />
                    {cupomMessage && (
                      <p className={`text-sm mt-1 ${
                        cupomStatus === 'success' ? 'text-green-400' : 
                        cupomStatus === 'error' ? 'text-red-400' : 
                        'text-gray-400'
                      }`}>
                        {cupomMessage}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    className={`px-6 font-medium transition-all duration-200 ${
                      cupomStatus === 'loading' ? 'bg-gray-600 cursor-not-allowed' :
                      cupomStatus === 'success' ? 'bg-green-600 hover:bg-green-700' :
                      'bg-[#0B7A48] hover:bg-[#0B7A48]/80'
                    } text-white shadow-lg hover:shadow-xl`}
                    disabled={cupomStatus === 'loading'}
                    onClick={async () => {
                      if (!formData.cupomDesconto) {
                        setCupomStatus('error')
                        setCupomMessage('Digite um cupom válido')
                        return
                      }

                      setCupomStatus('loading')
                      setCupomMessage('Validando cupom...')

                      try {
                        const response = await fetch(`/api/cupons/${formData.cupomDesconto}`)
                        const data = await response.json()

                        if (!response.ok) throw new Error(data.message)

                        if (data.status !== 'ATIVO') {
                          setCupomStatus('error')
                          setCupomMessage(data.status === 'EXPIRADO' ? 'Cupom expirado' : 'Cupom inativo')
                          setDescontoAplicado(0)
                          return
                        }

                        setDescontoAplicado(data.desconto)
                        setCupomStatus('success')
                        setCupomMessage(`Cupom aplicado! ${data.desconto}% de desconto`)
                      } catch (err) {
                        setCupomStatus('error')
                        setCupomMessage('Cupom inválido')
                        setDescontoAplicado(0)
                      }
                    }}
                  >
                    {cupomStatus === 'loading' ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Validando
                      </span>
                    ) : cupomStatus === 'success' ? (
                      'Aplicado!'
                    ) : (
                      'Aplicar'
                    )}
                  </Button>
                </div>
              </div>

              {/* Exibição do valor com desconto */}
              {descontoAplicado > 0 && (
                <div className="mt-4 space-y-1">
                  <div className="flex justify-between items-center text-sm text-gray-300">
                    <span>Subtotal:</span>
                    <span>{PLANOS.find(p => p.id === formData.plano)?.preco}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-green-400">
                    <span>Desconto ({descontoAplicado}%):</span>
                    <span>-R$ {(
                      Number(PLANOS.find(p => p.id === formData.plano)?.preco.replace('R$ ', '').replace(',', '.')) * 
                      (descontoAplicado / 100)
                    ).toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold text-white pt-2 border-t border-white/10">
                    <span>Total:</span>
                    <span>R$ {(
                      Number(PLANOS.find(p => p.id === formData.plano)?.preco.replace('R$ ', '').replace(',', '.')) * 
                      (1 - descontoAplicado / 100)
                    ).toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-medium text-white">Dados do Cartão</h4>
              <div className="space-y-2">
                <label htmlFor="cartao.numero" className="text-sm font-medium text-gray-300">
                  Número do Cartão
                </label>
                <Input
                  id="cartao.numero"
                  name="cartao.numero"
                  type="text"
                  required
                  placeholder="1234 5678 9012 3456"
                  value={formData.cartao.numero}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  maxLength={19}
                  autoComplete="cc-number"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="cartao.nome" className="text-sm font-medium text-gray-300">
                  Nome no Cartão
                </label>
                <Input
                  id="cartao.nome"
                  name="cartao.nome"
                  type="text"
                  required
                  placeholder="Como está no cartão"
                  value={formData.cartao.nome}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  autoComplete="cc-name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="cartao.validade" className="text-sm font-medium text-gray-300">
                    Validade
                  </label>
                  <Input
                    id="cartao.validade"
                    name="cartao.validade"
                    type="text"
                    required
                    placeholder="MM/AA"
                    value={formData.cartao.validade}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    maxLength={5}
                    autoComplete="cc-exp"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="cartao.cvv" className="text-sm font-medium text-gray-300">
                    CVV
                  </label>
                  <Input
                    id="cartao.cvv"
                    name="cartao.cvv"
                    type="text"
                    required
                    placeholder="123 ou 1234"
                    value={formData.cartao.cvv}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    maxLength={4}
                    autoComplete="cc-csc"
                  />
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#2D1810] relative">
      {/* Mensagem de Sucesso */}
      {success && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-[#0B7A48] text-white p-6 rounded-lg shadow-xl flex items-center gap-3 animate-fade-in">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <h4 className="font-semibold text-lg">Cadastro realizado com sucesso!</h4>
              <p className="text-white/90">Redirecionando para o login...</p>
            </div>
          </div>
        </div>
      )}

      {/* Botão Voltar */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <Button
          onClick={() => step > 1 ? setStep(step - 1) : router.push('/')}
          variant="ghost"
          className="text-white hover:bg-white/10 flex items-center"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          {step > 1 ? 'Voltar uma etapa' : 'Início'}
        </Button>
        {step > 1 && (
          <Button
            onClick={() => setStep(1)}
            variant="outline"
            className="bg-white/5 border-[#0B7A48] text-white hover:bg-[#0B7A48]/20 flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Voltar para dados pessoais
          </Button>
        )}
      </div>

      {/* Seção Verde */}
      <div className="hidden md:flex md:w-1/2 bg-[#0B7A48] items-center justify-center p-8">
        <div className="text-white max-w-md space-y-8">
          <div className="flex justify-center mb-8">
            <Image
              src="/images/logo.png"
              alt="Doce Gestão Logo"
              width={120}
              height={120}
              className="animate-fade-in"
              priority
            />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter">Doce Gestão - Sistema de Gestão para Confeitaria e afins</h1>
            <p className="text-lg text-white/90">
              Comece agora a gerenciar suas receitas e finanças de forma profissional.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-8">
            <div className="bg-[#2D1810]/20 p-4 rounded-lg backdrop-blur-sm border border-white/10">
              <h3 className="font-semibold text-white">Comece Agora Mesmo</h3>
              <p className="text-sm text-white/80">Experimente e comece a gerenciar suas receitas e finanças de forma profissional.</p>
            </div>
            <div className="bg-[#2D1810]/20 p-4 rounded-lg backdrop-blur-sm border border-white/10">
              <h3 className="font-semibold text-white">Suporte Total</h3>
              <p className="text-sm text-white/80">Ajuda especializada para suas dúvidas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário de Registro */}
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
              {step === 1 && 'Crie sua conta'}
              {step === 2 && 'Escolha seu plano'}
              {step === 3 && 'Dados de pagamento'}
            </h2>
            <p className="text-gray-300">
              {step === 1 && 'Comece sua jornada de sucesso na confeitaria'}
              {step === 2 && 'Selecione o melhor plano para você'}
              {step === 3 && 'Insira os dados do seu cartão'}
            </p>

            {/* Indicador de Progresso */}
            <div className="flex justify-center items-center space-x-2 mt-4">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all ${s === step ? 'w-8 bg-[#0B7A48]' : 'w-2 bg-white/20'}`}
                />
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-900/30 border border-red-500 p-4 rounded-lg flex items-start gap-3 animate-shake">
                <div className="min-w-[20px] mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 text-red-500">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <div>
                  <p className="text-red-500 font-medium mb-1">Ops! Algo deu errado</p>
                  <p className="text-red-400/90 text-sm">{error}</p>
                </div>
              </div>
            )}

            {renderStep()}

            <Button
              type="submit"
              className="w-full bg-[#0B7A48] hover:bg-[#0B7A48]/80 text-white"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {step === 3 ? 'Criando conta...' : 'Carregando...'}
                </span>
              ) : (
                step === 3 ? 'Criar conta' : 'Continuar'
              )}
            </Button>

            {step === 1 && (
              <div className="text-center">
                <p className="text-sm text-gray-300">
                  Já tem uma conta?{' '}
                  <Button
                    onClick={() => router.push('/login')}
                    variant="link"
                    className="text-[#0B7A48] hover:text-[#0B7A48]/80 font-medium px-1.5 h-auto"
                  >
                    Fazer login aqui
                  </Button>
                </p>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* WhatsApp Float Button */}
      <WhatsAppFloat position="right" />
    </div>
  )
} 