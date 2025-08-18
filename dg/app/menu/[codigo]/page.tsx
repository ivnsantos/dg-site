'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { QRCodeCanvas } from 'qrcode.react'
import { Plus, Minus, ShoppingCart, X, Check, User, MapPin, Phone, Trash2, RefreshCw, Search } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import DoceGestaoLoading from '@/components/ui/DoceGestaoLoading'

interface MenuItem {
  id: number
  name: string
  description: string
  price: number | string
  available: boolean
  position: number
  imageUrl?: string
}

interface MenuSection {
  id: number
  title: string
  description: string
  imageUrl: string
  position: number
  items: MenuItem[]
}

interface Menu {
  id: number
  name: string
  description: string
  imageUrl: string
  imageUrlBackground?: string
  telefone?: string
  instagram?: string
  template: string
  status: string
  sections: MenuSection[]
  valorFrete?: number
  fazEntregas?: boolean
}

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  imageUrl?: string
  observation?: string
}

interface ClienteDG {
  id: number
  nome: string
  telefone: string
  ativo: boolean
  createdAt: Date
  updatedAt: Date
}

interface EnderecoDG {
  id: number
  clienteId: number
  cep?: string
  endereco: string
  bairro: string
  cidade: string
  estado: string
  complemento?: string
  referencia?: string
  ativo: boolean
  createdAt: Date
  updatedAt: Date
}

interface EnderecoCEP {
  cep: string
  endereco: string
  numero: string
  bairro: string
  cidade: string
  estado: string
}

