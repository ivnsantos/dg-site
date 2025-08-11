'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { PlusCircle, Pencil, Trash2, Package2, Scale, TrendingUp, AlertTriangle, Search, BarChart3 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import dynamic from 'next/dynamic'

// Importação dinâmica do Chart.js para evitar problemas de SSR
const Bar = dynamic(() => import('react-chartjs-2').then(mod => mod.Bar), { ssr: false })

// Registrar componentes do Chart.js
if (typeof window !== 'undefined') {
  import('chart.js').then(({ Chart, registerables }) => {
    Chart.register(...registerables)
  })
}

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
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [searchTerm, products])

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

  const filterProducts = () => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products)
      return
    }

    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredProducts(filtered)
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

  const createProductChart = (product: Product) => {
    const chartData = {
      labels: ['Custo', 'Preço Atual', 'Preço Sugerido'],
      datasets: [
        {
          label: 'Valores (R$)',
          data: [product.totalCost, product.sellingPrice, product.suggestedPrice],
          backgroundColor: [
            'rgba(239, 68, 68, 0.8)',   // Vermelho para custo
            'rgba(34, 197, 94, 0.8)',   // Verde para preço atual
            'rgba(59, 130, 246, 0.8)',  // Azul para preço sugerido
          ],
          borderColor: [
            'rgba(239, 68, 68, 1)',
            'rgba(34, 197, 94, 1)',
            'rgba(59, 130, 246, 1)',
          ],
          borderWidth: 1,
        },
      ],
    }

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
                 title: {
           display: true,
           text: `${product.name}`,
           font: {
             size: 14,
             weight: 'bold' as const
           }
         },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Valor (R$)',
            font: {
              size: 12
            }
          },
          ticks: {
            font: {
              size: 10
            }
          }
        },
        x: {
          ticks: {
            font: {
              size: 10
            }
          }
        },
      },
    }

    return { chartData, chartOptions }
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

      {/* Barra de Pesquisa */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Pesquisar produtos por nome ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>



      <div className="space-y-4">
        {isLoading ? (
          <>
            <LoadingSkeleton />
            <LoadingSkeleton />
            <LoadingSkeleton />
          </>
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package2 className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
                </h3>
                <p className="text-gray-500 text-center mb-6">
                  {searchTerm 
                    ? `Nenhum produto encontrado para "${searchTerm}". Tente uma busca diferente.`
                    : 'Comece cadastrando seu primeiro produto para gerenciar suas receitas'
                  }
                </p>
                {!searchTerm && (
                  <Link href="/dashboard/produtos/novo">
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Cadastrar Produto
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const { chartData, chartOptions } = createProductChart(product)
            
            return (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  {/* Seção do Produto */}
                  <div className="p-6">
                    {/* Header do Produto */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
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
                    
                    {/* Alertas */}
                    {product.profitMargin < 0 && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <span className="text-sm font-medium text-red-800">
                            Prejuízo: R$ {(product.sellingPrice - product.totalCost).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {product.profitMargin >= 0 && product.profitMargin <= 15 && (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-800">
                            Margem baixa: {product.profitMargin.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Informações Básicas */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
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

                    {/* Preços */}
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Custo</span>
                        <span className="font-medium text-gray-900">R$ {product.totalCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Preço Atual</span>
                        <span className="font-medium text-gray-900">R$ {product.sellingPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Preço Sugerido</span>
                        <span className="font-medium text-blue-600">R$ {product.suggestedPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Lucros */}
                    <div className="pt-4 border-t">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Lucro Atual</p>
                          <p className={`text-lg font-bold ${product.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {product.profitMargin.toFixed(1)}%
                          </p>
                          <p className="text-sm text-gray-600">
                            R$ {(product.sellingPrice - product.totalCost).toFixed(2)}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Lucro Sugerido</p>
                          <p className="text-lg font-bold text-blue-600">
                            {((product.suggestedPrice - product.totalCost) / product.totalCost * 100).toFixed(1)}%
                          </p>
                          <p className="text-sm text-gray-600">
                            R$ {(product.suggestedPrice - product.totalCost).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seção do Gráfico */}
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Análise de Preços</h3>
                    </div>
                    <div className="h-64">
                      {typeof window !== 'undefined' && (
                        <Bar data={chartData} options={chartOptions} />
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}