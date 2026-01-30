import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'

export const tenantMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
  // Skip tenant middleware for auth routes and health check
  if (request.url.startsWith('/api/auth') || request.url === '/api/health') {
    return
  }

  // Extract tenant from subdomain or header
  let tenantSlug: string | undefined

  // Try to get from subdomain (e.g., burger-express.localhost:3001)
  const hostname = request.hostname
  if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
    const parts = hostname.split('.')
    if (parts.length > 2) {
      tenantSlug = parts[0]
    }
  }

  // Fallback to header (for development/testing)
  if (!tenantSlug) {
    tenantSlug = request.headers['x-tenant-id'] as string
  }

  // Fallback to default tenant for development
  if (!tenantSlug && process.env.NODE_ENV === 'development') {
    tenantSlug = 'burger-express'
  }

  if (!tenantSlug) {
    reply.status(400).send({
      error: 'Tenant not specified',
      message: 'Please provide tenant ID in subdomain or x-tenant-id header'
    })
    return
  }

  try {
    const prisma = request.server.prisma
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
      }
    })

    if (!tenant) {
      reply.status(404).send({
        error: 'Tenant not found',
        message: `Tenant '${tenantSlug}' does not exist`
      })
      return
    }

    if (!tenant.isActive) {
      reply.status(403).send({
        error: 'Tenant inactive',
        message: `Tenant '${tenantSlug}' is not active`
      })
      return
    }

    // Add tenant to request object
    request.tenant = tenant

    // Set tenant context for database queries
    await prisma.$executeRaw`SET app.current_tenant_id = ${tenant.id}`

  } catch (error) {
    request.server.log.error('Tenant middleware error:', error)
    reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to validate tenant'
    })
  }
}

// Extend FastifyRequest to include tenant
declare module 'fastify' {
  interface FastifyRequest {
    tenant?: {
      id: string
      name: string
      slug: string
      isActive: boolean
    }
  }
}
