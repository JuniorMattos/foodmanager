import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient, User, UserRole } from '@prisma/client'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  tenantSlug: z.string().optional(),
})

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.nativeEnum(UserRole).optional(),
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
      await fastify.prisma.session.create({
        data: {
          userId: user.id,
          token: accessToken,
          refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          userAgent: request.headers['user-agent'],
          ipAddress: request.ip,
        },
      })

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user

      return reply.send({
        user: userWithoutPassword,
        accessToken,
        refreshToken,
        expiresIn: 15 * 60, // 15 minutes
      })
    } catch (error) {
      fastify.log.error('Login error:', error)
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to process login'
      })
    }
  })

  // Register (for tenant creation or user invitation)
  fastify.post('/register', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { email, password, name, role = 'CUSTOMER', tenantSlug } = registerSchema.parse(request.body)

      // Find or create tenant
      let tenant
      if (tenantSlug) {
        tenant = await fastify.prisma.tenant.findUnique({
          where: { slug: tenantSlug },
        })
        if (!tenant) {
          return reply.status(404).send({
            error: 'Tenant not found',
            message: `Tenant '${tenantSlug}' does not exist`
          })
        }
      } else {
        // For demo purposes, create a new tenant
        const slug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-')
        tenant = await fastify.prisma.tenant.create({
          data: {
            name: `${name}'s Restaurant`,
            slug,
            email,
          },
        })
      }

      // Check if user already exists
      const existingUser = await fastify.prisma.user.findFirst({
        where: {
          email,
          tenantId: tenant.id,
        },
      })

      if (existingUser) {
        return reply.status(409).send({
          error: 'User already exists',
          message: 'A user with this email already exists in this tenant'
        })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Create user
      const user = await fastify.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role,
          tenantId: tenant.id,
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

      // Generate tokens
      const accessToken = generateAccessToken(user)
      const refreshToken = generateRefreshToken(user)

      // Save refresh token
      await fastify.prisma.session.create({
        data: {
          userId: user.id,
          token: accessToken,
          refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          userAgent: request.headers['user-agent'],
          ipAddress: request.ip,
        },
      })

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user

      return reply.status(201).send({
        user: userWithoutPassword,
        accessToken,
        refreshToken,
        expiresIn: 15 * 60, // 15 minutes
      })
    } catch (error) {
      fastify.log.error('Register error:', error)
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to process registration'
      })
    }
  })

  // Refresh token
  fastify.post('/refresh', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { refreshToken } = refreshTokenSchema.parse(request.body)

      // Find session
      const session = await fastify.prisma.session.findFirst({
        where: {
          refreshToken,
          isActive: true,
          expiresAt: { gt: new Date() },
        },
        include: {
          user: {
            include: {
              tenant: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      })

      if (!session) {
        return reply.status(401).send({
          error: 'Invalid refresh token',
          message: 'Refresh token is invalid or expired'
        })
      }

      // Generate new tokens
      const accessToken = generateAccessToken(session.user)
      const newRefreshToken = generateRefreshToken(session.user)

      // Update session
      await fastify.prisma.session.update({
        where: { id: session.id },
        data: {
          token: accessToken,
          refreshToken: newRefreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      })

      // Remove password from response
      const { password: _, ...userWithoutPassword } = session.user

      return reply.send({
        user: userWithoutPassword,
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: 15 * 60, // 15 minutes
      })
    } catch (error) {
      fastify.log.error('Refresh token error:', error)
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to refresh token'
      })
    }
  })

  // Logout
  fastify.post('/logout', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const token = request.headers.authorization?.replace('Bearer ', '')
      
      if (token) {
        // Deactivate session
        await fastify.prisma.session.updateMany({
          where: { token },
          data: { isActive: false },
        })
      }

      return reply.send({ message: 'Logged out successfully' })
    } catch (error) {
      fastify.log.error('Logout error:', error)
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to process logout'
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
              address: true,
              phone: true,
              email: true,
              deliveryFee: true,
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
      role: UserRole
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
