import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import prisma from '../lib/prisma'

const tenantQuerySchema = z.object({
  tenant: z.string().min(1, 'Tenant identifier is required'),
})

const menuQuerySchema = z.object({
  tenant: z.string().min(1),
  category: z.string().optional(),
  search: z.string().optional(),
  available: z.string().transform(val => val === 'true').optional(),
})

const orderCreateSchema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().optional(),
  customerEmail: z.string().email().optional(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().positive(),
    customizations: z.array(z.object({
      customizationId: z.string(),
      quantity: z.number().positive().default(1)
    })).optional()
  })).min(1),
  deliveryType: z.enum(['PICKUP', 'DELIVERY']),
  deliveryAddress: z.object({
    street: z.string(),
    number: z.string(),
    neighborhood: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    complement: z.string().optional(),
  }).optional(),
  observations: z.string().optional(),
})

export default async function publicRoutes(fastify: FastifyInstance) {
  // Middleware para validação de tenant
  const validateTenant = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { tenant } = tenantQuerySchema.parse(request.query)
      
      const tenantData = await fastify.prisma.tenant.findFirst({
        where: {
          slug: tenant,
          isActive: true
        },
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          createdAt: true
        }
      })

      if (!tenantData) {
        return reply.status(404).send({
          error: 'Tenant not found',
          message: 'Estabelecimento não encontrado ou inativo'
        })
      }

      (request as any).tenant = tenantData
    } catch (error: any) {
      if (error.code === 'invalid_type') {
        return reply.status(400).send({
          error: 'Validation error',
          message: 'Parâmetro tenant é obrigatório'
        })
      }
      
      fastify.log.error('Tenant validation error:', error)
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Erro ao validar tenant'
      })
    }
  }

  // GET /public/menu - Cardápio público
  fastify.get('/menu', {
    preHandler: [validateTenant]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { category, search, available } = menuQuerySchema.parse(request.query)
      const tenant = (request as any).tenant

      const where: any = {
        tenantId: tenant.id,
        isAvailable: available !== false ? true : undefined,
      }

      if (category) {
        where.categoryId = category
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }

      const [categories, products] = await Promise.all([
        // Buscar categorias ativas
        fastify.prisma.category.findMany({
          where: {
            tenantId: tenant.id,
            isActive: true,
            ...(category && { id: category })
          },
          orderBy: { orderIndex: 'asc' }
        }),
        // Buscar produtos
        fastify.prisma.product.findMany({
          where,
          include: {
            category: {
              select: { id: true, name: true }
            }
          },
          orderBy: { orderIndex: 'asc' }
        })
      ])

      // Processar resposta
      const processedCategories = categories.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        orderIndex: cat.orderIndex,
        products: products.filter((p: any) => p.categoryId === cat.id).map((product: any) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: Number(product.price),
          imageUrl: product.imageUrl,
          preparationTime: product.preparationTime,
          orderIndex: product.orderIndex,
          category: product.category
        }))
      }))

      return reply.send({
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          logoUrl: tenant.logoUrl
        },
        categories: processedCategories,
        allProducts: products.map((product: any) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: Number(product.price),
          imageUrl: product.imageUrl,
          preparationTime: product.preparationTime,
          category: product.category
        }))
      })
    } catch (error: any) {
      fastify.log.error('Public menu error:', error)
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Erro ao carregar cardápio'
      })
    }
  })

  // GET /public/tenant - Informações públicas do tenant
  fastify.get('/tenant', {
    preHandler: [validateTenant]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const tenant = (request as any).tenant

      return reply.send({
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          logoUrl: tenant.logoUrl,
          createdAt: tenant.createdAt
        }
      })
    } catch (error: any) {
      fastify.log.error('Public tenant info error:', error)
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Erro ao carregar informações do estabelecimento'
      })
    }
  })

  // POST /public/orders - Criar pedido público
  fastify.post('/orders', {
    preHandler: [validateTenant]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const orderData = orderCreateSchema.parse(request.body)
      const tenant = (request as any).tenant

      // Validar tipo de entrega
      if (orderData.deliveryType === 'DELIVERY' && !orderData.deliveryAddress) {
        return reply.status(400).send({
          error: 'Delivery address required',
          message: 'Endereço de entrega obrigatório para delivery'
        })
      }

      // Validar produtos e calcular total
      let totalAmount = 0
      const orderItems = []

      for (const item of orderData.items) {
        const product = await fastify.prisma.product.findFirst({
          where: {
            id: item.productId,
            tenantId: tenant.id,
            isAvailable: true
          }
        })

        if (!product) {
          return reply.status(400).send({
            error: 'Product not available',
            message: `Produto ${item.productId} não encontrado ou indisponível`
          })
        }

        const itemTotal = Number(product.price) * item.quantity
        totalAmount += itemTotal

        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: Number(product.price),
          totalPrice: itemTotal
        })
      }

      // Gerar número do pedido
      const orderNumber = `ORD${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`

      // Criar pedido com SQL direto (tabela orders simplificada)
      const order = await fastify.prisma.$queryRaw`
        INSERT INTO orders (id, order_number, tenant_id, customer_name, customer_phone, total_amount, status, notes, created_at, updated_at)
        VALUES (gen_random_uuid(), ${orderNumber}, ${tenant.id}, ${orderData.customerName}, ${orderData.customerPhone}, ${totalAmount}, 'PENDING', ${orderData.observations}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `

      // Emitir evento em tempo real
      if (fastify.io) {
        fastify.io.to(`tenant-${tenant.id}`).emit('new-order', {
          orderId: order[0].id,
          orderNumber: order[0].order_number,
          customerName: order[0].customer_name,
          totalAmount: order[0].total_amount,
          createdAt: order[0].created_at
        })
      }

      return reply.status(201).send({
        order: {
          id: order[0].id,
          orderNumber: order[0].order_number,
          status: order[0].status,
          customerName: order[0].customer_name,
          totalAmount: order[0].total_amount,
          createdAt: order[0].created_at,
          items: orderItems
        },
        message: 'Pedido criado com sucesso!'
      })
    } catch (error: any) {
      fastify.log.error('Public order creation error:', error.message)
      fastify.log.error('Public order creation stack:', error.stack)
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Erro ao criar pedido',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  })

  // GET /public/orders/:orderNumber - Consultar status do pedido
  fastify.get('/orders/:orderNumber', {
    preHandler: [validateTenant]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { orderNumber } = request.params as { orderNumber: string }
      const tenant = (request as any).tenant

      const order = await fastify.prisma.order.findFirst({
        where: {
          orderNumber,
          tenantId: tenant.id
        },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          customerName: true,
          customerPhone: true,
          deliveryType: true,
          totalAmount: true,
          createdAt: true,
          updatedAt: true
        }
      })

      if (!order) {
        return reply.status(404).send({
          error: 'Order not found',
          message: 'Pedido não encontrado'
        })
      }

      return reply.send({ order })
    } catch (error: any) {
      fastify.log.error('Public order status error:', error)
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Erro ao consultar status do pedido'
      })
    }
  })

  // GET /public/tenants - Lista de tenants públicos
  fastify.get('/tenants', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const tenants = await fastify.prisma.tenant.findMany({
        where: {
          isActive: true
        },
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          createdAt: true
        },
        orderBy: {
          name: 'asc'
        }
      })

      return reply.send({
        tenants,
        count: tenants.length
      })
    } catch (error: any) {
      fastify.log.error('Public tenants list error:', error)
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Erro ao carregar lista de estabelecimentos'
      })
    }
  })

  // GET /public/health - Health check endpoint
  fastify.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await fastify.prisma.$queryRaw`SELECT 1`
      
      return reply.send({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        uptime: process.uptime()
      })
    } catch (error: any) {
      return reply.status(503).send({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Database connection failed'
      })
    }
  })
}
