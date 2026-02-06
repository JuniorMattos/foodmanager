import { FastifyRequest, FastifyReply } from 'fastify'
import { verifyAccessToken, JWTPayload } from '../utils/jwt'

export interface TenantContext {
  id: string
  name: string
  slug: string
  isActive: boolean
  domain?: string
  settings?: Record<string, any>
}

// Extend FastifyRequest interface
declare module 'fastify' {
  interface FastifyRequest {
    user?: JWTPayload
    tenant?: TenantContext
    tenantId?: string
  }
}

/**
 * Tenant Middleware - Extrai e valida tenant da requisição
 */
export async function tenantMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    // 1. Extrair token do header Authorization
    const authHeader = request.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'No token provided',
        code: 'MISSING_TOKEN'
      })
    }

    const token = authHeader.replace('Bearer ', '')

    // 2. Verificar token JWT com RS256
    let payload: JWTPayload
    try {
      payload = verifyAccessToken(token)
    } catch (error) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: error instanceof Error ? error.message : 'Invalid token',
        code: 'INVALID_TOKEN'
      })
    }

    // 3. Extrair tenantId do payload ou do header
    let tenantId: string
    const tenantFromHeader = request.headers['x-tenant-id'] as string
    const tenantFromSlug = request.headers['x-tenant-slug'] as string

    if (tenantFromHeader) {
      tenantId = tenantFromHeader
    } else if (tenantFromSlug) {
      // Buscar tenant pelo slug
      const tenant = await getTenantBySlug(tenantFromSlug)
      if (!tenant) {
        return reply.status(404).send({
          error: 'Tenant not found',
          message: `Tenant '${tenantFromSlug}' does not exist`,
          code: 'TENANT_NOT_FOUND'
        })
      }
      tenantId = tenant.id
    } else {
      // Usar tenantId do token JWT
      tenantId = payload.tenantId
    }

    // 4. Validar se o tenant do token corresponde ao tenant da requisição
    if (payload.tenantId !== tenantId) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'Tenant mismatch - you cannot access this tenant',
        code: 'TENANT_MISMATCH'
      })
    }

    // 5. Buscar informações do tenant
    const tenant = await getTenantById(tenantId)
    if (!tenant) {
      return reply.status(404).send({
        error: 'Tenant not found',
        message: 'Tenant does not exist or is inactive',
        code: 'TENANT_NOT_FOUND'
      })
    }

    // 6. Validar se tenant está ativo
    if (!tenant.isActive) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'Tenant is inactive',
        code: 'TENANT_INACTIVE'
      })
    }

    // 7. Adicionar contexto ao request
    request.user = payload
    request.tenant = tenant
    request.tenantId = tenantId

    // 8. Adicionar headers de resposta para debug
    reply.header('X-Tenant-ID', tenant.id)
    reply.header('X-Tenant-Slug', tenant.slug)

  } catch (error) {
    console.error('Tenant middleware error:', error)
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Tenant validation failed',
      code: 'TENANT_VALIDATION_ERROR'
    })
  }
}

/**
 * Rate Limiting por Tenant
 */
export function getTenantRateLimit(tenantId: string): number {
  // Configurações diferentes por plano/tenant
  const rateLimits: Record<string, number> = {
    '1': 1000, // Premium tenant
    '2': 500,  // Standard tenant
    '3': 100,  // Basic tenant
  }
  
  return rateLimits[tenantId] || 100 // Default rate limit
}

/**
 * CORS por Tenant
 */
export function getTenantAllowedOrigins(tenantId: string): string[] {
  const origins: Record<string, string[]> = {
    '1': [
      'https://burgerexpress.foodmanager.com',
      'https://admin.burgerexpress.com',
      'http://localhost:3000', // Development
    ],
    '2': [
      'https://standard-tenant.foodmanager.com',
      'http://localhost:3000', // Development
    ],
  }
  
  return origins[tenantId] || ['http://localhost:3000']
}

/**
 * Tenant Rate Limiter Factory
 */
export function createTenantRateLimiter() {
  const tenantRequests = new Map<string, { count: number; resetTime: number }>()

  return function tenantRateLimiter(request: FastifyRequest, reply: FastifyReply): void {
    const tenantId = request.tenantId
    if (!tenantId) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Tenant ID required',
        code: 'TENANT_ID_REQUIRED'
      })
    }

    const now = Date.now()
    const windowMs = 60 * 1000 // 1 minute
    const limit = getTenantRateLimit(tenantId)

    const tenantData = tenantRequests.get(tenantId)

    if (!tenantData || now > tenantData.resetTime) {
      // Reset or initialize counter
      tenantRequests.set(tenantId, {
        count: 1,
        resetTime: now + windowMs
      })
    } else {
      // Increment counter
      tenantData.count++
      
      if (tenantData.count > limit) {
        return reply.status(429).send({
          error: 'Too Many Requests',
          message: `Rate limit exceeded for tenant ${tenantId}`,
          code: 'RATE_LIMIT_EXCEEDED',
          limit,
          windowMs,
          retryAfter: Math.ceil((tenantData.resetTime - now) / 1000)
        })
      }
    }

    // Add rate limit headers
    reply.header('X-RateLimit-Limit', limit)
    reply.header('X-RateLimit-Remaining', Math.max(0, limit - (tenantData?.count || 0)))
    reply.header('X-RateLimit-Reset', Math.ceil((tenantData?.resetTime || 0) / 1000))
  }
}

// Mock functions - substituir com Prisma quando disponível
async function getTenantById(id: string): Promise<TenantContext | null> {
  // Mock implementation
  const mockTenants: Record<string, TenantContext> = {
    '1': {
      id: '1',
      name: 'Burger Express',
      slug: 'burgerexpress',
      isActive: true,
      domain: 'burgerexpress.foodmanager.com',
    },
  }
  
  return mockTenants[id] || null
}

async function getTenantBySlug(slug: string): Promise<TenantContext | null> {
  // Mock implementation
  const mockTenants: Record<string, TenantContext> = {
    'burgerexpress': {
      id: '1',
      name: 'Burger Express',
      slug: 'burgerexpress',
      isActive: true,
      domain: 'burgerexpress.foodmanager.com',
    },
  }
  
  return mockTenants[slug] || null
}
