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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Trash2, Search, Plus, Calculator, Plus as PlusCircle } from 'lucide-react'

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
  sellingPrice: z.number().min(0, 'Preço de venda deve ser maior que 0'),
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

  const { control, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      category: '',
      quantity: 1,
      description: '',
      sellingPrice: 0,
    }
  })

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

    const productData = {
      name: data.name,
      category: data.category,
      quantity: data.quantity,
      description: data.description,
      totalWeight: totals.totalWeight,
      totalCost: totals.totalCost,
      suggestedPrice: 0,
      sellingPrice: data.sellingPrice,
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

      if (!response.ok) throw new Error('Erro ao criar produto')
      
      toast.success('Produto e ficha técnica criados com sucesso!')
      router.push('/dashboard/produtos')
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
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Novo Produto</h1>
          <p className="text-gray-500">Crie um novo produto e sua ficha técnica</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Voltar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna da Esquerda - Dados do Produto */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados do Produto</CardTitle>
            </CardHeader>
            <CardContent>
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

                <div className="grid grid-cols-2 gap-4">
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
                    <Label htmlFor="quantity">Rendimento</Label>
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
                    <Label htmlFor="sellingPrice">Quanto costuma cobrar ?</Label>
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
                        />
                      )}
                    />
                    {errors.sellingPrice && (
                      <span className="text-sm text-red-500">{errors.sellingPrice.message}</span>
                    )}
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Ingredientes Selecionados */}
          <Card>
            <CardHeader>
              <CardTitle>Ingredientes da Receita</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedIngredients.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhum ingrediente selecionado</p>
                  <p className="text-sm">Use a busca ao lado para adicionar ingredientes</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedIngredients.map(ing => (
                    <div key={ing.id} className="bg-white border rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{ing.name}</span>
                            <span className="text-gray-500 text-sm">({ing.brand})</span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
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
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-medium">R$ {ing.totalCost.toFixed(2)}</div>
                          </div>
                          <Button
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

                  <div className="bg-gray-50 rounded-lg p-4 mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Peso Total:</span>
                      <span>{calculateTotals().totalWeight.toFixed(2)}g</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-medium">
                      <span>Custo Total:</span>
                      <span>R$ {calculateTotals().totalCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500 mt-2">
                      <span>Preço Minimo Sugerido (1.2x):</span>
                      <span>R$ {(calculateTotals().totalCost * 1.2).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Coluna da Direita - Busca de Ingredientes */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Buscar Ingredientes</span>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
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
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    className="pl-9"
                    placeholder="Buscar por nome ou marca..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="border rounded-lg divide-y max-h-[600px] overflow-y-auto">
                {filteredIngredients.map((ingredient) => {
                  const isSelected = selectedIngredients.some(ing => ing.id === ingredient.id)
                  return (
                    <div
                      key={ingredient.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        isSelected ? 'bg-gray-50' : ''
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{ingredient.name}</div>
                            <div className="text-sm text-gray-500">{ingredient.brand}</div>
                            <div className="text-sm text-gray-500">
                              Disponível: {formatQuantity(ingredient.quantity, ingredient.unit)}
                            </div>
                            {quantities[ingredient.id] && parseFloat(quantities[ingredient.id].replace(',', '.')) > ingredient.quantity && (
                              <div className="text-sm text-orange-600 font-medium mt-1">
                                ⚠️ Quantidade maior que disponível
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              R$ {ingredient.pricePerGram.toFixed(2)}
                            </div>
                          </div>
                        </div>
                        
                        {!isSelected ? (
                          <div className="mt-4 flex items-center gap-2">
                            <div className="flex-1">
                              <Input
                                type="text"
                                inputMode="decimal"
                                className="w-full"
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
                              className="min-w-[120px]"
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

      <div className="flex gap-4">
        <Button
          type="submit"
          form="productForm"
          className="flex-1"
          onClick={handleSubmit(onSubmit)}
        >
          Criar Produto
        </Button>
      </div>
    </div>
  )
} 