# Tokenização de Cartão de Crédito - Asaas

## Visão Geral

A tokenização de cartão de crédito é um processo de segurança que substitui os dados sensíveis do cartão por um token único e seguro. Isso permite armazenar e processar pagamentos sem expor os dados reais do cartão.

## Endpoint de Tokenização

### POST `/api/credit-card/tokenize`

Tokeniza um cartão de crédito no Asaas e retorna um token seguro.

#### Payload de Entrada

```json
{
  "creditCard": {
    "holderName": "João Silva",
    "number": "1234567890123456",
    "expiryMonth": "09",
    "expiryYear": "28", // Aceita 2 ou 4 dígitos (28 → 2028)
    "ccv": "123"
  },
  "creditCardHolderInfo": {
    "name": "João Silva",
    "email": "joao@email.com",
    "cpfCnpj": "12345678901",
    "postalCode": "04545110",
    "addressNumber": "123",
    "phone": "11987654321"
  },
  "customer": "cus_000006924095",
  "remoteIp": "192.168.1.1"
}
```

#### Payload de Saída

```json
{
  "success": true,
  "data": {
    "creditCardNumber": "3456",
    "creditCardBrand": "VISA",
    "creditCardToken": "cf4ebbe8-55ac-48bb-a654-9db327e6f088"
  }
}
```

## Integração com Assinaturas

### Fluxo Completo

1. **Tokenização do Cartão**: Primeiro, tokenize o cartão usando o endpoint `/api/credit-card/tokenize`
2. **Criação da Assinatura**: Use o token retornado para criar a assinatura no Asaas
3. **Salvamento Local**: Os dados da assinatura e do cartão tokenizado são salvos na tabela `subscriptions`

### Exemplo de Uso

```typescript
// 1. Tokenizar cartão
const tokenResponse = await fetch('/api/credit-card/tokenize', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    creditCard: {
      holderName: "João Silva",
      number: "1234567890123456",
      expiryMonth: "09",
      expiryYear: "28", // Será convertido para 2028 automaticamente
      ccv: "123"
    },
    creditCardHolderInfo: {
      name: "João Silva",
      email: "joao@email.com",
      cpfCnpj: "12345678901",
      postalCode: "04545110",
      addressNumber: "123",
      phone: "11987654321"
    },
    customer: "cus_000006924095",
    remoteIp: "192.168.1.1"
  })
})

const { data: tokenData } = await tokenResponse.json()

// 2. Criar assinatura (já implementado automaticamente nos endpoints de registro e atualização)
// O token é usado automaticamente nos endpoints:
// - POST /api/users (registro de usuário)
// - POST /api/assinatura/atualizar (atualização de assinatura)
```

## Dados Salvos na Tabela Subscriptions

Após a tokenização e criação da assinatura, os seguintes dados são salvos na tabela `subscriptions`:

- `creditCardNumber`: Últimos 4 dígitos do cartão (ex: "3456")
- `creditCardBrand`: Bandeira do cartão (ex: "VISA", "MASTERCARD")
- `creditCardToken`: Token seguro do cartão (ex: "cf4ebbe8-55ac-48bb-a654-9db327e6f088")

## Normalização de Dados

### Ano de Expiração
O sistema normaliza automaticamente o ano de expiração do cartão:

- **2 dígitos**: `"28"` → `"2028"`
- **4 dígitos**: `"2028"` → `"2028"` (mantém como está)

**Lógica de conversão:**
- Anos < 30: Assume século 21 (2000+)
- Anos ≥ 30: Assume século 20 (1900+)

**Exemplos:**
- `"28"` → `"2028"`
- `"25"` → `"2025"`
- `"35"` → `"1935"`
- `"2028"` → `"2028"` (não altera)

## Segurança

- Os dados sensíveis do cartão nunca são armazenados localmente
- Apenas o token seguro é salvo no banco de dados
- O token pode ser usado para futuras transações sem expor os dados reais
- A comunicação com o Asaas é feita via HTTPS

## Tratamento de Erros

A API retorna erros específicos para diferentes situações:

- `400`: Dados inválidos ou incompletos
- `500`: Erro interno do servidor

Exemplos de mensagens de erro:
- "Cartão de crédito inválido"
- "Cliente inválido"
- "Dados do portador do cartão incompletos"
