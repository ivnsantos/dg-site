"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../../../components/ui/button"
import { toast } from "react-hot-toast"
import { uploadFile } from '../../../../src/lib/firebase'
import DoceGestaoLoading from '../../../../components/ui/DoceGestaoLoading'
import { useSession } from 'next-auth/react'

interface HeaderOrcamentoForm {
  nomeFantasia: string
  logotipoUrl?: string
  telefone?: string
  instagram?: string
}

interface FooterOrcamentoForm {
  formaPagamento: string
  pix?: string
}

export const dynamic = 'force-dynamic'

export default function ConfiguracaoOrcamento() {
  const [header, setHeader] = useState<HeaderOrcamentoForm>({
    nomeFantasia: "",
    logotipoUrl: "",
    telefone: "",
    instagram: ""
  })
  const [footer, setFooter] = useState<FooterOrcamentoForm>({
    formaPagamento: "Pix ou Kix no cartão de crédito",
    pix: ""
  })
  const [loading, setLoading] = useState(true)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()

  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false)
      return
    }

    const userId = session.user.id

    async function fetchData() {
      const res = await fetch(`/api/orcamentos/configuracao?userId=${userId}`)
      const data = await res.json()
      if (data.header) setHeader(data.header)
      if (data.footer) setFooter(data.footer)
      setLoading(false)
    }
    if (userId) fetchData()
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch("/api/orcamentos/configuracao", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session?.user?.id,
          header,
          footer
        })
      })
      if (!response.ok) throw new Error()
      toast.success("Configuração salva com sucesso!")
      router.push("/dashboard/orcamentos")
    } catch {
      toast.error("Erro ao salvar configuração")
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = async (file: File) => {
    setUploading(true)
    try {
      const path = `orcamentos/logos/${Date.now()}-${file.name}`
      const url = await uploadFile(file, path)
      setHeader(h => ({ ...h, logotipoUrl: url }))
      toast.success('Logo enviada com sucesso!')
    } catch {
      toast.error('Erro ao enviar logo')
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <DoceGestaoLoading />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Configuração do Orçamento</h1>
        <Button 
          variant="outline" 
          onClick={() => router.push('/dashboard/orcamentos')}
        >
          Voltar
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome Fantasia <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={header.nomeFantasia}
              onChange={e => setHeader({ ...header, nomeFantasia: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Logotipo</label>
            <div className="flex items-center gap-4">
              <label htmlFor="logoUpload" className="cursor-pointer inline-flex items-center px-4 py-2 bg-[#0B7A48] text-white rounded-md hover:bg-[#0B7A48]/80 transition-colors">
                {header.logotipoUrl ? 'Alterar logo' : 'Enviar logo'}
                <input
                  type="file"
                  id="logoUpload"
                  accept="image/*"
                  className="hidden"
                  onChange={async e => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setLogoFile(file)
                      await handleLogoUpload(file)
                    }
                  }}
                  disabled={uploading}
                />
              </label>
              {logoFile && (
                <span className="text-xs text-muted-foreground block">{logoFile.name}</span>
              )}
            </div>
            {/* Preview da imagem */}
            {logoFile ? (
              <img
                src={URL.createObjectURL(logoFile)}
                alt="Preview do logo"
                className="mt-2 rounded shadow max-h-24"
                style={{ maxWidth: 120, objectFit: 'contain' }}
              />
            ) : header.logotipoUrl && (
              <img
                src={header.logotipoUrl}
                alt="Logo atual"
                className="mt-2 rounded shadow max-h-24"
                style={{ maxWidth: 120, objectFit: 'contain' }}
              />
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Telefone</label>
            <input
              type="text"
              value={header.telefone}
              onChange={e => setHeader({ ...header, telefone: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="(99) 99999-9999"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Instagram</label>
            <input
              type="text"
              value={header.instagram}
              onChange={e => setHeader({ ...header, instagram: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="@seudocenoinsta"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Forma de Pagamento <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={footer.formaPagamento}
              onChange={e => setFooter({ ...footer, formaPagamento: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Chave Pix / Instrução</label>
            <input
              type="text"
              value={footer.pix}
              onChange={e => setFooter({ ...footer, pix: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Chave Pix ou instrução extra"
            />
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/orcamentos')}
          >
            Cancelar
          </Button>
          <Button type="submit" className="bg-[#0B7A48] text-white" disabled={loading}>
            {loading ? "Salvando..." : "Salvar e Avançar"}
          </Button>
        </div>
      </form>
    </div>
  )
} 