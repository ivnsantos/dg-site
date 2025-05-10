import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { writeFile } from 'fs/promises'
import { join } from 'path'

const supabaseUrl = 'https://ofdgaoobhjcyoqgtjxdg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mZGdhb29iaGpjeW9xZ3RqeGRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMjg1MzAsImV4cCI6MjA2MTcwNDUzMH0.RBciA1lKfSTa0cPeyNgWaxr39GgqrMM6MHEBdV2oV64'

const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Cria um nome único para o arquivo
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name}`
    
    // Define o caminho onde o arquivo será salvo
    const path = join(process.cwd(), 'public', 'uploads', filename)
    
    // Salva o arquivo
    await writeFile(path, buffer)

    // Retorna a URL do arquivo
    const url = `/uploads/${filename}`
    return NextResponse.json({ url })
  } catch (error) {
    console.error('Erro ao fazer upload:', error)
    return NextResponse.json(
      { error: 'Erro ao fazer upload do arquivo' },
      { status: 500 }
    )
  }
} 