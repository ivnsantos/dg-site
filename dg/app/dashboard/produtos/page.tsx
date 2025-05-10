export const dynamic = 'force-dynamic'

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { PlusCircle, Pencil, Trash2, Package2, Scale, DollarSign, TrendingUp } from 'lucide-react'
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

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/produtos')
      if (!response.ok) throw new Error('Erro ao carregar produtos')
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
      toast.error('Erro ao carregar produtos')
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
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Produtos</h1>
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
                    <span className="text-xs text-gray-500">Custo</span>
                    <span className="text-xs text-gray-600">R$ {product.totalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Preço Atual</span>
                    <span className="text-xs text-gray-600">R$ {product.sellingPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Preço Sugerido</span>
                    <span className="text-xs text-gray-400">R$ {product.suggestedPrice.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="bg-gray-50 rounded-b-lg">
                <div className="w-full space-y-2">
                  {/* Lucro Atual */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <TrendingUp className={`h-4 w-4 ${product.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                      <span className="text-sm text-gray-500">Lucro Atual</span>
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
                      <span className="text-sm text-gray-500">Lucro Sugerido</span>
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