import fastify from 'fastify'
import cors from '@fastify/cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from './lib/prisma'

// 🔥 TEMPORÁRIO - Valores hardcoded para teste
process.env.JWT_SECRET = 'temp-jwt-secret-for-testing-only'
process.env.JWT_REFRESH_SECRET = 'temp-jwt-refresh-secret-for-testing-only'

const server = fastify({
  logger: true,
})

// CORS
server.register(cors, {
  origin: true,
  credentials: true,
})

// Database
const prismaClient = prisma

// Health check
server.get('/api/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// Login endpoint
server.post('/api/auth/login', async (request, reply) => {
  try {
    const { email, password, tenantSlug } = request.body as any

    // Find tenant if provided
    let tenantId: string | undefined
    if (tenantSlug) {
      const tenant = await prismaClient.tenant.findUnique({
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
    const user = await prisma.user.findFirst({
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
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    )

    const refreshToken = jwt.sign(
      {
        userId: user.id,
        type: 'refresh',
      },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    )

    // Save refresh token to database
    await prisma.session.create({
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
    console.error('Login error:', error)
    return reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to process login'
    })
  }
})

// Get current user
server.get('/api/auth/me', async (request, reply) => {
  try {
    const token = (request.headers as any).authorization?.replace('Bearer ', '')
    
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

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return reply.send({ user: userWithoutPassword })
  } catch (error) {
    console.error('Get current user error:', error)
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Invalid token'
    })
  }
})

// Start server
const start = async () => {
  try {
    const port = 3001
    const host = '0.0.0.0'

    await server.listen({ port, host })
    console.log(`🚀 Server listening on http://${host}:${port}`)
    console.log(`📡 API ready for testing`)
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

start()
