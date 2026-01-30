# 🔌 API Contracts - FoodManager SaaS

## 📋 Overview

Documentação completa dos contratos de API para integração entre frontend e backend do FoodManager, incluindo estrutura para futuras integrações fiscais.

---

## 🏗️ Base Architecture

### Base URL
```
Development: http://localhost:3001/api
Production: https://api.foodmanager.com/api
```

### Headers
```typescript
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer <access_token>',
  'X-Tenant-ID': '<tenant_slug>' // Opcional, fallback para subdomínio
}
```

### Response Format
```typescript
interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}
```

---

## 🔐 Authentication Endpoints

### POST /auth/login
Autenticação de usuário

**Request:**
```typescript
interface LoginRequest {
  email: string
  password: string
  tenantSlug?: string // Opcional para multi-tenant
}
```

**Response:**
```typescript
interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
  expiresIn: number
}
```

### POST /auth/register
Registro de novo usuário/tenant

**Request:**
```typescript
interface RegisterRequest {
  email: string
  password: string
  name: string
  role?: UserRole
  tenantSlug?: string // Se não informado, cria novo tenant
}
```

### POST /auth/refresh
Refresh do access token

**Request:**
```typescript
interface RefreshRequest {
  refreshToken: string
}
```

### POST /auth/logout
Logout do usuário

**Headers:** `Authorization: Bearer <token>`

### GET /auth/me
Obter informações do usuário atual

**Headers:** `Authorization: Bearer <token>`

---

## 📦 Products Endpoints

### GET /products
Listar produtos com filtros

**Query Parameters:**
```typescript
interface ProductQuery {
  page?: number
  limit?: number
  search?: string
  categoryId?: string
  isAvailable?: boolean
  sortBy?: 'name' | 'price' | 'orderIndex' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}
```

**Response:**
```typescript
interface ProductsResponse {
  products: Product[]
  pagination: PaginationInfo
}
```

### GET /products/:id
Obter produto por ID

### POST /products
Criar novo produto

**Request:**
```typescript
interface CreateProductRequest {
  name: string
  description?: string
  price: number
  categoryId: string
  imageUrl?: string
  isAvailable?: boolean
  orderIndex?: number
  preparationTime?: number
}
```

### PUT /products/:id
Atualizar produto

**Request:** `UpdateProductRequest` (campos opcionais)

### DELETE /products/:id
Excluir produto

### PATCH /products/:id/toggle-availability
Alternar disponibilidade do produto

### GET /products/categories/with-products
Listar categorias com produtos

---

## 🛒 Orders Endpoints

### GET /orders
Listar pedidos

**Query Parameters:**
```typescript
interface OrderQuery {
  page?: number
  limit?: number
  status?: OrderStatus
  deliveryType?: DeliveryType
  startDate?: string
  endDate?: string
  customerName?: string
}
```

### GET /orders/:id
Obter pedido por ID

### POST /orders
Criar novo pedido

**Request:**
```typescript
interface CreateOrderRequest {
  customerName?: string
  customerPhone?: string
  customerAddress?: string
  deliveryType: DeliveryType
  items: OrderItemRequest[]
  notes?: string
}

interface OrderItemRequest {
  productId: string
  quantity: number
  customizations?: {
    customizationId: string
  }[]
}
```

### PUT /orders/:id/status
Atualizar status do pedido

**Request:**
```typescript
interface UpdateOrderStatusRequest {
  status: OrderStatus
  notes?: string
}
```

### GET /orders/summary
Resumo de pedidos (para dashboard)

**Query Parameters:**
```typescript
interface OrderSummaryQuery {
  period?: 'today' | 'week' | 'month' | 'year'
  startDate?: string
  endDate?: string
}
```

---

## 📦 Inventory Endpoints

### GET /inventory
Listar itens de estoque

**Query Parameters:**
```typescript
interface InventoryQuery {
  page?: number
  limit?: number
  search?: string
  lowStock?: boolean
  category?: string
}
```

### POST /inventory
Criar item de estoque

**Request:**
```typescript
interface CreateInventoryRequest {
  name: string
  description?: string
  quantity: number
  minQuantity: number
  unit: string
  cost?: number
  supplier?: string
}
```

### PUT /inventory/:id
Atualizar item de estoque

### POST /inventory/:id/movements
Registrar movimentação

**Request:**
```typescript
interface InventoryMovementRequest {
  type: MovementType
  quantity: number
  reason: string
  cost?: number
  orderId?: string
}
```

### GET /inventory/alerts
Alertas de estoque baixo

---

## 💰 Financial Endpoints

### GET /financial
Listar registros financeiros

**Query Parameters:**
```typescript
interface FinancialQuery {
  page?: number
  limit?: number
  type?: RecordType
  category?: string
  startDate?: string
  endDate?: string
}
```

### POST /financial
Criar registro financeiro

**Request:**
```typescript
interface CreateFinancialRequest {
  type: RecordType
  description: string
  amount: number
  category: string
  date: string
  orderId?: string
  attachments?: string[]
  notes?: string
}
```

### GET /financial/summary
Resumo financeiro

**Query Parameters:**
```typescript
interface FinancialSummaryQuery {
  period?: 'today' | 'week' | 'month' | 'year'
  startDate?: string
  endDate?: string
}
```

---

## 🧾 Fiscal Integration Endpoints

### GET /invoices
Listar notas fiscais

### POST /invoices
Emitir nota fiscal

**Request:**
```typescript
interface CreateInvoiceRequest {
  orderId: string
  type: InvoiceType
  customerData?: {
    name: string
    document?: string
    address?: string
  }
}
```

### GET /invoices/:id/xml
Obter XML da nota fiscal

