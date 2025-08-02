// Função para validar imagem no frontend
export const validateImage = (file: File): { isValid: boolean; error?: string } => {
  // Verificar se é uma imagem
  if (!file.type.startsWith('image/')) {
    return {
      isValid: false,
      error: '❌ O arquivo deve ser uma imagem (JPG, PNG, GIF, WebP)'
    }
  }

  // Verificar tamanho (máximo 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB em bytes
  if (file.size > maxSize) {
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)
    return {
      isValid: false,
      error: `❌ Arquivo muito grande! Tamanho atual: ${fileSizeMB}MB. Máximo permitido: 5MB`
    }
  }

  // Verificar extensões permitidas
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  const fileName = file.name.toLowerCase()
  const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext))
  
  if (!hasValidExtension) {
    return {
      isValid: false,
      error: '❌ Formato não suportado. Use apenas: JPG, PNG, GIF ou WebP'
    }
  }

  return { isValid: true }
}

// Função para formatar tamanho de arquivo
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Função para obter dimensões da imagem
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
    }
    img.onerror = () => {
      reject(new Error('Erro ao carregar imagem'))
    }
    img.src = URL.createObjectURL(file)
  })
} 