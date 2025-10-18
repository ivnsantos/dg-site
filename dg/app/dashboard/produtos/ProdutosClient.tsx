'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { PlusCircle, Pencil, Trash2, Package2, Scale, TrendingUp, AlertTriangle, Search, BarChart3, FlaskConical } from 'lucide-react'
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
  sellingPricePerUnit: number
  sellingPricePerGram: number
  profitMargin: number
  idealMarkup: number
  lastUpdate: Date
}



export default function ProdutosClient() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCharts, setExpandedCharts] = useState<{[key: number]: boolean}>({})

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
      console.log('Produtos carregados:', data)
      
      const formattedProducts = data.map((product: Product) => ({
        ...product,
        price: Number(product.price),
        totalWeight: Number(product.totalWeight),
        totalCost: Number(product.totalCost),
        suggestedPrice: Number(product.suggestedPrice),
        sellingPrice: Number(product.sellingPrice),
        sellingPricePerUnit: Number(product.sellingPricePerUnit || 0),
        sellingPricePerGram: Number(product.sellingPricePerGram || 0),
        profitMargin: Number(product.profitMargin),
        idealMarkup: Number(product.idealMarkup)
      }))
      
      console.log('Produtos formatados:', formattedProducts)
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

  const handleViewIngredients = (product: Product) => {
    router.push(`/dashboard/produtos/${product.id}/ingredientes`)
  }

  const toggleChartExpansion = (productId: number) => {
    setExpandedCharts(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }))
  }

    const createProductChart = (product: Product) => {
    const lucroSugerido = product.suggestedPrice - product.totalCost
    
    const chartData = {
      labels: ['Custo', 'Preço Atual', 'Preço Sugerido'],
      datasets: [
        {
          label: 'Custo',
          data: [product.totalCost, 0, product.totalCost],
          backgroundColor: 'rgba(220, 38, 38, 0.9)',   // Vermelho mais escuro para custo
          borderColor: 'rgba(220, 38, 38, 1)',
          borderWidth: 2,
          stack: 'stack1',
        },
        {
          label: 'Preço Atual',
          data: [0, product.sellingPrice, 0],
          backgroundColor: 'rgba(37, 99, 235, 0.9)',   // Azul mais escuro para preço atual
          borderColor: 'rgba(37, 99, 235, 1)',
          borderWidth: 2,
          stack: 'stack2',
        },
        {
          label: 'Lucro Sugerido',
          data: [0, 0, lucroSugerido],
          backgroundColor: 'rgba(16, 185, 129, 0.9)',  // Verde esmeralda para lucro
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 2,
          stack: 'stack1',
        }
      ],
    }

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
        },
        title: {
          display: true,
          text: `${product.name}`,
          font: {
            size: 18,
            weight: 'bold' as const
          }
        },
        tooltip: {
          enabled: true,
          callbacks: {
            label: function(context: any) {
              const value = context.parsed.y.toFixed(2)
              if (context.datasetIndex === 0 && context.dataIndex === 2) {
                return `Custo: R$ ${value}`
              } else if (context.datasetIndex === 1) {
                return `Preço Atual: R$ ${value}`
              } else if (context.datasetIndex === 2) {
                return `Lucro Sugerido: R$ ${value}`
              }
              return `${context.dataset.label}: R$ ${value}`
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Valor (R$)',
            font: {
              size: 14
            }
          },
          ticks: {
            font: {
              size: 12
            }
          }
        },
        x: {
          ticks: {
            font: {
              size: 12
            }
          }
        },
      },
    }

    return { chartData, chartOptions }
  }

                const LoadingSkeleton = () => (
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-3">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <div className="flex gap-1">
                          <Skeleton className="h-6 w-6 rounded-md" />
                          <Skeleton className="h-6 w-6 rounded-md" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5">
                            <Skeleton className="h-3 w-3" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                          <Skeleton className="h-3 w-12" />
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5">
                            <Skeleton className="h-3 w-3" />
                            <Skeleton className="h-3 w-12" />
                          </div>
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t">
                        <div className="flex justify-between items-center">
                          <Skeleton className="h-3 w-12" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        <div className="flex justify-between items-center">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        <div className="flex justify-between items-center">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                        <div className="text-center p-1.5 bg-gray-50 rounded-lg">
                          <Skeleton className="h-3 w-16 mx-auto mb-1" />
                          <Skeleton className="h-4 w-12 mx-auto mb-1" />
                          <Skeleton className="h-3 w-20 mx-auto" />
                        </div>
                        <div className="text-center p-1.5 bg-gray-50 rounded-lg">
                          <Skeleton className="h-3 w-20 mx-auto mb-1" />
                          <Skeleton className="h-4 w-12 mx-auto mb-1" />
                          <Skeleton className="h-3 w-20 mx-auto" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
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



                        <div className={`grid gap-4 ${
                    expandedCharts[Object.keys(expandedCharts).find(key => expandedCharts[parseInt(key)]) ? parseInt(Object.keys(expandedCharts).find(key => expandedCharts[parseInt(key)])!) : 0] ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 lg:grid-cols-3'
                  }`}>
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
                        const weightKg = product.totalWeight > 0 ? (product.totalWeight / 1000) : 0
                        const sellingPerKg = weightKg ? (product.sellingPrice / weightKg) : 0
                        const costPerKg = weightKg ? (product.totalCost / weightKg) : 0
                        const suggestedPerKg = weightKg ? (product.suggestedPrice / weightKg) : 0
                        const sellingPerUnit = product.quantity > 0 ? (product.sellingPrice / product.quantity) : 0
                        const costPerUnit = product.quantity > 0 ? (product.totalCost / product.quantity) : 0
                        const suggestedPerUnit = product.quantity > 0 ? (product.suggestedPrice / product.quantity) : 0
                        
                        console.log(`Produto ${product.name}:`, {
                          sellingPrice: product.sellingPrice,
                          sellingPerUnit: sellingPerUnit,
                          quantity: product.quantity
                        })

                        return (
                          <Card key={product.id} className={`hover:shadow-lg transition-all duration-300 ${
                            expandedCharts[product.id] ? 'lg:col-span-2' : ''
                          }`}>
                            <div className={`grid gap-0 ${
                              expandedCharts[product.id] ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
                            }`}>
                              {/* Seção do Produto */}
                              <div className={`transition-all duration-300 ${
                                expandedCharts[product.id] ? 'p-6' : 'p-3'
                              }`}>
                                                    {/* Header do Produto */}
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h2 className={`font-bold text-gray-900 ${
                                      expandedCharts[product.id] ? 'text-xl' : 'text-base'
                                    }`}>{product.name}</h2>
                                    <Badge variant="secondary" className="mt-1">{product.category}</Badge>
                                  </div>
                                                        <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleViewIngredients(product)}
                                      title="Ver ingredientes"
                                    >
                                      <FlaskConical className="h-4 w-4 text-blue-600" />
                                    </Button>
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
                                  <div className={`mb-2 p-1.5 bg-red-50 border border-red-200 rounded-lg ${
                                    expandedCharts[product.id] ? 'p-3 mb-4' : ''
                                  }`}>
                                    <div className="flex items-center gap-1.5">
                                      <AlertTriangle className="h-3 w-3 text-red-600" />
                                      <span className={`font-medium text-red-800 ${
                                        expandedCharts[product.id] ? 'text-sm' : 'text-xs'
                                      }`}>
                                        Prejuízo: R$ {(product.sellingPrice - product.totalCost).toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                )}
                                
                                {product.profitMargin >= 0 && product.profitMargin <= 15 && (
                                  <div className={`mb-2 p-1.5 bg-yellow-50 border border-yellow-200 rounded-lg ${
                                    expandedCharts[product.id] ? 'p-3 mb-4' : ''
                                  }`}>
                                    <div className="flex items-center gap-1.5">
                                      <AlertTriangle className="h-3 w-3 text-yellow-600" />
                                      <span className={`font-medium text-yellow-800 ${
                                        expandedCharts[product.id] ? 'text-sm' : 'text-xs'
                                      }`}>
                                        Margem baixa: {product.profitMargin.toFixed(1)}%
                                      </span>
                                    </div>
                                  </div>
                                )}
                                
                                                                                                {/* Informações Básicas e Preços */}
                                <div className={`space-y-1.5 mb-2 ${
                                  expandedCharts[product.id] ? 'space-y-3 mb-4' : ''
                                }`}>
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-1.5">
                                      <Package2 className={`text-gray-500 ${
                                        expandedCharts[product.id] ? 'h-4 w-4' : 'h-3 w-3'
                                      }`} />
                                      <span className={`text-gray-600 ${
                                        expandedCharts[product.id] ? 'text-sm' : 'text-xs'
                                      }`}>Rendimento</span>
                                    </div>
                                    <span className={`font-medium text-gray-900 ${
                                      expandedCharts[product.id] ? 'text-base' : 'text-sm'
                                    }`}>{product.quantity} un</span>
                                  </div>
                                  
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-1.5">
                                      <Scale className={`text-gray-500 ${
                                        expandedCharts[product.id] ? 'h-4 w-4' : 'h-3 w-3'
                                      }`} />
                                      <span className={`text-gray-600 ${
                                        expandedCharts[product.id] ? 'text-sm' : 'text-xs'
                                      }`}>Peso</span>
                                    </div>
                                    <span className={`font-medium text-gray-900 ${
                                      expandedCharts[product.id] ? 'text-base' : 'text-sm'
                                    }`}>{Math.round(product.totalWeight)}g</span>
                                  </div>
                                  
                                  <div className="flex justify-between items-center">
                                    <span className={`text-gray-600 ${
                                      expandedCharts[product.id] ? 'text-sm' : 'text-xs'
                                    }`}></span>
                                    <span className={`font-medium text-gray-900 ${
                                      expandedCharts[product.id] ? 'text-base' : 'text-sm'
                                    }`}></span>
                                  </div>
                                </div>

                                {/* Tabela 3x3 clean (tipografia menor) */}
                                <div className="mb-2 rounded-md bg-white">
                                  <div className="grid grid-cols-3 text-[10px] text-gray-500 bg-gray-50 rounded-md">
                                    <div className="px-2.5 py-1">Resumo</div>
                                    <div className="px-2.5 py-1 text-right">kg</div>
                                    <div className="px-2.5 py-1 text-right">unidade</div>
                                  </div>
                                  <div className="grid grid-cols-3 text-xs mt-1">
                                    <div className="px-2.5 py-1 text-gray-600">Custo</div>
                                    <div className="px-2.5 py-1 text-right font-medium text-gray-900">R$ {costPerKg.toFixed(2)}</div>
                                    <div className="px-2.5 py-1 text-right font-medium text-gray-900">R$ {costPerUnit.toFixed(2)}</div>
                                  </div>
                                  <div className="grid grid-cols-3 text-xs">
                                    <div className="px-2.5 py-1 text-gray-600">Preço atual</div>
                                    <div className="px-2.5 py-1 text-right font-medium text-gray-900">
                                      {product.sellingPricePerGram > 0 ? `R$ ${product.sellingPricePerGram.toFixed(2)}` : 'R$ 0,00'}
                                    </div>
                                    <div className="px-2.5 py-1 text-right font-medium text-gray-900">
                                      {product.sellingPricePerUnit > 0 ? `R$ ${product.sellingPricePerUnit.toFixed(2)}` : 'R$ 0,00'}
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-3 text-xs">
                                    <div className="px-2.5 py-1 text-gray-600">Preço sugerido</div>
                                    <div className="px-2.5 py-1 text-right font-semibold text-blue-600">R$ {suggestedPerKg.toFixed(2)}</div>
                                    <div className="px-2.5 py-1 text-right font-semibold text-blue-600">R$ {suggestedPerUnit.toFixed(2)}</div>
                                  </div>
                                </div>

                                                                {/* Lucros */}
                                <div className={`pt-2 border-t ${
                                  expandedCharts[product.id] ? 'pt-4' : ''
                                }`}>
                                  <div className={`grid grid-cols-2 gap-2 ${
                                    expandedCharts[product.id] ? 'gap-4' : ''
                                  }`}>
                                    <div className={`text-center bg-gray-50 rounded-lg ${
                                      expandedCharts[product.id] ? 'p-3' : 'p-1.5'
                                    }`}>
                                      <p className="text-xs text-gray-500 mb-1">Lucro Atual</p>
                                      <p className={`font-bold ${product.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'} ${
                                        expandedCharts[product.id] ? 'text-lg' : 'text-sm'
                                      }`}>
                                        {product.profitMargin.toFixed(1)}%
                                      </p>
                                      <p className={`text-gray-600 ${
                                        expandedCharts[product.id] ? 'text-sm' : 'text-xs'
                                      }`}>
                                        R$ {(product.sellingPrice - product.totalCost).toFixed(2)}
                                      </p>
                                    </div>
                                    <div className={`text-center bg-blue-50 rounded-lg ${
                                      expandedCharts[product.id] ? 'p-3' : 'p-1.5'
                                    }`}>
                                      <p className="text-xs text-gray-500 mb-1">Lucro Sugerido</p>
                                      <p className={`font-bold text-blue-600 ${
                                        expandedCharts[product.id] ? 'text-lg' : 'text-sm'
                                      }`}>
                                        {((product.suggestedPrice - product.totalCost) / product.totalCost * 100).toFixed(1)}%
                                      </p>
                                      <p className={`text-gray-600 ${
                                        expandedCharts[product.id] ? 'text-sm' : 'text-xs'
                                      }`}>
                                        R$ {(product.suggestedPrice - product.totalCost).toFixed(2)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                  </div>

                  {/* Seção do Gráfico */}
                  <div className={`transition-all duration-300 ${
                    expandedCharts[product.id] ? 'p-6' : 'p-3'
                  }`}>
                    <div className={`flex justify-between items-center ${
                      expandedCharts[product.id] ? 'mb-4' : 'mb-2'
                    }`}>
                      <h3 className={`font-semibold text-gray-900 ${
                        expandedCharts[product.id] ? 'text-lg' : 'text-sm'
                      }`}>Análise de Preços</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleChartExpansion(product.id)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {expandedCharts[product.id] ? (
                          <>
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Ocultar
                          </>
                        ) : (
                          <>
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Mostrar Gráfico
                          </>
                        )}
                      </Button>
                    </div>
                    {expandedCharts[product.id] && (
                      <div className="h-96 transition-all duration-300 ease-in-out">
                        {typeof window !== 'undefined' && (
                          <Bar data={chartData} options={chartOptions} />
                        )}
                      </div>
                    )}
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