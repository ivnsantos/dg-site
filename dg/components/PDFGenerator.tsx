'use client'

import { Button } from './ui/button'
import { Download } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface PDFGeneratorProps {
  targetElementId: string
  filename?: string
  className?: string
}

export default function PDFGenerator({ 
  targetElementId, 
  filename = 'orcamento.pdf',
  className = ''
}: PDFGeneratorProps) {
  const generatePDF = async () => {
    try {
      const element = document.getElementById(targetElementId)
      if (!element) {
        console.error('Elemento não encontrado para gerar PDF')
        return
      }

      // Mostrar loading
      const originalContent = element.innerHTML
      element.innerHTML = '<div style="text-align: center; padding: 50px; font-size: 18px;">Gerando PDF...</div>'

      // Aguardar um pouco para o loading aparecer
      await new Promise(resolve => setTimeout(resolve, 500))

      // Restaurar conteúdo original
      element.innerHTML = originalContent

      // Configurações otimizadas para html2canvas
      const canvas = await html2canvas(element, {
        scale: 3, // Aumenta muito a qualidade
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        logging: false,
        removeContainer: true
      })

      const imgData = canvas.toDataURL('image/png', 1.0)
      
      // Criar PDF com configurações otimizadas
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      })

      // Dimensões do PDF em mm
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      
      // Dimensões da imagem
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      
      // Calcular proporção mantendo aspecto
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const finalWidth = imgWidth * ratio
      const finalHeight = imgHeight * ratio

      // Centralizar horizontalmente
      const x = (pdfWidth - finalWidth) / 2
      const y = 0 // Começar do topo

      // Adicionar a imagem
      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight, '', 'FAST')
      
      // Se a imagem for muito alta, adicionar páginas adicionais
      if (finalHeight > pdfHeight) {
        const remainingHeight = finalHeight - pdfHeight
        const pagesNeeded = Math.ceil(remainingHeight / pdfHeight)
        
        for (let i = 1; i <= pagesNeeded; i++) {
          pdf.addPage()
          const yOffset = -i * pdfHeight
          pdf.addImage(imgData, 'PNG', x, yOffset, finalWidth, finalHeight, '', 'FAST')
        }
      }
      
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
