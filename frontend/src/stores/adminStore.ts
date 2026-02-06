import { create } from 'zustand'
import { AdminUser, TenantStats, TenantWithStats, TenantFilters, CreateTenantData } from '@/types/admin'
import { adminApi } from '@/services/adminApi'

interface AdminState {
  // Estado do Admin
  currentUser: AdminUser | null
  isLoading: boolean
  
  // Dados dos Tenants
  tenants: TenantWithStats[]
  selectedTenant: TenantWithStats | null
  stats: TenantStats | null
  filters: TenantFilters
  
  // UI State
  showCreateModal: boolean
  showEditModal: boolean
  showDeleteModal: boolean
  
  // Actions
  setCurrentUser: (user: AdminUser | null) => void
  setTenants: (tenants: TenantWithStats[]) => void
  setSelectedTenant: (tenant: TenantWithStats | null) => void
  setStats: (stats: TenantStats) => void
  setFilters: (filters: Partial<TenantFilters>) => void
  setShowCreateModal: (show: boolean) => void
  setShowEditModal: (show: boolean) => void
  setShowDeleteModal: (show: boolean) => void
  
  // API Actions
  fetchTenants: () => Promise<void>
  fetchStats: () => Promise<void>
  createTenant: (data: CreateTenantData) => Promise<void>
  updateTenant: (id: string, data: Partial<TenantWithStats>) => Promise<void>
  deleteTenant: (id: string) => Promise<void>
  toggleTenantStatus: (id: string) => Promise<void>

  // Bulk Operations
  bulkToggleTenantStatus: (tenantIds: string[], active: boolean) => Promise<void>
  bulkDeleteTenants: (tenantIds: string[]) => Promise<void>
  
  // Filters
  updateFilters: (filters: Partial<TenantFilters>) => void
  resetFilters: () => void
}

const defaultFilters: TenantFilters = {
  search: '',
  status: 'all',
  plan: 'all',
  created_at: '',
  sort_by: 'created_at',
  sort_order: 'desc'
}

export const useAdminStore = create<AdminState>((set, get) => ({
  // Estado inicial
  currentUser: null,
  isLoading: false,
  tenants: [],
  selectedTenant: null,
  stats: null,
  filters: defaultFilters,
  showCreateModal: false,
  showEditModal: false,
  showDeleteModal: false,

  // Setters básicos
  setCurrentUser: (user) => set({ currentUser: user }),
  setTenants: (tenants) => set({ tenants }),
  setSelectedTenant: (tenant) => set({ selectedTenant: tenant }),
  setStats: (stats) => set({ stats }),
  setFilters: (filters: TenantFilters) => set({ filters }),
  setShowCreateModal: (show) => set({ showCreateModal: show }),
  setShowEditModal: (show) => set({ showEditModal: show }),
  setShowDeleteModal: (show) => set({ showDeleteModal: show }),

  // API Actions (com integração real)
  fetchTenants: async () => {
    set({ isLoading: true })
    try {
      const tenants = await adminApi.getTenants(get().filters)
      set({ tenants, isLoading: false })
    } catch (error) {
      console.error('Error fetching tenants:', error)
      set({ isLoading: false })
    }
  },

  fetchStats: async () => {
    try {
      const stats = await adminApi.getStats()
      set({ stats })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  },

  createTenant: async (data: CreateTenantData) => {
    set({ isLoading: true })
    try {
      const newTenant = await adminApi.createTenant(data)
      set(state => ({ 
        tenants: [...state.tenants, newTenant],
        isLoading: false,
        showCreateModal: false
      }))
    } catch (error) {
      console.error('Error creating tenant:', error)
      set({ isLoading: false })
      throw error
    }
  },

  updateTenant: async (id: string, data: Partial<TenantWithStats>) => {
    set({ isLoading: true })
    try {
      const updatedTenant = await adminApi.updateTenant(id, data)
      set(state => ({
        tenants: state.tenants.map(tenant => 
          tenant.id === id ? updatedTenant : tenant
        ),
        isLoading: false,
        showEditModal: false
      }))
    } catch (error) {
      console.error('Error updating tenant:', error)
      set({ isLoading: false })
      throw error
    }
  },

  deleteTenant: async (id: string) => {
    set({ isLoading: true })
    try {
      await adminApi.deleteTenant(id)
      set(state => ({
        tenants: state.tenants.filter(tenant => tenant.id !== id),
        isLoading: false,
        showDeleteModal: false,
        selectedTenant: null
      }))
    } catch (error) {
      console.error('Error deleting tenant:', error)
      set({ isLoading: false })
      throw error
    }
  },

  toggleTenantStatus: async (id: string) => {
    try {
      const updatedTenant = await adminApi.toggleTenantStatus(id)
      set(state => ({
        tenants: state.tenants.map(tenant => 
          tenant.id === id ? updatedTenant : tenant
        )
      }))
    } catch (error) {
      console.error('Error toggling tenant status:', error)
      throw error
    }
  },

  // Bulk Operations
  bulkToggleTenantStatus: async (tenantIds: string[], active: boolean) => {
    set({ isLoading: true })
    try {
      const updatedTenants = await adminApi.bulkToggleTenantStatus(tenantIds, active)
      set(state => ({
        tenants: state.tenants.map(tenant => 
          tenantIds.includes(tenant.id) 
            ? updatedTenants.find(updated => updated.id === tenant.id) || tenant
            : tenant
        ),
        isLoading: false
      }))
    } catch (error) {
      console.error('Error in bulk toggle:', error)
      set({ isLoading: false })
      throw error
    }
  },

  bulkDeleteTenants: async (tenantIds: string[]) => {
    set({ isLoading: true })
    try {
      await adminApi.bulkDeleteTenants(tenantIds)
      set(state => ({
        tenants: state.tenants.filter(tenant => !tenantIds.includes(tenant.id)),
        isLoading: false
      }))
    } catch (error) {
      console.error('Error in bulk delete:', error)
      set({ isLoading: false })
      throw error
    }
  },

  // Filters
  updateFilters: (filters) => {
    set(state => ({ filters: { ...state.filters, ...filters } }))
  },

  resetFilters: () => {
    set({ filters: defaultFilters })
  }
}))
