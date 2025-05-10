'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useRouter } from 'next/navigation'
import { useToast } from "@/components/ui/use-toast"

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
  const [pagaComissao, setPagaComissao] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    endereco: '',
    logo: '',
    horarioFuncionamento: '',
    horasTrabalhoDiarias: '',
    quantidadeFuncionarios: '',
    folhaPagamentoTotal: '',
    faturamentoMedio: '',
    faturamentoDesejado: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
          faturamentoDesejado: Number(formData.faturamentoDesejado),
          porcentagemImposto: Number(formData.porcentagemImposto),
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
        title: "Configuração salva com sucesso!",
        description: (
          <div className="mt-2 flex flex-col gap-1">
            <p>Markup ideal calculado para sua confeitaria:</p>
            <p className="font-semibold text-[#0B7A48]">{data.markupIdeal}%</p>
            <p className="text-sm text-gray-500">
              Este é o percentual que você deve aplicar sobre seus custos para atingir o faturamento desejado.
            </p>
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

  return (
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
            <div className="space-y-2">
              <Label htmlFor="faturamentoDesejado" className={labelStyle}>Faturamento Desejado/Mês</Label>
              <Input
                type="number"
                id="faturamentoDesejado"
                name="faturamentoDesejado"
                value={formData.faturamentoDesejado}
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
  )
} 