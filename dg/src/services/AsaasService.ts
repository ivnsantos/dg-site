interface CreateCustomerRequest {
  name: string
  cpfCnpj: string
  email: string
  notificationDisabled?: boolean
}

interface AsaasCustomerResponse {
  object: 'customer'
  id: string
  dateCreated: string
  name: string
  email: string
}

interface TokenizeCreditCardRequest {
  creditCard: {
    holderName: string
    number: string
    expiryMonth: string
    expiryYear: string
    ccv: string
  }
  creditCardHolderInfo: {
    name: string
    email: string
    cpfCnpj: string
    postalCode: string
    addressNumber: string
    phone: string
  }
  customer: string
  remoteIp: string
}

interface TokenizeCreditCardResponse {
  creditCardNumber: string
  creditCardBrand: string
  creditCardToken: string
}

interface CreateSubscriptionRequest {
  customer: string // customer id
  billingType: 'CREDIT_CARD' | 'BOLETO' | 'PIX'
  value: number
  nextDueDate: string
  cycle: 'MONTHLY' | 'WEEKLY' | 'BIWEEKLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY'
  description: string
  creditCard?: {
    holderName: string
    number: string
    expiryMonth: string
    expiryYear: string
    ccv: string
  }
  creditCardHolderInfo?: {
    name: string
    email: string
    cpfCnpj: string
    postalCode: string
    addressNumber: string
    phone: string
  },
  discount?: {
    value: number
    dueDateLimitDays: number
    type: 'PERCENTAGE' | 'FIXED'
  },
  maxPayments: number
}

interface AsaasSubscriptionResponse {
  id: string
  customer: string
  value: number
  nextDueDate: string
  cycle: string
  description: string
  billingType: string
  status: string
  createdAt: string
  updatedAt: string
  endDate: string
}

export class AsaasService {
  private apiUrl: string
  private accessToken: string

  constructor() {
    // Permite configurar a URL (sandbox/produção) via env. Padrão: sandbox
    this.apiUrl = process.env.ASAAS_API_URL || 'https://api-sandbox.asaas.com/v3'
    this.accessToken = (process.env.ASAAS_ACCESS_TOKEN || '')
    if (!this.accessToken) {
      throw new Error('TOKEN não configurado')
    }
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any
  ): Promise<T> {
    const url = `${this.apiUrl}${endpoint}`
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'access_token': this.accessToken,
          'Content-Type': 'application/json',
          'User-Agent': 'assinatura-api-dg'

        },
        body: data ? JSON.stringify(data) : undefined
      })
      if (!response.ok) {
        // A API do Asaas retorna mensagens no corpo. Tentamos extrair detalhes úteis
        let payload: any = null
        try {
          payload = await response.json()
        } catch {
          // fallback para texto cru
          const text = await response.text()
          throw new Error(text || 'Erro na requisição ao Asaas')
        }

        const detailed = payload?.errors?.[0]?.description || payload?.error || payload?.message
        throw new Error(detailed || 'Erro na requisição ao Asaas')
      }

      return response.json()
    } catch (error) {
      console.log('Erro na requisição RR:', error)
      console.error(`Erro na requisição ${method} para ${endpoint}:`, error)
      throw error
    }
  }

  async createCustomer(data: CreateCustomerRequest): Promise<AsaasCustomerResponse> {
   const response = await this.request<AsaasCustomerResponse>('POST', '/customers', data)
   return response;
  }

  async createSubscription(data: CreateSubscriptionRequest): Promise<AsaasSubscriptionResponse> {
    return this.request<AsaasSubscriptionResponse>('POST', '/subscriptions', data)
  }

  async cancelarSubscription(data: string): Promise<AsaasSubscriptionResponse> {
    return this.request<AsaasSubscriptionResponse>('DELETE', '/subscriptions/' + data)
  }

  async tokenizeCreditCard(data: TokenizeCreditCardRequest): Promise<TokenizeCreditCardResponse> {
    return this.request<TokenizeCreditCardResponse>('POST', '/creditCard/tokenizeCreditCard', data)
  }
}

// Exporta uma instância única do serviço
// Removido export singleton para evitar inicialização antecipada com env ausente