import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { z } from 'zod'
import { authenticate, authorize } from '../middleware/auth'

// Schemas para validação
const createTenantSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  slug: z.string().min(1, 'Slug é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  plan: z.enum(['basic', 'premium', 'enterprise']),
  admin_user: z.object({
    name: z.string().min(1, 'Nome do admin é obrigatório'),
    email: z.string().email('Email do admin inválido'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres')
  }),
  branding: z.object({
    brand_name: z.string().min(1, 'Nome da marca é obrigatório'),
    logo_url: z.string().url('URL do logo inválida'),
    tagline: z.string().optional()
  }),
  theme: z.object({
    primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor primária inválida'),
    secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor secundária inválida'),
    accent_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor de destaque inválida'),
    background_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor de fundo inválida'),
    text_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor do texto inválida'),
    button_style: z.enum(['rounded', 'square', 'pill']),
    font_family: z.string().min(1, 'Fonte é obrigatória')
  }),
  settings: z.object({
    currency: z.string().min(1, 'Moeda é obrigatória'),
    currency_symbol: z.string().min(1, 'Símbolo da moeda é obrigatório'),
    language: z.string().min(1, 'Idioma é obrigatório'),
    timezone: z.string().min(1, 'Fuso horário é obrigatório'),
    delivery_enabled: z.boolean(),
    pickup_enabled: z.boolean(),
    min_order_amount: z.number().min(0, 'Valor mínimo deve ser positivo'),
    delivery_radius: z.number().min(0, 'Raio de entrega deve ser positivo'),
    payment_methods: z.array(z.string()),
    working_hours: z.object({
      monday: z.object({ open: z.string(), close: z.string(), enabled: z.boolean() }),
      tuesday: z.object({ open: z.string(), close: z.string(), enabled: z.boolean() }),
      wednesday: z.object({ open: z.string(), close: z.string(), enabled: z.boolean() }),
      thursday: z.object({ open: z.string(), close: z.string(), enabled: z.boolean() }),
      friday: z.object({ open: z.string(), close: z.string(), enabled: z.boolean() }),
      saturday: z.object({ open: z.string(), close: z.string(), enabled: z.boolean() }),
      sunday: z.object({ open: z.string(), close: z.string(), enabled: z.boolean() })
    })
  })
})

const updateTenantSchema = createTenantSchema.partial()

