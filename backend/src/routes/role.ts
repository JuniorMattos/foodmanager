import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { authenticateAdmin } from '../middleware/adminAuth'

// Schema definitions
const createRoleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  permissions: z.array(z.string())
})

const updateRoleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(500).optional(),
  permissions: z.array(z.string()).optional()
})

const cloneRoleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500)
})

const assignRoleSchema = z.object({
  userId: z.string(),
  roleId: z.string()
})

const bulkAssignRoleSchema = z.object({
  assignments: z.array(z.object({
    userId: z.string(),
    roleId: z.string()
  }))
})

const checkPermissionSchema = z.object({
  resource: z.string(),
  action: z.string(),
  context: z.record(z.any()).optional()
})

const updateHierarchySchema = z.object({
  hierarchy: z.array(z.object({
    id: z.string(),
    parentId: z.string().optional()
  }))
})

const bulkDeleteSchema = z.object({
  roleIds: z.array(z.string())
})

const bulkUpdateSchema = z.object({
  updates: z.array(z.object({
    id: z.string(),
    data: updateRoleSchema
  }))
})

const bulkPermissionSchema = z.object({
  permissionIds: z.array(z.string())
})

// Helper functions
const createAuditLog = async (action: string, entityType: string, entityId: string, entityName: string, userId: string, oldValues: any = null, newValues: any = null, severity: string = 'medium', category: string = 'update') => {
  try {
    await prisma.auditLog.create({
      data: {
        id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        action,
        entity_type: entityType,
        entity_id: entityId,
        entity_name: entityName,
        old_values: oldValues || {},
        new_values: newValues || {},
        user_id: userId,
        user_name: 'System',
        user_email: 'system@foodmanager.com',
        user_role: 'system',
        ip_address: '127.0.0.1',
        user_agent: 'System',
        timestamp: new Date().toISOString(),
        severity,
        category,
        description: `${action} ${entityType}: ${entityName}`,
        metadata: {}
      }
    })
  } catch (error) {
    console.error('Error creating audit log:', error)
  }
}

const getRoleStats = async (period: string = '30d') => {
  const dateRange = new Date()
  const days = parseInt(period.replace('d', ''))
  dateRange.setDate(dateRange.getDate() - days)

  const [
    totalRoles,
    systemRoles,
    customRoles,
    activeRoles,
    unusedRoles,
    totalUsers,
    usersWithRoles,
    usersWithoutRoles,
    recentActivity
  ] = await Promise.all([
    prisma.role.count(),
    prisma.role.count({ where: { is_system: true } }),
    prisma.role.count({ where: { is_system: false } }),
    prisma.role.count({ where: { user_roles: { some: {} } } }),
    prisma.role.count({ where: { user_roles: { none: {} } } }),
    prisma.user.count(),
    prisma.user.count({ where: { user_roles: { some: {} } } }),
    prisma.user.count({ where: { user_roles: { none: {} } } }),
    prisma.auditLog.findMany({
      where: {
        entity_type: 'role',
        timestamp: { gte: dateRange }
      },
      orderBy: { timestamp: 'desc' },
      take: 10,
      select: {
        id: true,
        action: true,
        entity_name: true,
        user_name: true,
        timestamp: true,
        severity: true
      }
    })
  ])

  // Get role distribution
  const roleDistribution = await prisma.role.findMany({
    select: {
      name: true,
      _count: {
        select: {
          user_roles: true
        }
      }
    },
    orderBy: {
      user_roles: {
        _count: 'desc'
      }
    },
    take: 10
  })

  const totalRoleUsers = roleDistribution.reduce((sum, role) => sum + role._count.user_roles, 0)

  // Get permission usage
  const permissionCategories = await prisma.permission.groupBy({
    by: ['category'],
    _count: {
      id: true
    }
  })

  return {
    totalRoles,
    systemRoles,
    customRoles,
    activeRoles,
    unusedRoles,
    totalUsers,
    usersWithRoles,
    usersWithoutRoles,
    recentActivity,
    roleDistribution: roleDistribution.map(role => ({
      roleName: role.name,
      userCount: role._count.user_roles,
      percentage: totalRoleUsers > 0 ? Math.round((role._count.user_roles / totalRoleUsers) * 100) : 0
    })),
    permissionUsage: permissionCategories.map(category => ({
      category: category.category,
      usageCount: category._count.id,
      totalPermissions: category._count.id
    }))
  }
}

