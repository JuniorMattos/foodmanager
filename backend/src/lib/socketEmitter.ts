import { FastifyInstance } from 'fastify'

export class SocketEmitter {
  constructor(private fastify: FastifyInstance) {}

  // Notificar novo pedido para cozinha
  notifyNewOrder(tenantId: string, orderData: any) {
    this.fastify.io
      .to(`tenant:${tenantId}:kitchen`)
      .to(`tenant:${tenantId}:dashboard`)
      .emit('order:new', orderData)
  }

  // Atualizar status do pedido
  updateOrderStatus(tenantId: string, orderId: string, status: string, customerId?: string) {
    this.fastify.io
      .to(`tenant:${tenantId}:dashboard`)
      .emit('order:updated', { orderId, status })

    if (customerId) {
      this.fastify.io
        .to(`tenant:${tenantId}:customer:${customerId}`)
        .emit('order:status', { orderId, status })
    }
  }

  // Nova venda no PDV
  notifyNewSale(tenantId: string, saleData: any) {
    this.fastify.io
      .to(`tenant:${tenantId}:dashboard`)
      .emit('sale:new', saleData)
  }

  // Broadcast geral para tenant
  broadcastToTenant(tenantId: string, event: string, data: any) {
    this.fastify.io
      .to(`tenant:${tenantId}`)
      .emit(event, data)
  }
}

// Uso em rotas:
// const emitter = new SocketEmitter(fastify)
// emitter.notifyNewOrder(tenantId, order)
