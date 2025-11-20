'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Trash2, Search, Plus, Calculator, Plus as PlusCircle, Package, Scale } from 'lucide-react'
import SuccessModal from '@/components/ui/SuccessModal'

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
  useQuantity: number // Quantidade que será usada na receita
  useUnit: string // Unidade que será usada na receita
}

// Função para converter unidades para a unidade base (g, ml)
const convertToBase = (value: number, fromUnit: string): number => {
  switch (fromUnit.toLowerCase()) {
    case 'kg':
      return value * 1000 // kg para g
    case 'g':
      return value // g para g
    case 'l':
      return value * 1000 // l para ml
    case 'ml':
      return value // ml para ml
    case 'un':
      return value // unidade mantém o mesmo valor
    default:
      return value
  }
}

// Função para converter da unidade base para a unidade de exibição
const convertFromBase = (value: number, toUnit: string): number => {
  switch (toUnit.toLowerCase()) {
    case 'kg':
      return value / 1000 // g para kg
    case 'g':
      return value // g para g
    case 'l':
      return value / 1000 // ml para l
    case 'ml':
      return value // ml para ml
    case 'un':
      return value // unidade mantém o mesmo valor
    default:
      return value
  }
}

// Função para formatar a quantidade com a unidade correta
const formatQuantity = (value: number, unit: string): string => {
  // Verifica quantas casas decimais são realmente necessárias
  const intValue = Math.floor(value);
  const hasDecimal = value !== intValue;
  
  // Se o valor for inteiro (500kg), não mostra casas decimais
  // Se tiver decimal, mostra no formato brasileiro com vírgula
  const formattedValue = hasDecimal 
    ? value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 3 })
    : intValue.toString();
  
  return `${formattedValue}${unit}`;
}

// Função para calcular o preço por unidade selecionada
const calculatePricePerUnit = (totalPrice: number, totalQuantity: number, fromUnit: string, toUnit: string): number => {
  // Primeiro convertemos a quantidade total para a unidade base (g ou ml)
  const baseQuantity = convertToBase(totalQuantity, fromUnit)
  // Calculamos o preço por unidade base (g ou ml)
  const pricePerBase = totalPrice / baseQuantity
  
  // Agora convertemos para a unidade desejada
  switch (toUnit.toLowerCase()) {
    case 'kg':
      return pricePerBase * 1000 // Preço por kg
    case 'g':
      return pricePerBase // Preço por g
    case 'l':
      return pricePerBase * 1000 // Preço por litro
    case 'ml':
      return pricePerBase // Preço por ml
    case 'un':
      return totalPrice / totalQuantity // Preço por unidade
    default:
      return pricePerBase
  }
}

// Função para calcular o custo total de um ingrediente
const calculateIngredientCost = (
  totalPrice: number, 
  totalQuantity: number, 
  useQuantity: number, 
  fromUnit: string, 
  useUnit: string
): number => {
  // Convertemos ambas as quantidades para a unidade base
  const baseTotalQuantity = convertToBase(totalQuantity, fromUnit)
  const baseUseQuantity = convertToBase(useQuantity, useUnit)
  
  // Calculamos o preço por unidade base
  const pricePerBase = totalPrice / baseTotalQuantity
  
  // Retornamos o custo total para a quantidade usada
  return pricePerBase * baseUseQuantity
}

const formSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  quantity: z.number().min(1, 'Quantidade deve ser maior que 0'),
  description: z.string().optional(),
  sellingPrice: z.number().min(0, 'Preço de venda deve ser maior que 0').optional(),
  productWeightGrams: z.number().min(0.01, 'Informe o peso do produto em gramas'),
})

export const dynamic = 'force-dynamic'

