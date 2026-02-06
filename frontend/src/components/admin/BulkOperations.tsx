import React, { useState } from 'react'
import { 
  CheckSquare, 
  Square, 
  Trash2, 
  Power, 
  PowerOff, 
  Download, 
  Upload,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  MoreVertical,
  Eye,
  Edit
} from 'lucide-react'
import { useAdminStore } from '@/stores/adminStore'
import { TenantWithStats } from '@/types/admin'

interface BulkOperationsProps {
  selectedTenants: string[]
  onSelectionChange: (tenantIds: string[]) => void
  tenants: TenantWithStats[]
}

interface BulkAction {
  id: string
  label: string
  icon: React.ElementType
  color: string
  bgColor: string
  action: (tenantIds: string[]) => Promise<void>
  requiresConfirmation?: boolean
  confirmationMessage?: string
  danger?: boolean
}

export function BulkOperations({ selectedTenants, onSelectionChange, tenants }: BulkOperationsProps) {
  const { bulkToggleTenantStatus, bulkDeleteTenants, isLoading } = useAdminStore()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingAction, setPendingAction] = useState<BulkAction | null>(null)
  const [operationStatus, setOperationStatus] = useState<{
    type: 'success' | 'error' | 'warning' | null
    message: string
    details?: any
  } | null>(null)

  const bulkActions: BulkAction[] = [
    {
      id: 'activate',
      label: 'Ativar Selecionados',
      icon: Power,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      action: async (tenantIds) => {
        await bulkToggleTenantStatus(tenantIds, true)
        setOperationStatus({
          type: 'success',
          message: `${tenantIds.length} tenants ativados com sucesso`
        })
      },
      requiresConfirmation: true,
      confirmationMessage: 'Tem certeza que deseja ativar os tenants selecionados?'
    },
    {
      id: 'deactivate',
      label: 'Desativar Selecionados',
      icon: PowerOff,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      action: async (tenantIds) => {
        await bulkToggleTenantStatus(tenantIds, false)
        setOperationStatus({
          type: 'warning',
          message: `${tenantIds.length} tenants desativados`
        })
      },
      requiresConfirmation: true,
      confirmationMessage: 'Tem certeza que deseja desativar os tenants selecionados? Isso afetará o acesso dos usuários.'
    },
    {
      id: 'delete',
      label: 'Excluir Selecionados',
      icon: Trash2,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      action: async (tenantIds) => {
        await bulkDeleteTenants(tenantIds)
        setOperationStatus({
          type: 'success',
          message: `${tenantIds.length} tenants excluídos permanentemente`
        })
        onSelectionChange([]) // Limpar seleção após exclusão
      },
      requiresConfirmation: true,
      confirmationMessage: '⚠️ ATENÇÃO: Esta ação não pode ser desfeita! Todos os dados dos tenants selecionados serão permanentemente excluídos.',
      danger: true
    },
    {
      id: 'export',
      label: 'Exportar Selecionados',
      icon: Download,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      action: async (tenantIds) => {
        await exportSelectedTenants(tenantIds)
        setOperationStatus({
          type: 'success',
          message: `${tenantIds.length} tenants exportados com sucesso`
        })
      }
    }
  ]

  const handleSelectAll = () => {
    if (selectedTenants.length === tenants.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(tenants.map(t => t.id))
    }
  }

  const handleSelectTenant = (tenantId: string) => {
    if (selectedTenants.includes(tenantId)) {
      onSelectionChange(selectedTenants.filter(id => id !== tenantId))
    } else {
      onSelectionChange([...selectedTenants, tenantId])
    }
  }

  const executeBulkAction = async (action: BulkAction) => {
    if (action.requiresConfirmation) {
      setPendingAction(action)
      setShowConfirmDialog(true)
    } else {
      await action.action(selectedTenants)
    }
  }

  const confirmAction = async () => {
    if (pendingAction) {
      try {
        await pendingAction.action(selectedTenants)
        setShowConfirmDialog(false)
        setPendingAction(null)
      } catch (error) {
        setOperationStatus({
          type: 'error',
          message: 'Erro ao executar ação em lote',
          details: error
        })
      }
    }
  }

  const exportSelectedTenants = async (tenantIds: string[]) => {
    const selectedTenantsData = tenants.filter(t => tenantIds.includes(t.id))
    
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

  const getSelectedTenantsSummary = () => {
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

  const summary = getSelectedTenantsSummary()

  return (
    <div className="space-y-4">
      {/* Selection Controls */}
      <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            {selectedTenants.length === tenants.length ? (
              <CheckSquare className="w-4 h-4 text-orange-500" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            Selecionar Todos ({tenants.length})
          </button>

          {selectedTenants.length > 0 && (
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
              <span>{summary.users.toLocaleString()} usuários</span>
              <span>R$ {summary.revenue.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedTenants.length > 0 && (
          <div className="flex items-center gap-2">
            {bulkActions.map((action) => (
              <button
                key={action.id}
                onClick={() => executeBulkAction(action)}
                disabled={isLoading}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                  action.danger
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : `${action.bgColor} ${action.color} hover:opacity-80`
                }`}
              >
                <action.icon className="w-4 h-4" />
                {action.label}
              </button>
            ))}
          </div>
        )}
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

      {/* Selected Tenants List */}
      {selectedTenants.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">Tenants Selecionados ({selectedTenants.length})</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {tenants
              .filter(tenant => selectedTenants.includes(tenant.id))
              .map((tenant) => (
                <div key={tenant.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleSelectTenant(tenant.id)}
                      className="text-orange-500"
                    >
                      <CheckSquare className="w-4 h-4" />
                    </button>
                    <div>
                      <p className="font-medium text-gray-900">{tenant.name}</p>
                      <p className="text-sm text-gray-600">{tenant.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {tenant.stats.user_count} usuários
                      </p>
                      <p className="text-sm text-gray-600">
                        R$ {tenant.stats.revenue.toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      tenant.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {tenant.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && pendingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowConfirmDialog(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${pendingAction.bgColor}`}>
                <pendingAction.icon className={`w-5 h-5 ${pendingAction.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Confirmar Ação em Lote
              </h3>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600">
                {pendingAction.confirmationMessage}
              </p>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-900 mb-2">
                  Esta ação afetará {selectedTenants.length} tenants:
                </p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {tenants
                    .filter(t => selectedTenants.includes(t.id))
                    .map(tenant => (
                      <div key={tenant.id} className="text-sm text-gray-600">
                        • {tenant.name} ({tenant.email})
                      </div>
                    ))}
                </div>
              </div>

              {pendingAction.danger && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium">Ação Irreversível</span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">
                    Esta ação não pode ser desfeita e resultará na perda permanente de dados.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmAction}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg text-white font-medium disabled:opacity-50 ${
                  pendingAction.danger
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-orange-500 hover:bg-orange-600'
                }`}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Confirmar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
