import React, { useEffect } from 'react'
import { 
  Users, 
  Building2, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart,
  Activity,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Power,
  PowerOff
} from 'lucide-react'
import { useAdminStore } from '@/stores/adminStore'
import { TenantFilters } from '@/types/admin'
import { CreateTenantModal } from './CreateTenantModal'
import { useTranslation } from 'react-i18next'

export default function AdminDashboardPage() {
  const { t } = useTranslation()
  const {
    tenants,
    stats,
    isLoading,
    filters,
    selectedTenant,
    showCreateModal,
    showEditModal,
    showDeleteModal,
    fetchTenants,
    fetchStats,
    setSelectedTenant,
    setShowCreateModal,
    setShowEditModal,
    setShowDeleteModal,
    toggleTenantStatus,
    updateFilters
  } = useAdminStore()

  useEffect(() => {
    fetchTenants()
    fetchStats()
  }, [])

  const handleFilterChange = (key: keyof TenantFilters, value: any) => {
    updateFilters({ [key]: value })
  }

  const filteredTenants = tenants.filter(tenant => {
    if (filters.search && !tenant.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    if (filters.status === 'active' && !tenant.is_active) return false
    if (filters.status === 'inactive' && tenant.is_active) return false
    return true
  })

  const sortedTenants = [...filteredTenants].sort((a, b) => {
    const { sort_by, sort_order } = filters
    
    let aValue: any
    let bValue: any
    
    switch (sort_by) {
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case 'user_count':
        aValue = a.stats.user_count
        bValue = b.stats.user_count
        break
      case 'revenue':
        aValue = a.stats.revenue
        bValue = b.stats.revenue
        break
      case 'created_at':
        aValue = new Date(a.created_at)
        bValue = new Date(b.created_at)
        break
      default:
        return 0
    }
    
    if (sort_order === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  if (isLoading && tenants.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">{t('adminDashboard.subtitle')}</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{t('adminDashboard.newTenant')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('adminDashboard.stats.totalTenants')}</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_tenants}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('adminDashboard.stats.activeTenants')}</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active_tenants}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('adminDashboard.stats.totalUsers')}</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_users}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('adminDashboard.stats.totalRevenue')}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {stats.total_revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Tenant Modal */}
      {showCreateModal && (
        <CreateTenantModal onClose={() => setShowCreateModal(false)} />
      )}

      {/* Filters */}
      <div className="px-6 pb-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={t('adminDashboard.searchPlaceholder')}
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">{t('adminDashboard.filters.allStatus')}</option>
                <option value="active">{t('adminDashboard.filters.active')}</option>
                <option value="inactive">{t('adminDashboard.filters.inactive')}</option>
              </select>

              <select
                value={filters.sort_by}
                onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="created_at">{t('adminDashboard.filters.createdAt')}</option>
                <option value="name">{t('adminDashboard.filters.name')}</option>
                <option value="user_count">{t('adminDashboard.filters.users')}</option>
                <option value="revenue">{t('adminDashboard.filters.revenue')}</option>
              </select>

              <select
                value={filters.sort_order}
                onChange={(e) => handleFilterChange('sort_order', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="desc">{t('adminDashboard.filters.newest')}</option>
                <option value="asc">{t('adminDashboard.filters.oldest')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="px-6 pb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('adminDashboard.table.tenant')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.users')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('adminDashboard.table.orders')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('adminDashboard.table.revenue')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('adminDashboard.table.lastActivity')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedTenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {tenant.logo_url ? (
                            <img
                              className="h-10 w-10 rounded-lg object-cover"
                              src={tenant.logo_url}
                              alt={tenant.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-orange-500 flex items-center justify-center">
                              <span className="text-white font-bold">
                                {tenant.name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                          <div className="text-sm text-gray-500">{tenant.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          tenant.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {tenant.is_active ? t('adminDashboard.filters.active') : t('adminDashboard.filters.inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tenant.stats.user_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tenant.stats.order_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      R$ {tenant.stats.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(tenant.stats.last_active).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedTenant(tenant)}
                          className="text-gray-400 hover:text-gray-600"
                          title={t('common.view')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTenant(tenant)
                            setShowEditModal(true)
                          }}
                          className="text-gray-400 hover:text-gray-600"
                          title={t('common.edit')}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleTenantStatus(tenant.id)}
                          className={`${
                            tenant.is_active
                              ? 'text-gray-400 hover:text-red-600'
                              : 'text-gray-400 hover:text-green-600'
                          }`}
                          title={tenant.is_active ? t('common.deactivate') : t('common.activate')}
                        >
                          {tenant.is_active ? (
                            <PowerOff className="w-4 h-4" />
                          ) : (
                            <Power className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTenant(tenant)
                            setShowDeleteModal(true)
                          }}
                          className="text-gray-400 hover:text-red-600"
                          title={t('common.delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedTenants.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">{t('adminDashboard.empty.title')}</h3>
              <p className="mt-1 text-sm text-gray-500">
                {t('adminDashboard.empty.description')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Tenant Modal */}
      {showCreateModal && (
        <CreateTenantModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  )
}
