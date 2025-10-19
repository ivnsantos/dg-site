# Normalização de Ano na API de Usuários

## Implementação

A rota `/api/users` agora normaliza automaticamente o ano de expiração do cartão antes de enviar para o Asaas.

### Função de Normalização

```typescript
function normalizeExpiryYear(year: string): string {
  const yearStr = String(year).trim()
  
  // Se já tem 4 dígitos, retorna como está
  if (yearStr.length === 4) {
    return yearStr
  }
  
  // Se tem 2 dígitos, converte para 4
  if (yearStr.length === 2) {
    const yearNum = parseInt(yearStr)
    
    // Se o ano for menor que 30, assume século 21 (2000+)
    // Se for maior ou igual a 30, assume século 20 (1900+)
    if (yearNum < 30) {
      return `20${yearStr}`
    } else {
      return `19${yearStr}`
    }
  }
  
  // Se não conseguir normalizar, retorna o valor original
  return yearStr
}
```

## Aplicação na API

### 1. Tokenização do Cartão
```typescript
const tokenResponse = await asaas.tokenizeCreditCard({
  creditCard: {
    holderName: cartao.nome,
    number: String(cartao.numero).replace(/\D/g, ''),
    expiryMonth: cartao.mes,
    expiryYear: normalizeExpiryYear(cartao.ano), // ← Normalização aplicada
    ccv: cartao.cvv
  },
  // ...
})
```

### 2. Criação da Assinatura
```typescript
subscription = await asaas.createSubscription({
  // ...
  creditCard: {
    holderName: cartao.nome,
    number: String(cartao.numero).replace(/\D/g, ''),
    expiryMonth: cartao.mes,
    expiryYear: normalizeExpiryYear(cartao.ano), // ← Normalização aplicada
    ccv: cartao.cvv
  },
  // ...
})
```

## Exemplos de Conversão

### Entrada do Frontend
```json
{
  "cartao": {
    "ano": "26",  // 2 dígitos
    "mes": "08",
    "nome": "Ivan Pedroso",
    "numero": "1111111111111111",
    "cvv": "123"
  }
}
```

### Processamento Interno
```typescript
// Antes da normalização
cartao.ano = "26"

// Após normalização
normalizeExpiryYear("26") // → "2026"
```

### Envio para Asaas
```json
{
  "creditCard": {
    "expiryYear": "2026",  // 4 dígitos completos
    "expiryMonth": "08",
    "holderName": "Ivan Pedroso",
    "number": "1111111111111111",
    "ccv": "123"
  }
}
```

## Casos de Teste

| Entrada | Saída | Explicação |
|---------|-------|------------|
| `"26"` | `"2026"` | < 30 = século 21 |
| `"28"` | `"2028"` | < 30 = século 21 |
| `"35"` | `"1935"` | ≥ 30 = século 20 |
| `"2026"` | `"2026"` | Já tem 4 dígitos |
| `"2028"` | `"2028"` | Já tem 4 dígitos |

## Vantagens

1. **Compatibilidade**: Aceita tanto 2 quanto 4 dígitos
2. **Usabilidade**: Usuários podem digitar apenas "26" em vez de "2026"
3. **Consistência**: Sempre envia 4 dígitos para o Asaas
4. **Robustez**: Trata casos edge de forma segura
5. **Manutenibilidade**: Função centralizada e reutilizável

## Rotas Afetadas

- ✅ `/api/users` - Registro de usuário
- ✅ `/api/assinatura/atualizar` - Atualização de assinatura
- ✅ `/api/credit-card/tokenize` - Tokenização de cartão

Todas as rotas que processam dados de cartão agora normalizam o ano automaticamente.