### GET /invoices/:id/pdf
Obter PDF da nota fiscal

### POST /invoices/:id/cancel
Cancelar nota fiscal

---

## 🔌 Webhook Events

### Order Events
```typescript
interface OrderWebhook {
  event: 'order.created' | 'order.updated' | 'order.cancelled'
  data: Order
  tenantId: string
  timestamp: string
}
```

### Payment Events
```typescript
interface PaymentWebhook {
  event: 'payment.received' | 'payment.failed'
  data: Payment
  tenantId: string
  timestamp: string
}
```

### Inventory Events
```typescript
interface InventoryWebhook {
  event: 'inventory.low' | 'inventory.out'
  data: InventoryItem
  tenantId: string
  timestamp: string
}
```

---

## 🏪 Fiscal Integration Structure

### NFS-e (Nota Fiscal de Serviço Eletrônica)
```typescript
interface NFSEData {
  serviceCode: string
  serviceDescription: string
  amount: number
  deductions?: number
  baseAmount: number
  issRate: number
  issAmount: number
  provider: {
    document: string
    name: string
    address: Address
  }
  customer?: {
    document?: string
    name: string
    address?: Address
  }
}
```

### SAT (Sistema Autenticador e Transmissor)
```typescript
interface SATData {
  cnpj: string
  ie: string
    im: string
  ccf: number
  coo: number
  items: SATItem[]
  payment: SATPayment[]
  total: number
}
```

### NFC-e (Nota Fiscal ao Consumidor)
```typescript
interface NFCEData {
  cnpj: string
  ie: string
  items: NFCEItem[]
  payment: NFCEPayment[]
  total: number
  customer?: {
    document?: string
    name?: string
  }
}
```

---

## 🔧 Integration Examples

### JavaScript/TypeScript Client
```typescript
class FoodManagerAPI {
  private baseURL: string
  private accessToken?: string

  constructor(baseURL: string, tenantSlug?: string) {
    this.baseURL = baseURL
  }

  async login(email: string, password: string) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    
    const data = await response.json()
    this.accessToken = data.accessToken
    return data
  }

  async getProducts(filters?: ProductQuery) {
    const params = new URLSearchParams(filters as any).toString()
    const response = await fetch(`${this.baseURL}/products?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    })
    
    return response.json()
  }

  async createOrder(orderData: CreateOrderRequest) {
    const response = await fetch(`${this.baseURL}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    })
    
    return response.json()
  }
}
```

### React Hook Example
```typescript
import { useState, useEffect } from 'react'

export function useProducts(filters?: ProductQuery) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        const api = new FoodManagerAPI(process.env.API_URL!)
        const data = await api.getProducts(filters)
        setProducts(data.products)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [filters])

  return { products, loading, error }
}
```

---

## 📊 Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| Auth | 5 requests | 1 minute |
| Products | 100 requests | 1 minute |
| Orders | 50 requests | 1 minute |
| Inventory | 30 requests | 1 minute |
| Financial | 20 requests | 1 minute |

---

## 🔒 Security Considerations

### Authentication
- JWT tokens com 15 minutos de validade
- Refresh tokens com 7 dias de validade
- Rate limiting em endpoints de auth

### Data Validation
- Zod schemas para validação de entrada
- Sanitização de dados contra XSS
- SQL injection prevention via Prisma

### Multi-tenant Isolation
- Row Level Security (RLS) no PostgreSQL
- Tenant ID em todas as queries
- Validação de ownership em todas as operações

---

## 🚀 Future Integrations

### Payment Gateways
```typescript
interface PaymentGateway {
  id: string
  name: string
  type: 'pix' | 'credit_card' | 'debit_card' | 'wallet'
  credentials: Record<string, any>
  isActive: boolean
}
```

### Delivery Services
```typescript
interface DeliveryService {
  id: string
  name: string
  apiKey: string
  webhookUrl: string
  isActive: boolean
}
```

### Analytics Services
```typescript
interface AnalyticsService {
  id: string
  name: string
  trackingId: string
  events: string[]
  isActive: boolean
}
```

---

## 📝 Testing Examples

### Unit Test Example
```typescript
import { describe, it, expect } from '@jest/globals'
import { FoodManagerAPI } from '../api'

describe('FoodManagerAPI', () => {
  it('should authenticate successfully', async () => {
    const api = new FoodManagerAPI('http://localhost:3001')
    const result = await api.login('test@example.com', 'password')
    
    expect(result).toHaveProperty('accessToken')
    expect(result).toHaveProperty('refreshToken')
    expect(result.user.email).toBe('test@example.com')
  })
})
```

### Integration Test Example
```typescript
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { setupTestServer, cleanupTestServer } from '../test-utils'

describe('Orders API', () => {
  beforeAll(async () => {
    await setupTestServer()
  })

  afterAll(async () => {
    await cleanupTestServer()
  })

  it('should create an order successfully', async () => {
    const api = new FoodManagerAPI(process.env.TEST_API_URL!)
    await api.login('vendor@test.com', 'password')
    
    const orderData = {
      customerName: 'John Doe',
      deliveryType: 'PICKUP',
      items: [
        {
          productId: 'product-1',
          quantity: 2
        }
      ]
    }
    
    const result = await api.createOrder(orderData)
    expect(result).toHaveProperty('id')
    expect(result.status).toBe('PENDING')
  })
})
```

---

## 📞 Support

Para dúvidas sobre integração:
- **Documentação**: https://docs.foodmanager.com
- **API Reference**: https://api.foodmanager.com/docs
- **Support**: api-support@foodmanager.com
- **Status Page**: https://status.foodmanager.com
