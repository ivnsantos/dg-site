import { NextRequest, NextResponse } from 'next/server'
import { uploadFileToS3 } from '@/src/lib/s3'

// Configuração para aumentar limite de tamanho (nova sintaxe Next.js 13+)
export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const customPath = formData.get('path') as string

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      )
    }

    // Verificar se é uma imagem
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'O arquivo deve ser uma imagem' },
        { status: 400 }
      )
    }

    // Verificar tamanho (máximo 20MB)
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'O arquivo deve ter no máximo 20MB' },
        { status: 400 }
      )
    }

    // Usar path customizado ou gerar um padrão
    const path = customPath || `uploads/${Date.now()}-${file.name}`

    // Fazer upload para S3
    const imageUrl = await uploadFileToS3(file, path)

    return NextResponse.json({ 
      url: imageUrl,
      message: 'Imagem enviada com sucesso'
    })

  } catch (error: any) {
    console.error('Erro ao fazer upload:', error)
    
    // Mensagens de erro mais específicas
    let errorMessage = 'Erro ao fazer upload da imagem'
    let statusCode = 500
    
    if (error.message) {
      // Erros conhecidos do S3
      if (error.message.includes('Nenhum arquivo fornecido')) {
        errorMessage = 'Nenhum arquivo foi selecionado. Por favor, escolha uma imagem.'
        statusCode = 400
      } else if (error.message.includes('deve ser uma imagem')) {
        errorMessage = 'O arquivo selecionado não é uma imagem válida. Por favor, escolha um arquivo de imagem (JPG, PNG, etc.).'
        statusCode = 400
      } else if (error.message.includes('no máximo 5MB')) {
        errorMessage = 'A imagem é muito grande. Por favor, escolha uma imagem com no máximo 5MB.'
        statusCode = 400
      } else if (error.message.includes('Network') || error.message.includes('fetch')) {
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.'
        statusCode = 503
      } else if (error.message.includes('timeout') || error.message.includes('Timeout')) {
        errorMessage = 'O upload demorou muito. Tente novamente com uma imagem menor.'
        statusCode = 504
      } else if (error.message.includes('AccessDenied') || error.message.includes('Forbidden')) {
        errorMessage = 'Erro de permissão no servidor. Entre em contato com o suporte.'
        statusCode = 403
      } else if (error.message.includes('Bucket') || error.message.includes('S3')) {
        errorMessage = 'Erro no servidor de armazenamento. Tente novamente em alguns instantes.'
        statusCode = 503
      } else {
        // Usar a mensagem original se for específica
        errorMessage = error.message
      }
    } else if (error.name === 'NetworkError' || error.code === 'NETWORK_ERROR') {
      errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.'
      statusCode = 503
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: statusCode }
    )
  }
}
