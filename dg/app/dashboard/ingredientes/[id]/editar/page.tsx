'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from 'sonner'
import { Calculator, ArrowLeft } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Product {
  id: number
  name: string
  category: string
  totalCost: number
}

interface FichaTecnica {
  id: number
  product: Product
  quantityUsed: number
  unit: string
}

interface Ingredient {
  id: number
  name: string
  unit: string
  quantity: number
  pricePerGram: number
  brand: string
  lastUpdate: string
  fichaTecnicas: FichaTecnica[]
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
          <Label htmlFor="valor" className="text-right">Valor</Label>
          <Input
            id="valor"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="col-span-3"
            placeholder="Digite o valor"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="unidadeOrigem" className="text-right">De</Label>
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
          <Label htmlFor="unidadeDestino" className="text-right">Para</Label>
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

export default function EditarIngredientePage() {
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [ingredient, setIngredient] = useState<Ingredient | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    quantity: '',
    price: '',
    brand: ''
  })

  useEffect(() => {
    const fetchIngredient = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/ingredientes/${params.id}`)
        if (!response.ok) throw new Error('Erro ao carregar ingrediente')
        
        const data: Ingredient = await response.json()
        console.log('Dados do ingrediente:', data) // Para debug
        
        setIngredient(data)
        setFormData({
          name: data.name,
          unit: data.unit,
          quantity: data.quantity.toString(),
          price: data.pricePerGram.toString(),
          brand: data.brand
        })
      } catch (error) {
        console.error('Erro ao carregar ingrediente:', error)
        toast.error('Erro ao carregar ingrediente')
        router.push('/dashboard/ingredientes')
      } finally {
        setIsLoading(false)
      }
    }

    fetchIngredient()
  }, [params.id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.unit || !formData.quantity || !formData.price || !formData.brand) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    // Se houver produtos vinculados, mostrar aviso
    if (ingredient?.fichaTecnicas && ingredient.fichaTecnicas.length > 0) {
      toast.info(
        `Este ingrediente está sendo usado em ${ingredient.fichaTecnicas.length} produto(s). 
         Os custos serão recalculados automaticamente.`
      )
    }

    try {
      const response = await fetch(`/api/ingredientes/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          unit: formData.unit,
          quantity: parseFloat(formData.quantity),
          pricePerGram: parseFloat(formData.price),
          brand: formData.brand,
          // Enviando as fichas técnicas para atualização
          fichaTecnicas: ingredient?.fichaTecnicas?.map(ft => ({
            id: ft.id,
            productId: ft.product.id,
            quantityUsed: ft.quantityUsed,
            unit: ft.unit
          }))
        })
      })

      if (!response.ok) throw new Error('Erro ao atualizar ingrediente')
      
      toast.success('Ingrediente e produtos relacionados atualizados com sucesso!')
      router.push('/dashboard/ingredientes')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao atualizar ingrediente')
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="space-y-4">
          <div className="h-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Editar Ingrediente</h1>
            <p className="text-gray-500 mt-1">Atualize as informações do ingrediente</p>
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

      <Card>
        <CardHeader>
          <CardTitle>Dados do Ingrediente</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                placeholder="Ex: Farinha de Trigo"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Quantidade</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="500"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  className="flex-1"
                />
                <div className="w-[120px] flex items-center justify-center border rounded-md bg-gray-50">
                  <span className="text-gray-600">{formData.unit}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Preço</Label>
              <Input 
                type="number" 
                step="0.01" 
                placeholder="Preço do ingrediente"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Marca</Label>
              <Input
                placeholder="Ex: Dona Benta"
                value={formData.brand}
                onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/ingredientes')}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[#0B7A48] hover:bg-[#0ea65f]"
              >
                Salvar Alterações
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Seção de produtos vinculados */}
      {ingredient && ingredient.fichaTecnicas && ingredient.fichaTecnicas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Produtos que utilizam este ingrediente</CardTitle>
            <p className="text-sm text-gray-500 mt-2">
              Este ingrediente está sendo usado nos seguintes produtos:
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ingredient.fichaTecnicas.map((ft) => (
                <div 
                  key={ft.id} 
                  className="p-4 border rounded-lg hover:bg-gray-50"
                >
                  {/* Informações do Produto */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium text-lg">{ft.product.name}</h3>
                      <p className="text-sm text-gray-500">Categoria: {ft.product.category}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Custo total do produto</div>
                      <div className="font-medium">
                        R$ {(ft.product.totalCost.toString() || 0)}
                      </div>
                    </div>
                  </div>

                  {/* Informações do Ingrediente no Produto */}
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <div className="text-sm text-gray-500">Nome do ingrediente</div>
                        <div className="font-medium">
                          {ingredient.name}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Quantidade usada</div>
                        <div className="font-medium">
                          {ft.quantityUsed} {ft.unit}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-500">Custo do ingrediente</div>
                        <div className="font-medium">
                          R$ {(ft.totalCost)}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 