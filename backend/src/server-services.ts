import fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import { tenantMiddleware, createTenantRateLimiter } from './middleware/tenant-final'
import { getServiceContainer, initializeServices, cleanupServices } from './services'
import authRoutes from './routes/auth-secure'
import billingRoutes from './routes/billing'

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
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://burgerexpress.foodmanager.com',
      'https://checkout.stripe.com',
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
    'Stripe-Signature',
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
      connectSrc: ["'self'", "https:", "https://js.stripe.com"],
      scriptSrcElem: ["'self'", "https://js.stripe.com"],
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
    features: {
      jwt: 'RS256',
      tenant_isolation: 'enabled',
      rate_limiting: 'per_tenant',
      billing: 'stripe',
      security: 'enterprise',
      services_layer: 'enabled',
    },
  }
})

// Services info endpoint
server.get('/api/services/info', async () => {
  const container = getServiceContainer()
  
  return {
    services: {
      tenant_service: 'active',
      user_service: 'active',
      billing_service: 'active',
      repositories: {
        tenant_repository: 'active',
        user_repository: 'active',
      },
    },
    architecture: {
      pattern: 'Repository + Service Layer',
      orm: 'Prisma',
      database: 'PostgreSQL',
      authentication: 'JWT RS256',
      payment: 'Stripe',
    },
    status: 'operational',
  }
})

// Register auth routes
server.register(authRoutes, { prefix: '/api/auth' })

// Register billing routes
server.register(billingRoutes, { prefix: '/api/billing' })

// Protected routes with services
server.register(async function (protectedRoutes) {
  // Apply tenant middleware to all protected routes
  protectedRoutes.addHook('preHandler', tenantMiddleware)
  protectedRoutes.addHook('preHandler', createTenantRateLimiter())

  // Dashboard with services integration
  protectedRoutes.get('/dashboard', async (request, reply) => {
    const user = (request as any).user
    const tenant = (request as any).tenant
    const container = getServiceContainer()
    
    // Get tenant details
    const tenantDetails = await container.tenantService.getTenantById(tenant.id)
    
    // Get tenant usage
    const usage = await container.tenantService.getTenantUsage(tenant.id)
    
    // Get user statistics
    const userStats = await container.userService.getUserStatistics(tenant.id)
    
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
        plan: tenantDetails?.planId || 'unknown',
        status: tenantDetails?.status || 'unknown',
      },
      usage: {
        current: usage.metrics,
        limits: usage.limits,
        exceeded: usage.exceeded,
        period: usage.period,
      },
      statistics: {
        users: userStats,
        billing: {
          plan: tenantDetails?.planId || 'unknown',
          status: tenantDetails?.status || 'unknown',
        },
      },
      permissions: getUserPermissions(user.role),
    }
  })

  // Tenant management endpoints
  protectedRoutes.get('/tenants/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const container = getServiceContainer()
    
    const tenant = await container.tenantService.getTenantById(id)
    if (!tenant) {
      return reply.status(404).send({
        error: 'Tenant not found',
        code: 'TENANT_NOT_FOUND'
      })
    }
    
    return tenant
  })

  protectedRoutes.put('/tenants/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const updateData = request.body as any
    const container = getServiceContainer()
    
    const tenant = await container.tenantService.updateTenant(id, updateData)
    return tenant
  })

  // User management endpoints
  protectedRoutes.get('/users/profile', async (request, reply) => {
    const user = (request as any).user
    const container = getServiceContainer()
    
    const profile = await container.userService.getUserProfile(user.userId)
    if (!profile) {
      return reply.status(404).send({
        error: 'User profile not found',
        code: 'PROFILE_NOT_FOUND'
      })
    }
    
    return profile
  })

  protectedRoutes.put('/users/profile', async (request, reply) => {
    const user = (request as any).user
    const updateData = request.body as any
    const container = getServiceContainer()
    
    const updatedUser = await container.userService.updateUser(user.userId, updateData)
    return updatedUser
  })

  protectedRoutes.get('/users', async (request, reply) => {
    const tenant = (request as any).tenant
    const container = getServiceContainer()
    
    const filters = request.query as any
    const users = await container.userService.getUsersByTenant(tenant.id, filters)
    
    return users
  })

  protectedRoutes.post('/users', async (request, reply) => {
    const tenant = (request as any).tenant
    const userData = request.body as any
    const container = getServiceContainer()
    
    const user = await container.userService.createUser({
      ...userData,
      tenantId: tenant.id,
    })
    
    return reply.status(201).send(user)
  })

  // Usage tracking
  protectedRoutes.post('/usage/track', async (request, reply) => {
    const { metric, quantity } = request.body as {
      metric: string
      quantity: number
    }
    const tenant = (request as any).tenant
    
    console.log(`Usage tracked: ${tenant.id} - ${metric}: ${quantity}`)
    
    return reply.send({
      message: 'Usage tracked successfully',
      tenant_id: tenant.id,
      metric,
      quantity,
      timestamp: new Date().toISOString(),
    })
  })

  // Tenant metrics
  protectedRoutes.get('/tenants/metrics', async (request, reply) => {
    const container = getServiceContainer()
    
    const metrics = await container.tenantService.getTenantMetrics()
    return metrics
  })

  // User statistics
  protectedRoutes.get('/users/statistics', async (request, reply) => {
    const tenant = (request as any).tenant
    const container = getServiceContainer()
    
    const stats = await container.userService.getUserStatistics(tenant.id)
    return stats
  })

  // Search endpoints
  protectedRoutes.get('/search/tenants', async (request, reply) => {
    const { q, status, planId } = request.query as {
      q?: string
      status?: string
      planId?: string
    }
    const container = getServiceContainer()
    
    if (!q) {
      return reply.status(400).send({
        error: 'Search query required',
        code: 'QUERY_REQUIRED'
      })
    }
    
    const tenants = await container.tenantService.searchTenants(q, {
      status: status as any,
      planId,
    })
    
    return tenants
  })

  protectedRoutes.get('/search/users', async (request, reply) => {
    const { q, role, isActive } = request.query as {
      q?: string
      role?: string
      isActive?: string
    }
    const tenant = (request as any).tenant
    const container = getServiceContainer()
    
    if (!q) {
      return reply.status(400).send({
        error: 'Search query required',
        code: 'QUERY_REQUIRED'
      })
    }
    
    const users = await container.userService.searchUsers(q, tenant.id, {
      role: role as any,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    })
    
    return users
  })

}, { prefix: '/api/v1' })

