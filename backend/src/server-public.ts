import fastify from 'fastify'
import cors from '@fastify/cors'
import prisma from './lib/prisma'
import publicRoutes from './routes/public'
import authRoutes from './routes/auth'

const server = fastify({
  logger: true,
})

// Make Prisma available globally
declare module 'fastify' {
  interface FastifyInstance {
    prisma: any
  }
}

// Registrar plugins
server.register(cors, {
  origin: true, // Permitir todas as origens para API pública
  credentials: true,
})

// Disponibilizar Prisma globalmente
server.decorate('prisma', prisma)

// Registrar rotas públicas
server.register(publicRoutes, { prefix: '/api/public' })

// Registrar rotas de autenticação
server.register(authRoutes, { prefix: '/api/auth' })

// Health check básico
server.get('/health', async (request, reply) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      database: 'connected'
    }
  } catch (error) {
    return { 
      status: 'unhealthy', 
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
      database: 'disconnected'
    }
  }
})

// Root route
server.get('/', async (request, reply) => {
  return {
    message: 'FoodManager API Public',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      public: '/api/public',
      auth: '/api/auth'
    }
  }
})

const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3003
    
    await server.listen({ port, host: '0.0.0.0' })
    
    server.log.info(`🚀 Public API server listening on port ${port}`)
    server.log.info(`📖 API Documentation: http://localhost:${port}/api/public`)
    server.log.info(`🏥 Health Check: http://localhost:${port}/health`)
    server.log.info(`⚡ Prisma Accelerate: Enabled`)
    
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect()
  await server.close()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  await server.close()
  process.exit(0)
})

// Iniciar servidor
if (require.main === module) {
  start()
}

export default server
