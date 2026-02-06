import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient, User } from '@prisma/client'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  tenantSlug: z.string().optional(),
})

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.string().optional(),
  tenantSlug: z.string().optional(),
})

const refreshTokenSchema = z.object({
  refreshToken: z.string(),
})

export default async function authRoutes(fastify: FastifyInstance) {
  // Login
  fastify.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { email, password, tenantSlug } = loginSchema.parse(request.body)

      // Find tenant if provided
      let tenantId: string | undefined
      if (tenantSlug) {
        const tenant = await fastify.prisma.tenant.findUnique({
          where: { slug: tenantSlug, isActive: true },
        })
        if (!tenant) {
          return reply.status(404).send({
            error: 'Tenant not found',
            message: `Tenant '${tenantSlug}' does not exist or is inactive`
          })
        }
        tenantId = tenant.id
      }

      // Find user
      const user = await fastify.prisma.user.findFirst({
        where: {
          email,
          isActive: true,
          ...(tenantId && { tenantId }),
        },
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      })

      if (!user) {
        return reply.status(401).send({
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        })
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        return reply.status(401).send({
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        })
      }

      // Generate tokens
      const accessToken = generateAccessToken(user)
      const refreshToken = generateRefreshToken(user)

      // Save refresh token to database
      await fastify.prisma.$queryRaw`
        INSERT INTO sessions (id, user_id, token, refresh_token, expires_at, user_agent, ip_address, created_at, updated_at)
        VALUES (gen_random_uuid(), ${user.id}, ${accessToken}, ${refreshToken}, ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}, ${request.headers['user-agent']}, ${request.ip}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user

      return reply.send({
        user: userWithoutPassword,
        accessToken,
        refreshToken,
        expiresIn: 15 * 60, // 15 minutes
      })
    } catch (error) {
      fastify.log.error('Login error:', error.message)
      fastify.log.error('Login error stack:', error.stack)
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to process login',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  })

  // Get current user
  fastify.get('/me', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = await fastify.prisma.user.findUnique({
        where: { id: request.user!.id },
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      })

      if (!user) {
        return reply.status(404).send({
          error: 'User not found',
          message: 'User does not exist'
        })
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user

      return reply.send({ user: userWithoutPassword })
    } catch (error) {
      fastify.log.error('Get current user error:', error)
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to get user information'
      })
    }
  })
}

// Helper functions
function generateAccessToken(user: User): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  )
}

function generateRefreshToken(user: User): string {
  return jwt.sign(
    {
      userId: user.id,
      type: 'refresh',
    },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }
  )
}

// Auth middleware
async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'No token provided'
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    const user = await fastify.prisma.user.findUnique({
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
  }
}
