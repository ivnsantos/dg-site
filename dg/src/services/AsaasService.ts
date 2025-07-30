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
  }
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
}

export class AsaasService {
  private apiUrl: string
  private accessToken: string

  constructor() {
    this.apiUrl = 'https://api-sandbox.asaas.com/v3'
    this.accessToken = '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmEzMzRhYzc2LTdhYTMtNDg3Ni05OGU5LWZjMjVjNmMxZTQyOTo6JGFhY2hfYmJjNDNlNTktYTJhMC00YzhhLTljOTItNzhhM2M3ZDMyYjZi'
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any
  ): Promise<T> {
    const url = `${this.apiUrl}${endpoint}`
    
    try {
      console.log("TESTEEEEEE________data_____________")
      console.log(data)
      console.log("TESTEEEEEE________url_____________")
      console.log(url)
      console.log("TESTEEEEEE________accessToken_____________") 
      console.log(this.accessToken)

      const response = await fetch(url, {
        method,
        headers: {
          'access_token': this.accessToken,
          'Content-Type': 'application/json',
          'User-Agent': 'assinatura-api-dg'

        },
        body: data ? JSON.stringify(data) : undefined
      })
      console.log("TESTEEEEEE_____________________")
      console.log(response)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro na requisição ao Asaas')
      }

      return response.json()
    } catch (error) {
      console.error(`Erro na requisição ${method} para ${endpoint}:`, error)
      throw error
    }
  }

  async createCustomer(data: CreateCustomerRequest): Promise<AsaasCustomerResponse> {
   const response = await this.request<AsaasCustomerResponse>('POST', '/customers', data)
   return response;
  }

  async createSubscription(data: CreateSubscriptionRequest): Promise<AsaasSubscriptionResponse> {
    console.log("TESTEEEEEE________data_____________")
    console.log(data)
  
    return this.request<AsaasSubscriptionResponse>('POST', '/subscriptions', data)
  }

  async cancelarSubscription(data: string): Promise<AsaasSubscriptionResponse> {
    return this.request<AsaasSubscriptionResponse>('DELETE', '/subscriptions/' + data)
  }
}

// Exporta uma instância única do serviço
export const asaasService = new AsaasService() 