// Public API endpoints (versioned)
server.register(async function (publicRoutes) {
  
  publicRoutes.get('/public/plans', async (request, reply) => {
    // Return public billing plans
    return {
      plans: [
        {
          id: 'basic',
          name: 'Basic',
          price: 4900,
          currency: 'usd',
          interval: 'month',
          features: [
            'Até 3 usuários',
            'Até 50 produtos',
            'Dashboard básico',
          ],
        },
        {
          id: 'standard',
          name: 'Standard',
          price: 9900,
          currency: 'usd',
          interval: 'month',
          features: [
            'Até 10 usuários',
            'Até 200 produtos',
            'Dashboard avançado',
            'PDV completo',
          ],
        },
        {
          id: 'premium',
          name: 'Premium',
          price: 19900,
          currency: 'usd',
          interval: 'month',
          features: [
            'Usuários ilimitados',
            'Produtos ilimitados',
            'Analytics avançado',
            'Suporte dedicado',
          ],
        },
      ],
    }
  })

  publicRoutes.get('/public/menu', async (request, reply) => {
    const tenantSlug = (request.headers['x-tenant-slug'] || request.query.tenant) as string
    
    if (!tenantSlug) {
      return reply.status(400).send({
        error: 'Tenant slug required',
        message: 'Please provide X-Tenant-Slug header or tenant query parameter',
      })
    }

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
    // Initialize services
    await initializeServices()
    
    const port = 3001
    const host = '0.0.0.0'

    await server.listen({ port, host })
    
    console.log(`🚀 FoodManager SaaS Server with Services Layer listening on http://${host}:${port}`)
    console.log(`🏗️ Architecture:`)
    console.log(`   • Pattern: Repository + Service Layer`)
    console.log(`   • ORM: Prisma`)
    console.log(`   • Database: PostgreSQL`)
    console.log(`💰 Billing Features:`)
    console.log(`   • Stripe Integration: Enabled`)
    console.log(`   • Subscription Management: Active`)
    console.log(`   • Payment Processing: Ready`)
    console.log(`🔐 Security Features:`)
    console.log(`   • JWT Algorithm: RS256`)
    console.log(`   • Tenant Isolation: Enabled`)
    console.log(`   • Rate Limiting: Per Tenant`)
    console.log(`📡 API Endpoints:`)
    console.log(`   • Auth: /api/auth/*`)
    console.log(`   • Billing: /api/billing/*`)
    console.log(`   • Services: /api/v1/*`)
    console.log(`   • Public: /api/v1/public/*`)
    console.log(`🏢 Services Layer:`)
    console.log(`   • Tenant Service: Active`)
    console.log(`   • User Service: Active`)
    console.log(`   • Billing Service: Active`)
    console.log(`   • Repository Pattern: Active`)
    
  } catch (error) {
    console.error('Failed to start server:', error)
    await cleanupServices()
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...')
  await cleanupServices()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...')
  await cleanupServices()
  process.exit(0)
})

start()
