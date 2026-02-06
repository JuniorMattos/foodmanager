/**
 * Testes para API Pública FoodManager
 * Versão simplificada em JavaScript para evitar problemas de TypeScript
 */

const request = require('supertest')
const fastify = require('fastify')

describe('Public API', () => {
  let app

  beforeAll(async () => {
    // Criar instância do Fastify
    app = fastify.default()
    
    // Registrar CORS
    await app.register(require('@fastify/cors'), { origin: true })
    
    // Mock do Prisma
    const mockPrisma = {
      tenant: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      category: {
        findMany: jest.fn(),
      },
      product: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
      order: {
        create: jest.fn(),
        findFirst: jest.fn(),
      },
      $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }])
    }

    // Mock do Socket.io
    const mockIo = {
      to: jest.fn().mockReturnValue({
        emit: jest.fn()
      })
    }

    // Injetar mocks no app
    app.decorate('prisma', mockPrisma)
    app.decorate('io', mockIo)

    // Registrar rotas públicas
    const publicRoutes = require('../src/routes/public').default
    await app.register(publicRoutes, { prefix: '/api/public' })
    
    // Iniciar o servidor
    await app.ready()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(async () => {
    if (app) {
      await app.close()
    }
  })

  describe('GET /api/public/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/public/health')
        .expect(200)

      expect(response.body).toMatchObject({
        status: 'healthy',
        timestamp: expect.any(String),
        version: expect.any(String),
        uptime: expect.any(Number)
      })
    })

    it('should return unhealthy status when database fails', async () => {
      app.prisma.$queryRaw.mockRejectedValueOnce(new Error('Database error'))

      const response = await request(app)
        .get('/api/public/health')
        .expect(503)

      expect(response.body).toMatchObject({
        status: 'unhealthy',
        timestamp: expect.any(String),
        error: 'Database connection failed'
      })
    })
  })

  describe('GET /api/public/menu', () => {
    const mockTenant = {
      id: 'test-tenant-id',
      name: 'Test Restaurant',
      slug: 'test-tenant',
      logoUrl: null,
      createdAt: new Date()
    }

    it('should return menu for valid tenant', async () => {
      // Mock tenant
      app.prisma.tenant.findFirst.mockResolvedValue(mockTenant)

      // Mock categories
      app.prisma.category.findMany.mockResolvedValue([
        {
          id: 'cat-1',
          name: 'Lanches',
          description: 'Nossos lanches',
          orderIndex: 1,
          isActive: true,
          tenantId: mockTenant.id
        }
      ])

      // Mock products
      app.prisma.product.findMany.mockResolvedValue([
        {
          id: 'prod-1',
          name: 'Hambúrguer',
          description: 'Delicioso hambúrguer',
          price: 25.90,
          imageUrl: 'burger.jpg',
          preparationTime: 15,
          orderIndex: 1,
          isAvailable: true,
          categoryId: 'cat-1',
          tenantId: mockTenant.id,
          category: { id: 'cat-1', name: 'Lanches' }
        }
      ])

      const response = await request(app)
        .get('/api/public/menu?tenant=test-tenant')
        .expect(200)

      expect(response.body).toMatchObject({
        tenant: {
          id: mockTenant.id,
          name: mockTenant.name,
          slug: mockTenant.slug
        },
        categories: expect.any(Array),
        allProducts: expect.any(Array)
      })

      expect(response.body.categories[0]).toMatchObject({
        id: 'cat-1',
        name: 'Lanches',
        products: expect.any(Array)
      })
    })

    it('should return 404 for invalid tenant', async () => {
      app.prisma.tenant.findFirst.mockResolvedValue(null)

      const response = await request(app)
        .get('/api/public/menu?tenant=invalid-tenant')
        .expect(404)

      expect(response.body).toMatchObject({
        error: 'Tenant not found',
        message: 'Estabelecimento não encontrado ou inativo'
      })
    })

    it('should filter by category', async () => {
      app.prisma.tenant.findFirst.mockResolvedValue(mockTenant)
      app.prisma.category.findMany.mockResolvedValue([])
      app.prisma.product.findMany.mockResolvedValue([])

      await request(app)
        .get('/api/public/menu?tenant=test-tenant&category=cat-1')
        .expect(200)

      expect(app.prisma.category.findMany).toHaveBeenCalledWith({
        where: {
          tenantId: mockTenant.id,
          isActive: true,
          id: 'cat-1'
        },
        orderBy: { orderIndex: 'asc' }
      })
    })

    it('should search products', async () => {
      app.prisma.tenant.findFirst.mockResolvedValue(mockTenant)
      app.prisma.category.findMany.mockResolvedValue([])
      app.prisma.product.findMany.mockResolvedValue([])

      await request(app)
        .get('/api/public/menu?tenant=test-tenant&search=hamburguer')
        .expect(200)

      expect(app.prisma.product.findMany).toHaveBeenCalledWith({
        where: {
          tenantId: mockTenant.id,
          isAvailable: true,
          OR: [
            { name: { contains: 'hamburguer', mode: 'insensitive' } },
            { description: { contains: 'hamburguer', mode: 'insensitive' } }
          ]
        },
        include: {
          category: {
            select: { id: true, name: true }
          }
        },
        orderBy: { orderIndex: 'asc' }
      })
    })
  })

  describe('GET /api/public/tenant', () => {
    const mockTenant = {
      id: 'test-tenant-id',
      name: 'Test Restaurant',
      slug: 'test-tenant',
      logoUrl: null,
      createdAt: new Date()
    }

    it('should return tenant information', async () => {
      app.prisma.tenant.findFirst.mockResolvedValue(mockTenant)

      const response = await request(app)
        .get('/api/public/tenant?tenant=test-tenant')
        .expect(200)

      expect(response.body).toMatchObject({
        tenant: {
          id: mockTenant.id,
          name: mockTenant.name,
          slug: mockTenant.slug,
          logoUrl: mockTenant.logoUrl,
          createdAt: mockTenant.createdAt.toISOString()
        }
      })
    })

    it('should return 404 for invalid tenant', async () => {
      app.prisma.tenant.findFirst.mockResolvedValue(null)

      await request(app)
        .get('/api/public/tenant?tenant=invalid-tenant')
        .expect(404)
    })
  })

  describe('POST /api/public/orders', () => {
    const mockTenant = {
      id: 'test-tenant-id',
      name: 'Test Restaurant',
      slug: 'test-tenant'
    }

    const validOrderData = {
      customerName: 'João Silva',
      customerPhone: '+5511999998888',
      deliveryType: 'PICKUP',
      items: [
        {
          productId: 'prod-1',
          quantity: 2
        }
      ]
    }

    it('should create order successfully', async () => {
      app.prisma.tenant.findFirst.mockResolvedValue(mockTenant)
      
      // Mock product validation
      app.prisma.product.findFirst.mockResolvedValue({
        id: 'prod-1',
        tenantId: mockTenant.id,
        isAvailable: true,
        price: 25.90
      })

      // Mock order creation
      const mockOrder = {
        id: 'order-1',
        orderNumber: 'ORD123456789',
        status: 'PENDING',
        customerName: 'João Silva',
        customerPhone: '+5511999998888',
        deliveryType: 'PICKUP',
        totalAmount: 51.80,
        createdAt: new Date()
      }

      app.prisma.order.create.mockResolvedValue(mockOrder)

      const response = await request(app)
        .post('/api/public/orders?tenant=test-tenant')
        .send(validOrderData)
        .expect(201)

      expect(response.body).toMatchObject({
        order: expect.objectContaining({
          id: 'order-1',
          orderNumber: 'ORD123456789',
          customerName: 'João Silva',
          deliveryType: 'PICKUP',
          totalAmount: 51.80
        }),
        message: 'Pedido criado com sucesso!'
      })

      // Verificar se o evento foi emitido
      expect(app.io.to).toHaveBeenCalledWith('tenant-test-tenant-id')
    })

    it('should validate required fields', async () => {
      app.prisma.tenant.findFirst.mockResolvedValue(mockTenant)

      const invalidOrder = {
        // missing customerName
        deliveryType: 'PICKUP',
        items: []
      }

      const response = await request(app)
        .post('/api/public/orders?tenant=test-tenant')
        .send(invalidOrder)
        .expect(400)
    })

    it('should require delivery address for DELIVERY orders', async () => {
      app.prisma.tenant.findFirst.mockResolvedValue(mockTenant)

      const deliveryOrder = {
        customerName: 'João Silva',
        deliveryType: 'DELIVERY',
        // missing deliveryAddress
        items: [{ productId: 'prod-1', quantity: 1 }]
      }

      const response = await request(app)
        .post('/api/public/orders?tenant=test-tenant')
        .send(deliveryOrder)
        .expect(400)

      expect(response.body).toMatchObject({
        error: 'Delivery address required',
        message: 'Endereço de entrega obrigatório para delivery'
      })
    })

    it('should validate product availability', async () => {
      app.prisma.tenant.findFirst.mockResolvedValue(mockTenant)
      app.prisma.product.findFirst.mockResolvedValue(null) // Product not found

      const response = await request(app)
        .post('/api/public/orders?tenant=test-tenant')
        .send(validOrderData)
        .expect(400)

      expect(response.body).toMatchObject({
        error: 'Product not available',
        message: 'Produto prod-1 não encontrado ou indisponível'
      })
    })
  })

  describe('GET /api/public/orders/:orderNumber', () => {
    const mockTenant = {
      id: 'test-tenant-id',
      name: 'Test Restaurant',
      slug: 'test-tenant'
    }

    it('should return order status', async () => {
      app.prisma.tenant.findFirst.mockResolvedValue(mockTenant)
      
      const mockOrder = {
        id: 'order-1',
        orderNumber: 'ORD123456789',
        status: 'CONFIRMED',
        customerName: 'João Silva',
        customerPhone: '+5511999998888',
        deliveryType: 'PICKUP',
        totalAmount: 51.80,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      app.prisma.order.findFirst.mockResolvedValue(mockOrder)

      const response = await request(app)
        .get('/api/public/orders/ORD123456789?tenant=test-tenant')
        .expect(200)

      expect(response.body).toMatchObject({
        order: {
          id: 'order-1',
          orderNumber: 'ORD123456789',
          status: 'CONFIRMED',
          customerName: 'João Silva'
        }
      })
    })

    it('should return 404 for non-existent order', async () => {
      app.prisma.tenant.findFirst.mockResolvedValue(mockTenant)
      app.prisma.order.findFirst.mockResolvedValue(null)

      const response = await request(app)
        .get('/api/public/orders/NONEXISTENT?tenant=test-tenant')
        .expect(404)

      expect(response.body).toMatchObject({
        error: 'Order not found',
        message: 'Pedido não encontrado'
      })
    })
  })
})
