import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Users, 
  Building2, 
  Search, 
  Filter, 
  Download, 
  Upload,
  CheckSquare,
  Square,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Power,
  PowerOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { useAdminStore } from '@/stores/adminStore'
import { BulkOperations } from '@/components/admin/BulkOperations'
import { TenantWithStats, TenantFilters } from '@/types/admin'

export default function BulkOperationsPage() {
  const { t } = useTranslation()
  const {
    tenants,
    fetchTenants,
    bulkToggleTenantStatus,
    bulkDeleteTenants,
    isLoading
  } = useAdminStore()

  const [selectedTenants, setSelectedTenants] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<TenantFilters>({
    search: '',
    status: 'all',
    plan: 'all',
    sort_by: 'name',
    sort_order: 'asc',
    created_at: 'all'
  })
  const [showFilters, setShowFilters] = useState(false)
  const [operationStatus, setOperationStatus] = useState<{
    type: 'success' | 'error' | 'warning' | null
    message: string
    details?: any
  } | null>(null)

  useEffect(() => {
    fetchTenants()
  }, [fetchTenants])

  const handleSelectionChange = (tenantIds: string[]) => {
    setSelectedTenants(tenantIds)
  }

  const handleSelectAll = () => {
    if (selectedTenants.length === filteredTenants.length) {
      setSelectedTenants([])
    } else {
      setSelectedTenants(filteredTenants.map(t => t.id))
    }
  }

  const handleSelectTenant = (tenantId: string) => {
    if (selectedTenants.includes(tenantId)) {
      setSelectedTenants(selectedTenants.filter(id => id !== tenantId))
    } else {
      setSelectedTenants([...selectedTenants, tenantId])
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedTenants.length === 0) {
      setOperationStatus({
        type: 'warning',
        message: 'Nenhum tenant selecionado'
      })
      return
    }

    try {
      switch (action) {
        case 'activate':
          await bulkToggleTenantStatus(selectedTenants, true)
          setOperationStatus({
            type: 'success',
            message: `${selectedTenants.length} tenants ativados com sucesso`
          })
          break
        case 'deactivate':
          await bulkToggleTenantStatus(selectedTenants, false)
          setOperationStatus({
            type: 'warning',
            message: `${selectedTenants.length} tenants desativados`
          })
          break
        case 'delete':
          await bulkDeleteTenants(selectedTenants)
          setOperationStatus({
            type: 'success',
            message: `${selectedTenants.length} tenants excluídos permanentemente`
          })
          setSelectedTenants([])
          break
        case 'export':
          await exportSelectedTenants()
          setOperationStatus({
            type: 'success',
            message: `${selectedTenants.length} tenants exportados com sucesso`
          })
          break
      }
    } catch (error) {
      setOperationStatus({
        type: 'error',
        message: 'Erro ao executar ação em lote',
        details: error
      })
    }
  }

  const exportSelectedTenants = async () => {
    const selectedTenantsData = tenants.filter(t => selectedTenants.includes(t.id))
    
    const csv = [
      'ID,Nome,Slug,Email,Status,Plano,Usuários,Pedidos,Receita,Criado em',
      ...selectedTenantsData.map(tenant => [
        tenant.id,
        tenant.name,
        tenant.slug,
        tenant.email,
        tenant.is_active ? 'Ativo' : 'Inativo',
        tenant.plan || 'basic',
        tenant.stats.user_count,
        tenant.stats.order_count,
        tenant.stats.revenue.toFixed(2),
        tenant.created_at
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tenants-bulk-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const importTenants = async (file: File) => {
    // TODO: Implementar import functionality
    console.log('Import tenants:', file)
  }

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filters.status === 'all' || 
                         (filters.status === 'active' && tenant.is_active) ||
                         (filters.status === 'inactive' && !tenant.is_active)
    
    const matchesPlan = filters.plan === 'all' || tenant.plan === filters.plan

    return matchesSearch && matchesStatus && matchesPlan
  })

  const getBulkActionsSummary = () => {
    if (selectedTenants.length === 0) return null

    const selectedData = tenants.filter(t => selectedTenants.includes(t.id))
    const activeCount = selectedData.filter(t => t.is_active).length
    const inactiveCount = selectedData.length - activeCount
    const totalUsers = selectedData.reduce((sum, t) => sum + t.stats.user_count, 0)
    const totalRevenue = selectedData.reduce((sum, t) => sum + t.stats.revenue, 0)

    return {
      total: selectedTenants.length,
      active: activeCount,
      inactive: inactiveCount,
      users: totalUsers,
      revenue: totalRevenue
    }
  }

  const summary = getBulkActionsSummary()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('bulkOperations.title')}</h1>
          <p className="text-gray-600">{t('bulkOperations.subtitle')}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchTenants()}
            disabled={isLoading}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {t('common.refresh')}
          </button>
          
          <label className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            {t('bulkOperations.importCsv')}
            <input
              type="file"
              accept=".csv"
              onChange={(e) => e.target.files?.[0] && importTenants(e.target.files[0])}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar tenants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">Todos</option>
                  <option value="active">Ativos</option>
                  <option value="inactive">Inativos</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plano</label>
                <select
                  value={filters.plan}
                  onChange={(e) => setFilters({ ...filters, plan: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">Todos</option>
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar</label>
                <select
                  value={`${filters.sort_by}-${filters.sort_order}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-')
                    setFilters({ ...filters, sort_by: sortBy as any, sort_order: sortOrder as any })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="name-asc">Nome (A-Z)</option>
                  <option value="name-desc">Nome (Z-A)</option>
                  <option value="created_at-desc">Mais recentes</option>
                  <option value="created_at-asc">Mais antigos</option>
                  <option value="stats.user_count-desc">Mais usuários</option>
                  <option value="stats.revenue-desc">Maior receita</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Operations Component */}
      <BulkOperations
        selectedTenants={selectedTenants}
        onSelectionChange={handleSelectionChange}
        tenants={filteredTenants}
      />

      {/* Tenants Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Tenants ({filteredTenants.length})
            </h3>
            
            {summary && (
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{summary.total} selecionados</span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  {summary.active} ativos
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  {summary.inactive} inativos
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {selectedTenants.length === filteredTenants.length ? (
                      <CheckSquare className="w-4 h-4 text-orange-500" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                    Tenant
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuários
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pedidos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receita
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Criado em
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleSelectTenant(tenant.id)}
                        className="text-orange-500"
                      >
                        {selectedTenants.includes(tenant.id) ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                        <div className="text-sm text-gray-500">{tenant.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      tenant.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {tenant.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {tenant.stats.user_count.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {tenant.stats.order_count.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    R$ {tenant.stats.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(tenant.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="text-gray-400 hover:text-gray-600">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Operation Status */}
      {operationStatus && (
        <div className={`rounded-lg border p-4 ${
          operationStatus.type === 'success' ? 'bg-green-50 border-green-200' :
          operationStatus.type === 'error' ? 'bg-red-50 border-red-200' :
          operationStatus.type === 'warning' ? 'bg-orange-50 border-orange-200' :
          'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center gap-3">
            {operationStatus.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
            {operationStatus.type === 'error' && <XCircle className="w-5 h-5 text-red-600" />}
            {operationStatus.type === 'warning' && <AlertTriangle className="w-5 h-5 text-orange-600" />}
            <div>
              <p className={`font-medium ${
                operationStatus.type === 'success' ? 'text-green-900' :
                operationStatus.type === 'error' ? 'text-red-900' :
                operationStatus.type === 'warning' ? 'text-orange-900' :
                'text-blue-900'
              }`}>
                {operationStatus.message}
              </p>
              {operationStatus.details && (
                <p className="text-sm text-gray-600 mt-1">
                  {JSON.stringify(operationStatus.details)}
                </p>
              )}
            </div>
            <button
              onClick={() => setOperationStatus(null)}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
