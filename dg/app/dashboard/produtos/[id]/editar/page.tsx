'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Trash2, Search, Plus, Calculator, Package, Scale } from 'lucide-react'

interface Ingredient {
  id: number
  name: string
  unit: string
  pricePerGram: number
  brand: string
  quantity: number
}

interface SelectedIngredient extends Ingredient {
  totalCost: number
  useQuantity: number
  useUnit: string
}

interface FichaTecnica {
  id: number
  name: string
  description: string
  unitCost: number
  quantityUsed: number
  totalCost: number
  unit: string
  ingredientId: number
  ingredient: Ingredient
}

interface Product {
  id: number
  name: string
  quantity: number
  category: string
  description?: string
  totalWeight: number
  totalCost: number
  suggestedPrice: number
  sellingPrice: number
  sellingPricePerUnit: number
  sellingPricePerGram: number
  profitMargin: number
  idealMarkup: number
  lastUpdate: Date
  fichaTecnicas: FichaTecnica[]
}

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  quantity: z.string().min(1, 'Quantidade é obrigatória'),
  description: z.string().optional(),
  sellingPricePerUnit: z.string().optional(),
  sellingPricePerGram: z.string().optional(),
  totalWeight: z.string().min(1, 'Peso do produto é obrigatório')
})

// Função para formatar valor monetário
const formatCurrency = (value: string | number): string => {
  const numericValue = typeof value === 'string' ? value.replace(/\D/g, '') : value.toString().replace(/\D/g, '')
  const number = parseFloat(numericValue) / 100
  return number.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// Função para converter valor formatado para número
const parseCurrency = (value: string): number => {
  const numericValue = value.replace(/\D/g, '')
  return parseFloat(numericValue) / 100
}

// Funções de conversão de unidades
const convertToBase = (value: number, fromUnit: string): number => {
  switch (fromUnit.toLowerCase()) {
    case 'kg': return value * 1000
    case 'g': return value
    case 'mg': return value / 1000
    case 'l': return value * 1000
    case 'ml': return value
    case 'un': return value
    default: return value
  }
}

const convertFromBase = (value: number, toUnit: string): number => {
  switch (toUnit.toLowerCase()) {
    case 'kg': return value / 1000
    case 'g': return value
    case 'mg': return value * 1000
    case 'l': return value / 1000
    case 'ml': return value
    case 'un': return value
    default: return value
  }
}

// Função para formatar a quantidade com a unidade correta
const formatQuantity = (value: number | string | null | undefined, unit: string): string => {
  // Converte para número
  const numValue = Number(value);
  if (isNaN(numValue)) return `0${unit}`;
  
  // Verifica quantas casas decimais são realmente necessárias
  const intValue = Math.floor(numValue);
  const hasDecimal = numValue !== intValue;
  
  // Se o valor for inteiro (500kg), não mostra casas decimais
  // Se tiver decimal, mostra no formato brasileiro com vírgula
  const formattedValue = hasDecimal 
    ? numValue.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 3 })
    : intValue.toString();
  
  return `${formattedValue}${unit}`;
}

const calculateTotalPrice = (pricePerGram: number, quantity: number): number => {
  return pricePerGram * quantity
}

const calculatePricePerUnit = (
  pricePerGram: number,
  availableQuantity: number,
  fromUnit: string,
  toUnit: string
): number => {
  // Calcula o preço total do ingrediente disponível
  const totalPrice = calculateTotalPrice(pricePerGram, availableQuantity)
  
  // Retorna o preço por unidade
  return totalPrice / availableQuantity
}

const calculateTotalCost = (
  pricePerUnit: number,      // Preço por unidade (ex: R$ 23.50 por kg)
  requestedQuantity: number,  // Quantidade desejada (ex: 0.8kg)
  availableQuantity: number  // Quantidade total disponível 50g
): number => {
  console.log(pricePerUnit, requestedQuantity, availableQuantity)
return  (pricePerUnit * requestedQuantity) / availableQuantity

  // Calcula o custo total multiplicando o preço por unidade pela quantidade desejada
  return pricePerUnit * requestedQuantity / availableQuantity
}

