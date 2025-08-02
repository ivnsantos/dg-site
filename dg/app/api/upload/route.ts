import { NextRequest, NextResponse } from 'next/server'
import { uploadFileToS3 } from '@/src/lib/s3'

// Configuração para aumentar limite de tamanho
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
}

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
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'O arquivo deve ter no máximo 5MB' },
        { status: 400 }
      )
    }

    // Usar path customizado ou gerar um padrão
    const path = customPath || `uploads/${Date.now()}-${file.name}`

    // Fazer upload para S3
    const imageUrl = await uploadFileToS3(file, path, )

    return NextResponse.json({ 
      url: imageUrl,
      message: 'Imagem enviada com sucesso'
    })

  } catch (error: any) {
    console.error('Erro ao fazer upload:', error)
    return NextResponse.json(
      { error: 'Erro ao fazer upload da imagem' },
      { status: 500 }
    )
  }
} 