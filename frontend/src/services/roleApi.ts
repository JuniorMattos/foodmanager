import axios from 'axios'
import { Role, Permission, RoleFormData, RoleStats, RoleFilters, RoleAssignment, PermissionCheck, RoleTemplate } from '@/types/role'

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const roleApi = {
  // Role Management
  getRoles: async (filters?: RoleFilters) => {
    const params = new URLSearchParams()
    if (filters?.search) params.append('search', filters.search)
    if (filters?.category) params.append('category', filters.category)
    if (filters?.isSystem !== undefined) params.append('isSystem', filters.isSystem.toString())
    if (filters?.hasUsers !== undefined) params.append('hasUsers', filters.hasUsers.toString())
    if (filters?.dateRange?.start) params.append('startDate', filters.dateRange.start)
    if (filters?.dateRange?.end) params.append('endDate', filters.dateRange.end)
    
    const response = await api.get(`/admin/roles?${params}`)
    return response.data
  },

  getRole: async (id: string) => {
    const response = await api.get(`/admin/roles/${id}`)
    return response.data
  },

  createRole: async (data: RoleFormData) => {
    const response = await api.post('/admin/roles', data)
    return response.data
  },

  updateRole: async (id: string, data: Partial<RoleFormData>) => {
    const response = await api.put(`/admin/roles/${id}`, data)
    return response.data
  },

  deleteRole: async (id: string) => {
    const response = await api.delete(`/admin/roles/${id}`)
    return response.data
  },

  cloneRole: async (id: string, data: { name: string; description: string }) => {
    const response = await api.post(`/admin/roles/${id}/clone`, data)
    return response.data
  },

  // Permission Management
  getPermissions: async () => {
    const response = await api.get('/admin/permissions')
    return response.data
  },

  getPermission: async (id: string) => {
    const response = await api.get(`/admin/permissions/${id}`)
    return response.data
  },

  createPermission: async (data: Omit<Permission, 'id'>) => {
    const response = await api.post('/admin/permissions', data)
    return response.data
  },

  updatePermission: async (id: string, data: Partial<Permission>) => {
    const response = await api.put(`/admin/permissions/${id}`, data)
    return response.data
  },

  deletePermission: async (id: string) => {
    const response = await api.delete(`/admin/permissions/${id}`)
    return response.data
  },

  // Role Assignment
  getRoleAssignments: async (roleId?: string, userId?: string) => {
    const params = new URLSearchParams()
    if (roleId) params.append('roleId', roleId)
    if (userId) params.append('userId', userId)
    
    const response = await api.get(`/admin/role-assignments?${params}`)
    return response.data
  },

  assignRole: async (userId: string, roleId: string) => {
    const response = await api.post('/admin/role-assignments', { userId, roleId })
    return response.data
  },

  removeRoleAssignment: async (assignmentId: string) => {
    const response = await api.delete(`/admin/role-assignments/${assignmentId}`)
    return response.data
  },

  bulkAssignRoles: async (assignments: Array<{ userId: string; roleId: string }>) => {
    const response = await api.post('/admin/role-assignments/bulk', { assignments })
    return response.data
  },

  // Permission Checking
  checkPermission: async (userId: string, check: PermissionCheck) => {
    const response = await api.post(`/admin/users/${userId}/check-permission`, check)
    return response.data
  },

  getUserPermissions: async (userId: string) => {
    const response = await api.get(`/admin/users/${userId}/permissions`)
    return response.data
  },

  getUserRoles: async (userId: string) => {
    const response = await api.get(`/admin/users/${userId}/roles`)
    return response.data
  },

  // Statistics and Analytics
  getRoleStats: async (period?: string) => {
    const params = period ? `?period=${period}` : ''
    const response = await api.get(`/admin/roles/stats${params}`)
    return response.data
  },

  getPermissionUsage: async (period?: string) => {
    const params = period ? `?period=${period}` : ''
    const response = await api.get(`/admin/permissions/usage${params}`)
    return response.data
  },

  getRoleActivity: async (roleId?: string, limit?: number) => {
    const params = new URLSearchParams()
    if (roleId) params.append('roleId', roleId)
    if (limit) params.append('limit', limit.toString())
    
    const response = await api.get(`/admin/roles/activity?${params}`)
    return response.data
  },

  // Role Templates
  getRoleTemplates: async () => {
    const response = await api.get('/admin/role-templates')
    return response.data
  },

  createRoleFromTemplate: async (templateId: string, data: { name: string; description: string }) => {
    const response = await api.post(`/admin/role-templates/${templateId}/create`, data)
    return response.data
  },

  // Role Hierarchy
  getRoleHierarchy: async () => {
    const response = await api.get('/admin/roles/hierarchy')
    return response.data
  },

  updateRoleHierarchy: async (hierarchy: Array<{ id: string; parentId?: string }>) => {
    const response = await api.put('/admin/roles/hierarchy', { hierarchy })
    return response.data
  },

  // Export and Import
  exportRoles: async (format: 'csv' | 'json' | 'xlsx' = 'csv') => {
    const response = await api.get(`/admin/roles/export?format=${format}`, {
      responseType: 'blob' as any
    })
    
    const blob = new Blob([response.data], { 
      type: format === 'csv' ? 'text/csv' : format === 'json' ? 'application/json' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `roles.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  },

  importRoles: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post('/admin/roles/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      } as any
    })
    
    return response.data
  },

  // Validation
  validateRoleName: async (name: string, excludeId?: string) => {
    const params = new URLSearchParams()
    params.append('name', name)
    if (excludeId) params.append('excludeId', excludeId)
    
    const response = await api.get(`/admin/roles/validate-name?${params}`)
    return response.data
  },

  validatePermissionName: async (name: string, excludeId?: string) => {
    const params = new URLSearchParams()
    params.append('name', name)
    if (excludeId) params.append('excludeId', excludeId)
    
    const response = await api.get(`/admin/permissions/validate-name?${params}`)
    return response.data
  },

  // Search and Filter
  searchRoles: async (query: string, filters?: RoleFilters) => {
    const params = new URLSearchParams()
    params.append('query', query)
    if (filters?.category) params.append('category', filters.category)
    if (filters?.isSystem !== undefined) params.append('isSystem', filters.isSystem.toString())
    if (filters?.hasUsers !== undefined) params.append('hasUsers', filters.hasUsers.toString())
    
    const response = await api.get(`/admin/roles/search?${params}`)
    return response.data
  },

  searchPermissions: async (query: string, category?: string) => {
    const params = new URLSearchParams()
    params.append('query', query)
    if (category) params.append('category', category)
    
    const response = await api.get(`/admin/permissions/search?${params}`)
    return response.data
  },

  // Bulk Operations
  bulkDeleteRoles: async (roleIds: string[]) => {
    const response = await api.post('/admin/roles/bulk-delete', { roleIds })
    return response.data
  },

  bulkUpdateRoles: async (updates: Array<{ id: string; data: Partial<RoleFormData> }>) => {
    const response = await api.put('/admin/roles/bulk-update', { updates })
    return response.data
  },

  bulkAssignPermissions: async (roleId: string, permissionIds: string[]) => {
    const response = await api.post(`/admin/roles/${roleId}/permissions/bulk`, { permissionIds })
    return response.data
  },

  bulkRemovePermissions: async (roleId: string, permissionIds: string[]) => {
    const response = await api.delete(`/admin/roles/${roleId}/permissions/bulk`, { 
      data: { permissionIds } 
    })
    return response.data
  }
}
