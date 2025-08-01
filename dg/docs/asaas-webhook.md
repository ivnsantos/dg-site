# Webhook de Assinaturas - Asaas

## 📋 Visão Geral

Este webhook recebe atualizações de assinaturas do Asaas e atualiza automaticamente os dados no banco de dados local.

## 🚀 Endpoint

```
POST /api/webhooks/asaas/subscription
```

## 📦 Payload Recebido

O webhook recebe um payload no seguinte formato:

```json
{
  "id": "evt_6561b631fa5580caadd00bbe3b858607&9193",
  "event": "SUBSCRIPTION_CREATED",
  "dateCreated": "2024-10-16 11:11:04",
  "subscription": {
    "object": "subscription",
    "id": "sub_m5gdy1upm25fbwgx",
    "dateCreated": "16/10/2024",
    "customer": "cus_000000008773",
    "paymentLink": null,
    "value": 19.9,
    "nextDueDate": "22/11/2024",
    "cycle": "MONTHLY",
    "description": "Assinatura Plano Pró",
    "billingType": "BOLETO",
    "deleted": false,
    "status": "ACTIVE",
    "externalReference": null,
    "sendPaymentByPostalService": false,
    "discount": {
      "value": 10,
      "limitDate": null,
      "dueDateLimitDays": 0,
      "type": "PERCENTAGE"
    },
    "fine": {
      "value": 1,
      "type": "PERCENTAGE"
    },
    "interest": {
      "value": 2,
      "type": "PERCENTAGE"
    },
    "split": [
      {
        "walletId": "a0188304-4860-4d97-9178-4da0cde5fdc1",
        "fixedValue": null,
        "percentualValue": 20,
        "externalReference": null,
        "description": null
      }
    ]
  }
}
```

## 🎯 Eventos Suportados

| Evento | Descrição | Ação no Banco |
|--------|-----------|---------------|
| `SUBSCRIPTION_CREATED` | Assinatura criada | Atualiza/cria dados da assinatura |
| `SUBSCRIPTION_UPDATED` | Assinatura atualizada | Atualiza dados da assinatura e reativa usuário se necessário |
| `SUBSCRIPTION_INACTIVATED` | Assinatura inativada | Marca assinatura como `INACTIVE` e usuário como `INATIVO` |
| `SUBSCRIPTION_DELETED` | Assinatura removida | Marca assinatura como `CANCELLED` e usuário como `INATIVO` |

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Adicione no seu arquivo `.env`:

```env
# Chave secreta para validar webhooks do Asaas (opcional)
ASAAS_WEBHOOK_SECRET=sua_chave_secreta_aqui
```

### 2. Configuração no Dashboard do Asaas

