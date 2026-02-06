import { FastifyRequest, FastifyReply } from 'fastify'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma'

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'No token provided'
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
          },
        },
      },
    })

    if (!user || !user.isActive) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'User not found or inactive'
      })
    }

    if (!user.tenant.isActive) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'Tenant is inactive'
      })
    }

    request.user = user
    request.tenant = user.tenant
  } catch (error) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Invalid token'
    })
  }
}

// Extend FastifyRequest to include user
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string
      email: string
      name: string | null
      role: string
      tenantId: string
      isActive: boolean
      createdAt: Date
      updatedAt: Date
      tenant?: {
        id: string
        name: string
        slug: string
        isActive: boolean
      }
    }
    tenant?: {
      id: string
      name: string
      slug: string
      isActive: boolean
    }
  }
}
