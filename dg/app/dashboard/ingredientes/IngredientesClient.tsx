'use client'

import { useState, useEffect } from 'react'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from 'sonner'
import { Pencil, Trash2 } from 'lucide-react'
import SuccessModal from '../../../components/ui/SuccessModal'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useRouter } from 'next/navigation'
import DoceGestaoLoading from '../../../components/ui/DoceGestaoLoading'

interface Ingredient {
  id: number
  name: string
  unit: string
  quantity?: number
  pricePerGram: number
  brand: string
  lastUpdate: string
  fichaTecnicas?: { length: number }[]
}

export default function IngredientesClient() {
  const router = useRouter()
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdIngredientName, setCreatedIngredientName] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    quantity: '',
    price: '',
    brand: ''
  })

  useEffect(() => {
    fetchIngredients()
  }, [])

  const fetchIngredients = async () => {
    try {
      const response = await fetch('/api/ingredientes')
      if (!response.ok) {
        throw new Error('Erro ao buscar ingredientes')
      }
      const data = await response.json()
      setIngredients(data)
    } catch (error) {
      toast.error('Erro ao carregar ingredientes')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.unit || !formData.quantity || !formData.price || !formData.brand) {
      // Mensagem de erro mais específica
      const missingFields = []
      if (!formData.name) missingFields.push('nome')
      if (!formData.unit) missingFields.push('unidade')
      if (!formData.quantity) missingFields.push('quantidade')
      if (!formData.price) missingFields.push('preço')
      if (!formData.brand) missingFields.push('marca')
      
      toast.error(`Preencha os campos obrigatórios: ${missingFields.join(', ')}`)
      return
    }

    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = '/api/ingredientes' + (editingId ? `?id=${editingId}` : '')
      
      const requestBody = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        price: parseFloat(formData.price),
        ...(editingId && { id: editingId })
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao salvar ingrediente')
      }

      const isEditing = !!editingId
      setCreatedIngredientName(formData.name)
      
      // Limpar formulário
      setFormData({ name: '', unit: '', quantity: '', price: '', brand: '' })
      setEditingId(null)
      
      // Mostrar confirmação apenas para novos ingredientes
      if (!isEditing) {
        setShowSuccess(true)
      }
      
      toast.success(isEditing ? 'Ingrediente atualizado com sucesso!' : 'Ingrediente adicionado com sucesso!')
      fetchIngredients()
    } catch (error) {
      toast.error('Erro ao salvar ingrediente')
      console.error(error)
    }
  }

  const handleEdit = (ingredient: Ingredient) => {
    router.push(`/dashboard/ingredientes/${ingredient.id}/editar`)
  }

  const handleDeleteClick = async (ingredient: Ingredient) => {
    if (ingredient.fichaTecnicas && ingredient.fichaTecnicas.length > 0) {
      toast.info(
        `Este ingrediente está sendo usado em ${ingredient.fichaTecnicas.length} produto(s). 
         Os custos dos produtos serão recalculados após a remoção.`
      )
    }

    setDeleteId(ingredient.id)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteId) return

    try {
      const response = await fetch(`/api/ingredientes?id=${deleteId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir ingrediente')
      }

      toast.success('Ingrediente removido com sucesso!')
      fetchIngredients()
    } catch (error) {
      toast.error('Erro ao excluir ingrediente')
      console.error(error)
    } finally {
      setIsDeleteDialogOpen(false)
      setDeleteId(null)
    }
  }

  if (isLoading) {
    return <DoceGestaoLoading />
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {editingId ? 'Editar Ingrediente' : 'Adicionar Ingrediente'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  id="quantity"
                  type="number"
                  step="0.01"
                  placeholder="500"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  className="flex-1"
                />
                <Select
                  value={formData.unit}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}
                >
                  <SelectTrigger className={`w-[120px] ${!formData.unit ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Unidade *" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="g">Gramas (g)</SelectItem>
                    <SelectItem value="kg">Quilogramas (kg)</SelectItem>
                    <SelectItem value="ml">Mililitros (ml)</SelectItem>
                    <SelectItem value="l">Litros (l)</SelectItem>
                    <SelectItem value="un">Unidade (un)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {!formData.unit && (
                <p className="text-sm text-red-500">Selecione uma unidade</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Preço</Label>
              <Input 
                id="price" 
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
                id="brand"
                placeholder="Ex: Dona Benta"
                value={formData.brand}
                onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
              />
            </div>

            <div className="flex items-end">
              <Button
                type="submit"
                className="w-full bg-[#0B7A48] hover:bg-[#0ea65f]"
              >
                {editingId ? 'Atualizar' : 'Adicionar'} Ingrediente
              </Button>
            </div>

            {editingId && (
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setEditingId(null)
                    setFormData({ name: '', unit: '', quantity: '', price: '', brand: '' })
                  }}
                >
                  Cancelar
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este ingrediente? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Ingredientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Última atualização</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingredients.map((ingredient) => (
                <TableRow key={ingredient.id}>
                  <TableCell>{ingredient.name}</TableCell>
                  <TableCell>{Number(ingredient.quantity ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {ingredient.unit}</TableCell>
                  <TableCell>
                    R$ {Number(ingredient.pricePerGram).toFixed(2)}
                  </TableCell>
                  <TableCell>{ingredient.brand}</TableCell>
                  <TableCell>
                    {new Date(ingredient.lastUpdate).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(ingredient)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteClick(ingredient)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Sucesso */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Ingrediente Adicionado com Sucesso!"
        message={createdIngredientName ? `O ingrediente "${createdIngredientName}" foi adicionado com sucesso!` : 'Ingrediente adicionado com sucesso!'}
        confirmText="Entendi"
      />
    </div>
  )
} 