function CalculadoraMedidas() {
  const [valor, setValor] = useState('')
  const [unidadeOrigem, setUnidadeOrigem] = useState('g')
  const [unidadeDestino, setUnidadeDestino] = useState('kg')
  const [resultado, setResultado] = useState<number | null>(null)

  const calcularConversao = () => {
    const numeroValor = parseFloat(valor.replace(',', '.'))
    if (isNaN(numeroValor)) {
      toast.error('Digite um valor válido')
      return
    }

    const valorBase = convertToBase(numeroValor, unidadeOrigem)
    const valorConvertido = convertFromBase(valorBase, unidadeDestino)
    setResultado(valorConvertido)
  }

  const unidades = [
    { value: 'kg', label: 'Quilogramas (kg)' },
    { value: 'g', label: 'Gramas (g)' },
    { value: 'mg', label: 'Miligramas (mg)' },
    { value: 'l', label: 'Litros (L)' },
    { value: 'ml', label: 'Mililitros (mL)' }
  ]

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Calculadora de Medidas</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="valor" className="text-right">
            Valor
          </Label>
          <Input
            id="valor"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="col-span-3"
            placeholder="Digite o valor"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="unidadeOrigem" className="text-right">
            De
          </Label>
          <Select value={unidadeOrigem} onValueChange={setUnidadeOrigem}>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Selecione a unidade" />
            </SelectTrigger>
            <SelectContent>
              {unidades.map((unidade) => (
                <SelectItem key={unidade.value} value={unidade.value}>
                  {unidade.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="unidadeDestino" className="text-right">
            Para
          </Label>
          <Select value={unidadeDestino} onValueChange={setUnidadeDestino}>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Selecione a unidade" />
            </SelectTrigger>
            <SelectContent>
              {unidades.map((unidade) => (
                <SelectItem key={unidade.value} value={unidade.value}>
                  {unidade.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={calcularConversao} className="w-full">
          Calcular
        </Button>
        {resultado !== null && (
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500">Resultado</div>
            <div className="text-2xl font-bold">
              {resultado.toFixed(3)} {unidadeDestino}
            </div>
            <div className="text-sm text-gray-500">
              {valor} {unidadeOrigem} = {resultado.toFixed(3)} {unidadeDestino}
            </div>
          </div>
        )}
      </div>
    </DialogContent>
  )
}

// Função para converter qualquer quantidade para gramas
const convertToGrams = (value: number, unit: string): number => {
  switch (unit.toLowerCase()) {
    case 'kg':
      return value * 1000 // 1 kg = 1000g
    case 'g':
      return value // já está em gramas
    case 'mg':
      return value / 1000 // 1000 mg = 1g
    case 'l':
      return value * 1000 // 1 L = 1000ml = 1000g (assumindo densidade 1)
    case 'ml':
      return value // 1 ml = 1g (assumindo densidade 1)
    default:
      return value
  }
}

// Primeiro, vamos ajustar a função calcularPesoTotal para usar selectedIngredients
const calcularPesoTotal = (ingredientes: SelectedIngredient[]) => {
  const totalEmGramas = ingredientes.reduce((total, ing) => {
    const quantidade = parseFloat(ing.useQuantity.toString()) || 0
    const unidade = ing.useUnit || 'g'
    
    // Converte a quantidade para gramas antes de somar
    const quantidadeEmGramas = convertToGrams(quantidade, unidade)
    return total + quantidadeEmGramas
  }, 0)

  return totalEmGramas.toFixed(2)
}

// Ajustar a função calcularCustoTotal também
const calcularCustoTotal = (ingredientes: SelectedIngredient[]) => {
  const total = ingredientes.reduce((total, ing) => {
    const custo = parseFloat(ing.totalCost.toString()) || 0
    return total + custo
  }, 0)
  return Number(total).toFixed(2)
}

export default function EditarProdutoPage() {
  const router = useRouter()
  const params = useParams()
  const [produto, setProduto] = useState<Product | null>(null)
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [quantities, setQuantities] = useState<Record<number, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  })

  useEffect(() => {
    const fetchProduto = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/produtos/${params.id}`)
        
        if (!response.ok) {
          throw new Error(`Erro ao carregar produto: ${response.statusText}`)
        }

        const data = await response.json()
        setProduto(data)
        
        // Preencher o formulário com os dados do produto
        setValue('name', data.name)
        setValue('category', data.category)
        setValue('quantity', data.quantity.toString())
        setValue('description', data.description || '')
        setValue('sellingPricePerUnit', formatCurrency(data.sellingPricePerUnit ?? 0))
        setValue('sellingPricePerGram', formatCurrency(data.sellingPricePerGram ?? 0))
        setValue('totalWeight', Number(data.totalWeight ?? 0).toFixed(0))
        
        // Habilitar o campo de preço de venda se já existe um valor
        setEnableSellingPrice((data.sellingPricePerUnit ?? 0) > 0 || (data.sellingPricePerGram ?? 0) > 0)

        // Configurar ingredientes selecionados
        const selectedIngs = data.fichaTecnicas.map((ft: FichaTecnica) => ({
          ...ft.ingredient,
          totalCost: Number(ft.totalCost),
          useQuantity: Number(ft.quantityUsed),
          useUnit: ft.unit,
          quantity: Number(ft.ingredient.quantity),
          pricePerGram: Number(ft.ingredient.pricePerGram)
        }))
        
        // Inicializar o estado de quantities com os valores atuais
        const initialQuantities = selectedIngs.reduce((acc: Record<number, string>, ing: SelectedIngredient) => ({
          ...acc,
          [ing.id]: ing.useQuantity.toString()
        }), {})
        
        setSelectedIngredients(selectedIngs)
        setQuantities(initialQuantities)

        // Carregar ingredientes
        const ingredientsResponse = await fetch('/api/ingredientes')
        if (!ingredientsResponse.ok) {
          throw new Error(`Erro ao carregar ingredientes: ${ingredientsResponse.status}`)
        }
        const ingredientsData = await ingredientsResponse.json()
        setIngredients(ingredientsData.map((ing: Ingredient) => ({
          ...ing,
          quantity: Number(ing.quantity),
          pricePerGram: Number(ing.pricePerGram)
        })))

      } catch (err) {
        console.error('Erro:', err)
        setError(err instanceof Error ? err.message : 'Erro ao carregar produto')
        toast.error('Erro ao carregar produto')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduto()
  }, [params.id, router, setValue])

  const calculateTotals = () => {
    const totalCost = selectedIngredients.reduce((sum, ing) => sum + Number(ing.totalCost), 0)
    return { totalCost }
  }

  const [enableSellingPrice, setEnableSellingPrice] = useState(false)
  
  const handleSellingPriceToggle = (checked: boolean) => {
    setEnableSellingPrice(checked)
    if (!checked) {
      // Limpar os campos quando desabilitado
      setValue('sellingPricePerUnit', '0,00')
      setValue('sellingPricePerGram', '0,00')
    }
  }

  const onSubmit = async (data: any) => {
    if (selectedIngredients.length === 0) {
      toast.error('Adicione pelo menos um ingrediente')
      return
    }
    
    // Validação condicional dos preços de venda
    const unitPrice = enableSellingPrice ? parseCurrency(data.sellingPricePerUnit || '0,00') : 0
    const gramPrice = enableSellingPrice ? parseCurrency(data.sellingPricePerGram || '0,00') : 0
    
    if (enableSellingPrice && unitPrice <= 0 && gramPrice <= 0) {
      toast.error('Pelo menos um preço de venda deve ser maior que zero quando habilitado')
      return
    }
    
    // Garantir que os preços de venda sejam números válidos
    const sellingPricePerUnit = unitPrice
    const sellingPricePerGram = gramPrice

    const totals = calculateTotals()

    const productData = {
      name: data.name,
      category: data.category,
      quantity: parseInt(data.quantity),
      description: data.description,
      totalWeight: parseFloat(data.totalWeight),
      totalCost: totals.totalCost,
      sellingPrice: sellingPricePerUnit > 0 ? sellingPricePerUnit : sellingPricePerGram,
      sellingPricePerUnit: sellingPricePerUnit,
      sellingPricePerGram: sellingPricePerGram,
      ingredients: selectedIngredients.map(ing => ({
        name: `${ing.name}`,
        description: `O ingrediente ${ing.name} no produto ${data.name}`,
        unitCost: ing.pricePerGram,
        quantityUsed: ing.useQuantity,
        totalCost: ing.totalCost,
        unit: ing.useUnit,
        ingredientId: ing.id
      }))
    }
    
    console.log('Dados enviados para API:', productData)

    try {
      const response = await fetch(`/api/produtos/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      })

      if (!response.ok) throw new Error('Erro ao atualizar produto')
      
      toast.success('Produto atualizado com sucesso!')
      router.push('/dashboard/produtos')
    } catch (error) {
      console.error('Erro ao atualizar produto:', error)
      toast.error('Erro ao atualizar produto')
    }
  }

  const filteredIngredients = ingredients.filter(ing => 
    ing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ing.brand.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Mover a função handleQuantityChange para dentro do componente
  const handleQuantityChange = (id: number, value: string, unit: string) => {
    setQuantities(prev => ({
      ...prev,
      [id]: value
    }))

    const numValue = parseFloat(value.replace(',', '.'))
    if (isNaN(numValue)) return

    const existingIngredient = selectedIngredients.find(ing => ing.id === id)
    if (existingIngredient) {
      const totalCost = calculateTotalCost(
        existingIngredient.pricePerGram,
        numValue,
        existingIngredient.quantity
      )

      setSelectedIngredients(prev => prev.map(ing => 
        ing.id === id ? { 
          ...ing, 
          useQuantity: numValue,
          useUnit: unit,
          totalCost
        } : ing
      ))
    }
  }

  // Mover a função handleIngredientToggle para dentro do componente
  const handleIngredientToggle = (ingredient: Ingredient, checked: boolean) => {
    if (checked) {
      const value = quantities[ingredient.id] || ''
      const quantity = parseFloat(value.replace(',', '.'))
      
      if (!value || quantity <= 0) {
        toast.error('Defina uma quantidade maior que 0')
        return
      }

      const totalCost = calculateTotalCost(
        ingredient.pricePerGram,
        quantity,
        ingredient.quantity
      )

      setSelectedIngredients(prev => [...prev, {
        ...ingredient,
        useQuantity: quantity,
        useUnit: ingredient.unit,
        totalCost
      }])

      setQuantities(prev => ({
        ...prev,
        [ingredient.id]: quantity.toString()
      }))
    } else {
      setSelectedIngredients(prev => prev.filter(ing => ing.id !== ingredient.id))
      setQuantities(prev => {
        const newQuantities = { ...prev }
        delete newQuantities[ingredient.id]
        return newQuantities
      })
    }
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={() => router.push('/dashboard/produtos')}>
          Voltar para Lista de Produtos
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="space-y-4">
          <div className="h-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard/produtos')}
            className="flex items-center gap-2"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Editar Produto</h1>
            <p className="text-gray-500 mt-1">Atualize as informações do produto e seus ingredientes</p>
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Calculator className="h-4 w-4 mr-2" />
              Calculadora
            </Button>
          </DialogTrigger>
          <CalculadoraMedidas />
        </Dialog>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados do Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  {...register('name')}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <span className="text-sm text-red-500">{errors.name.message as string}</span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  {...register('category')}
                  className={errors.category ? 'border-red-500' : ''}
                />
                {errors.category && (
                  <span className="text-sm text-red-500">{errors.category.message as string}</span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Unidades (rendimento)</Label>
                <Input
                  id="quantity"
                  type="number"
                  {...register('quantity')}
                  className={errors.quantity ? 'border-red-500' : ''}
                />
                {errors.quantity && (
                  <span className="text-sm text-red-500">{errors.quantity.message as string}</span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalWeight">Peso do produto (g)</Label>
                <Input id="totalWeight" type="number" step="0.01" {...register('totalWeight')} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Preços de Venda</Label>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Habilitar</span>
                    <Switch id="toggleSellingPrice" checked={enableSellingPrice} onCheckedChange={handleSellingPriceToggle} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="sellingPricePerUnit">Por Unidade (R$)</Label>
                    <Input
                      id="sellingPricePerUnit"
                      type="text"
                      placeholder="0,00"
                      {...register('sellingPricePerUnit')}
                      className={errors.sellingPricePerUnit ? 'border-red-500' : ''}
                      disabled={!enableSellingPrice}
                      onChange={(e) => {
                        const formatted = formatCurrency(e.target.value)
                        setValue('sellingPricePerUnit', formatted)
                      }}
                    />
                    {errors.sellingPricePerUnit && enableSellingPrice && (
                      <span className="text-xs text-red-500">{errors.sellingPricePerUnit.message as string}</span>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="sellingPricePerGram">Por Grama (R$)</Label>
                    <Input
                      id="sellingPricePerGram"
                      type="text"
                      placeholder="0,00"
                      {...register('sellingPricePerGram')}
                      className={errors.sellingPricePerGram ? 'border-red-500' : ''}
                      disabled={!enableSellingPrice}
                      onChange={(e) => {
                        const formatted = formatCurrency(e.target.value)
                        setValue('sellingPricePerGram', formatted)
                      }}
                    />
                    {errors.sellingPricePerGram && enableSellingPrice && (
                      <span className="text-xs text-red-500">{errors.sellingPricePerGram.message as string}</span>
                    )}
                  </div>
                </div>
                
                {!enableSellingPrice && (
                  <p className="text-xs text-gray-500">Opcional. Desabilitado: não será considerado no cálculo.</p>
                )}
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Input
                  id="description"
                  {...register('description')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Ingredientes da Receita</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculadora
                  </Button>
                </DialogTrigger>
                <CalculadoraMedidas />
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Lista de ingredientes selecionados */}
            <div className="space-y-4">
              {selectedIngredients.map(ing => (
                <div key={ing.id} className="bg-white border rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{ing.name}</span>
                        <span className="text-gray-500 text-sm">({ing.brand})</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {formatQuantity(ing.useQuantity, ing.useUnit)} × R$ {ing.pricePerGram}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">R$ {Number(ing.totalCost).toFixed(2)}</div>
                        <Input
                          type="text"
                          value={quantities[ing.id]}
                          onChange={(e) => handleQuantityChange(ing.id, e.target.value, ing.unit)}
                          className="w-24 mt-1"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleIngredientToggle(ing, false)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Totais */}
              {selectedIngredients.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Package className="h-4 w-4" />
                        <span>Rendimento</span>
                      </div>
                      <span className="font-medium">{String(watch('quantity') || 0)} un</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Scale className="h-4 w-4" />
                        <span>Peso</span>
                      </div>
                      <span className="font-medium">{String(watch('totalWeight') || 0)}g</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-600">Custo Total:</span>
                    <span className="font-medium">R$ {calcularCustoTotal(selectedIngredients)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Busca de ingredientes */}
            <div className="border rounded-lg p-4">
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Buscar ingredientes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" variant="secondary">
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
              </div>

              <div className="divide-y">
                {filteredIngredients.map((ingredient) => {
                  const isSelected = selectedIngredients.some(ing => ing.id === ingredient.id)
                  return (
                    <div
                      key={ingredient.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        isSelected ? 'bg-gray-50' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{ingredient.name}</div>
                          <div className="text-sm text-gray-500">{ingredient.brand}</div>
                          <div className="text-sm text-gray-500">
                            Disponível: {formatQuantity(ingredient.quantity, ingredient.unit)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            R$ {Number(ingredient.pricePerGram).toFixed(2)}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Input
                              type="text"
                              placeholder="0"
                              className="w-24"
                              value={quantities[ingredient.id] || ''}
                              onChange={(e) => setQuantities(prev => ({
                                ...prev,
                                [ingredient.id]: e.target.value
                              }))}
                              disabled={isSelected}
                            />
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => handleIngredientToggle(ingredient, !isSelected)}
                              disabled={isSelected && !quantities[ingredient.id]}
                            >
                              {isSelected ? (
                                <Trash2 className="h-4 w-4 text-red-500" />
                              ) : (
                                <Plus className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/produtos')}
          >
            Cancelar
          </Button>
          <Button type="submit">
            Salvar Alterações
          </Button>
        </div>
      </form>
    </div>
  )
} 