export default function MenuPublicoPage() {
  const params = useParams()
  const codigo = params?.codigo as string
  const [menu, setMenu] = useState<Menu | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  
  // Estados para o fluxo de cliente
  const [clientPhone, setClientPhone] = useState('')
  const [searchingClient, setSearchingClient] = useState(false)
  const [clientFound, setClientFound] = useState<ClienteDG | null>(null)
  const [showClientForm, setShowClientForm] = useState(false)
  const [clientFormData, setClientFormData] = useState({
    nome: '',
    telefone: '',
    cep: '',
    endereco: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    complemento: '',
    referencia: ''
  })
  const [loadingCEP, setLoadingCEP] = useState(false)
  
  // Estados para múltiplos endereços
  const [enderecosCliente, setEnderecosCliente] = useState<EnderecoDG[]>([])
  const [enderecoSelecionado, setEnderecoSelecionado] = useState<EnderecoDG | null>(null)
  const [mostrarFormNovoEndereco, setMostrarFormNovoEndereco] = useState(false)
  
  // Estado para modal de confirmação
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [enderecoParaRemover, setEnderecoParaRemover] = useState<EnderecoDG | null>(null)

  // Estado para forma de entrega
  const [formaEntrega, setFormaEntrega] = useState<'retirada' | 'entrega'>('retirada')
  
  // Efeito para definir forma de entrega padrão baseado na configuração do menu
  useEffect(() => {
    // Só define como 'entrega' se o usuário ainda não fez nenhuma escolha
    // e se o menu oferece entregas
    if (menu?.fazEntregas && formaEntrega === 'retirada') {
      // Não define automaticamente, deixa o usuário escolher
      // setFormaEntrega('entrega')
    } else if (!menu?.fazEntregas) {
      setFormaEntrega('retirada')
    }
  }, [menu?.fazEntregas])

  // Funções do carrinho
  const getItemQuantity = (itemId: number) => {
    const cartItem = cart.find(item => item.id === itemId)
    return cartItem ? cartItem.quantity : 0
  }

  const openObservationModal = (item: MenuItem) => {
    // Função para abrir modal de observação
    // Por enquanto, apenas adiciona ao carrinho
    addToCart(item)
  }

  const addToCart = (item: MenuItem) => {
    if (!item.available) return
    
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id)
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      } else {
        return [...prevCart, {
          id: item.id,
          name: item.name,
          price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
          quantity: 1,
          imageUrl: item.imageUrl,
          observation: ''
        }]
      }
    })
  }

  const removeFromCart = (itemId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId))
  }

  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId)
      return
    }
    
    setCart(prevCart => prevCart.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ))
  }

  const updateObservation = (itemId: number, observation: string) => {
    setCart(prevCart => prevCart.map(item =>
      item.id === itemId ? { ...item, observation } : item
    ))
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPriceWithFrete = () => {
    // Se não faz entregas OU se escolheu retirada, retorna só o preço dos itens
    if (!menu?.fazEntregas || formaEntrega === 'retirada') {
      return getTotalPrice()
    }
    
    // Se escolheu entrega, adiciona o frete
    if (formaEntrega === 'entrega') {
      const frete = Number(menu?.valorFrete || 0)
      return getTotalPrice() + frete
    }
    
    // Padrão: retorna só o preço dos itens
    return getTotalPrice()
  }

  // Funções para busca de CEP
  const buscarCEP = async (cep: string) => {
    if (cep.length !== 8) return
    
    setLoadingCEP(true)
    try {
      console.log('Buscando CEP:', cep)
      const response = await fetch(`/api/cep/${cep}`)
      
      if (response.ok) {
        const data: EnderecoCEP = await response.json()
        console.log('CEP encontrado:', data)
        
        setClientFormData(prev => ({
          ...prev,
          cep: data.cep,
          endereco: data.endereco,
          numero: data.numero,
          bairro: data.bairro,
          cidade: data.cidade,
          estado: data.estado
        }))
      } else {
        const errorData = await response.json()
        console.error('Erro ao buscar CEP:', errorData)
        alert(`Erro ao buscar CEP: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      alert('Erro ao buscar CEP. Tente novamente.')
    } finally {
      setLoadingCEP(false)
    }
  }

  // Função para formatar telefone
  const formatarTelefone = (telefone: string) => {
    // Remove tudo que não é número
    const numeros = telefone.replace(/\D/g, '')
    
    // Aplica máscara (XX) XXXXX-XXXX
    if (numeros.length <= 2) {
      return numeros
    } else if (numeros.length <= 7) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`
    } else if (numeros.length <= 11) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`
    } else {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`
    }
  }

  // Função para limpar telefone (remover máscara)
  const limparTelefone = (telefone: string) => {
    return telefone.replace(/\D/g, '')
  }

  // Função para validar campos obrigatórios
  const validarCamposObrigatorios = () => {
    const camposObrigatorios = {
      nome: clientFormData.nome.trim() !== '',
      telefone: limparTelefone(clientFormData.telefone).length >= 10,
      endereco: clientFormData.endereco.trim() !== '',
      numero: clientFormData.numero.trim() !== '',
      bairro: clientFormData.bairro.trim() !== '',
      cidade: clientFormData.cidade.trim() !== '',
      estado: clientFormData.estado.trim() !== ''
    }
    
    return Object.values(camposObrigatorios).every(campo => campo)
  }

  // Função para verificar se um campo específico é válido
  const isFieldValid = (fieldName: keyof typeof clientFormData) => {
    const value = clientFormData[fieldName]
    if (fieldName === 'telefone') {
      return limparTelefone(value).length >= 10
    }
    if (fieldName === 'numero') {
      return value.trim() !== ''
    }
    return value.trim() !== ''
  }

  // Função para obter a classe CSS de um campo
  const getFieldClass = (fieldName: keyof typeof clientFormData) => {
    const baseClass = "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0B7A48]"
    if (isFieldValid(fieldName)) {
      return `${baseClass} border-green-500`
    }
    if (clientFormData[fieldName].trim() !== '') {
      return `${baseClass} border-red-500`
    }
    return `${baseClass} border-gray-300`
  }

  // Funções para gerenciar cliente
  const buscarCliente = async () => {
    if (!clientPhone || limparTelefone(clientPhone).length < 10) {
      alert('Digite um telefone válido')
      return
    }
    
    setSearchingClient(true)
    try {
      const telefoneLimpo = limparTelefone(clientPhone)
      console.log('Buscando cliente com telefone:', telefoneLimpo)
      
      const response = await fetch(`/api/clientes-dg?telefone=${telefoneLimpo}`)
      if (response.ok) {
        const data = await response.json()
        console.log('Cliente encontrado:', data)
        
        setClientFound(data.cliente)
        
        // Buscar endereços do cliente existente
        const enderecosResponse = await fetch(`/api/clientes-dg/${data.cliente.id}/enderecos`)
        if (enderecosResponse.ok) {
          const enderecosData = await enderecosResponse.json()
          setEnderecosCliente(enderecosData.enderecos || [])
          
          // Se tem endereços, selecionar o primeiro por padrão
          if (enderecosData.enderecos && enderecosData.enderecos.length > 0) {
            setEnderecoSelecionado(enderecosData.enderecos[0])
          }
        }
        
        // Limpar formulário para não interferir com dados do cliente existente
        setClientFormData({
          nome: '',
          telefone: clientPhone,
          cep: '',
          endereco: '',
          numero: '',
          bairro: '',
          cidade: '',
          estado: '',
          complemento: '',
          referencia: ''
        })
        setShowClientForm(false)
        setMostrarFormNovoEndereco(false)
      } else {
        const errorData = await response.json()
        console.log('Cliente não encontrado:', errorData)
        
        setClientFound(null)
        setEnderecosCliente([])
        setEnderecoSelecionado(null)
        setClientFormData(prev => ({ ...prev, telefone: clientPhone }))
        setShowClientForm(true)
        setMostrarFormNovoEndereco(false)
      }
    } catch (error) {
      console.error('Erro ao buscar cliente:', error)
      alert(`Erro ao buscar cliente: ${error instanceof Error ? error.message : 'Tente novamente'}`)
      setClientFound(null)
      setEnderecosCliente([])
      setEnderecoSelecionado(null)
      setShowClientForm(true)
      setMostrarFormNovoEndereco(false)
    } finally {
      setSearchingClient(false)
    }
  }

  const criarCliente = async () => {
    if (!clientFormData.nome || !clientFormData.telefone) {
      alert('Nome e telefone são obrigatórios')
      return null
    }
    
    try {
      const clienteData = {
        nome: clientFormData.nome,
        telefone: limparTelefone(clientFormData.telefone)
        // Não incluir dados do endereço aqui - será criado separadamente se necessário
      }
      
      console.log('Criando cliente:', clienteData)
      
      const response = await fetch('/api/clientes-dg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clienteData)
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Cliente criado com sucesso:', data)
        
        // Atualizar o estado com o cliente criado
        setClientFound(data.cliente)
        setShowClientForm(false)
        
        // Não buscar endereços automaticamente - usuário novo não tem endereços
        setEnderecosCliente([])
        setEnderecoSelecionado(null)
        
        return data.cliente
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar cliente')
      }
    } catch (error) {
      console.error('Erro ao criar cliente:', error)
      alert(`Erro ao criar cliente: ${error instanceof Error ? error.message : 'Tente novamente'}`)
      return null
    }
  }

  const placeOrder = async () => {
    try {
      // Validar se tem itens no carrinho
      if (cart.length === 0) {
        alert('Adicione itens ao carrinho antes de finalizar o pedido')
        return
      }

      let cliente = clientFound
      
      // Se não tem cliente, precisa criar primeiro
      if (!cliente) {
        console.log('Cliente não encontrado, criando novo cliente...')
        cliente = await criarCliente()
        
        // Aguardar o cliente ser criado
        if (!cliente) {
          alert('Erro ao criar cliente. Verifique os dados e tente novamente.')
          return
        }
      }
      
      // Verificar se o cliente foi criado/encontrado
      if (!cliente) {
        throw new Error('Não foi possível obter dados do cliente')
      }
      
      // Usar endereço selecionado ou dados do formulário
      let enderecoEntrega = enderecoSelecionado || clientFormData
      
      // Se não faz entregas, forçar retirada
      if (!menu?.fazEntregas) {
        setFormaEntrega('retirada')
      }
      
      // Se não tem endereço selecionado e não está preenchendo formulário, erro
      if (!enderecoEntrega && menu?.fazEntregas && formaEntrega === 'entrega') {
        throw new Error('Endereço de entrega é obrigatório')
      }
      
      console.log('Cliente encontrado/criado:', cliente)
      console.log('Endereço de entrega:', enderecoEntrega)
      
      // Criar pedido no banco
      const pedidoData = {
        clienteId: cliente.id,
        menuId: menu?.id,
        itens: cart,
        valorTotal: getTotalPriceWithFrete(),
        observacoes: cart.map(item => 
          item.observation ? `${item.name}: ${item.observation}` : item.name
        ).join(', '),
        formaPagamento: 'pendente',
        formaEntrega: formaEntrega,
        enderecoEntrega: formaEntrega === 'entrega' ? {
          cep: enderecoEntrega.cep,
          endereco: enderecoEntrega.endereco,
          numero: 'numero' in enderecoEntrega ? enderecoEntrega.numero : '',
          bairro: enderecoEntrega.bairro,
          cidade: enderecoEntrega.cidade,
          estado: enderecoEntrega.estado,
          complemento: enderecoEntrega.complemento,
          referencia: enderecoEntrega.referencia
        } : null
      }
      
      console.log('Enviando pedido:', pedidoData)
      
      const response = await fetch('/api/pedidos-dg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedidoData)
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Pedido criado com sucesso:', data)
        
        setOrderPlaced(true)
        setTimeout(() => {
          setOrderPlaced(false)
          setCart([])
          setShowCart(false)
          setClientFound(null)
          setClientPhone('')
          setShowClientForm(false)
          setMostrarFormNovoEndereco(false)
          setEnderecosCliente([])
          setEnderecoSelecionado(null)
          setClientFormData({
            nome: '',
            telefone: '',
            cep: '',
            endereco: '',
            numero: '',
            bairro: '',
            cidade: '',
            estado: '',
            complemento: '',
            referencia: ''
          })
        }, 3000)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar pedido')
      }
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error)
      alert(`Erro ao finalizar pedido: ${error instanceof Error ? error.message : 'Tente novamente'}`)
    }
  }

  // Função para cadastrar novo cliente
  const handleCadastrarCliente = async () => {
    if (!validarCamposObrigatorios()) {
      alert('Preencha todos os campos obrigatórios')
      return
    }
    
    await salvarEnderecoNovoCliente()
  }

  const handleFinalizarPedido = async () => {
    try {
      if (!clientFound) {
        // Se não tem cliente, mostrar formulário primeiro
        setShowClientForm(true)
        return
      }
      
      // Se já tem cliente, verificar se tem endereço selecionado
      if (!enderecoSelecionado && !mostrarFormNovoEndereco) {
        // Se não tem endereço selecionado, mostrar opção de adicionar novo
        setMostrarFormNovoEndereco(true)
        return
      }
      
      // Se tem cliente e endereço, finalizar pedido
      await placeOrder()
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error)
      alert(`Erro ao finalizar pedido: ${error instanceof Error ? error.message : 'Tente novamente'}`)
    }
  }

  // Função para salvar endereço do novo cliente
  const salvarEnderecoNovoCliente = async () => {
    if (!validarCamposObrigatorios()) {
      alert('Preencha todos os campos obrigatórios')
      return
    }
    
    try {
      let cliente = clientFound
      
      // Se não tem cliente, criar primeiro
      if (!cliente) {
        cliente = await criarCliente()
        if (!cliente) {
          return
        }
      }
      
      // Agora criar o endereço
      const enderecoData = {
        cep: clientFormData.cep,
        endereco: clientFormData.endereco,
        numero: clientFormData.numero,
        bairro: clientFormData.bairro,
        cidade: clientFormData.cidade,
        estado: clientFormData.estado,
        complemento: clientFormData.complemento,
        referencia: clientFormData.referencia
      }
      
      const response = await fetch(`/api/clientes-dg/${cliente.id}/enderecos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enderecoData)
      })
      
      if (response.ok) {
        const data = await response.json()
        setEnderecosCliente([data.endereco])
        setEnderecoSelecionado(data.endereco)
        setMostrarFormNovoEndereco(false)
        
        // Limpar formulário
        setClientFormData(prev => ({
          ...prev,
          cep: '',
          endereco: '',
          numero: '',
          bairro: '',
          cidade: '',
          estado: '',
          complemento: '',
          referencia: ''
        }))
        
        // Não mostrar alerta, apenas continuar
      } else {
        throw new Error('Erro ao criar endereço')
      }
    } catch (error) {
      console.error('Erro ao salvar endereço:', error)
      alert('Erro ao salvar endereço. Tente novamente.')
    }
  }

  // Função para abrir modal de confirmação
  const abrirConfirmacaoRemocao = (endereco: EnderecoDG) => {
    // Verificar se é o último endereço
    if (enderecosCliente.length <= 1) {
      alert('Não é possível remover o último endereço. É necessário ter pelo menos um endereço cadastrado.')
      return
    }
    
    setEnderecoParaRemover(endereco)
    setShowConfirmDelete(true)
  }

  // Função para remover endereço
  const removerEndereco = async () => {
    if (!enderecoParaRemover || !clientFound) {
      return
    }
    
    try {
      const response = await fetch(`/api/clientes-dg/${clientFound.id}/enderecos?enderecoId=${enderecoParaRemover.id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        // Remover da lista local
        setEnderecosCliente(prev => prev.filter(e => e.id !== enderecoParaRemover.id))
        
        // Se o endereço removido era o selecionado, limpar seleção
        if (enderecoSelecionado && enderecoSelecionado.id === enderecoParaRemover.id) {
          setEnderecoSelecionado(null)
        }
        
        // Fechar modal
        setShowConfirmDelete(false)
        setEnderecoParaRemover(null)
      } else {
        throw new Error('Erro ao remover endereço')
      }
    } catch (error) {
      console.error('Erro ao remover endereço:', error)
      alert('Erro ao remover endereço. Tente novamente.')
    }
  }

  useEffect(() => {
    if (!codigo) return

    fetch(`/api/menus/public/${codigo}`)
      .then(res => {
        if (!res.ok) throw new Error('Menu não encontrado')
        return res.json()
      })
      .then(data => {
        console.log('Menu carregado:', data)
        console.log('fazEntregas:', data.fazEntregas)
        setMenu(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [codigo])

  if (loading) {
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

  if (error || !menu) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Menu não encontrado</h1>
          <p className="text-gray-600">O menu que você está procurando não existe ou não está disponível.</p>
        </div>
      </div>
    )
  }

  if (menu.status !== 'Ativo') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600 mb-2">Menu Indisponível</h1>
          <p className="text-gray-600">Este menu está temporariamente indisponível.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex justify-center items-start bg-background p-0">
      <div className="w-full max-w-2xl flex flex-col items-center">
        {/* Header com imagem de fundo e logo */}
        <div className="w-full relative mb-6">
          <div className="w-full h-56 md:h-72 overflow-hidden rounded-b-2xl bg-muted relative">
            <Image
              src={menu.imageUrlBackground || "/images/sem-imagem.jpg"}
              alt="Fundo do menu"
              fill
              className="object-cover w-full h-full"
              priority
            />
          </div>
          <div className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-1/2 z-20 w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white flex items-center justify-center">
            <Image
              src={menu.imageUrl || "/images/sem-imagem.jpg"}
              alt="Logo da empresa"
              width={128}
              height={128}
              className="object-cover w-full h-full rounded-full"
            />
          </div>
        </div>
        
        <div className="mt-16 w-full flex flex-col items-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="text-3xl md:text-4xl font-bold text-primary text-center flex items-center gap-2">{menu.name}
              <img src="/images/verified-badge-profile-icon-png.webp" alt="Verificado" className="w-7 h-7 object-contain ml-1" />
            </h1>
          </div>
          {(menu.telefone || menu.instagram) && (
            <div className="flex items-center justify-center gap-3 text-base font-normal mb-1 text-primary">
              {menu.telefone && (
                <span className="flex items-center gap-1">
                  <a
                    href={`https://wa.me/${menu.telefone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:underline"
                  >
                    <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={2} stroke='currentColor' className='w-5 h-5 text-green-600'><path strokeLinecap='round' strokeLinejoin='round' d='M2.25 6.75c0-1.243 1.007-2.25 2.25-2.25h15a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75z' /><path strokeLinecap='round' strokeLinejoin='round' d='M6.75 9.75h.008v.008H6.75V9.75zm0 4.5h.008v.008H6.75v-.008zm5.25-4.5h.008v.008h-.008V9.75zm0 4.5h.008v.008h-.008v-.008zm5.25-4.5h.008v.008h-.008V9.75zm0 4.5h.008v.008h-.008v-.008z' /></svg>
                    <span>{menu.telefone}</span>
                  </a>
                </span>
              )}
              {menu.instagram && (
                <span className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-pink-500"><rect width="20" height="20" x="2" y="2" rx="5" /><circle cx="12" cy="12" r="3.5" /><circle cx="17" cy="7" r="1.5" /></svg>
                  <a href={`https://instagram.com/${menu.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="hover:underline">{menu.instagram}</a>
                </span>
              )}
            </div>
          )}
          {menu.description && (
            <div className="flex justify-center w-full mb-1 mt-1">
              <blockquote className="border-l-4 border-[#0B7A48] bg-[#F3F6F4] text-gray-700 italic rounded-r-2xl px-5 py-3 shadow-sm max-w-xl text-left">
                {menu.description}
              </blockquote>
            </div>
          )}
        </div>

        {/* Botão do carrinho fixo na parte inferior */}
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setShowCart(true)}
            className="relative bg-[#0B7A48] text-white p-3 rounded-full hover:bg-[#0B7A48]/90 transition-colors shadow-lg"
          >
            <ShoppingCart className="h-5 w-5" />
            {getTotalItems() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                {getTotalItems()}
              </span>
            )}
          </button>
        </div>

                {/* Lista de produtos */}
        <div className="space-y-12 md:space-y-16 p-3 md:p-6">
          {menu?.sections?.map((section, sectionIndex) => (
            <div key={section.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 md:p-8">
              {sectionIndex > 0 && (
                <div className="border-t-2 border-gray-200 pt-8 md:pt-12 mb-8"></div>
              )}
              
              {/* Título da seção */}
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-3">
                  {section.name}
                </h2>
                {section.description && (
                  <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto px-4 leading-relaxed mb-4">
                    {section.description}
                  </p>
                )}
                <div className="w-24 h-1 bg-gradient-to-r from-[#0B7A48] to-[#0A6A3F] mx-auto rounded-full"></div>
              </div>

              {/* Produtos da seção */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                {section.items?.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                  >
                    {/* Imagem do produto */}
                    <div className="relative h-40 md:h-56 overflow-hidden">
                      <img
                        src={item.imageUrl || '/images/sem-imagem.jpg'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      {item.destaque && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          Destaque
                        </div>
                      )}
                    </div>

                    {/* Informações do produto */}
                    <div className="p-3 md:p-4">
                      <h3 className="font-semibold text-gray-800 text-sm md:text-lg mb-1 line-clamp-2">
                        {item.name}
                      </h3>
                      
                      {item.description && (
                        <p className="text-gray-600 text-xs md:text-sm mb-2 line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      {/* Preço */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-base md:text-xl font-bold text-green-600">
                          R$ {Number(item.price).toFixed(2).replace('.', ',')}
                        </span>
                      </div>

                      {/* Controles de quantidade */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                            disabled={!getItemQuantity(item.id)}
                          >
                            <Minus className="w-4 h-4 text-gray-600" />
                          </button>
                          
                          <span className="text-gray-800 font-medium min-w-[2rem] text-center text-sm md:text-base">
                            {getItemQuantity(item.id)}
                          </span>
                          
                          <button
                            onClick={() => addToCart(item)}
                            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-colors"
                          >
                            <Plus className="w-4 h-4 text-white" />
                          </button>
                        </div>

                        {/* Botão de adicionar com observação */}
                        {getItemQuantity(item.id) > 0 && (
                          <button
                            onClick={() => openObservationModal(item)}
                            className="text-xs md:text-sm text-green-600 hover:text-green-700 font-medium px-2 py-1 rounded border border-green-200 hover:border-green-300 transition-colors"
                          >
                            + Obs
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Doce Gestão */}
        <footer className="w-full flex flex-col items-center justify-center py-8 mt-16 border-t border-gray-200 bg-white/80">
          <span className="text-sm text-gray-500">Feito com ♥ por <a href="https://docegestao.com.br" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#0B7A48] hover:underline">Doce Gestão</a></span>
        </footer>
      </div>

      {/* Carrinho lateral */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="w-full sm:max-w-md bg-white h-full overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Seu Pedido</h3>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <ShoppingCart className="h-4 w-4" />
                <span>{getTotalItems()} {getTotalItems() === 1 ? 'item' : 'itens'}</span>
              </div>
            </div>
            
            <div className="p-4">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Seu carrinho está vazio</p>
                  <p className="text-sm">Adicione produtos para fazer seu pedido</p>
                </div>
              ) : (
                <>
                  {/* Lista de itens */}
                  <div className="space-y-3 mb-6">
                    {cart.map((item) => (
                      <div key={item.id} className="p-3 bg-gray-50 rounded-lg space-y-3">
                        <div className="flex items-center gap-3">
                          {item.imageUrl && (
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              width={50}
                              height={50}
                              className="rounded-lg object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                            <p className="text-sm text-gray-600">R$ {Number(item.price).toFixed(2)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 sm:w-6 sm:h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                            >
                              <Minus className="h-4 w-4 sm:h-3 sm:w-3 text-gray-600" />
                            </button>
                            <span className="w-8 text-center font-medium text-sm sm:text-base">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 sm:w-6 sm:h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                            >
                              <Plus className="h-4 w-4 sm:h-3 sm:w-3 text-gray-600" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Campo de observação */}
                        <div className="border-t border-gray-200 pt-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Observação para este item:
                          </label>
                          <textarea
                            value={item.observation || ''}
                            onChange={(e) => updateObservation(item.id, e.target.value)}
                            placeholder="Ex: Sem glúten, cor rosa, decoração especial..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0B7A48] focus:border-transparent"
                            rows={2}
                            maxLength={200}
                          />
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-gray-500">
                              {item.observation?.length || 0}/200 caracteres
                            </span>
                            {item.observation && item.observation.trim() && (
                              <span className="text-xs text-[#0B7A48] font-medium">
                                ✓ Observação adicionada
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Seção de cliente */}
                  <div className="border-t pt-4">
                    {/* Busca de cliente existente */}
                    {!clientFound && !showClientForm && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Já é cliente? Digite seu telefone:
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="tel"
                            value={clientPhone}
                            onChange={(e) => setClientPhone(formatarTelefone(e.target.value))}
                            placeholder="(11) 99999-9999"
                            className="flex-1 px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0B7A48] focus:border-transparent text-base"
                          />
                          <button
                            onClick={buscarCliente}
                            disabled={searchingClient || limparTelefone(clientPhone).length < 10}
                            className="px-4 py-3 sm:py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium"
                          >
                            {searchingClient ? '...' : 'Buscar'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Cliente encontrado */}
                    {clientFound && (
                      <div className="mb-4">
                        <div className="p-3 bg-green-50 border border-green-200 rounded-md mb-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-green-800">
                              ✓ Cliente: <strong>{clientFound.nome}</strong> - {clientFound.telefone}
                            </p>
                            <button
                              onClick={() => {
                                setClientFound(null)
                                setClientPhone('')
                                setEnderecosCliente([])
                                setEnderecoSelecionado(null)
                                setShowClientForm(false)
                                setMostrarFormNovoEndereco(false)
                                setClientFormData({
                                  nome: '',
                                  telefone: '',
                                  cep: '',
                                  endereco: '',
                                  numero: '',
                                  bairro: '',
                                  cidade: '',
                                  estado: '',
                                  complemento: '',
                                  referencia: ''
                                })
                              }}
                              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                              title="Trocar cliente"
                            >
                              <RefreshCw className="h-3 w-3" />
                              Trocar
                            </button>
                          </div>
                        </div>
                        
                        {/* Seleção de endereço */}
                        <div className="p-4 bg-gray-50 rounded-lg border">
                          <h4 className="font-medium text-gray-900 mb-3">Endereço de Entrega</h4>
                          
                          {/* Endereços existentes */}
                          {enderecosCliente.length > 0 && (
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Escolha um endereço salvo:
                              </label>
                            
                              <div className="space-y-2">
                                {enderecosCliente.map((endereco, index) => (
                                  <label key={index} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-100">
                                    <input
                                      type="radio"
                                      name="endereco"
                                      value={index}
                                      checked={enderecoSelecionado === endereco}
                                      onChange={() => setEnderecoSelecionado(endereco)}
                                      className="mt-1"
                                    />
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-gray-900">
                                        {endereco.endereco}, {endereco.bairro}
                                      </p>
                                      <p className="text-xs text-gray-600">
                                        {endereco.cidade}-{endereco.estado} - CEP: {endereco.cep}
                                      </p>
                                      {endereco.complemento && (
                                        <p className="text-xs text-gray-600">
                                          {endereco.complemento}
                                        </p>
                                      )}
                                    </div>
                                    {enderecosCliente.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.preventDefault()
                                          e.stopPropagation()
                                          abrirConfirmacaoRemocao(endereco)
                                        }}
                                        className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                        title="Remover endereço"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                        </svg>
                                      </button>
                                    )}
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}
                          
                                                     {/* Botão para adicionar novo endereço */}
                           <div className="flex gap-2">
                             <button
                               type="button"
                               onClick={() => setMostrarFormNovoEndereco(!mostrarFormNovoEndereco)}
                               className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                             >
                               {mostrarFormNovoEndereco ? 'Cancelar' : '+ Adicionar Novo Endereço'}
                             </button>
                             
                             {enderecosCliente.length === 0 && (
                               <span className="text-xs text-gray-500 flex items-center">
                                 Nenhum endereço salvo
                               </span>
                             )}
                           </div>
                           
                           {/* Formulário para novo endereço */}
                           {mostrarFormNovoEndereco && (
                             <div className="mt-4 p-4 bg-white rounded-lg border">
                               <h5 className="font-medium text-gray-900 mb-3">Novo Endereço</h5>
                               <div className="space-y-3">
                                 <div>
                                   <label className="block text-sm font-medium text-gray-700 mb-1">
                                     CEP
                                   </label>
                                   <div className="flex gap-2">
                                     <input
                                       type="text"
                                       value={clientFormData.cep}
                                       onChange={(e) => {
                                         const cep = e.target.value.replace(/\D/g, '')
                                         setClientFormData(prev => ({ ...prev, cep }))
                                         if (cep.length === 8) {
                                           buscarCEP(cep)
                                         }
                                       }}
                                       placeholder="00000-000"
                                       maxLength={8}
                                       className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0B7A48] focus:border-transparent"
                                     />
                                     {loadingCEP && (
                                       <div className="flex items-center px-3">
                                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0B7A48]"></div>
                                       </div>
                                     )}
                                   </div>
                                 </div>

                                 <div>
                                   <label className="block text-sm font-medium text-gray-700 mb-1">
                                     Endereço <span className="text-red-500">*</span>
                                   </label>
                                   <input
                                     type="text"
                                     required
                                     value={clientFormData.endereco}
                                     onChange={(e) => setClientFormData(prev => ({ ...prev, endereco: e.target.value }))}
                                     className={`w-full px-3 py-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0B7A48] focus:border-transparent ${
                                       clientFormData.endereco.trim() === '' ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                     }`}
                                     placeholder="Rua, número, etc."
                                   />
                                   {clientFormData.endereco.trim() === '' && (
                                     <p className="text-xs text-red-500 mt-1">Endereço é obrigatório</p>
                                   )}
                                 </div>

                                 <div>
                                   <label className="block text-sm font-medium text-gray-700 mb-1">
                                     Número <span className="text-red-500">*</span>
                                   </label>
                                   <input
                                     type="text"
                                     required
                                     value={clientFormData.numero}
                                     onChange={(e) => setClientFormData(prev => ({ ...prev, numero: e.target.value }))}
                                     className={`w-full px-3 py-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0B7A48] focus:border-transparent ${
                                       clientFormData.numero.trim() === '' ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                     }`}
                                     placeholder="Número da residência, apartamento, etc."
                                   />
                                   {clientFormData.numero.trim() === '' && (
                                     <p className="text-xs text-red-500 mt-1">Número é obrigatório</p>
                                   )}
                                 </div>

                                 <div className="grid grid-cols-2 gap-3">
                                   <div>
                                     <label className="block text-sm font-medium text-gray-700 mb-1">
                                       Bairro <span className="text-red-500">*</span>
                                     </label>
                                     <input
                                       type="text"
                                       required
                                       value={clientFormData.bairro}
                                       onChange={(e) => setClientFormData(prev => ({ ...prev, bairro: e.target.value }))}
                                       className={`w-full px-3 py-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0B7A48] focus:border-transparent ${
                                         clientFormData.bairro.trim() === '' ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                       }`}
                                       placeholder="Nome do bairro"
                                     />
                                     {clientFormData.bairro.trim() === '' && (
                                       <p className="text-xs text-red-500 mt-1">Bairro é obrigatório</p>
                                     )}
                                   </div>
                                   <div>
                                     <label className="block text-sm font-medium text-gray-700 mb-1">
                                       Cidade <span className="text-red-500">*</span>
                                     </label>
                                     <input
                                       type="text"
                                       required
                                       value={clientFormData.cidade}
                                       onChange={(e) => setClientFormData(prev => ({ ...prev, cidade: e.target.value }))}
                                       className={`w-full px-3 py-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0B7A48] focus:border-transparent ${
                                         clientFormData.cidade.trim() === '' ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                       }`}
                                       placeholder="Nome da cidade"
                                     />
                                     {clientFormData.cidade.trim() === '' && (
                                       <p className="text-xs text-red-500 mt-1">Cidade é obrigatória</p>
                                     )}
                                   </div>
                                 </div>

                                 <div className="grid grid-cols-2 gap-3">
                                   <div>
                                     <label className="block text-sm font-medium text-gray-700 mb-1">
                                       Estado <span className="text-red-500">*</span>
                                     </label>
                                     <input
                                       type="text"
                                       required
                                       value={clientFormData.estado}
                                       onChange={(e) => setClientFormData(prev => ({ ...prev, estado: e.target.value }))}
                                       maxLength={2}
                                       className={`w-full px-3 py-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0B7A48] focus:border-transparent ${
                                         clientFormData.estado.trim() === '' ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                       }`}
                                       placeholder="SP, RJ, MG..."
                                     />
                                     {clientFormData.estado.trim() === '' && (
                                       <p className="text-xs text-red-500 mt-1">Estado é obrigatório</p>
                                     )}
                                   </div>
                                   <div>
                                     <label className="block text-sm font-medium text-gray-700 mb-1">
                                       Complemento
                                     </label>
                                     <input
                                       type="text"
                                       value={clientFormData.complemento}
                                       onChange={(e) => setClientFormData(prev => ({ ...prev, complemento: e.target.value }))}
                                       placeholder="Apto, bloco, etc."
                                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0B7A48] focus:border-transparent"
                                     />
                                   </div>
                                 </div>

                                 <div>
                                   <label className="block text-sm font-medium text-gray-700 mb-1">
                                     Referência
                                   </label>
                                   <input
                                     type="text"
                                     value={clientFormData.referencia}
                                     onChange={(e) => setClientFormData(prev => ({ ...prev, referencia: e.target.value }))}
                                     placeholder="Perto de onde, etc."
                                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0B7A48] focus:border-transparent"
                                   />
                                 </div>
                                 
                                 {/* Botão para salvar novo endereço */}
                                 <div className="pt-3">
                                   <button
                                     type="button"
                                     onClick={async () => {
                                       if (validarCamposObrigatorios()) {
                                         await salvarEnderecoNovoCliente()
                                       }
                                     }}
                                     disabled={!validarCamposObrigatorios()}
                                     className={`w-full py-2 rounded-md font-medium transition-colors ${
                                       validarCamposObrigatorios()
                                         ? 'bg-[#0B7A48] text-white hover:bg-[#0B7A48]/90'
                                         : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                     }`}
                                   >
                                     Salvar Novo Endereço
                                   </button>
                                 </div>
                               </div>
                             </div>
                           )}
                          
                          {/* Formulário para novo endereço */}
                          {mostrarFormNovoEndereco && (
                            <div className="mt-4 p-4 bg-white rounded-lg border">
                              <h5 className="font-medium text-gray-900 mb-3">Novo Endereço</h5>
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    CEP
                                  </label>
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      value={clientFormData.cep}
                                      onChange={(e) => {
                                        const cep = e.target.value.replace(/\D/g, '')
                                        setClientFormData(prev => ({ ...prev, cep }))
                                        if (cep.length === 8) {
                                          buscarCEP(cep)
                                        }
                                      }}
                                      placeholder="00000-000"
                                      maxLength={8}
                                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0B7A48] focus:border-transparent"
                                    />
                                    {loadingCEP && (
                                      <div className="flex items-center px-3">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0B7A48]"></div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Endereço <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    required
                                    value={clientFormData.endereco}
                                    onChange={(e) => setClientFormData(prev => ({ ...prev, endereco: e.target.value }))}
                                    className={`w-full px-3 py-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0B7A48] focus:border-transparent ${
                                      clientFormData.endereco.trim() === '' ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                    }`}
                                    placeholder="Rua, número, etc."
                                  />
                                  {clientFormData.endereco.trim() === '' && (
                                    <p className="text-xs text-red-500 mt-1">Endereço é obrigatório</p>
                                  )}
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Número <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    required
                                    value={clientFormData.numero}
                                    onChange={(e) => setClientFormData(prev => ({ ...prev, numero: e.target.value }))}
                                    className={`w-full px-3 py-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0B7A48] focus:border-transparent ${
                                      clientFormData.numero.trim() === '' ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                    }`}
                                    placeholder="Número da residência, apartamento, etc."
                                  />
                                  {clientFormData.numero.trim() === '' && (
                                    <p className="text-xs text-red-500 mt-1">Número é obrigatório</p>
                                  )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Bairro <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      required
                                      value={clientFormData.bairro}
                                      onChange={(e) => setClientFormData(prev => ({ ...prev, bairro: e.target.value }))}
                                      className={`w-full px-3 py-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0B7A48] focus:border-transparent ${
                                        clientFormData.bairro.trim() === '' ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                      }`}
                                      placeholder="Nome do bairro"
                                    />
                                    {clientFormData.bairro.trim() === '' && (
                                      <p className="text-xs text-red-500 mt-1">Bairro é obrigatório</p>
                                    )}
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Cidade <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      required
                                      value={clientFormData.cidade}
                                      onChange={(e) => setClientFormData(prev => ({ ...prev, cidade: e.target.value }))}
                                      className={`w-full px-3 py-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0B7A48] focus:border-transparent ${
                                        clientFormData.cidade.trim() === '' ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                      }`}
                                      placeholder="Nome da cidade"
                                    />
                                    {clientFormData.cidade.trim() === '' && (
                                      <p className="text-xs text-red-500 mt-1">Cidade é obrigatória</p>
                                    )}
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Estado <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      required
                                      value={clientFormData.estado}
                                      onChange={(e) => setClientFormData(prev => ({ ...prev, estado: e.target.value }))}
                                      maxLength={2}
                                      className={`w-full px-3 py-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0B7A48] focus:border-transparent ${
                                        clientFormData.estado.trim() === '' ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                      }`}
                                      placeholder="SP, RJ, MG..."
                                    />
                                    {clientFormData.estado.trim() === '' && (
                                      <p className="text-xs text-red-500 mt-1">Estado é obrigatório</p>
                                    )}
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Complemento
                                    </label>
                                    <input
                                      type="text"
                                      value={clientFormData.complemento}
                                      onChange={(e) => setClientFormData(prev => ({ ...prev, complemento: e.target.value }))}
                                      placeholder="Apto, bloco, etc."
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0B7A48] focus:border-transparent"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Referência
                                  </label>
                                  <input
                                    type="text"
                                    value={clientFormData.referencia}
                                    onChange={(e) => setClientFormData(prev => ({ ...prev, referencia: e.target.value }))}
                                    placeholder="Perto de onde, etc."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0B7A48] focus:border-transparent"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Formulário de cliente (só aparece se não for cliente) */}
                    {showClientForm && !clientFound && (
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
                        <h4 className="font-medium text-gray-900 mb-3">Dados para Entrega</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nome completo <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={clientFormData.nome}
                              onChange={(e) => setClientFormData(prev => ({ ...prev, nome: e.target.value }))}
                              className={`w-full px-3 py-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0B7A48] focus:border-transparent ${
                                clientFormData.nome.trim() === '' ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                              placeholder="Digite seu nome completo"
                            />
                            {clientFormData.nome.trim() === '' && (
                              <p className="text-xs text-red-500 mt-1">Nome é obrigatório</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Telefone <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="tel"
                              required
                              value={clientFormData.telefone}
                              onChange={(e) => setClientFormData(prev => ({ ...prev, telefone: formatarTelefone(e.target.value) }))}
                              placeholder="(11) 99999-9999"
                              className={`w-full px-3 py-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0B7A48] focus:border-transparent ${
                                limparTelefone(clientFormData.telefone).length < 10 ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                            />
                            {limparTelefone(clientFormData.telefone).length < 10 && (
                              <p className="text-xs text-red-500 mt-1">Telefone válido é obrigatório</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              CEP
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={clientFormData.cep}
                                onChange={(e) => {
                                  const cep = e.target.value.replace(/\D/g, '')
                                  setClientFormData(prev => ({ ...prev, cep }))
                                  if (cep.length === 8) {
                                    buscarCEP(cep)
                                  }
                                }}
                                placeholder="00000-000"
                                maxLength={8}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0B7A48] focus:border-transparent"
                              />
                              {loadingCEP && (
                                <div className="flex items-center px-3">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0B7A48]"></div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Endereço <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={clientFormData.endereco}
                              onChange={(e) => setClientFormData(prev => ({ ...prev, endereco: e.target.value }))}
                              className={`w-full px-3 py-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0B7A48] focus:border-transparent ${
                                clientFormData.endereco.trim() === '' ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                              placeholder="Rua, número, etc."
                            />
                            {clientFormData.endereco.trim() === '' && (
                              <p className="text-xs text-red-500 mt-1">Endereço é obrigatório</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Número <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={clientFormData.numero}
                              onChange={(e) => setClientFormData(prev => ({ ...prev, numero: e.target.value }))}
                              className={`w-full px-3 py-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0B7A48] focus:border-transparent ${
                                clientFormData.numero.trim() === '' ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                              placeholder="Número da residência, apartamento, etc."
                            />
                            {clientFormData.numero.trim() === '' && (
                              <p className="text-xs text-red-500 mt-1">Número é obrigatório</p>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Bairro <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                value={clientFormData.bairro}
                                onChange={(e) => setClientFormData(prev => ({ ...prev, bairro: e.target.value }))}
                                className={`w-full px-3 py-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0B7A48] focus:border-transparent ${
                                  clientFormData.bairro.trim() === '' ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="Nome do bairro"
                              />
                              {clientFormData.bairro.trim() === '' && (
                                <p className="text-xs text-red-500 mt-1">Bairro é obrigatório</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cidade <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                value={clientFormData.cidade}
                                onChange={(e) => setClientFormData(prev => ({ ...prev, cidade: e.target.value }))}
                                className={`w-full px-3 py-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0B7A48] focus:border-transparent ${
                                  clientFormData.cidade.trim() === '' ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="Nome da cidade"
                              />
                              {clientFormData.cidade.trim() === '' && (
                                <p className="text-xs text-red-500 mt-1">Cidade é obrigatória</p>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Estado <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                value={clientFormData.estado}
                                onChange={(e) => setClientFormData(prev => ({ ...prev, estado: e.target.value }))}
                                maxLength={2}
                                className={`w-full px-3 py-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0B7A48] focus:border-transparent ${
                                  clientFormData.estado.trim() === '' ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="SP, RJ, MG..."
                              />
                              {clientFormData.estado.trim() === '' && (
                                <p className="text-xs text-red-500 mt-1">Estado é obrigatório</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Complemento
                              </label>
                              <input
                                type="text"
                                value={clientFormData.complemento}
                                onChange={(e) => setClientFormData(prev => ({ ...prev, complemento: e.target.value }))}
                                placeholder="Apto, bloco, etc."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0B7A48] focus:border-transparent"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Referência
                            </label>
                            <input
                              type="text"
                              value={clientFormData.referencia}
                              onChange={(e) => setClientFormData(prev => ({ ...prev, referencia: e.target.value }))}
                              placeholder="Perto de onde, etc."
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0B7A48] focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Seção de Frete e Retirada */}
                    {clientFound && menu?.fazEntregas && (
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
                        <h4 className="font-medium text-gray-900 mb-3">Forma de Entrega</h4>
                        
                        {/* Opção de Retirada */}
                        <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-100 mb-3">
                          <input
                            type="radio"
                            name="formaEntrega"
                            value="retirada"
                            checked={formaEntrega === 'retirada'}
                            onChange={() => setFormaEntrega('retirada')}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              🚶 Retirar no local
                            </p>
                            <p className="text-xs text-gray-600">
                              Sem custo de frete
                            </p>
                          </div>
                        </label>

                        {/* Opção de Entrega */}
                        <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-100">
                          <input
                            type="radio"
                            name="formaEntrega"
                            value="entrega"
                            checked={formaEntrega === 'entrega'}
                            onChange={() => setFormaEntrega('entrega')}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              🚚 Receber em casa
                            </p>
                            <p className="text-xs text-gray-600">
                              {menu?.valorFrete !== undefined && menu.valorFrete !== null && menu.valorFrete > 0
                                ? `Frete: R$ ${Number(menu.valorFrete).toFixed(2)}`
                                : 'Frete grátis'
                              }
                            </p>
                          </div>
                        </label>
                      </div>
                    )}

                    {/* Seção de Retirada (quando não faz entregas) */}
                    {clientFound && !menu?.fazEntregas && (
                      <div className="mb-4 p-4 bg-blue-50 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-blue-900">
                              🚶 Retirada na Confeitaria
                            </p>
                            <p className="text-xs text-blue-600">
                              Este menu não oferece entregas. Os pedidos devem ser retirados na confeitaria.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Subtotal (sempre visível) */}
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-base text-gray-600">Subtotal:</span>
                      <span className="text-lg font-semibold text-gray-800">
                        R$ {getTotalPrice().toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    {/* Frete (só aparece DEPOIS de escolher entrega) */}
                    {clientFound && menu?.fazEntregas && formaEntrega === 'entrega' && (
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-base text-gray-600">Frete:</span>
                        <span className="text-lg font-semibold text-gray-800">
                          R$ {Number(menu.valorFrete || 0).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    )}

                    {/* Total final */}
                    <div className="flex justify-between items-center mb-4 pt-2 border-t border-gray-200">
                      <span className="text-lg font-bold">Total:</span>
                      <span className="text-xl font-bold text-[#0B7A48]">
                        R$ {formaEntrega === 'entrega' ? getTotalPriceWithFrete().toFixed(2).replace('.', ',') : getTotalPrice().toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    
                    {/* Botão só aparece após buscar cliente */}
                    {(clientFound || showClientForm) ? (
                      <div>
                        {showClientForm && !validarCamposObrigatorios() && (
                          <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p className="text-sm text-yellow-800">
                              ⚠️ Preencha todos os campos obrigatórios marcados com <span className="text-red-500">*</span>
                            </p>
                          </div>
                        )}
                        
                        {clientFound && !enderecoSelecionado && !mostrarFormNovoEndereco && (
                          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <p className="text-sm text-blue-800">
                              ℹ️ Cliente cadastrado! Agora selecione um endereço de entrega ou adicione um novo
                            </p>
                          </div>
                        )}
                        
                        {mostrarFormNovoEndereco && !validarCamposObrigatorios() && (
                          <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p className="text-sm text-yellow-800">
                              ⚠️ Preencha todos os campos obrigatórios do novo endereço
                            </p>
                          </div>
                        )}

                        
                        <button
                          onClick={!clientFound ? handleCadastrarCliente : handleFinalizarPedido}
                          disabled={
                            (showClientForm && !validarCamposObrigatorios()) ||
                            (clientFound && !enderecoSelecionado && !mostrarFormNovoEndereco) ||
                            (mostrarFormNovoEndereco && !validarCamposObrigatorios())
                          }
                          className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                            (showClientForm && !validarCamposObrigatorios()) ||
                            (clientFound && !enderecoSelecionado && !mostrarFormNovoEndereco) ||
                            (mostrarFormNovoEndereco && !validarCamposObrigatorios())
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-[#0B7A48] text-white hover:bg-[#0B7A48]/90'
                          }`}
                        >
                          {!clientFound ? 'Cadastrar Cliente' : 
                           !enderecoSelecionado ? 'Configurar Endereço' : 
                           'Finalizar Pedido'}
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <p className="text-sm">Digite seu telefone e clique em "Buscar" para continuar</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notificação de pedido realizado */}
      {orderPlaced && (
        <div className="fixed bottom-4 left-4 right-4 z-50 bg-green-500 text-white p-4 rounded-lg shadow-lg flex items-center gap-3">
          <Check className="h-5 w-5" />
          <span className="font-medium">Pedido enviado com sucesso!</span>
        </div>
      )}

      {/* Modal de confirmação para remover endereço */}
      <Dialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Remover Endereço
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover este endereço? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          {enderecoParaRemover && (
            <div className="p-4 bg-gray-50 rounded-lg border">
              <p className="text-sm font-medium text-gray-900">
                {enderecoParaRemover.endereco}, {enderecoParaRemover.bairro}
              </p>
              <p className="text-xs text-gray-600">
                {enderecoParaRemover.cidade}-{enderecoParaRemover.estado} - CEP: {enderecoParaRemover.cep}
              </p>
              {enderecoParaRemover.complemento && (
                <p className="text-xs text-gray-600">
                  {enderecoParaRemover.complemento}
                </p>
              )}
            </div>
          )}
          
          <DialogFooter className="flex gap-2">
            <button
              onClick={() => {
                setShowConfirmDelete(false)
                setEnderecoParaRemover(null)
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={removerEndereco}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-md hover:bg-red-700 transition-colors"
            >
              Remover Endereço
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      



      
    </div>
  )
} 