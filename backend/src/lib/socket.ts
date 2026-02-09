import { Server as SocketServer } from 'socket.io'
import { FastifyInstance } from 'fastify'
import { createAdapter } from '@socket.io/redis-adapter'
import { createClient } from 'redis'
import jwt from 'jsonwebtoken'

// Tipos para TypeScript
export interface SocketUser {
  userId: string
  tenantId: string
  role: 'admin' | 'manager' | 'kitchen' | 'cashier' | 'customer'
  socketId: string
}

// Store de conexões ativas (pode ser Redis em produção)
export const connectedUsers = new Map<string, SocketUser>()

export async function setupSocketIO(fastify: FastifyInstance) {
  const io = new SocketServer(fastify.server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
    transports: ['websocket', 'polling'], // Fallback para polling
  })

  // Configurar Redis Adapter (escalabilidade horizontal) - opcional para dev
  // if (process.env.REDIS_URL) {
  //   const pubClient = createClient({ url: process.env.REDIS_URL })
  //   const subClient = pubClient.duplicate()
  //   await Promise.all([pubClient.connect(), subClient.connect()])
  //   io.adapter(createAdapter(pubClient, subClient))
  //   fastify.log.info('🔌 Redis adapter configurado para Socket.io')
  // }

  // Middleware de autenticação JWT
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token
      
      if (!token) {
        return next(new Error('Token não fornecido'))
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
      
      // Adicionar dados do usuário ao socket
      socket.data.user = {
        userId: decoded.sub,
        tenantId: decoded.tenantId,
        role: decoded.role,
        socketId: socket.id,
      }

      next()
    } catch (error) {
      next(new Error('Token inválido'))
    }
  })

  // Eventos de conexão
  io.on('connection', (socket) => {
    const user = socket.data.user as SocketUser
    
    fastify.log.info(`🔌 Cliente conectado: ${user.userId} (Tenant: ${user.tenantId})`)
    
    // Registrar usuário
    connectedUsers.set(socket.id, user)
    
    // Entrar na room do tenant (isolamento multi-tenant)
    socket.join(`tenant:${user.tenantId}`)
    
    // Sub-rooms baseadas na role
    socket.join(`tenant:${user.tenantId}:${user.role}`)
    
    // Evento: Novo pedido criado (cliente → servidor)
    socket.on('order:created', (orderData) => {
      // Broadcast para cozinha e dashboard do mesmo tenant
      io.to(`tenant:${user.tenantId}:kitchen`)
        .to(`tenant:${user.tenantId}:dashboard`)
        .emit('order:new', {
          orderId: orderData.id,
          items: orderData.items,
          total: orderData.total,
          customer: orderData.customerName,
          timestamp: new Date().toISOString(),
        })
    })

    // Evento: Status de pedido atualizado (cozinha → cliente)
    socket.on('order:status:updated', (data) => {
      const { orderId, status, customerId } = data
      
      // Notificar cliente específico se estiver online
      io.to(`tenant:${user.tenantId}:customer:${customerId}`)
        .emit('order:status', { orderId, status })
      
      // Notificar dashboard
      io.to(`tenant:${user.tenantId}:dashboard`)
        .emit('order:updated', { orderId, status })
    })

    // Evento: Nova venda (PDV → Dashboard)
    socket.on('sale:completed', (saleData) => {
      io.to(`tenant:${user.tenantId}:dashboard`)
        .emit('sale:new', saleData)
    })

    // Desconexão
    socket.on('disconnect', () => {
      connectedUsers.delete(socket.id)
      fastify.log.info(`❌ Cliente desconectado: ${user.userId}`)
    })
  })

  // Tornar io acessível globalmente no Fastify
  fastify.decorate('io', io)
  
  return io
}

// Tipos para Fastify
declare module 'fastify' {
  interface FastifyInstance {
    io: SocketServer
  }
}
