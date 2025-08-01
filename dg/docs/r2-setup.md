# Configuração do Cloudflare R2 para URLs Públicas

## 🎯 **Objetivo**
Configurar o bucket R2 para permitir acesso público às imagens dos LinkTrees.

## 📋 **Configurações Necessárias**

### 1. **Bucket Público**
- ✅ Habilitar acesso público no bucket
- ✅ Configurar política de bucket para permitir leitura pública
- ✅ Definir CORS se necessário

### 2. **Política de Bucket (Bucket Policy)**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::hml/*"
    }
  ]
}
```

### 3. **Configuração CORS (se necessário)**
```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }
]
```

## 🔧 **Como Configurar**

### **No Dashboard do Cloudflare:**
1. Acesse **R2 Object Storage**
2. Selecione o bucket **hml**
3. Vá em **Settings** → **Public Access**
4. Habilite **Public Access**
5. Configure a **Bucket Policy** acima

### **Verificação:**
- ✅ Upload de imagem funciona
- ✅ URL pública acessível
- ✅ Imagem carrega no navegador
- ✅ Sem erros de autorização

## 🚀 **URLs Geradas**
Formato: `https://pub-f6373861b23346918a681332b65f9a68.r2.dev/linktrees/logos/[filename]`

## ⚠️ **Importante**
- URLs são **permanentes** e **públicas**
- Não expiram
- Acessíveis por qualquer pessoa
- Ideais para imagens de LinkTree

## 🔗 **Domínio Público**
- **URL Base:** `https://pub-f6373861b23346918a681332b65f9a68.r2.dev`
- **Formato Final:** `https://pub-f6373861b23346918a681332b65f9a68.r2.dev/[path]`
- **Exemplo:** `https://pub-f6373861b23346918a681332b65f9a68.r2.dev/delivery.jpg` 