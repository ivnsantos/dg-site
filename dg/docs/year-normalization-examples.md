# Exemplos de Normalização de Ano de Expiração

## Testes da Função normalizeExpiryYear

```typescript
// Exemplos de entrada e saída esperada:

// Casos com 2 dígitos (século 21)
normalizeExpiryYear("28")  // → "2028"
normalizeExpiryYear("25")  // → "2025"
normalizeExpiryYear("30")  // → "2030"
normalizeExpiryYear("29")  // → "2029"

// Casos com 2 dígitos (século 20)
normalizeExpiryYear("35")  // → "1935"
normalizeExpiryYear("50")  // → "1950"
normalizeExpiryYear("99")  // → "1999"

// Casos com 4 dígitos (não altera)
normalizeExpiryYear("2028") // → "2028"
normalizeExpiryYear("2025") // → "2025"
normalizeExpiryYear("1935") // → "1935"

// Casos especiais
normalizeExpiryYear("0")    // → "2000"
normalizeExpiryYear("1")    // → "2001"
normalizeExpiryYear("30")   // → "2030" (limite)
normalizeExpiryYear("31")   // → "1931" (acima do limite)
```

## Lógica de Conversão

A função usa a seguinte lógica para determinar o século:

1. **Se o ano tem 4 dígitos**: Mantém como está
2. **Se o ano tem 2 dígitos**:
   - **< 30**: Adiciona "20" no início (século 21)
   - **≥ 30**: Adiciona "19" no início (século 20)

## Casos de Uso Reais

### Formulário de Cartão
```html
<!-- Usuário digita apenas 2 dígitos -->
<input type="text" name="expiryYear" value="28" maxlength="2">
<!-- Sistema converte automaticamente para 2028 -->
```

### API Request
```json
{
  "creditCard": {
    "expiryYear": "28"  // Será convertido para "2028"
  }
}
```

### API Response
```json
{
  "success": true,
  "data": {
    "creditCardToken": "cf4ebbe8-55ac-48bb-a654-9db327e6f088"
  }
}
```

## Vantagens

1. **Flexibilidade**: Aceita tanto 2 quanto 4 dígitos
2. **Usabilidade**: Usuários podem digitar apenas "28" em vez de "2028"
3. **Compatibilidade**: Funciona com formulários existentes
4. **Segurança**: Validação automática antes de enviar para o Asaas
