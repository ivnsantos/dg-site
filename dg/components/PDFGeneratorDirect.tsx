'use client'

import { Button } from './ui/button'
import { Download } from 'lucide-react'
import jsPDF from 'jspdf'

interface PDFGeneratorDirectProps {
  orcamento: any
  header: any
  footer: any
  filename?: string
  className?: string
}

export default function PDFGeneratorDirect({ 
  orcamento,
  header,
  footer,
  filename = 'orcamento.pdf',
  className = ''
}: PDFGeneratorDirectProps) {
  const generatePDF = () => {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      let yPosition = 20

      // Função para adicionar texto com quebra de linha
      const addText = (text: string, x: number, y: number, options: any = {}) => {
        const lines = pdf.splitTextToSize(text, pageWidth - x - 20)
        pdf.text(lines, x, y)
        return y + (lines.length * (options.fontSize || 10) * 0.35) + 5
      }

      // Cabeçalho
      pdf.setFontSize(20)
      pdf.setFont('helvetica', 'bold')
      yPosition = addText(header?.nomeFantasia || 'Confeitaria', 20, yPosition, { fontSize: 20 })
      
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'normal')
      yPosition = addText('ORÇAMENTO', 20, yPosition + 5)
      
      // Linha separadora
      pdf.setDrawColor(11, 122, 72)
      pdf.setLineWidth(0.5)
      pdf.line(20, yPosition + 2, pageWidth - 20, yPosition + 2)
      yPosition += 10

      // Dados do orçamento
      pdf.setFontSize(10)
      yPosition = addText(`Número: ${orcamento.numero}`, 20, yPosition)
      yPosition = addText(`Código: ${orcamento.codigo}`, 20, yPosition)
      yPosition = addText(`Data: ${new Date(orcamento.createdAt).toLocaleDateString('pt-BR')}`, 20, yPosition)
      yPosition = addText(`Status: ${orcamento.status}`, 20, yPosition)
      yPosition += 10

      // Dados do cliente
      pdf.setFont('helvetica', 'bold')
      yPosition = addText('CLIENTE:', 20, yPosition)
      pdf.setFont('helvetica', 'normal')
      yPosition = addText(orcamento.cliente.nome, 20, yPosition)
      if (orcamento.cliente.telefone) {
        yPosition = addText(`Telefone: ${orcamento.cliente.telefone}`, 20, yPosition)
      }
      if (orcamento.cliente.endereco) {
        yPosition = addText(`Endereço: ${orcamento.cliente.endereco}`, 20, yPosition)
      }
      yPosition += 10

      // Tabela de itens
      pdf.setFont('helvetica', 'bold')
      yPosition = addText('ITENS DO ORÇAMENTO:', 20, yPosition)
      yPosition += 5

      // Cabeçalho da tabela
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Descrição', 20, yPosition)
      pdf.text('Qtd', 120, yPosition)
      pdf.text('Valor Unit.', 140, yPosition)
      pdf.text('Total', 170, yPosition)
      yPosition += 5

      // Linha da tabela
      pdf.setDrawColor(0, 0, 0)
      pdf.setLineWidth(0.1)
      pdf.line(20, yPosition, pageWidth - 20, yPosition)
      yPosition += 5

      // Itens
      pdf.setFont('helvetica', 'normal')
      let totalGeral = 0

      orcamento.itens.forEach((item: any) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage()
          yPosition = 20
        }

        // Descrição
        const descricao = item.descricao.length > 50 ? item.descricao.substring(0, 50) + '...' : item.descricao
        pdf.text(descricao, 20, yPosition)
        
        // Quantidade
        pdf.text(item.quantidade.toString(), 120, yPosition)
        
        // Valor unitário
        pdf.text(`R$ ${Number(item.valorUnitario).toFixed(2)}`, 140, yPosition)
        
        // Total
        const totalItem = Number(item.valorTotal)
        totalGeral += totalItem
        pdf.text(`R$ ${totalItem.toFixed(2)}`, 170, yPosition)
        
        yPosition += 5

        // Observações do item
        if (item.observacoes) {
          pdf.setFontSize(8)
          const obs = item.observacoes.length > 60 ? item.observacoes.substring(0, 60) + '...' : item.observacoes
          pdf.text(`Obs: ${obs}`, 25, yPosition)
          yPosition += 4
          pdf.setFontSize(9)
        }
      })

      yPosition += 5

      // Linha total
      pdf.setDrawColor(0, 0, 0)
      pdf.setLineWidth(0.2)
      pdf.line(20, yPosition, pageWidth - 20, yPosition)
      yPosition += 5

      // Total geral
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(12)
      pdf.text('TOTAL:', 120, yPosition)
      pdf.text(`R$ ${totalGeral.toFixed(2)}`, 170, yPosition)
      yPosition += 10

      // Forma de pagamento
      if (footer) {
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(10)
        yPosition = addText('FORMA DE PAGAMENTO:', 20, yPosition)
        pdf.setFont('helvetica', 'normal')
        yPosition = addText(footer.formaPagamento, 20, yPosition)
        if (footer.pix) {
          yPosition = addText(`PIX: ${footer.pix}`, 20, yPosition)
        }
        yPosition += 10
      }

      // Observações gerais
      if (orcamento.observacoes) {
        pdf.setFont('helvetica', 'bold')
        yPosition = addText('OBSERVAÇÕES:', 20, yPosition)
        pdf.setFont('helvetica', 'normal')
        yPosition = addText(orcamento.observacoes, 20, yPosition)
        yPosition += 10
      }

      // Validade
      pdf.setFont('helvetica', 'bold')
      yPosition = addText('VALIDADE:', 20, yPosition)
      pdf.setFont('helvetica', 'normal')
      yPosition = addText(`Este orçamento é válido até ${new Date(orcamento.dataValidade).toLocaleDateString('pt-BR')}`, 20, yPosition)

      // Rodapé
      const footerY = pageHeight - 20
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'normal')
      pdf.text('© Doce Gestão - Sistema de Gestão para Confeitarias', pageWidth / 2, footerY, { align: 'center' })

      // Salvar o PDF
      pdf.save(filename)
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      alert('Erro ao gerar PDF. Tente novamente.')
    }
  }

  return (
    <Button
      onClick={generatePDF}
      className={`bg-red-600 hover:bg-red-700 text-white ${className}`}
    >
      <Download className="w-4 h-4 mr-2" />
      Baixar PDF
    </Button>
  )
}
