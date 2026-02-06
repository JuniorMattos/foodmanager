export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  tenantId: string
  avatar?: string
  phone?: string
  lastLoginAt?: Date
  isActive: boolean
  emailVerified: boolean
  phoneVerified: boolean
  preferences: UserPreferences
  permissions: string[]
  createdAt: Date
  updatedAt: Date
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  VENDOR = 'VENDOR',
  CUSTOMER = 'CUSTOMER',
  STAFF = 'STAFF',
}

export interface UserPreferences {
  language: string
  timezone: string
  theme: 'light' | 'dark' | 'auto'
  notifications: {
    email: boolean
    sms: boolean
    push: boolean
    desktop: boolean
  }
  dashboard: {
    layout: string
    widgets: string[]
    refreshInterval: number
  }
  privacy: {
    shareData: boolean
    analytics: boolean
    marketing: boolean
  }
}

export interface UserProfile {
  id: string
  email: string
  name: string
  role: UserRole
  tenantId: string
  avatar?: string
  phone?: string
  lastLoginAt?: Date
  isActive: boolean
  emailVerified: boolean
  tenant: {
    id: string
    name: string
    slug: string
    planId: string
  }
  permissions: string[]
  createdAt: Date
}

export interface UserSession {
  id: string
  userId: string
  tenantId: string
  token: string
  refreshToken: string
  expiresAt: Date
  lastActivity: Date
  ipAddress: string
  userAgent: string
  isActive: boolean
  createdAt: Date
}

export interface UserActivity {
  id: string
  userId: string
  tenantId: string
  action: string
  resource: string
  resourceId?: string
  metadata?: Record<string, any>
  ipAddress: string
  userAgent: string
  timestamp: Date
}

export interface UserMetrics {
  totalUsers: number
  activeUsers: number
  newUsersToday: number
  newUsersThisMonth: number
  usersByRole: Record<UserRole, number>
  loginActivity: {
    today: number
    thisWeek: number
    thisMonth: number
  }
  topActiveUsers: Array<{
    userId: string
    name: string
    email: string
    activityCount: number
  }>
}
