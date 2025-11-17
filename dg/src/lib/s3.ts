import {
  S3Client,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

// Configuração do Cloudflare R2
const ACCOUNT_ID = "016184c3fec4e160e9b38a985a7fc4db";
const ACCESS_KEY_ID = "0cc461c690364ea512d5151cb4e41f38";
const SECRET_ACCESS_KEY = "5c456726242aee7b5ae71cf547e048ce89c6111ce636f6303df083876011cd6b";
const BUCKET_NAME = "hml";
const PUBLIC_DOMAIN = "https://pub-f6373861b23346918a681332b65f9a68.r2.dev";

const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
  // Configurações adicionais para evitar problemas de CORS
  forcePathStyle: false,
});

// Função para gerar URL pública permanente do R2
const generatePublicUrl = (path: string): string => {
  // URL pública permanente do Cloudflare R2 - sem bucket no path
  return `${PUBLIC_DOMAIN}/${path}`;
};

// Função para fazer upload de arquivo (usada no servidor)
export const uploadFileToS3 = async (file: File, path: string): Promise<string> => {
  try {
    // Verificar se o arquivo existe
    if (!file) {
      throw new Error('Nenhum arquivo fornecido');
    }

    // Verificar se o arquivo é uma imagem
    if (!file.type.startsWith('image/')) {
      throw new Error('O arquivo deve ser uma imagem');
    }

    // Verificar tamanho do arquivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('O arquivo deve ter no máximo 5MB');
    }

    // Converter arquivo para buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Criar comando de upload com ACL público
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: path,
      Body: buffer,
      ContentType: file.type,
      ACL: 'public-read', // Garantir que o arquivo seja público
    });

    // Fazer upload
    await S3.send(uploadCommand);

    // Gerar URL pública permanente
    const publicUrl = generatePublicUrl(path);
    
    return publicUrl;
  } catch (error: any) {
    console.error('Erro ao fazer upload para S3:', error);
    
    // Melhorar mensagens de erro específicas
    if (error.name === 'NoSuchBucket' || error.message?.includes('Bucket')) {
      throw new Error('Erro de configuração do servidor de armazenamento. Entre em contato com o suporte.');
    } else if (error.name === 'AccessDenied' || error.message?.includes('Access Denied')) {
      throw new Error('Sem permissão para fazer upload. Entre em contato com o suporte.');
    } else if (error.name === 'NetworkError' || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      throw new Error('Erro de conexão com o servidor. Verifique sua internet e tente novamente.');
    } else if (error.message) {
      // Manter mensagens de erro já específicas
      throw error;
    } else {
      throw new Error('Erro desconhecido ao fazer upload. Tente novamente.');
    }
  }
};

// Função para fazer upload via API (usada no cliente)
export const uploadFileViaAPI = async (file: File, path: string): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = 'Erro ao fazer upload da imagem';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (parseError) {
        // Se não conseguir parsear o JSON, usar mensagem baseada no status
        if (response.status === 400) {
          errorMessage = 'Arquivo inválido. Verifique o formato e tamanho da imagem.';
        } else if (response.status === 413) {
          errorMessage = 'A imagem é muito grande. Use uma imagem com no máximo 5MB.';
        } else if (response.status === 503) {
          errorMessage = 'Serviço temporariamente indisponível. Tente novamente em alguns instantes.';
        } else if (response.status >= 500) {
          errorMessage = 'Erro no servidor. Tente novamente mais tarde.';
        }
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Erro ao fazer upload via API:', error);
    throw error;
  }
};

export default S3; 