export async function roleRoutes(fastify: FastifyInstance) {
  // Role Management Routes
  
  // Get all roles
  fastify.get('/admin/roles', {
    preHandler: [authenticateAdmin],
    schema: {
      querystring: z.object({
        search: z.string().optional(),
        category: z.string().optional(),
        isSystem: z.string().optional(),
        hasUsers: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        page: z.string().optional(),
        limit: z.string().optional()
      })
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { search, category, isSystem, hasUsers, startDate, endDate, page = '1', limit = '50' } = request.query as any
      
      const where: any = {}
      
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }
      
      if (isSystem !== undefined) {
        where.is_system = isSystem === 'true'
      }
      
      if (hasUsers !== undefined) {
        if (hasUsers === 'true') {
          where.user_roles = { some: {} }
        } else {
          where.user_roles = { none: {} }
        }
      }
      
      if (startDate || endDate) {
        where.created_at = {}
        if (startDate) where.created_at.gte = new Date(startDate)
        if (endDate) where.created_at.lte = new Date(endDate)
      }
      
      const [roles, total] = await Promise.all([
        prisma.role.findMany({
          where,
          include: {
            _count: {
              select: {
                user_roles: true
              }
            }
          },
          orderBy: { created_at: 'desc' },
          skip: (parseInt(page) - 1) * parseInt(limit),
          take: parseInt(limit)
        }),
        prisma.role.count({ where })
      ])
      
      const rolesWithCounts = roles.map(role => ({
        ...role,
        userCount: role._count.user_roles
      }))
      
      return reply.send({
        data: rolesWithCounts,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      })
    } catch (error) {
      console.error('Error fetching roles:', error)
      return reply.status(500).send({ error: 'Failed to fetch roles' })
    }
  })

  // Get single role
  fastify.get('/admin/roles/:id', {
    preHandler: [authenticateAdmin]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as any
      
      const role = await prisma.role.findUnique({
        where: { id },
        include: {
          role_permissions: {
            include: {
              permission: true
            }
          },
          _count: {
            select: {
              user_roles: true
            }
          }
        }
      })
      
      if (!role) {
        return reply.status(404).send({ error: 'Role not found' })
      }
      
      const roleWithPermissions = {
        ...role,
        permissions: role.role_permissions.map(rp => rp.permission.id),
        userCount: role._count.user_roles
      }
      
      return reply.send({ data: roleWithPermissions })
    } catch (error) {
      console.error('Error fetching role:', error)
      return reply.status(500).send({ error: 'Failed to fetch role' })
    }
  })

  // Create role
  fastify.post('/admin/roles', {
    preHandler: [authenticateAdmin],
    schema: {
      body: createRoleSchema
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = createRoleSchema.parse(request.body)
      const user = (request as any).user
      
      // Check if role name already exists
      const existingRole = await prisma.role.findFirst({
        where: { name: data.name }
      })
      
      if (existingRole) {
        return reply.status(400).send({ error: 'Role name already exists' })
      }
      
      // Create role
      const role = await prisma.role.create({
        data: {
          id: `role-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: data.name,
          description: data.description,
          is_system: false,
          created_at: new Date(),
          updated_at: new Date()
        }
      })
      
      // Assign permissions
      if (data.permissions.length > 0) {
        await prisma.rolePermission.createMany({
          data: data.permissions.map(permissionId => ({
            id: `rp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            role_id: role.id,
            permission_id: permissionId,
            created_at: new Date()
          }))
        })
      }
      
      // Create audit log
      await createAuditLog(
        'role_created',
        'role',
        role.id,
        role.name,
        user.id,
        null,
        data,
        'medium',
        'create'
      )
      
      return reply.status(201).send({ data: role })
    } catch (error) {
      console.error('Error creating role:', error)
      return reply.status(500).send({ error: 'Failed to create role' })
    }
  })

  // Update role
  fastify.put('/admin/roles/:id', {
    preHandler: [authenticateAdmin],
    schema: {
      body: updateRoleSchema
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as any
      const data = updateRoleSchema.parse(request.body)
      const user = (request as any).user
      
      const existingRole = await prisma.role.findUnique({
        where: { id }
      })
      
      if (!existingRole) {
        return reply.status(404).send({ error: 'Role not found' })
      }
      
      if (existingRole.is_system) {
        return reply.status(400).send({ error: 'Cannot modify system roles' })
      }
      
      // Check if new name conflicts with existing role
      if (data.name && data.name !== existingRole.name) {
        const nameConflict = await prisma.role.findFirst({
          where: { name: data.name }
        })
        
        if (nameConflict) {
          return reply.status(400).send({ error: 'Role name already exists' })
        }
      }
      
      const oldValues = {
        name: existingRole.name,
        description: existingRole.description
      }
      
      // Update role
      const updatedRole = await prisma.role.update({
        where: { id },
        data: {
          ...data,
          updated_at: new Date()
        }
      })
      
      // Update permissions if provided
      if (data.permissions) {
        // Remove existing permissions
        await prisma.rolePermission.deleteMany({
          where: { role_id: id }
        })
        
        // Add new permissions
        if (data.permissions.length > 0) {
          await prisma.rolePermission.createMany({
            data: data.permissions.map(permissionId => ({
              id: `rp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              role_id: id,
              permission_id: permissionId,
              created_at: new Date()
            }))
          })
        }
      }
      
      // Create audit log
      await createAuditLog(
        'role_updated',
        'role',
        id,
        existingRole.name,
        user.id,
        oldValues,
        data,
        'medium',
        'update'
      )
      
      return reply.send({ data: updatedRole })
    } catch (error) {
      console.error('Error updating role:', error)
      return reply.status(500).send({ error: 'Failed to update role' })
    }
  })

  // Delete role
  fastify.delete('/admin/roles/:id', {
    preHandler: [authenticateAdmin]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as any
      const user = (request as any).user
      
      const role = await prisma.role.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              user_roles: true
            }
          }
        }
      })
      
      if (!role) {
        return reply.status(404).send({ error: 'Role not found' })
      }
      
      if (role.is_system) {
        return reply.status(400).send({ error: 'Cannot delete system roles' })
      }
      
      if (role._count.user_roles > 0) {
        return reply.status(400).send({ error: 'Cannot delete role with assigned users' })
      }
      
      // Delete role permissions
      await prisma.rolePermission.deleteMany({
        where: { role_id: id }
      })
      
      // Delete role
      await prisma.role.delete({
        where: { id }
      })
      
      // Create audit log
      await createAuditLog(
        'role_deleted',
        'role',
        id,
        role.name,
        user.id,
        { name: role.name, description: role.description },
        null,
        'high',
        'delete'
      )
      
      return reply.send({ message: 'Role deleted successfully' })
    } catch (error) {
      console.error('Error deleting role:', error)
      return reply.status(500).send({ error: 'Failed to delete role' })
    }
  })

  // Clone role
  fastify.post('/admin/roles/:id/clone', {
    preHandler: [authenticateAdmin],
    schema: {
      body: cloneRoleSchema
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as any
      const { name, description } = cloneRoleSchema.parse(request.body)
      const user = (request as any).user
      
      const sourceRole = await prisma.role.findUnique({
        where: { id },
        include: {
          role_permissions: {
            select: {
              permission_id: true
            }
          }
        }
      })
      
      if (!sourceRole) {
        return reply.status(404).send({ error: 'Source role not found' })
      }
      
      // Check if new name already exists
      const nameConflict = await prisma.role.findFirst({
        where: { name }
      })
      
      if (nameConflict) {
        return reply.status(400).send({ error: 'Role name already exists' })
      }
      
      // Create cloned role
      const clonedRole = await prisma.role.create({
        data: {
          id: `role-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name,
          description,
          is_system: false,
          created_at: new Date(),
          updated_at: new Date()
        }
      })
      
      // Copy permissions
      if (sourceRole.role_permissions.length > 0) {
        await prisma.rolePermission.createMany({
          data: sourceRole.role_permissions.map(rp => ({
            id: `rp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            role_id: clonedRole.id,
            permission_id: rp.permission_id,
            created_at: new Date()
          }))
        })
      }
      
      // Create audit log
      await createAuditLog(
        'role_cloned',
        'role',
        clonedRole.id,
        clonedRole.name,
        user.id,
        { sourceRole: sourceRole.name },
        { name, description },
        'medium',
        'create'
      )
      
      return reply.status(201).send({ data: clonedRole })
    } catch (error) {
      console.error('Error cloning role:', error)
      return reply.status(500).send({ error: 'Failed to clone role' })
    }
  })

  // Permission Management Routes
  
  // Get all permissions
  fastify.get('/admin/permissions', {
    preHandler: [authenticateAdmin]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const permissions = await prisma.permission.findMany({
        orderBy: [
          { category: 'asc' },
          { name: 'asc' }
        ]
      })
      
      return reply.send({ data: permissions })
    } catch (error) {
      console.error('Error fetching permissions:', error)
      return reply.status(500).send({ error: 'Failed to fetch permissions' })
    }
  })

  // Get single permission
  fastify.get('/admin/permissions/:id', {
    preHandler: [authenticateAdmin]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as any
      
      const permission = await prisma.permission.findUnique({
        where: { id }
      })
      
      if (!permission) {
        return reply.status(404).send({ error: 'Permission not found' })
      }
      
      return reply.send({ data: permission })
    } catch (error) {
      console.error('Error fetching permission:', error)
      return reply.status(500).send({ error: 'Failed to fetch permission' })
    }
  })

  // Create permission
  fastify.post('/admin/permissions', {
    preHandler: [authenticateAdmin],
    schema: {
      body: z.object({
        name: z.string().min(1).max(100),
        description: z.string().min(1).max(500),
        category: z.string().min(1).max(50),
        resource: z.string().min(1).max(50),
        action: z.string().min(1).max(50)
      })
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = (request.body as any)
      const user = (request as any).user
      
      // Check if permission name already exists
      const existingPermission = await prisma.permission.findFirst({
        where: { name: data.name }
      })
      
      if (existingPermission) {
        return reply.status(400).send({ error: 'Permission name already exists' })
      }
      
      // Create permission
      const permission = await prisma.permission.create({
        data: {
          id: `perm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ...data,
          created_at: new Date(),
          updated_at: new Date()
        }
      })
      
      // Create audit log
      await createAuditLog(
        'permission_created',
        'permission',
        permission.id,
        permission.name,
        user.id,
        null,
        data,
        'medium',
        'create'
      )
      
      return reply.status(201).send({ data: permission })
    } catch (error) {
      console.error('Error creating permission:', error)
      return reply.status(500).send({ error: 'Failed to create permission' })
    }
  })

  // Role Assignment Routes
  
  // Get role assignments
  fastify.get('/admin/role-assignments', {
    preHandler: [authenticateAdmin],
    schema: {
      querystring: z.object({
        roleId: z.string().optional(),
        userId: z.string().optional()
      })
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { roleId, userId } = request.query as any
      
      const where: any = {}
      if (roleId) where.role_id = roleId
      if (userId) where.user_id = userId
      
      const assignments = await prisma.userRole.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          role: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { created_at: 'desc' }
      })
      
      const formattedAssignments = assignments.map(assignment => ({
        id: assignment.id,
        userId: assignment.user_id,
        userName: assignment.user.name,
        userEmail: assignment.user.email,
        roleId: assignment.role_id,
        roleName: assignment.role.name,
        assignedAt: assignment.created_at,
        assignedBy: assignment.created_by || 'System'
      }))
      
      return reply.send({ data: formattedAssignments })
    } catch (error) {
      console.error('Error fetching role assignments:', error)
      return reply.status(500).send({ error: 'Failed to fetch role assignments' })
    }
  })

  // Assign role to user
  fastify.post('/admin/role-assignments', {
    preHandler: [authenticateAdmin],
    schema: {
      body: assignRoleSchema
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { userId, roleId } = assignRoleSchema.parse(request.body)
      const user = (request as any).user
      
      // Check if user exists
      const targetUser = await prisma.user.findUnique({
        where: { id: userId }
      })
      
      if (!targetUser) {
        return reply.status(404).send({ error: 'User not found' })
      }
      
      // Check if role exists
      const role = await prisma.role.findUnique({
        where: { id: roleId }
      })
      
      if (!role) {
        return reply.status(404).send({ error: 'Role not found' })
      }
      
      // Check if assignment already exists
      const existingAssignment = await prisma.userRole.findFirst({
        where: {
          user_id: userId,
          role_id: roleId
        }
      })
      
      if (existingAssignment) {
        return reply.status(400).send({ error: 'User already has this role' })
      }
      
      // Create assignment
      const assignment = await prisma.userRole.create({
        data: {
          id: `ur-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          user_id: userId,
          role_id: roleId,
          created_by: user.id,
          created_at: new Date()
        }
      })
      
      // Create audit log
      await createAuditLog(
        'role_assigned',
        'user_role',
        assignment.id,
        `${targetUser.name} -> ${role.name}`,
        user.id,
        null,
        { userId, roleId, userName: targetUser.name, roleName: role.name },
        'medium',
        'update'
      )
      
      return reply.status(201).send({ data: assignment })
    } catch (error) {
      console.error('Error assigning role:', error)
      return reply.status(500).send({ error: 'Failed to assign role' })
    }
  })

  // Remove role assignment
  fastify.delete('/admin/role-assignments/:id', {
    preHandler: [authenticateAdmin]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as any
      const user = (request as any).user
      
      const assignment = await prisma.userRole.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              name: true
            }
          },
          role: {
            select: {
              name: true
            }
          }
        }
      })
      
      if (!assignment) {
        return reply.status(404).send({ error: 'Assignment not found' })
      }
      
      // Delete assignment
      await prisma.userRole.delete({
        where: { id }
      })
      
      // Create audit log
      await createAuditLog(
        'role_unassigned',
        'user_role',
        id,
        `${assignment.user.name} -> ${assignment.role.name}`,
        user.id,
        { userName: assignment.user.name, roleName: assignment.role.name },
        null,
        'medium',
        'update'
      )
      
      return reply.send({ message: 'Role assignment removed successfully' })
    } catch (error) {
      console.error('Error removing role assignment:', error)
      return reply.status(500).send({ error: 'Failed to remove role assignment' })
    }
  })

  // Bulk assign roles
  fastify.post('/admin/role-assignments/bulk', {
    preHandler: [authenticateAdmin],
    schema: {
      body: bulkAssignRoleSchema
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { assignments } = bulkAssignRoleSchema.parse(request.body)
      const user = (request as any).user
      
      const results = []
      
      for (const assignment of assignments) {
        try {
          // Check if assignment already exists
          const existing = await prisma.userRole.findFirst({
            where: {
              user_id: assignment.userId,
              role_id: assignment.roleId
            }
          })
          
          if (existing) {
            results.push({ userId: assignment.userId, roleId: assignment.roleId, status: 'exists' })
            continue
          }
          
          // Create assignment
          await prisma.userRole.create({
            data: {
              id: `ur-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              user_id: assignment.userId,
              role_id: assignment.roleId,
              created_by: user.id,
              created_at: new Date()
            }
          })
          
          results.push({ userId: assignment.userId, roleId: assignment.roleId, status: 'created' })
        } catch (error) {
          results.push({ userId: assignment.userId, roleId: assignment.roleId, status: 'error', error: error.message })
        }
      }
      
      // Create audit log
      await createAuditLog(
        'bulk_role_assigned',
        'user_role',
        'bulk',
        `Bulk role assignment: ${assignments.length} assignments`,
        user.id,
        null,
        { assignments: assignments.length, results },
        'high',
        'update'
      )
      
      return reply.send({ data: results })
    } catch (error) {
      console.error('Error bulk assigning roles:', error)
      return reply.status(500).send({ error: 'Failed to bulk assign roles' })
    }
  })

  // Statistics Routes
  
  // Get role statistics
  fastify.get('/admin/roles/stats', {
    preHandler: [authenticateAdmin],
    schema: {
      querystring: z.object({
        period: z.string().optional()
      })
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { period = '30d' } = request.query as any
      
      const stats = await getRoleStats(period)
      
      return reply.send({ data: stats })
    } catch (error) {
      console.error('Error fetching role stats:', error)
      return reply.status(500).send({ error: 'Failed to fetch role stats' })
    }
  })

  // Get role activity
  fastify.get('/admin/roles/activity', {
    preHandler: [authenticateAdmin],
    schema: {
      querystring: z.object({
        roleId: z.string().optional(),
        limit: z.string().optional()
      })
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { roleId, limit = '50' } = request.query as any
      
      const where: any = {
        entity_type: 'role'
      }
      
      if (roleId) {
        where.entity_id = roleId
      }
      
      const activity = await prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: parseInt(limit),
        select: {
          id: true,
          action: true,
          entity_name: true,
          user_name: true,
          timestamp: true,
          severity: true,
          description: true
        }
      })
      
      return reply.send({ data: activity })
    } catch (error) {
      console.error('Error fetching role activity:', error)
      return reply.status(500).send({ error: 'Failed to fetch role activity' })
    }
  })

  // Export routes
  fastify.get('/admin/roles/export', {
    preHandler: [authenticateAdmin],
    schema: {
      querystring: z.object({
        format: z.enum(['csv', 'json', 'xlsx']).default('csv')
      })
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { format } = request.query as any
      
      const roles = await prisma.role.findMany({
        include: {
          role_permissions: {
            include: {
              permission: true
            }
          },
          _count: {
            select: {
              user_roles: true
            }
          }
        },
        orderBy: { created_at: 'desc' }
      })
      
      if (format === 'csv') {
        const csv = [
          'ID,Name,Description,Is System,User Count,Permissions,Created At,Updated At',
          ...roles.map(role => [
            role.id,
            role.name,
            role.description,
            role.is_system,
            role._count.user_roles,
            `"${role.role_permissions.map(rp => rp.permission.name).join(', ')}"`,
            role.created_at.toISOString(),
            role.updated_at.toISOString()
          ].join(','))
        ].join('\n')
        
        reply.header('Content-Type', 'text/csv')
        reply.header('Content-Disposition', 'attachment; filename="roles.csv"')
        return reply.send(csv)
      }
      
      if (format === 'json') {
        reply.header('Content-Type', 'application/json')
        reply.header('Content-Disposition', 'attachment; filename="roles.json"')
        return reply.send(roles)
      }
      
      // For XLSX, you would need to implement Excel generation
      return reply.status(400).send({ error: 'XLSX format not implemented yet' })
    } catch (error) {
      console.error('Error exporting roles:', error)
      return reply.status(500).send({ error: 'Failed to export roles' })
    }
  })

  // Validation routes
  fastify.get('/admin/roles/validate-name', {
    preHandler: [authenticateAdmin],
    schema: {
      querystring: z.object({
        name: z.string(),
        excludeId: z.string().optional()
      })
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { name, excludeId } = request.query as any
      
      const where: any = { name }
      if (excludeId) {
        where.id = { not: excludeId }
      }
      
      const existing = await prisma.role.findFirst({ where })
      
      return reply.send({ 
        valid: !existing,
        message: existing ? 'Role name already exists' : 'Role name is available'
      })
    } catch (error) {
      console.error('Error validating role name:', error)
      return reply.status(500).send({ error: 'Failed to validate role name' })
    }
  })

  // Search routes
  fastify.get('/admin/roles/search', {
    preHandler: [authenticateAdmin],
    schema: {
      querystring: z.object({
        query: z.string(),
        category: z.string().optional(),
        isSystem: z.string().optional(),
        hasUsers: z.string().optional()
      })
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { query, category, isSystem, hasUsers } = request.query as any
      
      const where: any = {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      }
      
      if (isSystem !== undefined) {
        where.is_system = isSystem === 'true'
      }
      
      if (hasUsers !== undefined) {
        if (hasUsers === 'true') {
          where.user_roles = { some: {} }
        } else {
          where.user_roles = { none: {} }
        }
      }
      
      const roles = await prisma.role.findMany({
        where,
        include: {
          _count: {
            select: {
              user_roles: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
        take: 20
      })
      
      const rolesWithCounts = roles.map(role => ({
        ...role,
        userCount: role._count.user_roles
      }))
      
      return reply.send({ data: rolesWithCounts })
    } catch (error) {
      console.error('Error searching roles:', error)
      return reply.status(500).send({ error: 'Failed to search roles' })
    }
  })
}