1. Acesse o [Dashboard do Asaas](https://www.asaas.com/)
2. Vá em **Configurações > Webhooks**
3. Clique em **Novo Webhook**
4. Configure:
   - **URL**: `https://seu-dominio.com/api/webhooks/asaas/subscription`
   - **Eventos**: Selecione os eventos de assinatura
   - **Status**: Ativo

### 3. Eventos a Configurar

No dashboard do Asaas, selecione os seguintes eventos:

- ✅ **SUBSCRIPTION_CREATED**
- ✅ **SUBSCRIPTION_UPDATED**
- ✅ **SUBSCRIPTION_INACTIVATED**
- ✅ **SUBSCRIPTION_DELETED**

## 🔒 Segurança

### Validação de Assinatura

O webhook valida a assinatura usando HMAC-SHA256:

```typescript
// Header esperado
asaas-access-token: <assinatura_hmac_sha256>
```

### Headers de Segurança

- `asaas-access-token`: Assinatura do webhook
- `Content-Type`: `application/json`

## 📊 Processamento

### 1. Validação
- ✅ Verifica assinatura do webhook (se configurada)
- ✅ Valida estrutura do payload
- ✅ Verifica se a assinatura existe no banco

### 2. Atualização dos Dados

Para cada evento, os seguintes campos são atualizados:

| Campo | Descrição |
|-------|-----------|
| `value` | Valor da assinatura |
| `cycle` | Ciclo de cobrança |
| `description` | Descrição da assinatura |
| `billingType` | Tipo de cobrança |
| `status` | Status da assinatura |
| `deleted` | Se foi deletada |
| `dateCreated` | Data de criação |
| `nextDueDate` | Próxima data de vencimento |
| `externalReference` | Referência externa |
| `paymentLink` | Link de pagamento |

### 3. Controle de Acesso do Usuário

O webhook também controla o acesso do usuário à plataforma:

| Evento | Ação no Usuário |
|--------|----------------|
| `SUBSCRIPTION_INACTIVATED` | Marca usuário como `INATIVO` (sem acesso) |
| `SUBSCRIPTION_DELETED` | Marca usuário como `INATIVO` (sem acesso) |
| `SUBSCRIPTION_UPDATED` (status ACTIVE) | Reativa usuário como `ATIVO` (com acesso) |

**Importante**: Usuários inativos não conseguem acessar a plataforma até que a assinatura seja reativada.

### 4. Conversão de Datas

O webhook converte automaticamente datas do formato brasileiro (`DD/MM/YYYY`) para o formato ISO.

## 🧪 Testes

### 1. Teste de Status

```bash
curl -X GET https://seu-dominio.com/api/webhooks/asaas/subscription
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "message": "Webhook de assinaturas do Asaas está funcionando",
  "timestamp": "2024-10-16T11:11:04.000Z",
  "supportedEvents": [
    "SUBSCRIPTION_CREATED",
    "SUBSCRIPTION_UPDATED",
    "SUBSCRIPTION_INACTIVATED",
    "SUBSCRIPTION_DELETED"
  ],
  "endpoint": "/api/webhooks/asaas/subscription"
}
```

### 2. Teste com Payload Simulado

```bash
curl -X POST https://seu-dominio.com/api/webhooks/asaas/subscription \
  -H "Content-Type: application/json" \
  -d '{
    "id": "evt_test_123",
    "event": "SUBSCRIPTION_UPDATED",
    "dateCreated": "2024-10-16 11:11:04",
    "subscription": {
      "id": "sub_test_123",
      "value": 19.9,
      "status": "ACTIVE",
      "nextDueDate": "22/11/2024"
    }
  }'
```

## 📝 Logs

O webhook registra logs detalhados:

```
Webhook recebido: SUBSCRIPTION_UPDATED - sub_m5gdy1upm25fbwgx
Webhook processado com sucesso: SUBSCRIPTION_UPDATED
Usuário 123 reativado devido à assinatura ativa
```

**Logs de Controle de Usuário:**
- `Usuário {id} inativado devido à assinatura inativa`
- `Usuário {id} inativado devido à assinatura deletada`
- `Usuário {id} reativado devido à assinatura ativa`

## 🚨 Tratamento de Erros

### Erros Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| `Assinatura inválida` | Webhook secret incorreto | Verificar `ASAAS_WEBHOOK_SECRET` |
| `Payload inválido` | Estrutura incorreta | Verificar formato do payload |
| `Assinatura não encontrada` | ExternalId não existe | Verificar se a assinatura foi criada |

### Respostas de Erro

```json
{
  "error": "Descrição do erro",
  "status": 400
}
```

## 🔄 Fluxo Completo

1. **Registro do Usuário** → Cria assinatura no Asaas e no banco local
2. **Webhook Recebido** → Atualiza dados no banco local
3. **Sincronização** → Mantém dados sempre atualizados

## 📞 Suporte

Para problemas com o webhook:

1. Verifique os logs do servidor
2. Teste o endpoint de status
3. Valide a configuração no dashboard do Asaas
4. Verifique as variáveis de ambiente

---

**Nota**: Este webhook é essencial para manter a sincronização entre o Asaas e o banco de dados local. Certifique-se de que está funcionando corretamente em produção. 