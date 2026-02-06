import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
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

      // Mock user validation
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

      // Find user
      const user = mockUsers.find(u => 
        u.email === email && 
        u.isActive && 
        (!tenantSlug || u.tenant.slug === tenantSlug)
      )

      if (!user) {
        return reply.status(401).send({
          error: 'Invalid credentials',
          message: 'Email or password is incorrect',
          code: 'INVALID_CREDENTIALS'
        })
      }

      // Verify password (simplified for demo)
      const isPasswordValid = password.length >= 6
      if (!isPasswordValid) {
        return reply.status(401).send({
          error: 'Invalid credentials',
          message: 'Email or password is incorrect',
          code: 'INVALID_CREDENTIALS'
        })
      }

      // Generate tokens with RS256
      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      })

      const refreshToken = generateRefreshToken({
        userId: user.id,
        type: 'refresh',
      })

      // Mock session storage
      console.log(`Session created for user ${user.email} in tenant ${user.tenant.slug}`)

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user

      return reply.send({
        user: userWithoutPassword,
        accessToken,
        refreshToken,
        expiresIn: 15 * 60, // 15 minutes
        tokenType: 'Bearer',
        algorithm: 'RS256',
      })
    } catch (error) {
      console.error('Login error:', error)
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to process login',
        code: 'LOGIN_ERROR'
      })
    }
  })

  // Refresh token
  fastify.post('/refresh', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { refreshToken } = refreshTokenSchema.parse(request.body)

      // Verify refresh token with RS256
      let decoded
      try {
        decoded = verifyRefreshToken(refreshToken)
      } catch (error) {
        return reply.status(401).send({
          error: 'Invalid refresh token',
          message: error instanceof Error ? error.message : 'Refresh token is invalid or expired',
          code: 'INVALID_REFRESH_TOKEN'
        })
      }

      // Mock user lookup
      const mockUsers = [
        {
          id: '1',
          email: 'admin@burgerexpress.com',
          name: 'Administrador',
          role: 'ADMIN',
          tenantId: '1',
          isActive: true,
          tenant: {
            id: '1',
            name: 'Burger Express',
            slug: 'burgerexpress',
            isActive: true,
          },
        },
      ]

      const user = mockUsers.find(u => u.id === decoded.userId && u.isActive)
      if (!user) {
        return reply.status(401).send({
          error: 'User not found',
          message: 'User does not exist or is inactive',
          code: 'USER_NOT_FOUND'
        })
      }

      // Generate new tokens
      const newAccessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      })

      const newRefreshToken = generateRefreshToken({
        userId: user.id,
        type: 'refresh',
      })

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user

      return reply.send({
        user: userWithoutPassword,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: 15 * 60,
        tokenType: 'Bearer',
        algorithm: 'RS256',
      })
    } catch (error) {
      console.error('Refresh token error:', error)
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to refresh token',
        code: 'REFRESH_ERROR'
      })
    }
  })

  // Logout
  fastify.post('/logout', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const token = request.headers.authorization?.replace('Bearer ', '')
      
      if (token) {
        // Mock session invalidation
        console.log('Session invalidated for token:', token.substring(0, 20) + '...')
      }

      return reply.send({ 
        message: 'Logged out successfully',
        code: 'LOGOUT_SUCCESS'
      })
    } catch (error) {
      console.error('Logout error:', error)
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to process logout',
        code: 'LOGOUT_ERROR'
      })
    }
  })

  // Get current user (protected)
  fastify.get('/me', {
    preHandler: [async (request: FastifyRequest, reply: FastifyReply) => {
      const token = request.headers.authorization?.replace('Bearer ', '')
      
      if (!token) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'No token provided',
          code: 'MISSING_TOKEN'
        })
      }

      try {
        const { generateAccessToken, verifyAccessToken } = await import('../utils/jwt')
        const decoded = verifyAccessToken(token)
        
        // Mock user lookup
        const mockUsers = [
          {
            id: '1',
            email: 'admin@burgerexpress.com',
            name: 'Administrador',
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
        ]

        const user = mockUsers.find(u => u.id === decoded.userId && u.isActive)
        if (!user) {
          return reply.status(401).send({
            error: 'Unauthorized',
            message: 'User not found or inactive',
            code: 'USER_NOT_FOUND'
          })
        }

        // Add user to request context
        ;(request as any).user = decoded
        ;(request as any).tenant = user.tenant
      } catch (error) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: error instanceof Error ? error.message : 'Invalid token',
          code: 'INVALID_TOKEN'
        })
      }
    }]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user
      const tenant = (request as any).tenant

      return reply.send({ 
        user: {
          id: user.userId,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
        },
        tenant,
        permissions: getUserPermissions(user.role),
      })
    } catch (error) {
      console.error('Get current user error:', error)
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to get user information',
        code: 'USER_INFO_ERROR'
      })
    }
  })
}

// Helper function to get user permissions based on role
function getUserPermissions(role: string): string[] {
  const permissions = {
    ADMIN: ['read', 'write', 'delete', 'manage_users', 'manage_billing'],
    MANAGER: ['read', 'write', 'delete', 'manage_inventory', 'manage_orders'],
    VENDOR: ['read', 'write', 'manage_orders'],
    CUSTOMER: ['read', 'create_orders'],
  }
  
  return permissions[role as keyof typeof permissions] || []
}
