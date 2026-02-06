import fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import multipart from '@fastify/multipart'
import { PrismaClient } from '@prisma/client'
import { FastifyInstance } from 'fastify'
import { prisma } from './lib/prisma'
import { authRoutes } from './routes/auth'
import { publicRoutes } from './routes/public'
import { adminRoutes } from './routes/admin'
import { analyticsRoutes } from './routes/analytics'
import { auditRoutes } from './routes/audit'
import { roleRoutes } from './routes/role'
import { authenticateAdmin } from './middleware/adminAuth'
import orderRoutes from './routes/orders-simple'
import inventoryRoutes from './routes/inventory-simple'
import financialRoutes from './routes/financial-simple'
import userRoutes from './routes/users-simple'
import tenantRoutes from './routes/tenants-simple'

import { Server } from 'socket.io'
import { createServer } from 'http'

import { authMiddleware } from './middleware/auth'
import { tenantMiddleware } from './middleware/tenant-simple'
import { errorHandler } from './middleware/errorHandler'

// 🔥 TEMPORÁRIO - Valores hardcoded para teste
process.env.JWT_SECRET = 'temp-jwt-secret-for-testing-only'
process.env.JWT_REFRESH_SECRET = 'temp-jwt-refresh-secret-for-testing-only'

const server = fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
  trustProxy: true,
})

// Create HTTP server for Socket.io
const httpServer = createServer(server.server)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

// Make Socket.io available globally
declare module 'fastify' {
  interface FastifyInstance {
    io: Server
  }
}

server.decorate('io', io)

// Register plugins
server.register(cors, {
  origin: true,
  credentials: true,
})

server.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
})

server.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
  skipOnError: false,
})

server.register(multipart, {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
})

// Database connection
import prisma from './lib/prisma'

// Make Prisma available globally
declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}

server.decorate('prisma', prisma)

// Middleware
server.register(tenantMiddleware)
server.register(authMiddleware)

// Register routes
server.register(authRoutes, { prefix: '/api/auth' })
server.register(publicRoutes, { prefix: '/api/public' })
server.register(adminRoutes, { prefix: '/api' })
server.register(analyticsRoutes, { prefix: '/api' })
server.register(auditRoutes, { prefix: '/api' })
server.register(roleRoutes, { prefix: '/api' })

// Simple routes (mantidos para compatibilidade)
server.register(orderRoutes, { prefix: '/api/orders' })
server.register(inventoryRoutes, { prefix: '/api/inventory' })
server.register(financialRoutes, { prefix: '/api/financial' })
server.register(userRoutes, { prefix: '/api/users' })
server.register(tenantRoutes, { prefix: '/api/tenants' })

// Socket.io connection handling
io.on('connection', (socket) => {
  server.log.info(`Socket connected: ${socket.id}`)

  socket.on('join-tenant', (tenantId: string) => {
    socket.join(`tenant-${tenantId}`)
    server.log.info(`Socket ${socket.id} joined tenant ${tenantId}`)
  })

  socket.on('leave-tenant', (tenantId: string) => {
    socket.leave(`tenant-${tenantId}`)
    server.log.info(`Socket ${socket.id} left tenant ${tenantId}`)
  })

  socket.on('disconnect', () => {
    server.log.info(`Socket disconnected: ${socket.id}`)
  })
})

// Health check
server.get('/api/health', async (request, reply) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development',
    }
  } catch (error) {
    server.log.error('Health check failed:', error)
    reply.status(503)
    return {
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
    }
  }
})

// Error handler
server.setErrorHandler(errorHandler)

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  server.log.info(`Received ${signal}, shutting down gracefully...`)
  
  try {
    await server.close()
    await prisma.$disconnect()
    httpServer.close()
    server.log.info('Graceful shutdown completed')
    process.exit(0)
  } catch (error) {
    server.log.error('Error during shutdown:', error)
    process.exit(1)
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3001', 10)
    const host = process.env.HOST || '0.0.0.0'

    await httpServer.listen({ port, host })
    server.log.info(`🚀 Server listening on http://${host}:${port}`)
    server.log.info(`📡 Socket.io server ready`)
  } catch (error) {
    server.log.error('Failed to start server:', error)
    process.exit(1)
  }
}

start()
