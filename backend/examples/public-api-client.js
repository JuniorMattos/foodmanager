/**
 * Cliente de exemplo para API Pública FoodManager
 * Demonstra como consumir os endpoints públicos
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3003/api/public'

// Para React, importe:
// import { useState, useCallback } from 'react'

class FoodManagerPublicAPI {
  constructor(tenantSlug) {
    this.tenantSlug = tenantSlug
  }

  /**
   * Buscar cardápio do estabelecimento
   */
  async getMenu(options = {}) {
    const params = new URLSearchParams({
      tenant: this.tenantSlug,
      ...options
    })

    const response = await fetch(`${API_BASE_URL}/menu?${params}`)
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar cardápio: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Buscar informações do estabelecimento
   */
  async getTenantInfo() {
    const response = await fetch(`${API_BASE_URL}/tenant?tenant=${this.tenantSlug}`)
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar informações: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Criar novo pedido
   */
  async createOrder(orderData) {
    const response = await fetch(`${API_BASE_URL}/orders?tenant=${this.tenantSlug}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Erro ao criar pedido: ${error.message}`)
    }

    return response.json()
  }

  /**
   * Consultar status do pedido
   */
  async getOrderStatus(orderNumber) {
    const response = await fetch(`${API_BASE_URL}/orders/${orderNumber}?tenant=${this.tenantSlug}`)
    
    if (!response.ok) {
      throw new Error(`Erro ao consultar pedido: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Verificar saúde da API
   */
  async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/health`)
    return response.json()
  }
}

// Exemplo de uso
async function example() {
  const api = new FoodManagerPublicAPI('restaurante-exemplo')

  try {
    // 1. Verificar saúde da API
    console.log('🏥 Health check:', await api.healthCheck())

    // 2. Buscar informações do estabelecimento
    console.log('🏪 Tenant info:', await api.getTenantInfo())

    // 3. Buscar cardápio
    const menu = await api getMenu()
    console.log('🍽️ Cardápio:', menu)

    // 4. Criar pedido
    if (menu.categories.length > 0 && menu.categories[0].products.length > 0) {
      const orderData = {
        customerName: 'João Silva',
        customerPhone: '+5511999998888',
        deliveryType: 'PICKUP',
        items: [
          {
            productId: menu.categories[0].products[0].id,
            quantity: 2
          }
        ]
      }

      const order = await api.createOrder(orderData)
      console.log('🛒 Pedido criado:', order)

      // 5. Consultar status do pedido
      const status = await api.getOrderStatus(order.order.orderNumber)
      console.log('📊 Status do pedido:', status)
    }

  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

// Exemplo de integração com React Hook
export function useFoodManagerAPI(tenantSlug) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const api = new FoodManagerPublicAPI(tenantSlug)

  const getMenu = useCallback(async (options) => {
    setLoading(true)
    setError(null)
    try {
      const result = await api.getMenu(options)
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [api])

  const createOrder = useCallback(async (orderData) => {
    setLoading(true)
    setError(null)
    try {
      const result = await api.createOrder(orderData)
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [api])

  return { getMenu, createOrder, loading, error }
}

// Exemplo de integração com WebSocket para notificações em tempo real
export class FoodManagerWebSocket {
  constructor(tenantSlug) {
    this.tenantSlug = tenantSlug
    this.socket = null
  }

  connect() {
    this.socket = new WebSocket(`ws://localhost:3001?tenant=${this.tenantSlug}`)
    
    this.socket.onopen = () => {
      console.log('🔌 Conectado ao WebSocket')
    }

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      console.log('📨 Mensagem recebida:', data)
      
      // Eventos disponíveis:
      // - new-order: Novo pedido criado
      // - order-updated: Status do pedido atualizado
    }

    this.socket.onerror = (error) => {
      console.error('❌ Erro no WebSocket:', error)
    }

    this.socket.onclose = () => {
      console.log('🔌 WebSocket desconectado')
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close()
    }
  }
}

// Executar exemplo se este arquivo for executado diretamente
if (require.main === module) {
  example()
}

export { FoodManagerPublicAPI, FoodManagerWebSocket }
