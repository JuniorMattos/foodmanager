# 📡 API Pública FoodManager

Documentação da API pública para clientes e parceiros do FoodManager.

## 🌐 Base URL

```
https://api.foodmanager.com/api/public
```

Para desenvolvimento local:
```
http://localhost:3003/api/public
```

## 🔐 Autenticação

A API pública não requer autenticação, mas utiliza identificação de tenant através de parâmetros ou headers.

### Identificação do Tenant

Você pode identificar o tenant de duas formas:

1. **Query Parameter**:
   ```
   GET /api/public/menu?tenant=slug-do-tenant
   ```

2. **Header**:
   ```
   GET /api/public/menu
   Headers:
   X-Tenant-Slug: slug-do-tenant
   ```

## 📋 Endpoints

### 🍽️ Cardápio Público

#### `GET /menu`

Retorna o cardápio completo do estabelecimento.

**Parâmetros:**
- `tenant` (obrigatório): Slug do tenant
- `category` (opcional): ID da categoria para filtrar
- `search` (opcional): Termo para busca em produtos
- `available` (opcional): Filtrar apenas produtos disponíveis (true/false)

**Exemplo:**
```bash
GET /api/public/menu?tenant=restaurante-exemplo&search=hamburguer&available=true
```

**Resposta:**
```json
{
  "tenant": {
    "id": "tenant-123",
    "name": "Restaurante Exemplo",
    "slug": "restaurante-exemplo",
    "logoUrl": "https://example.com/logo.jpg"
  },
  "categories": [
    {
      "id": "cat-123",
      "name": "Lanches",
      "description": "Nossos deliciosos lanches",
      "orderIndex": 1,
      "products": [
        {
          "id": "prod-123",
          "name": "Hambúrguer Tradicional",
          "description": "Hambúrguer com queijo e alface",
          "price": 25.90,
          "imageUrl": "https://example.com/burger.jpg",
          "preparationTime": 15,
          "orderIndex": 1,
          "category": {
            "id": "cat-123",
            "name": "Lanches"
          }
        }
      ]
    }
  ],
  "allProducts": [...]
}
```

### 🏪 Informações do Estabelecimento

#### `GET /tenant`

Retorna informações públicas do estabelecimento.

**Parâmetros:**
- `tenant` (obrigatório): Slug do tenant

**Exemplo:**
```bash
GET /api/public/tenant?tenant=restaurante-exemplo
```

**Resposta:**
```json
{
  "tenant": {
    "id": "tenant-123",
    "name": "Restaurante Exemplo",
    "slug": "restaurante-exemplo",
    "logoUrl": "https://example.com/logo.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 🛒 Criar Pedido

#### `POST /orders`

Cria um novo pedido no sistema.

**Parâmetros:**
- `tenant` (obrigatório): Slug do tenant

**Corpo da Requisição:**
```json
{
  "customerName": "João Silva",
  "customerPhone": "+5511999998888",
  "customerEmail": "joao@example.com",
  "deliveryType": "DELIVERY",
  "deliveryAddress": {
    "street": "Rua das Flores",
    "number": "123",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01234-567",
    "complement": "Apto 101"
  },
  "items": [
    {
      "productId": "prod-123",
      "quantity": 2,
      "customizations": [
        {
          "customizationId": "custom-123",
          "quantity": 1
        }
      ]
    }
  ],
  "observations": "Sem cebola, por favor"
}
```

**Resposta:**
```json
{
  "order": {
    "id": "order-123",
    "orderNumber": "ORD1704123456789ABC",
    "status": "PENDING",
    "customerName": "João Silva",
    "deliveryType": "DELIVERY",
    "totalAmount": 51.80,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "items": [
      {
        "productId": "prod-123",
        "quantity": 2,
        "unitPrice": 25.90,
        "totalPrice": 51.80
      }
    ]
  },
  "message": "Pedido criado com sucesso!"
}
```

### 📊 Status do Pedido

#### `GET /orders/:orderNumber`

Consulta o status de um pedido específico.

**Parâmetros:**
- `tenant` (obrigatório): Slug do tenant
- `orderNumber` (obrigatório): Número do pedido

**Exemplo:**
```bash
GET /api/public/orders/ORD1704123456789ABC?tenant=restaurante-exemplo
```

**Resposta:**
```json
{
  "order": {
    "id": "order-123",
    "orderNumber": "ORD1704123456789ABC",
    "status": "CONFIRMED",
    "customerName": "João Silva",
    "customerPhone": "+5511999998888",
    "deliveryType": "DELIVERY",
    "totalAmount": 51.80,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:05:00.000Z"
  }
}
```

### 💉 Health Check

#### `GET /health`

Verifica o status da API e do banco de dados.

**Resposta:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "version": "1.0.0",
  "uptime": 3600.5
}
```

## 🔄 Status dos Pedidos

| Status | Descrição |
|--------|----------|
| `PENDING` | Pedido recebido, aguardando confirmação |
| `CONFIRMED` | Pedido confirmado, em preparação |
| `PREPARING` | Pedido sendo preparado na cozinha |
| `READY` | Pedido pronto para retirada/entrega |
| `OUT_FOR_DELIVERY` | Pedido em rota de entrega |
| `DELIVERED` | Pedido entregue com sucesso |
| `CANCELLED` | Pedido cancelado |
| `REFUNDED` | Pedido reembolsado |

## 🚚 Tipos de Entrega

| Tipo | Descrição |
|------|----------|
| `PICKUP` | Retirada no local |
| `DELIVERY` | Entrega no endereço |

## ⚠️ Códigos de Erro

| Código | Descrição |
|--------|----------|
| `400` | Requisição inválida - parâmetros faltando ou incorretos |
| `403` | Funcionalidade não disponível para este tenant |
| `404` | Tenant ou recurso não encontrado |
| `500` | Erro interno do servidor |
| `503` | Serviço indisponível (banco de dados offline) |

## 📱 Exemplos de Uso

### JavaScript/TypeScript

```javascript
// Buscar cardápio
const response = await fetch('/api/public/menu?tenant=restaurante-exemplo')
const menu = await response.json()

// Criar pedido
const orderResponse = await fetch('/api/public/orders?tenant=restaurante-exemplo', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    customerName: 'João Silva',
    deliveryType: 'PICKUP',
    items: [
      {
        productId: 'prod-123',
        quantity: 1
      }
    ]
  })
})
const order = await orderResponse.json()
```

### cURL

```bash
# Buscar cardápio
curl -X GET "http://localhost:3003/api/public/menu?tenant=restaurante-exemplo"

# Criar pedido
curl -X POST "http://localhost:3003/api/public/orders?tenant=restaurante-exemplo" \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "João Silva",
    "deliveryType": "PICKUP",
    "items": [
      {
        "productId": "prod-123",
        "quantity": 1
      }
    ]
  }'
```

## 🔧 Rate Limiting

A API pública possui rate limiting para evitar abuso:
- **100 requisições por minuto** por IP
- **1000 requisições por hora** por tenant

## 🌐 CORS

A API permite requisições de qualquer origem (CORS habilitado) para facilitar integrações web e mobile.

## 📝 Notificações

Pedidos criados via API pública emitem eventos em tempo real via WebSocket para o painel administrativo do estabelecimento, permitindo acompanhamento em tempo real.

## 🚀 Integrações

Esta API foi projetada para facilitar integrações com:
- 📱 Aplicativos mobile de delivery
- 🌐 Sites de cardápio online
- 🤖 Chatbots e assistentes virtuais
- 📊 Sistemas de parceiros e agregadores
