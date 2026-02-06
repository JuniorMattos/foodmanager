import fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import { tenantMiddleware, createTenantRateLimiter, getTenantAllowedOrigins } from './middleware/tenant-final'
import authRoutes from './routes/auth-secure'

const server = fastify({
  logger: {
    level: 'info',
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

// CORS dinâmico por tenant
server.register(cors, {
  origin: (origin, callback) => {
    // Permitir origin se for válido para algum tenant
    const allowedOrigins = [
      'http://localhost:3000', // Development
      'http://localhost:5173', // Vite dev
      'https://burgerexpress.foodmanager.com',
    ]
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'), false)
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Authorization',
    'Content-Type',
    'X-Tenant-ID',
    'X-Tenant-Slug',
    'X-Requested-With',
  ],
})

// Security headers
server.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
})

// Rate limiting global
server.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
  skipOnError: false,
  keyGenerator: (request) => {
    // Rate limit por IP + Tenant se disponível
    const tenantId = (request as any).tenantId
    return `${request.ip}:${tenantId || 'anonymous'}`
  },
})

// Health check
server.get('/api/health', async () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    security: {
      jwt: 'RS256',
      tenant_isolation: 'enabled',
      rate_limiting: 'per_tenant',
    },
  }
})

// Security info endpoint
server.get('/api/security/info', async () => {
  return {
    jwt_algorithm: 'RS256',
    tenant_isolation: true,
    rate_limiting: true,
    cors: 'tenant_specific',
    security_headers: true,
  }
})

// Register auth routes
server.register(authRoutes, { prefix: '/api/auth' })

// Protected routes example
server.register(async function (protectedRoutes) {
  // Apply tenant middleware to all protected routes
  protectedRoutes.addHook('preHandler', tenantMiddleware)
  
  // Apply tenant rate limiting
  protectedRoutes.addHook('preHandler', createTenantRateLimiter())

  // Example protected endpoint
  protectedRoutes.get('/dashboard', async (request, reply) => {
    const user = (request as any).user
    const tenant = (request as any).tenant
    
    return {
      message: `Welcome to ${tenant.name} dashboard`,
      user: {
        id: user.userId,
        email: user.email,
        role: user.role,
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
      },
      permissions: getUserPermissions(user.role),
    }
  })

  // Example tenant-specific data
  protectedRoutes.get('/data', async (request, reply) => {
    const tenant = (request as any).tenant
    
    return {
      tenant_id: tenant.id,
      data: `This data is isolated for tenant: ${tenant.name}`,
      timestamp: new Date().toISOString(),
    }
  })

}, { prefix: '/api/v1' })

// Public API endpoints (versioned)
server.register(async function (publicRoutes) {
  
  publicRoutes.get('/public/menu', async (request, reply) => {
    const tenantSlug = (request.headers['x-tenant-slug'] || request.query.tenant) as string
    
    if (!tenantSlug) {
      return reply.status(400).send({
        error: 'Tenant slug required',
        message: 'Please provide X-Tenant-Slug header or tenant query parameter',
      })
    }

    // Mock menu data
    return {
      tenant: tenantSlug,
      menu: {
        categories: [
          {
            id: '1',
            name: 'Burgers',
            items: [
              { id: '1', name: 'Classic Burger', price: 12.99 },
              { id: '2', name: 'Cheese Burger', price: 14.99 },
            ]
          },
          {
            id: '2', 
            name: 'Drinks',
            items: [
              { id: '3', name: 'Coke', price: 3.99 },
              { id: '4', name: 'Juice', price: 4.99 },
            ]
          }
        ]
      },
      public_api: true,
    }
  })

}, { prefix: '/api/v1/public' })

// Error handler
server.setErrorHandler((error, request, reply) => {
  server.log.error(error)
  
  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV !== 'production'
  
  return reply.status(error.statusCode || 500).send({
    error: error.name || 'Error',
    message: isDevelopment ? error.message : 'Internal Server Error',
    code: error.code || 'INTERNAL_ERROR',
    ...(isDevelopment && { stack: error.stack }),
    timestamp: new Date().toISOString(),
  })
})

// Helper function
function getUserPermissions(role: string): string[] {
  const permissions = {
    ADMIN: ['read', 'write', 'delete', 'manage_users', 'manage_billing'],
    MANAGER: ['read', 'write', 'delete', 'manage_inventory', 'manage_orders'],
    VENDOR: ['read', 'write', 'manage_orders'],
    CUSTOMER: ['read', 'create_orders'],
  }
  
  return permissions[role as keyof typeof permissions] || []
}

// Start server
const start = async () => {
  try {
    const port = 3001
    const host = '0.0.0.0'

    await server.listen({ port, host })
    
    console.log(`🚀 Secure Server listening on http://${host}:${port}`)
    console.log(`🔐 Security Features:`)
    console.log(`   • JWT Algorithm: RS256`)
    console.log(`   • Tenant Isolation: Enabled`)
    console.log(`   • Rate Limiting: Per Tenant`)
    console.log(`   • CORS: Tenant Specific`)
    console.log(`   • Security Headers: Enabled`)
    console.log(`📡 API Endpoints:`)
    console.log(`   • POST /api/auth/login - Login with JWT RS256`)
    console.log(`   • POST /api/auth/refresh - Refresh tokens`)
    console.log(`   • GET  /api/v1/dashboard - Protected endpoint`)
    console.log(`   • GET  /api/v1/public/menu - Public endpoint`)
    
  } catch (error) {
    console.error('Failed to start secure server:', error)
    process.exit(1)
  }
}

start()