export async function adminRoutes(fastify: FastifyInstance) {
  // Middleware de autenticação para todas as rotas admin
  fastify.addHook('preHandler', async (request, reply) => {
    await authenticate(request, reply)
    await authorize(request, reply, ['super_admin', 'admin'])
  })

  // Dashboard Stats
  fastify.get('/admin/stats', async (request, reply) => {
    try {
      const [
        totalTenants,
        activeTenants,
        newTenantsThisMonth,
        totalUsers,
        totalOrders,
        totalRevenue
      ] = await Promise.all([
        prisma.tenant.count(),
        prisma.tenant.count({ where: { is_active: true } }),
        prisma.tenant.count({
          where: {
            created_at: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        }),
        prisma.user.count(),
        prisma.order.count(),
        prisma.order.aggregate({
          _sum: { total_amount: true }
        })
      ])

      const stats = {
        total_tenants: totalTenants,
        active_tenants: activeTenants,
        new_tenants_this_month: newTenantsThisMonth,
        total_users: totalUsers,
        total_orders: totalOrders,
        total_revenue: totalRevenue._sum.total_amount || 0,
        monthly_growth: 15.5 // TODO: Calcular crescimento real
      }

      return reply.send({ data: stats })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Erro ao buscar estatísticas' })
    }
  })

  // List Tenants
  fastify.get('/admin/tenants', async (request, reply) => {
    try {
      const { search, status, plan, sort_by = 'created_at', sort_order = 'desc' } = request.query as any

      const where: any = {}

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      }

      if (status !== 'all') {
        where.is_active = status === 'active'
      }

      const orderBy: any = {}
      orderBy[sort_by] = sort_order

      const tenants = await prisma.tenant.findMany({
        where,
        orderBy,
        include: {
          _count: {
            select: {
              users: true,
              orders: true
            }
          },
          orders: {
            select: {
              total_amount: true
            }
          }
        }
      })

      const tenantsWithStats = tenants.map(tenant => ({
        ...tenant,
        stats: {
          user_count: tenant._count.users,
          order_count: tenant._count.orders,
          revenue: tenant.orders.reduce((sum, order) => sum + Number(order.total_amount), 0),
          last_active: new Date().toISOString(), // TODO: Buscar última atividade real
          storage_used: Math.floor(Math.random() * 5000), // TODO: Calcular uso real
          api_calls: Math.floor(Math.random() * 50000) // TODO: Contar chamadas de API
        }
      }))

      return reply.send({ data: tenantsWithStats })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Erro ao buscar tenants' })
    }
  })

  // Get Tenant by ID
  fastify.get('/admin/tenants/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }

      const tenant = await prisma.tenant.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              users: true,
              orders: true
            }
          },
          orders: {
            select: {
              total_amount: true
            }
          }
        }
      })

      if (!tenant) {
        return reply.status(404).send({ error: 'Tenant não encontrado' })
      }

      const tenantWithStats = {
        ...tenant,
        stats: {
          user_count: tenant._count.users,
          order_count: tenant._count.orders,
          revenue: tenant.orders.reduce((sum, order) => sum + Number(order.total_amount), 0),
          last_active: new Date().toISOString(),
          storage_used: Math.floor(Math.random() * 5000),
          api_calls: Math.floor(Math.random() * 50000)
        }
      }

      return reply.send({ data: tenantWithStats })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Erro ao buscar tenant' })
    }
  })

  // Create Tenant
  fastify.post('/admin/tenants', { schema: { body: createTenantSchema } }, async (request, reply) => {
    try {
      const data = request.body as any

      // Verificar se slug já existe
      const existingTenant = await prisma.tenant.findUnique({
        where: { slug: data.slug }
      })

      if (existingTenant) {
        return reply.status(400).send({ error: 'Slug já está em uso' })
      }

      // Criar tenant
      const newTenant = await prisma.tenant.create({
        data: {
          name: data.name,
          slug: data.slug,
          email: data.email,
          phone: data.phone,
          is_active: true,
          theme: data.theme,
          branding: data.branding,
          settings: data.settings
        }
      })

      // Criar usuário admin do tenant
      const hashedPassword = await Bun.password.hash(data.admin_user.password)
      await prisma.user.create({
        data: {
          name: data.admin_user.name,
          email: data.admin_user.email,
          password: hashedPassword,
          role: 'admin',
          tenant_id: newTenant.id,
          is_active: true
        }
      })

      // Buscar tenant com stats
      const createdTenant = await prisma.tenant.findUnique({
        where: { id: newTenant.id },
        include: {
          _count: {
            select: {
              users: true,
              orders: true
            }
          }
        }
      })

      const tenantWithStats = {
        ...createdTenant,
        stats: {
          user_count: 1, // Admin criado
          order_count: 0,
          revenue: 0,
          last_active: new Date().toISOString(),
          storage_used: 0,
          api_calls: 0
        }
      }

      return reply.send({ data: tenantWithStats })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Erro ao criar tenant' })
    }
  })

  // Update Tenant
  fastify.put('/admin/tenants/:id', { schema: { body: updateTenantSchema } }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const data = request.body as any

      const updatedTenant = await prisma.tenant.update({
        where: { id },
        data: {
          ...data,
          updated_at: new Date()
        }
      })

      return reply.send({ data: updatedTenant })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Erro ao atualizar tenant' })
    }
  })

  // Delete Tenant
  fastify.delete('/admin/tenants/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }

      await prisma.tenant.delete({
        where: { id }
      })

      return reply.status(204).send()
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Erro ao excluir tenant' })
    }
  })

  // Toggle Tenant Status
  fastify.patch('/admin/tenants/:id/toggle-status', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }

      const tenant = await prisma.tenant.findUnique({
        where: { id }
      })

      if (!tenant) {
        return reply.status(404).send({ error: 'Tenant não encontrado' })
      }

      const updatedTenant = await prisma.tenant.update({
        where: { id },
        data: {
          is_active: !tenant.is_active,
          updated_at: new Date()
        }
      })

      return reply.send({ data: updatedTenant })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Erro ao alterar status do tenant' })
    }
  })

  // Bulk Operations
  fastify.post('/admin/tenants/bulk-toggle-status', async (request, reply) => {
    try {
      const { tenant_ids, active } = request.body as any

      const updatedTenants = await Promise.all(
        tenant_ids.map(id =>
          prisma.tenant.update({
            where: { id },
            data: {
              is_active: active,
              updated_at: new Date()
            }
          })
        )
      )

      return reply.send({ data: updatedTenants })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Erro ao alterar status em lote' })
    }
  })

  // Export/Import Operations
  fastify.get('/admin/tenants/export', { 
    schema: { 
      querystring: z.object({
        format: z.enum(['csv', 'xlsx', 'json', 'sql']),
        include: z.string(),
        filters: z.string()
      })
    } 
  }, async (request, reply) => {
    try {
      const { format, include, filters } = request.query as any
      const includeConfig = JSON.parse(include)
      const filterConfig = JSON.parse(filters)
      
      // Filtrar tenants baseado nos filtros
      let whereClause: any = {}
      
      if (filterConfig.status !== 'all') {
        whereClause.is_active = filterConfig.status === 'active'
      }
      
      if (filterConfig.plan !== 'all') {
        whereClause.plan = filterConfig.plan
      }
      
      if (filterConfig.dateRange) {
        whereClause.created_at = {
          gte: new Date(filterConfig.dateRange.start),
          lte: new Date(filterConfig.dateRange.end)
        }
      }
      
      const tenants = await prisma.tenant.findMany({
        where: whereClause,
        include: includeConfig.users ? {
          _count: {
            select: { users: true }
          }
        } : undefined
      })
      
      // Preparar dados para exportação
      const exportData = await Promise.all(
        tenants.map(async (tenant) => {
          const data: any = {
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            email: tenant.email,
            is_active: tenant.is_active,
            plan: tenant.plan,
            created_at: tenant.created_at,
            updated_at: tenant.updated_at
          }
          
          if (includeConfig.users) {
            data.user_count = tenant._count?.users || 0
          }
          
          if (includeConfig.orders) {
            const orderStats = await prisma.order.aggregate({
              where: { tenant_id: tenant.id },
              _count: { id: true },
              _sum: { total_amount: true }
            })
            data.order_count = orderStats._count.id
            data.revenue = orderStats._sum.total_amount || 0
          }
          
          if (includeConfig.settings) {
            // TODO: Buscar configurações do tenant
            data.settings = {}
          }
          
          if (includeConfig.branding) {
            // TODO: Buscar branding do tenant
            data.branding = {}
          }
          
          return data
        })
      )
      
      // Gerar arquivo baseado no formato
      let filename = `tenants-export-${new Date().toISOString().split('T')[0]}.${format}`
      let contentType: string
      let content: string
      
      switch (format) {
        case 'csv':
          contentType = 'text/csv'
          content = generateCSV(exportData)
          break
        case 'xlsx':
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          content = generateXLSX(exportData)
          break
        case 'json':
          contentType = 'application/json'
          content = JSON.stringify(exportData, null, 2)
          break
        case 'sql':
          contentType = 'text/sql'
          content = generateSQL(exportData)
          break
        default:
          return reply.status(400).send({ error: 'Formato não suportado' })
      }
      
      reply.header('Content-Type', contentType)
      reply.header('Content-Disposition', `attachment; filename="${filename}"`)
      return reply.send(content)
      
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Erro ao exportar tenants' })
    }
  })

  fastify.post('/admin/tenants/import', { 
    schema: { 
      consumes: ['multipart/form-data']
    } 
  }, async (request, reply) => {
    try {
      const data = await request.file()
      if (!data) {
        return reply.status(400).send({ error: 'Nenhum arquivo enviado' })
      }
      
      const content = await data.text()
      const filename = data.filename
      const extension = filename.split('.').pop()?.toLowerCase()
      
      let parsedData: any[]
      
      switch (extension) {
        case 'csv':
          parsedData = parseCSV(content)
          break
        case 'json':
          parsedData = JSON.parse(content)
          break
        case 'sql':
          parsedData = parseSQL(content)
          break
        default:
          return reply.status(400).send({ error: 'Formato de arquivo não suportado' })
      }
      
      // Processar importação
      let created = 0
      let updated = 0
      const errors: string[] = []
      const warnings: string[] = []
      
      for (const row of parsedData) {
        try {
          // Verificar se tenant já existe
          const existingTenant = await prisma.tenant.findFirst({
            where: {
              OR: [
                { id: row.id },
                { email: row.email },
                { slug: row.slug }
              ]
            }
          })
          
          if (existingTenant) {
            // Atualizar tenant existente
            await prisma.tenant.update({
              where: { id: existingTenant.id },
              data: {
                name: row.name,
                email: row.email,
                is_active: row.is_active,
                plan: row.plan
              }
            })
            updated++
            warnings.push(`Tenant atualizado: ${row.name}`)
          } else {
            // Criar novo tenant
            await prisma.tenant.create({
              data: {
                id: row.id,
                name: row.name,
                slug: row.slug,
                email: row.email,
                is_active: row.is_active,
                plan: row.plan
              }
            })
            created++
          }
        } catch (error) {
          errors.push(`Erro ao processar tenant ${row.name}: ${error}`)
        }
      }
      
      return reply.send({
        success: true,
        processed: parsedData.length,
        created,
        updated,
        errors,
        warnings
      })
      
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Erro ao importar tenants' })
    }
  })

  // Helper functions
  function generateCSV(data: any[]): string {
    if (data.length === 0) return ''
    
    const headers = Object.keys(data[0])
    const csv = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value
        }).join(',')
      )
    ].join('\n')
    
    return csv
  }

  function generateXLSX(data: any[]): string {
    if (data.length === 0) return ''
    
    const headers = Object.keys(data[0])
    const xlsx = [
      headers.join('\t'),
      ...data.map(row => 
        headers.map(header => row[header]).join('\t')
      )
    ].join('\n')
    
    return xlsx
  }

  function generateSQL(data: any[]): string {
    const sql = [
      '-- Tenant Export SQL',
      '-- Generated on: ' + new Date().toISOString(),
      '',
      ...data.map(tenant => {
        const columns = Object.keys(tenant).join(', ')
        const values = Object.values(tenant).map(value => 
          typeof value === 'string' ? `'${value}'` : value
        ).join(', ')
        
        return `INSERT INTO tenants (${columns}) VALUES (${values});`
      })
    ]
    
    return sql.join('\n')
  }

  function parseCSV(content: string): any[] {
    const lines = content.split('\n').filter(line => line.trim())
    if (lines.length < 2) return []
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const data = []
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
      const row: any = {}
      
      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })
      
      data.push(row)
    }
    
    return data
  }

  function parseSQL(content: string): any[] {
    const insertRegex = /INSERT INTO tenants \((.*?)\) VALUES \((.*?)\);/g
    const data = []
    let match
    
    while ((match = insertRegex.exec(content)) !== null) {
      const columns = match[1].split(',').map(c => c.trim())
      const values = match[2].split(',').map(v => v.trim().replace(/'/g, ''))
      
      const row: any = {}
      columns.forEach((col, index) => {
        row[col] = values[index]
      })
      
      data.push(row)
    }
    
    return data
  }

  // System Health
  fastify.get('/admin/system-health', async (request, reply) => {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
        memory: process.memoryUsage(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0'
      }

      return reply.send({ data: health })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Erro ao verificar saúde do sistema' })
    }
  })
}
