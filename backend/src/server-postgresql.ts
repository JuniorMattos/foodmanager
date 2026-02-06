import fastify from 'fastify'
import cors from '@fastify/cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

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

// Mock database para teste
const mockUsers = [
  {
    id: '1',
    email: 'admin@burgerexpress.com',
    name: 'Administrador',
    password: '$2a$10$K8Z8Z8Z8Z8Z8Z8Z8Z8Z8ZO8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8', // admin123
    role: 'ADMIN',
    tenantId: '1',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    tenant: {
      id: '1',
      name: 'Burger Express',
      slug: 'burgerexpress',
      isActive: true,
    },
  },
  {
    id: '2',
    email: 'manager@burgerexpress.com',
    name: 'Gerente',
    password: '$2a$10$K8Z8Z8Z8Z8Z8Z8Z8Z8Z8ZO8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8', // manager123
    role: 'MANAGER',
    tenantId: '1',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    tenant: {
      id: '1',
      name: 'Burger Express',
      slug: 'burgerexpress',
      isActive: true,
    },
  },
  {
    id: '3',
    email: 'vendor@burgerexpress.com',
    name: 'Vendedor',
    password: '$2a$10$K8Z8Z8Z8Z8Z8Z8Z8Z8Z8ZO8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8', // vendor123
    role: 'VENDOR',
    tenantId: '1',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    tenant: {
      id: '1',
      name: 'Burger Express',
      slug: 'burgerexpress',
      isActive: true,
    },
  },
]

// Mock sessions
const mockSessions: any[] = []

// Health check
server.get('/api/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// Login endpoint
server.post('/api/auth/login', async (request, reply) => {
  try {
    const { email, password, tenantSlug } = request.body as any

    // Find user (mock)
    const user = mockUsers.find(u => 
      u.email === email && 
      u.isActive && 
      (!tenantSlug || u.tenant.slug === tenantSlug)
    )

    if (!user) {
      return reply.status(401).send({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      })
    }

    // Verify password (mock - aceita qualquer senha para teste)
    const isPasswordValid = password.length >= 6 // Simplificado para teste
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

    // Save session (mock)
    mockSessions.push({
      id: Date.now().toString(),
      userId: user.id,
      token: accessToken,
      refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
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
    
    const user = mockUsers.find(u => u.id === decoded.userId && u.isActive)

    if (!user) {
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
    console.log(`🔥 Using mock database for testing`)
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

start()