export default function NovoProdutoPage() {
  const router = useRouter()
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>([])
  const [quantities, setQuantities] = useState<{[key: number]: string}>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddIngredient, setShowAddIngredient] = useState(false)
  const [calculatorValue, setCalculatorValue] = useState('')
  const [calculatorFromUnit, setCalculatorFromUnit] = useState('g')
  const [calculatorToUnit, setCalculatorToUnit] = useState('kg')
  const [calculatorResult, setCalculatorResult] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdProductName, setCreatedProductName] = useState('')

  const { control, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      category: '',
      quantity: 1,
      description: '',
      sellingPrice: undefined,
      productWeightGrams: undefined,
    }
  })

  const [enableSellingPrice, setEnableSellingPrice] = useState(false)

  // Carregar todos os ingredientes ao montar o componente
  useEffect(() => {
    loadIngredients()
  }, [])

  const loadIngredients = async () => {
    try {
      const response = await fetch('/api/ingredientes')
      if (!response.ok) throw new Error('Erro ao carregar ingredientes')
      const data = await response.json()
      setIngredients(data)
    } catch (error) {
      toast.error('Erro ao carregar ingredientes')
    }
  }

  const handleIngredientToggle = (ingredient: Ingredient, checked: boolean) => {
    if (checked) {
      const value = quantities[ingredient.id] || ''
      const quantity = parseFloat(value.replace(',', '.'))
      
      if (!value || quantity <= 0) {
        toast.error('Defina uma quantidade maior que 0')
        return
      }

      const totalCost = calculateIngredientCost(
        ingredient.pricePerGram,
        ingredient.quantity,
        quantity,
        ingredient.unit,
        ingredient.unit
      )

      setSelectedIngredients(prev => [...prev, {
        ...ingredient,
        useQuantity: quantity,
        useUnit: ingredient.unit,
        quantity: convertToBase(quantity, ingredient.unit),
        totalCost
      }])

      // Limpar o input após adicionar
      setQuantities(prev => {
        const newQuantities = { ...prev }
        delete newQuantities[ingredient.id]
        return newQuantities
      })
    } else {
      setSelectedIngredients(prev => prev.filter(ing => ing.id !== ingredient.id))
      setQuantities(prev => {
        const newQuantities = { ...prev }
        delete newQuantities[ingredient.id]
        return newQuantities
      })
    }
  }

  const handleQuantityChange = (id: number, value: string, unit: string) => {
    setQuantities(prev => ({
      ...prev,
      [id]: value
    }))

    const numValue = parseFloat(value.replace(',', '.'))
    if (isNaN(numValue)) return

    // Atualizar o ingrediente selecionado se já estiver na lista
    const existingIngredient = selectedIngredients.find(ing => ing.id === id)
    if (existingIngredient) {
      const totalCost = calculateIngredientCost(
        existingIngredient.pricePerGram,
        existingIngredient.quantity,
        numValue,
        existingIngredient.unit,
        unit
      )

      setSelectedIngredients(prev => prev.map(ing => 
        ing.id === id ? { 
          ...ing, 
          useQuantity: numValue,
          useUnit: unit,
          quantity: convertToBase(numValue, unit),
          totalCost 
        } : ing
      ))
    }
  }

  const calculateTotals = () => {
    const totalWeight = selectedIngredients.reduce((sum, ing) => sum + ing.quantity, 0)
    const totalCost = selectedIngredients.reduce((sum, ing) => sum + ing.totalCost, 0)
    return { totalWeight, totalCost }
  }

  const onSubmit = async (data: any) => {
    if (selectedIngredients.length === 0) {
      toast.error('Adicione pelo menos um ingrediente')
      return
    }

    const totals = calculateTotals()
    const totalWeight = data.productWeightGrams || 0
    const quantity = data.quantity || 1
    
    // Obter o preço de venda informado pelo usuário
    let sellingPrice = 0
    if (enableSellingPrice && data.sellingPrice !== undefined && data.sellingPrice !== null) {
      sellingPrice = typeof data.sellingPrice === 'number' ? data.sellingPrice : parseFloat(String(data.sellingPrice)) || 0
    }
    
    console.log('Valores de preço:', {
      enableSellingPrice,
      sellingPriceRaw: data.sellingPrice,
      sellingPrice,
      quantity,
      totalWeight
    })
    
    // Calcular preços por unidade e por grama a partir do preço total
    const sellingPricePerUnit = quantity > 0 && sellingPrice > 0 ? (sellingPrice / quantity) : 0
    const sellingPricePerGram = totalWeight > 0 && sellingPrice > 0 ? (sellingPrice / totalWeight) : 0

    console.log('Preços calculados:', {
      sellingPrice,
      sellingPricePerUnit,
      sellingPricePerGram
    })

    const productData = {
      name: data.name,
      category: data.category,
      quantity: quantity,
      description: data.description,
      totalWeight: totalWeight,
      totalCost: totals.totalCost,
      suggestedPrice: 0,
      sellingPrice: sellingPrice,
      sellingPricePerUnit: sellingPricePerUnit,
      sellingPricePerGram: sellingPricePerGram,
      profitMargin: 0,
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

    try {
      const response = await fetch('/api/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar produto')
      }
      
      const result = await response.json()
      setCreatedProductName(data.name)
      setShowSuccess(true)
      toast.success('Produto e ficha técnica criados com sucesso!')
    } catch (error) {
      console.error('Erro ao criar produto:', error)
      toast.error('Erro ao criar produto')
    }
  }

  const handleCalculatorConvert = () => {
    const value = parseFloat(calculatorValue.replace(',', '.'))
    if (isNaN(value)) {
      toast.error('Digite um valor válido')
      return
    }

    const baseValue = convertToBase(value, calculatorFromUnit)
    const convertedValue = convertFromBase(baseValue, calculatorToUnit)
    
    setCalculatorResult(`${value} ${calculatorFromUnit} = ${convertedValue.toFixed(3)} ${calculatorToUnit}`)
  }

  const filteredIngredients = ingredients.filter(ing => 
    ing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ing.brand.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Novo Produto</h1>
          <p className="text-sm sm:text-base text-gray-500">Crie um novo produto e sua ficha técnica</p>
        </div>
        <Button variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
          Voltar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Coluna da Esquerda - Dados do Produto */}
        <div className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Dados do Produto</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <form id="productForm" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Produto</Label>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} placeholder="Ex: Bolo de Chocolate" />
                    )}
                  />
                  {errors.name && <span className="text-sm text-red-500">{errors.name.message}</span>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} placeholder="Breve descrição do produto" />
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Controller
                      name="category"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bolos">Bolos</SelectItem>
                            <SelectItem value="doces">Doces</SelectItem>
                            <SelectItem value="salgados">Salgados</SelectItem>
                            <SelectItem value="bebidas">Bebidas</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.category && <span className="text-sm text-red-500">{errors.category.message}</span>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Unidades (rendimento)</Label>
                    <Controller
                      name="quantity"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="text"
                          pattern="[0-9]*[.,]?[0-9]*"
                          onChange={(e) => {
                            const value = e.target.value.replace(',', '.')
                            field.onChange(value === '' ? '' : parseFloat(value))
                          }}
                        />
                      )}
                    />
                    {errors.quantity && <span className="text-sm text-red-500">{errors.quantity.message}</span>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productWeightGrams">Peso do produto (g)</Label>
                    <Controller
                      name="productWeightGrams"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="text"
                          inputMode="decimal"
                          pattern="[0-9]*[.,]?[0-9]*"
                          placeholder="Ex: 1000"
                          onChange={(e) => {
                            const value = e.target.value.replace(',', '.')
                            const parsed = value === '' ? undefined : parseFloat(value)
                            field.onChange(parsed)
                          }}
                        />
                      )}
                    />
                    {errors.productWeightGrams && (
                      <span className="text-sm text-red-500">{errors.productWeightGrams.message as string}</span>
                    )}
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <Label htmlFor="sellingPrice" className="text-sm sm:text-base">Quanto costuma cobrar ?</Label>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <span>Habilitar</span>
                        <Switch id="toggleSellingPrice" checked={enableSellingPrice} onCheckedChange={setEnableSellingPrice} />
                      </div>
                    </div>
                    <Controller
                      name="sellingPrice"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder="0,00"
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          disabled={!enableSellingPrice}
                        />
                      )}
                    />
                    {errors.sellingPrice && enableSellingPrice && (
                      <span className="text-sm text-red-500">{errors.sellingPrice.message}</span>
                    )}
                    {!enableSellingPrice && (
                      <p className="text-xs text-gray-500">Opcional. Desabilitado: não será considerado no cálculo.</p>
                    )}
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Ingredientes Selecionados */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Ingredientes da Receita</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              {selectedIngredients.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  <p className="text-sm sm:text-base">Nenhum ingrediente selecionado</p>
                  <p className="text-xs sm:text-sm mt-1">Use a busca abaixo para adicionar ingredientes</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedIngredients.map(ing => (
                    <div key={ing.id} className="bg-white border rounded-lg p-3 sm:p-4 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                            <span className="font-medium text-sm sm:text-base truncate">{ing.name}</span>
                            <span className="text-gray-500 text-xs sm:text-sm">({ing.brand})</span>
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 mt-1">
                            {formatQuantity(ing.useQuantity, ing.useUnit)} × R$ {
                              calculatePricePerUnit(
                                ing.pricePerGram,
                                ing.quantity,
                                ing.unit,
                                ing.useUnit
                              ).toFixed(2)
                            }
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                          <div className="text-right sm:text-left">
                            <div className="font-medium text-sm sm:text-base">R$ {ing.totalCost.toFixed(2)}</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleIngredientToggle(ing, false)}
                            className="shrink-0"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mt-4">
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                        <div className="flex items-center gap-1 sm:gap-2 text-gray-600">
                          <Package className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                          <span className="text-xs sm:text-sm">Rendimento</span>
                        </div>
                        <span className="font-medium text-xs sm:text-sm">{String(watch('quantity') || 0)} un</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                        <div className="flex items-center gap-1 sm:gap-2 text-gray-600">
                          <Scale className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                          <span className="text-xs sm:text-sm">Peso</span>
                        </div>
                        <span className="font-medium text-xs sm:text-sm">{Math.round(calculateTotals().totalWeight)}g</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 text-base sm:text-lg font-medium">
                      <span className="text-sm sm:text-base">Custo Total:</span>
                      <span>R$ {calculateTotals().totalCost.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 text-xs sm:text-sm text-gray-500 mt-2">
                      <span className="break-words">Preço Minimo Sugerido (1.2x):</span>
                      <span className="whitespace-nowrap">R$ {(calculateTotals().totalCost * 1.2).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Coluna da Direita - Busca de Ingredientes */}
        <div className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 text-base sm:text-lg">
                <span>Buscar Ingredientes</span>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculadora
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Calculadora de Conversão</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          inputMode="decimal"
                          placeholder="Valor"
                          value={calculatorValue}
                          onChange={(e) => setCalculatorValue(e.target.value)}
                          className="flex-1"
                        />
                        <Select value={calculatorFromUnit} onValueChange={setCalculatorFromUnit}>
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="g">g</SelectItem>
                            <SelectItem value="l">L</SelectItem>
                            <SelectItem value="ml">ml</SelectItem>
                          </SelectContent>
                        </Select>
                        <span>para</span>
                        <Select value={calculatorToUnit} onValueChange={setCalculatorToUnit}>
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="g">g</SelectItem>
                            <SelectItem value="l">L</SelectItem>
                            <SelectItem value="ml">ml</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleCalculatorConvert} className="w-full">
                        Converter
                      </Button>
                      {calculatorResult && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center font-medium">
                          {calculatorResult}
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="mb-3 sm:mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    className="pl-9"
                    placeholder="Buscar por nome ou marca.. ."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="border rounded-lg divide-y max-h-[400px] sm:max-h-[600px] overflow-y-auto">
                {filteredIngredients.map((ingredient) => {
                  const isSelected = selectedIngredients.some(ing => ing.id === ingredient.id)
                  return (
                    <div
                      key={ingredient.id}
                      className={`p-3 sm:p-4 hover:bg-gray-50 transition-colors ${
                        isSelected ? 'bg-gray-50' : ''
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm sm:text-base truncate">{ingredient.name}</div>
                            <div className="text-xs sm:text-sm text-gray-500 truncate">{ingredient.brand}</div>
                            <div className="text-xs sm:text-sm text-gray-500">
                              Disponível: {formatQuantity(ingredient.quantity, ingredient.unit)}
                            </div>
                          </div>
                          <div className="text-left sm:text-right shrink-0">
                            <div className="font-medium text-sm sm:text-base">
                              R$ {ingredient.pricePerGram.toFixed(2)}
                            </div>
                          </div>
                        </div>
                        
                        {!isSelected ? (
                          <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <div className="flex-1">
                              <Input
                                type="text"
                                inputMode="decimal"
                                className="w-full text-sm sm:text-base"
                                value={quantities[ingredient.id] || ''}
                                onChange={(e) => {
                                  const value = e.target.value
                                  
                                  // Validar se é um número válido
                                  const numValue = parseFloat(value.replace(',', '.'))
                                  if (value !== '' && value !== ',' && value !== '.' && isNaN(numValue)) return
                                  
                                  handleQuantityChange(ingredient.id, value, ingredient.unit)
                                }}
                                placeholder={`Quantidade em ${ingredient.unit}`}
                              />
                            </div>
                            <Button
                              onClick={() => {
                                const quantity = parseFloat(quantities[ingredient.id]?.replace(',', '.') || '0')
                                if (quantity > ingredient.quantity) {
                                  toast.warning(`Atenção: Quantidade (${formatQuantity(quantity, ingredient.unit)}) maior que disponível (${formatQuantity(ingredient.quantity, ingredient.unit)})`)
                                }
                                handleIngredientToggle(ingredient, true)
                              }}
                              disabled={!quantities[ingredient.id] || quantities[ingredient.id] === ''}
                              className="w-full sm:w-auto sm:min-w-[120px]"
                            >
                              <PlusCircle className="h-4 w-4 mr-2" />
                              Adicionar
                            </Button>
                          </div>
                        ) : (
                          <div className="mt-4">
                            <Button
                              variant="destructive"
                              onClick={() => handleIngredientToggle(ingredient, false)}
                              className="w-full"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remover
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex gap-3 sm:gap-4">
        <Button
          type="submit"
          form="productForm"
          className="flex-1 w-full text-sm sm:text-base py-2 sm:py-2.5"
          onClick={handleSubmit(onSubmit)}
        >
          Criar Produto
        </Button>
      </div>

      {/* Modal de Sucesso */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false)
          router.push('/dashboard/produtos')
        }}
        title="Produto Criado com Sucesso!"
        message={createdProductName ? `O produto "${createdProductName}" e sua ficha técnica foram criados com sucesso!` : 'Produto e ficha técnica criados com sucesso!'}
        confirmText="Ver Produtos"
        onConfirm={() => {
          router.push('/dashboard/produtos')
        }}
      />
    </div>
  )
} 