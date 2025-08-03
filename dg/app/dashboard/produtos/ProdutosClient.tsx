'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { PlusCircle, Pencil, Trash2, Package2, Scale, TrendingUp, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface Product {
  id: number
  name: string
  quantity: number
  price: number
  category: string
  totalWeight: number
  totalCost: number
  suggestedPrice: number
  sellingPrice: number
  profitMargin: number
  idealMarkup: number
  lastUpdate: Date
}

export default function ProdutosClient() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/produtos')
      if (!response.ok) {
        const errorData = await response.json()
        
        if (response.status === 503) {
          // Erro de conexão com banco de dados
          toast.error('Erro de conexão. Tente novamente em alguns segundos.')
          return
        }
        
        throw new Error(errorData.error || 'Erro ao carregar produtos')
      }
      
      const data = await response.json()
      const formattedProducts = data.map((product: Product) => ({
        ...product,
        price: Number(product.price),
        totalWeight: Number(product.totalWeight),
        totalCost: Number(product.totalCost),
        suggestedPrice: Number(product.suggestedPrice),
        sellingPrice: Number(product.sellingPrice),
        profitMargin: Number(product.profitMargin),
        idealMarkup: Number(product.idealMarkup)
      }))
      setProducts(formattedProducts)
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao carregar produtos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return

    try {
      const response = await fetch(`/api/produtos/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Erro ao excluir produto')
      
      toast.success('Produto excluído com sucesso!')
      loadProducts()
    } catch (error) {
      toast.error('Erro ao excluir produto')
    }
  }

  const LoadingSkeleton = () => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="flex gap-1">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-gray-50 rounded-b-lg">
        <div className="w-full space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="text-right space-y-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="text-right space-y-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Produtos</h1>
          <p className="text-gray-500 mt-1">Gerencie seus produtos e receitas</p>
        </div>
        <Link href="/dashboard/produtos/novo">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <>
            <LoadingSkeleton />
            <LoadingSkeleton />
            <LoadingSkeleton />
          </>
        ) : products.length === 0 ? (
          <div className="col-span-full">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package2 className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum produto cadastrado</h3>
                <p className="text-gray-500 text-center mb-6">
                  Comece cadastrando seu primeiro produto para gerenciar suas receitas
                </p>
                <Link href="/dashboard/produtos/novo">
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Cadastrar Produto
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        ) : (
          products.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{product.name}</CardTitle>
                    <Badge variant="secondary" className="mt-2">{product.category}</Badge>
                  </div>
                  <div className="flex gap-1">
                    <Link href={`/dashboard/produtos/${product.id}/editar`}>
                      <Button variant="ghost" size="icon" title="Editar produto">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(product.id)}
                      title="Excluir produto"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {/* Alerta de Déficit */}
              {product.profitMargin < 0 && (
                <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <div>
                      <p className="text-sm font-medium text-red-800">
                         Prejuízo Detectado
                      </p>
                      <p className="text-xs text-red-600">
                        Este produto está gerando prejuízo. Considere ajustar o preço de venda.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Alerta de Margem Baixa */}
              {product.profitMargin >= 0 && product.profitMargin <= 15 && (
                <div className="mx-6 mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        ⚠️ Margem de Lucro Baixa
                      </p>
                      <p className="text-xs text-yellow-600">
                        A margem de lucro está muito baixa ({product.profitMargin.toFixed(1)}%). Considere aumentar o preço.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Package2 className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Rendimento</p>
                      <p className="font-medium">{product.quantity} un</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Peso</p>
                      <p className="font-medium">{product.totalWeight.toFixed(0)}g</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">Custo</span>
                      <div className="group relative">
                        <span className="text-xs text-gray-400 cursor-help">ⓘ</span>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          Custo total dos ingredientes
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-600">R$ {product.totalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">Preço Atual</span>
                    </div>
                    <span className="text-xs text-gray-600">R$ {product.sellingPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">Preço Sugerido</span>
                      <div className="group relative">
                        <span className="text-xs text-gray-400 cursor-help">ⓘ</span>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          Preço ideal para {product.idealMarkup.toFixed(1)}x markup
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-blue-600 font-medium">R$ {product.suggestedPrice.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="bg-gray-50 rounded-b-lg">
                <div className="w-full space-y-2">
                  {/* Lucro Atual */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <TrendingUp className={`h-4 w-4 ${product.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">Lucro Atual</span>
                        <div className="group relative">
                          <span className="text-xs text-gray-400 cursor-help">ⓘ</span>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            Lucro real com o preço atual
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${product.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.profitMargin.toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-500">
                        R$ {(product.sellingPrice - product.totalCost).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Lucro Projetado */}
                  <div className="flex justify-between items-center pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">Lucro Sugerido</span>
                        <div className="group relative">
                          <span className="text-xs text-gray-400 cursor-help">ⓘ</span>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            Lucro se usar o preço sugerido
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-blue-600">
                        {((product.suggestedPrice - product.totalCost) / product.totalCost * 100).toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-500">
                        R$ {(product.suggestedPrice - product.totalCost).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  )
} 