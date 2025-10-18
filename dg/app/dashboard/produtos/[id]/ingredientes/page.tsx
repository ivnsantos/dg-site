'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ArrowLeft, Package2, List, Scale, DollarSign, AlertTriangle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface FichaTecnica {
  id: number
  name: string
  description: string
  unitCost: number
  quantityUsed: number
  totalCost: number
  unit: string
  ingredientId: number
  ingredient: {
    id: number
    name: string
    pricePerGram: number
    unit: string
  }
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
  profitMargin: number
  idealMarkup: number
  lastUpdate: Date
  fichaTecnicas: FichaTecnica[]
}

export default function ProdutoIngredientesPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProduct()
  }, [params.id])

  const loadProduct = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/produtos/${params.id}`)
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar produto: ${response.statusText}`)
      }

      const data = await response.json()
      setProduct(data)
    } catch (error) {
      console.error('Erro ao carregar produto:', error)
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
      toast.error('Erro ao carregar dados do produto')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="p-4 sm:p-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Erro ao carregar produto
          </h2>
          <p className="text-gray-500 mb-6">
            {error || 'Não foi possível carregar os dados do produto'}
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Ingredientes de {product.name}
          </h1>
          <p className="text-gray-500 mt-1">
            Visualize todos os ingredientes e custos deste produto
          </p>
        </div>
      </div>

      {/* Informações do Produto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package2 className="h-5 w-5 text-blue-600" />
            Informações do Produto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Categoria</p>
              <Badge variant="secondary">{product.category}</Badge>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Rendimento</p>
              <p className="text-lg font-bold text-green-600">{product.quantity} un</p>
            </div>
                         <div className="text-center p-4 bg-purple-50 rounded-lg">
               <p className="text-sm text-gray-500 mb-1">Peso Total</p>
               <p className="text-lg font-bold text-purple-600">{Math.round(product.totalWeight)}g</p>
             </div>
                         <div className="text-center p-4 bg-orange-50 rounded-lg">
               <p className="text-sm text-gray-500 mb-1">Margem de Lucro</p>
               <p className={`text-lg font-bold ${Number(product.profitMargin) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                 {Number(product.profitMargin).toFixed(1)}%
               </p>
             </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Ingredientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5 text-green-600" />
            Ingredientes da Receita
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!product.fichaTecnicas || product.fichaTecnicas.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Nenhum ingrediente encontrado</h3>
              <p className="text-sm">Este produto não possui ingredientes cadastrados</p>
            </div>
          ) : (
            <div className="space-y-4">
              {product.fichaTecnicas.map((ficha) => (
                <div key={ficha.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg text-gray-900 mb-1">
                        {ficha.ingredient?.name || 'Ingrediente'}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {ficha.description || 'Sem descrição'}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Scale className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">
                            {ficha.quantityUsed} {ficha.unit}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">
                            R$ {Number(ficha.unitCost).toFixed(2)} por {ficha.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-2">
                        {ficha.ingredient?.unit || ficha.unit}
                      </Badge>
                      <div className="text-lg font-bold text-green-600">
                        R$ {Number(ficha.totalCost).toFixed(2)}
                      </div>
                      <p className="text-xs text-gray-500">Custo total</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo Financeiro */}
      {product.fichaTecnicas && product.fichaTecnicas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Resumo Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                             <div className="text-center p-4 bg-red-50 rounded-lg">
                 <p className="text-sm text-gray-500 mb-1">Custo Total</p>
                 <p className="text-2xl font-bold text-red-600">
                   R$ {Number(product.totalCost).toFixed(2)}
                 </p>
                 <p className="text-xs text-gray-500">
                   {product.fichaTecnicas?.length || 0} ingrediente(s)
                 </p>
               </div>
               
               <div className="text-center p-4 bg-blue-50 rounded-lg">
                 <p className="text-sm text-gray-500 mb-1">Preço Atual</p>
                 <p className="text-2xl font-bold text-blue-600">
                   R$ {Number(product.sellingPrice).toFixed(2)}
                 </p>
                 <p className="text-xs text-gray-500">Preço de venda</p>
               </div>
               
               <div className="text-center p-4 bg-green-50 rounded-lg">
                 <p className="text-sm text-gray-500 mb-1">Preço Sugerido</p>
                 <p className="text-2xl font-bold text-green-600">
                   R$ {Number(product.suggestedPrice).toFixed(2)}
                 </p>
                 <p className="text-xs text-gray-500">
                   Markup {Number(product.idealMarkup)}x
                 </p>
               </div>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                             <div className="flex justify-between items-center">
                 <span className="font-medium text-gray-700">Lucro Atual:</span>
                 <span className={`font-bold text-lg ${Number(product.profitMargin) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                   R$ {(Number(product.sellingPrice) - Number(product.totalCost)).toFixed(2)}
                 </span>
               </div>
               <div className="flex justify-between items-center mt-2">
                 <span className="font-medium text-gray-700">Lucro Sugerido:</span>
                 <span className="font-bold text-lg text-green-600">
                   R$ {(Number(product.suggestedPrice) - Number(product.totalCost)).toFixed(2)}
                 </span>
               </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 