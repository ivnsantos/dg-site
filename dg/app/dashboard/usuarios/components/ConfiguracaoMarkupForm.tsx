'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useRouter } from 'next/navigation'
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { AlertTriangle } from 'lucide-react'

type RegimeTributario = 'MEI' | 'Simples' | 'Lucro Presumido' | 'Lucro Real'

interface ConfiguracaoMarkupFormProps {
  onClose?: () => void;
}

const inputStyle = "bg-white border-gray-300 text-gray-900 focus:ring-[#0B7A48] focus:border-[#0B7A48]"
const labelStyle = "font-medium text-gray-700"

export function ConfiguracaoMarkupForm({ onClose }: ConfiguracaoMarkupFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [pagaComissao, setPagaComissao] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingSubmit, setPendingSubmit] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    endereco: '',
    logo: '',
    horarioFuncionamento: '',
    horasTrabalhoDiarias: '',
    quantidadeFuncionarios: '',
    folhaPagamentoTotal: '',
    faturamentoMedio: '',
    regimeTributario: '' as RegimeTributario,
    porcentagemImposto: '',
    custosFixos: '',
    proLabore: '',
    diasTrabalhadosMes: '',
    pagaComissao: false,
    porcentagemComissao: '',
    taxaMaquininha: '',
    porcentagemLucroDesejado: ''
  })

  // Carregar dados existentes quando o formulário for aberto
  useEffect(() => {
    console.log('🚀 ConfiguracaoMarkupForm montado - iniciando carregamento...')
    loadExistingData()
  }, [])

  const loadExistingData = async () => {
    try {
      setLoadingData(true)
      console.log('🔄 Carregando dados da confeitaria...')
      
      const response = await fetch('/api/confeitaria')
      console.log('📡 Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📊 Dados recebidos:', data)
        
        const confeitaria = data.confeitaria
        console.log('🏪 Dados da confeitaria:', confeitaria)
        
        // Preencher o formulário com os dados existentes
        const newFormData = {
          nome: confeitaria.nome || '',
          endereco: confeitaria.endereco || '',
          logo: confeitaria.logo || '',
          horarioFuncionamento: confeitaria.horarioFuncionamento || '',
          horasTrabalhoDiarias: confeitaria.horasTrabalhoDiarias?.toString() || '',
          quantidadeFuncionarios: confeitaria.quantidadeFuncionarios?.toString() || '',
          folhaPagamentoTotal: confeitaria.folhaPagamentoTotal?.toString() || '',
          faturamentoMedio: confeitaria.faturamentoMedio?.toString() || '',
          regimeTributario: (confeitaria.regimeTributario as RegimeTributario) || '',
          porcentagemImposto: confeitaria.porcentagemImposto?.toString() || '',
          custosFixos: confeitaria.custosFixos?.toString() || '',
          proLabore: confeitaria.proLabore?.toString() || '',
          diasTrabalhadosMes: confeitaria.diasTrabalhadosMes?.toString() || '',
          pagaComissao: confeitaria.pagaComissao || false,
          porcentagemComissao: confeitaria.porcentagemComissao?.toString() || '',
          taxaMaquininha: confeitaria.taxaMaquininha?.toString() || '',
          porcentagemLucroDesejado: confeitaria.porcentagemLucroDesejado?.toString() || ''
        }
        
        console.log('📝 Novo formData:', newFormData)
        setFormData(newFormData)
        setPagaComissao(confeitaria.pagaComissao || false)
        
        console.log('✅ Dados carregados com sucesso!')
      } else {
        console.log('❌ Response não ok:', response.status, response.statusText)
        const errorData = await response.json().catch(() => ({}))
        console.log('❌ Erro detalhado:', errorData)
        
        // Se for 404, significa que não há dados existentes (normal para primeira configuração)
        if (response.status === 404) {
          console.log('ℹ️ Primeira configuração - não há dados existentes para carregar')
        }
      }
    } catch (error) {
      console.error('💥 Erro ao carregar dados existentes:', error)
      // Não mostrar erro se não houver dados (usuário ainda não configurou)
    } finally {
      setLoadingData(false)
      console.log('🏁 Carregamento finalizado')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Verificar se é uma alteração de markup existente
    const isUpdating = formData.nome && formData.folhaPagamentoTotal
    
    if (isUpdating) {
      setShowConfirmDialog(true)
      setPendingSubmit(true)
      return
    }
    
    await submitForm()
  }

  const submitForm = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/confeitaria', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          horasTrabalhoDiarias: Number(formData.horasTrabalhoDiarias),
          quantidadeFuncionarios: Number(formData.quantidadeFuncionarios),
          folhaPagamentoTotal: Number(formData.folhaPagamentoTotal),
          faturamentoMedio: Number(formData.faturamentoMedio),
          porcentagemImposto: formData.regimeTributario === 'MEI' ? 0 : Number(formData.porcentagemImposto),
          custosFixos: Number(formData.custosFixos),
          proLabore: Number(formData.proLabore),
          diasTrabalhadosMes: Number(formData.diasTrabalhadosMes),
          pagaComissao,
          porcentagemComissao: pagaComissao ? Number(formData.porcentagemComissao) : null,
          taxaMaquininha: Number(formData.taxaMaquininha),
          porcentagemLucroDesejado: Number(formData.porcentagemLucroDesejado)
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar dados')
      }

      toast({
        title: data.markupAlterado ? "Markup Atualizado!" : "Configuração salva com sucesso!",
        description: (
          <div className="mt-2 flex flex-col gap-1">
            <p>Markup ideal calculado para sua confeitaria:</p>
            <p className="font-semibold text-[#0B7A48]">{data.markupIdeal}%</p>
            {data.markupAlterado ? (
              <>
                <p className="text-sm text-orange-600 font-medium">
                  ⚠️ {data.produtosAtualizados} produtos foram atualizados com o novo markup!
                </p>
                <p className="text-sm text-gray-500">
                  Todos os preços sugeridos dos seus produtos foram recalculados automaticamente.
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500">
                Este é o percentual a aplicar sobre seus custos para atingir sua meta.
              </p>
            )}
          </div>
        ),
        duration: 8000,
      })

      if (typeof onClose === 'function') {
        onClose()
      }
      router.refresh()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Não foi possível salvar os dados. Por favor, tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleConfirmSubmit = async () => {
    setShowConfirmDialog(false)
    setPendingSubmit(false)
    await submitForm()
  }

  const handleCancelSubmit = () => {
    setShowConfirmDialog(false)
    setPendingSubmit(false)
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B7A48] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando configurações existentes...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
      <div className="grid grid-cols-2 gap-6">
        {/* Dados Básicos */}
        <div className="col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Dados para Markup</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome" className={labelStyle}>Nome da Confeitaria</Label>
              <Input
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                className={inputStyle}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endereco" className={labelStyle}>Endereço</Label>
              <Input
                id="endereco"
                name="endereco"
                value={formData.endereco}
                onChange={handleChange}
                required
                className={inputStyle}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="logo" className={labelStyle}>URL da Logo</Label>
              <Input
                id="logo"
                name="logo"
                value={formData.logo}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="horarioFuncionamento" className={labelStyle}>Horário de Funcionamento</Label>
              <Input
                id="horarioFuncionamento"
                name="horarioFuncionamento"
                value={formData.horarioFuncionamento}
                onChange={handleChange}
                required
                placeholder="Ex: 08:00 às 18:00"
                className={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Dados Operacionais */}
        <div className="col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Dados Operacionais</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="horasTrabalhoDiarias" className={labelStyle}>Horas de Trabalho Diárias</Label>
              <Input
                type="number"
                id="horasTrabalhoDiarias"
                name="horasTrabalhoDiarias"
                value={formData.horasTrabalhoDiarias}
                onChange={handleChange}
                required
                min="1"
                max="24"
                className={inputStyle}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantidadeFuncionarios" className={labelStyle}>Quantidade de Funcionários</Label>
              <Input
                type="number"
                id="quantidadeFuncionarios"
                name="quantidadeFuncionarios"
                value={formData.quantidadeFuncionarios}
                onChange={handleChange}
                required
                min="0"
                className={inputStyle}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="folhaPagamentoTotal" className={labelStyle}>Folha de Pagamento Total</Label>
              <Input
                type="number"
                id="folhaPagamentoTotal"
                name="folhaPagamentoTotal"
                value={formData.folhaPagamentoTotal}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Dados Financeiros */}
        <div className="col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Dados Financeiros</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="faturamentoMedio" className={labelStyle}>Faturamento Médio/Mês</Label>
              <Input
                type="number"
                id="faturamentoMedio"
                name="faturamentoMedio"
                value={formData.faturamentoMedio}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className={inputStyle}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="regimeTributario" className={labelStyle}>Regime Tributário</Label>
              <Select
                value={formData.regimeTributario}
                onValueChange={(value: RegimeTributario) => setFormData(prev => ({ ...prev, regimeTributario: value }))}
              >
                <SelectTrigger className={inputStyle}>
                  <SelectValue placeholder="Selecione o regime" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEI">MEI</SelectItem>
                  <SelectItem value="Simples">Simples</SelectItem>
                  <SelectItem value="Lucro Presumido">Lucro Presumido</SelectItem>
                  <SelectItem value="Lucro Real">Lucro Real</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.regimeTributario !== 'MEI' ? (
              <div className="space-y-2">
                <Label htmlFor="porcentagemImposto" className={labelStyle}>% de Imposto</Label>
                <Input
                  type="number"
                  id="porcentagemImposto"
                  name="porcentagemImposto"
                  value={formData.porcentagemImposto}
                  onChange={handleChange}
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  className={inputStyle}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label className={labelStyle}>Imposto (MEI)</Label>
                <div className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-md p-2">
                  Para MEI, o imposto não é percentual sobre o faturamento. Será desconsiderado no cálculo do markup.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Custos e Operação */}
        <div className="col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Custos e Operação</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="custosFixos" className={labelStyle}>Custos Fixos</Label>
              <Input
                type="number"
                id="custosFixos"
                name="custosFixos"
                value={formData.custosFixos}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className={inputStyle}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proLabore" className={labelStyle}>Pró-labore</Label>
              <Input
                type="number"
                id="proLabore"
                name="proLabore"
                value={formData.proLabore}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className={inputStyle}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="diasTrabalhadosMes" className={labelStyle}>Dias Trabalhados/Mês</Label>
              <Input
                type="number"
                id="diasTrabalhadosMes"
                name="diasTrabalhadosMes"
                value={formData.diasTrabalhadosMes}
                onChange={handleChange}
                required
                min="1"
                max="31"
                className={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Comissões e Taxas */}
        <div className="col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Comissões e Taxas</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="pagaComissao"
                  checked={pagaComissao}
                  onCheckedChange={setPagaComissao}
                />
                <Label htmlFor="pagaComissao" className={labelStyle}>Paga Comissão?</Label>
              </div>
              {pagaComissao && (
                <div className="space-y-2">
                  <Label htmlFor="porcentagemComissao" className={labelStyle}>% de Comissão</Label>
                  <Input
                    type="number"
                    id="porcentagemComissao"
                    name="porcentagemComissao"
                    value={formData.porcentagemComissao}
                    onChange={handleChange}
                    required
                    min="0"
                    max="100"
                    step="0.01"
                    className={inputStyle}
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxaMaquininha" className={labelStyle}>Taxa de Maquininha (%)</Label>
              <Input
                type="number"
                id="taxaMaquininha"
                name="taxaMaquininha"
                value={formData.taxaMaquininha}
                onChange={handleChange}
                required
                min="0"
                max="100"
                step="0.01"
                className={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Lucro */}
        <div className="col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Lucro</h3>
          <div className="space-y-2">
            <Label htmlFor="porcentagemLucroDesejado" className={labelStyle}>% de Lucro Desejado</Label>
            <Input
              type="number"
              id="porcentagemLucroDesejado"
              name="porcentagemLucroDesejado"
              value={formData.porcentagemLucroDesejado}
              onChange={handleChange}
              required
              min="0"
              max="100"
              step="0.01"
              className={inputStyle}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        {typeof onClose === 'function' && (
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          className="bg-[#0B7A48] hover:bg-[#0B7A48]/90 text-white"
          disabled={loading}
        >
          {loading ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </form>

    {/* Dialog de Confirmação */}
    <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Atenção - Alteração de Markup
          </DialogTitle>
          <DialogDescription className="text-left">
            <p className="mb-3 font-medium text-orange-700">
              ⚠️ Esta alteração irá atualizar automaticamente todos os preços sugeridos dos seus produtos!
            </p>
            <p className="text-gray-600">
              Todos os produtos terão seus preços sugeridos recalculados com base no novo markup. 
              Os preços atuais de venda não serão alterados.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancelSubmit}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirmSubmit}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            Continuar e Atualizar Produtos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
} 