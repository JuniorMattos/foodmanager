export interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  isSystem: boolean
  userCount: number
  createdAt: string
  updatedAt: string
}

export interface Permission {
  id: string
  name: string
  description: string
  category: string
  resource: string
  action: string
}

export interface RoleFormData {
  name: string
  description: string
  permissions: string[]
}

export interface RoleStats {
  totalRoles: number
  systemRoles: number
  customRoles: number
  activeRoles: number
  unusedRoles: number
  totalUsers: number
  usersWithRoles: number
  usersWithoutRoles: number
  recentActivity: Array<{
    id: string
    action: string
    roleName: string
    userName: string
    timestamp: string
    severity: 'low' | 'medium' | 'high'
  }>
  roleDistribution: Array<{
    roleName: string
    userCount: number
    percentage: number
  }>
  permissionUsage: Array<{
    category: string
    usageCount: number
    totalPermissions: number
  }>
}

export interface RoleFilters {
  search?: string
  category?: string
  isSystem?: boolean
  hasUsers?: boolean
  dateRange?: {
    start: string
    end: string
  }
}

export interface RoleAssignment {
  id: string
  userId: string
  userName: string
  userEmail: string
  roleId: string
  roleName: string
  assignedAt: string
  assignedBy: string
}

export interface PermissionCheck {
  resource: string
  action: string
  context?: Record<string, any>
}

export interface RoleHierarchy {
  id: string
  name: string
  parentId?: string
  level: number
  children?: RoleHierarchy[]
}

export interface RoleTemplate {
  id: string
  name: string
  description: string
  permissions: string[]
  category: string
  isDefault: boolean
}
