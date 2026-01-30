import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { PrismaClient, ProductStatus } from '@prisma/client'

const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  categoryId: z.string(),
  imageUrl: z.string().url().optional(),
  isAvailable: z.boolean().default(true),
  orderIndex: z.number().default(0),
  preparationTime: z.number().positive().optional(),
})

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  categoryId: z.string().optional(),
  imageUrl: z.string().url().optional(),
  isAvailable: z.boolean().optional(),
  orderIndex: z.number().optional(),
  preparationTime: z.number().positive().optional(),
})

const queryProductsSchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  isAvailable: z.string().transform(val => val === 'true').optional(),
  sortBy: z.enum(['name', 'price', 'orderIndex', 'createdAt']).default('orderIndex'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

export default async function productRoutes(fastify: FastifyInstance) {
  // Get all products
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { page, limit, search, categoryId, isAvailable, sortBy, sortOrder } = queryProductsSchema.parse(request.query)
      
      const skip = (page - 1) * limit
      
      const where: any = {
        tenantId: request.tenant!.id,
      }
      
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ]
      }
      
      if (categoryId) {
        where.categoryId = categoryId
      }
      
      if (typeof isAvailable === 'boolean') {
        where.isAvailable = isAvailable
      }

      const [products, total] = await Promise.all([
        fastify.prisma.product.findMany({
          where,
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            customizations: {
              where: { isAvailable: true },
              select: {
                id: true,
                name: true,
                type: true,
                price: true,
              },
            },
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit,
        }),
        fastify.prisma.product.count({ where }),
      ])

      return reply.send({
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      })
    } catch (error) {
      fastify.log.error('Get products error:', error)
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to fetch products'
      })
    }
  })

  // Get product by ID
  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string }
      
      const product = await fastify.prisma.product.findFirst({
        where: {
          id,
          tenantId: request.tenant!.id,
        },
        include: {
          category: true,
          customizations: {
            where: { isAvailable: true },
          },
        },
      })

      if (!product) {
        return reply.status(404).send({
          error: 'Product not found',
          message: 'Product does not exist'
        })
      }

      return reply.send({ product })
    } catch (error) {
      fastify.log.error('Get product error:', error)
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to fetch product'
      })
    }
  })

  // Create product
  fastify.post('/', {
    preHandler: [requireAuth, requireRole(['ADMIN', 'MANAGER'])],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = createProductSchema.parse(request.body)
      
      // Verify category belongs to tenant
      const category = await fastify.prisma.category.findFirst({
        where: {
          id: data.categoryId,
          tenantId: request.tenant!.id,
        },
      })

      if (!category) {
        return reply.status(404).send({
          error: 'Category not found',
          message: 'Category does not exist or does not belong to this tenant'
        })
      }

      const product = await fastify.prisma.product.create({
        data: {
          ...data,
          tenantId: request.tenant!.id,
        },
        include: {
          category: true,
          customizations: true,
        },
      })

      // Emit real-time update
      fastify.io.to(`tenant-${request.tenant!.id}`).emit('product-created', product)

      return reply.status(201).send({ product })
    } catch (error) {
      fastify.log.error('Create product error:', error)
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to create product'
      })
    }
  })

  // Update product
  fastify.put('/:id', {
    preHandler: [requireAuth, requireRole(['ADMIN', 'MANAGER'])],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string }
      const data = updateProductSchema.parse(request.body)
      
      // Verify product belongs to tenant
      const existingProduct = await fastify.prisma.product.findFirst({
        where: {
          id,
          tenantId: request.tenant!.id,
        },
      })

      if (!existingProduct) {
        return reply.status(404).send({
          error: 'Product not found',
          message: 'Product does not exist or does not belong to this tenant'
        })
      }

      // If categoryId is provided, verify it belongs to tenant
      if (data.categoryId) {
        const category = await fastify.prisma.category.findFirst({
          where: {
            id: data.categoryId,
            tenantId: request.tenant!.id,
          },
        })

        if (!category) {
          return reply.status(404).send({
            error: 'Category not found',
            message: 'Category does not exist or does not belong to this tenant'
          })
        }
      }

      const product = await fastify.prisma.product.update({
        where: { id },
        data,
        include: {
          category: true,
          customizations: true,
        },
      })

      // Emit real-time update
      fastify.io.to(`tenant-${request.tenant!.id}`).emit('product-updated', product)

      return reply.send({ product })
    } catch (error) {
      fastify.log.error('Update product error:', error)
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to update product'
      })
    }
  })

  // Delete product
  fastify.delete('/:id', {
    preHandler: [requireAuth, requireRole(['ADMIN', 'MANAGER'])],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string }
      
      // Verify product belongs to tenant
      const existingProduct = await fastify.prisma.product.findFirst({
        where: {
          id,
          tenantId: request.tenant!.id,
        },
      })

      if (!existingProduct) {
        return reply.status(404).send({
          error: 'Product not found',
          message: 'Product does not exist or does not belong to this tenant'
        })
      }

      await fastify.prisma.product.delete({
        where: { id },
      })

      // Emit real-time update
      fastify.io.to(`tenant-${request.tenant!.id}`).emit('product-deleted', { id })

      return reply.status(204).send()
    } catch (error) {
      fastify.log.error('Delete product error:', error)
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to delete product'
      })
    }
  })

  // Toggle product availability
  fastify.patch('/:id/toggle-availability', {
    preHandler: [requireAuth, requireRole(['ADMIN', 'MANAGER', 'VENDOR'])],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string }
      
      const product = await fastify.prisma.product.findFirst({
        where: {
          id,
          tenantId: request.tenant!.id,
        },
      })

      if (!product) {
        return reply.status(404).send({
          error: 'Product not found',
          message: 'Product does not exist or does not belong to this tenant'
        })
      }

      const updatedProduct = await fastify.prisma.product.update({
        where: { id },
        data: { isAvailable: !product.isAvailable },
        include: {
          category: true,
          customizations: true,
        },
      })

      // Emit real-time update
      fastify.io.to(`tenant-${request.tenant!.id}`).emit('product-availability-changed', updatedProduct)

      return reply.send({ product: updatedProduct })
    } catch (error) {
      fastify.log.error('Toggle product availability error:', error)
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to toggle product availability'
      })
    }
  })

  // Get categories with products
  fastify.get('/categories/with-products', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const categories = await fastify.prisma.category.findMany({
        where: {
          tenantId: request.tenant!.id,
          isActive: true,
        },
        include: {
          products: {
            where: { isAvailable: true },
            include: {
              customizations: {
                where: { isAvailable: true },
              },
            },
            orderBy: { orderIndex: 'asc' },
          },
        },
        orderBy: { orderIndex: 'asc' },
      })

      return reply.send({ categories })
    } catch (error) {
      fastify.log.error('Get categories with products error:', error)
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to fetch categories with products'
      })
    }
  })
}

// Helper middleware (import from auth route or create separate file)
async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  // Implementation would be same as in auth route
  // For brevity, assuming it's imported
}

async function requireRole(roles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user || !roles.includes(request.user.role)) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'Insufficient permissions'
      })
    }
  }
}
