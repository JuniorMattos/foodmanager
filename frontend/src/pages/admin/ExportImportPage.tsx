import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Database, 
  Download, 
  Upload, 
  History, 
  Settings, 
  Calendar,
  Filter,
  Search,
  RefreshCw,
  FileText,
  FileSpreadsheet,
  Archive,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  Trash2,
  DownloadCloud
} from 'lucide-react'
import { useAdminStore } from '@/stores/adminStore'
import { ExportImportManager } from '@/components/admin/ExportImportManager'
import { TenantWithStats } from '@/types/admin'

interface ExportHistory {
  id: string
  filename: string
  format: string
  size: number
  records: number
  created_at: string
  created_by: string
  filters: any
  status: 'completed' | 'processing' | 'failed'
  download_url?: string
}

interface ImportHistory {
  id: string
  filename: string
  format: string
  size: number
  records: number
  processed: number
  created: number
  updated: number
  errors: string[]
  created_at: string
  created_by: string
  status: 'completed' | 'processing' | 'failed'
}

export default function ExportImportPage() {
  const { t } = useTranslation()
  const { tenants, fetchTenants, isLoading } = useAdminStore()
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'history'>('export')
  const [exportHistory, setExportHistory] = useState<ExportHistory[]>([])
  const [importHistory, setImportHistory] = useState<ImportHistory[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'processing' | 'failed'>('all')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ExportHistory | ImportHistory | null>(null)

  const getItemRecordsCount = (item: ExportHistory | ImportHistory) => {
    if ('processed' in item) return item.processed
    return item.records
  }

  useEffect(() => {
    fetchTenants()
    fetchHistory()
  }, [fetchTenants])

  const fetchHistory = async () => {
    try {
      // Mock data - substituir com API real
      const mockExportHistory: ExportHistory[] = [
        {
          id: '1',
          filename: 'tenants-export-2024-01-15.csv',
          format: 'csv',
          size: 245760,
          records: 156,
          created_at: '2024-01-15T10:30:00Z',
          created_by: 'admin@foodmanager.com',
          filters: { status: 'all', plan: 'all' },
          status: 'completed',
          download_url: '/api/exports/tenants-export-2024-01-15.csv'
        },
        {
          id: '2',
          filename: 'tenants-export-2024-01-10.xlsx',
          format: 'xlsx',
          size: 512000,
          records: 142,
          created_at: '2024-01-10T15:45:00Z',
          created_by: 'admin@foodmanager.com',
          filters: { status: 'active', plan: 'premium' },
          status: 'completed',
          download_url: '/api/exports/tenants-export-2024-01-10.xlsx'
        },
        {
          id: '3',
          filename: 'tenants-export-2024-01-05.json',
          format: 'json',
          size: 1024000,
          records: 189,
          created_at: '2024-01-05T09:20:00Z',
          created_by: 'admin@foodmanager.com',
          filters: { status: 'all', plan: 'enterprise' },
          status: 'failed'
        }
      ]

      const mockImportHistory: ImportHistory[] = [
        {
          id: '1',
          filename: 'tenants-import-2024-01-12.csv',
          format: 'csv',
          size: 128000,
          records: 45,
          processed: 45,
          created: 15,
          updated: 30,
          errors: [],
          created_at: '2024-01-12T14:30:00Z',
          created_by: 'admin@foodmanager.com',
          status: 'completed'
        },
        {
          id: '2',
          filename: 'tenants-import-2024-01-08.json',
          format: 'json',
          size: 256000,
          records: 67,
          processed: 67,
          created: 20,
          updated: 47,
          errors: ['Tenant já existe: burger-express'],
          created_at: '2024-01-08T11:15:00Z',
          created_by: 'admin@foodmanager.com',
          status: 'completed'
        },
        {
          id: '3',
          filename: 'tenants-import-2024-01-03.sql',
          format: 'sql',
          size: 512000,
          records: 89,
          processed: 0,
          created: 0,
          updated: 0,
          errors: ['Formato SQL inválido', 'Sintaxe incorreta na linha 23'],
          created_at: '2024-01-03T16:45:00Z',
          created_by: 'admin@foodmanager.com',
          status: 'failed'
        }
      ]

      setExportHistory(mockExportHistory)
      setImportHistory(mockImportHistory)
    } catch (error) {
      console.error('Error fetching history:', error)
    }
  }

  const handleImportComplete = () => {
    fetchHistory()
    fetchTenants()
  }

  const handleDownload = async (item: ExportHistory) => {
    if (item.download_url) {
      window.open(item.download_url, '_blank')
    }
  }

  const handleDelete = async (item: ExportHistory | ImportHistory) => {
    setSelectedItem(item)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!selectedItem) return

    try {
      // Mock delete - substituir com API real
      if ('download_url' in selectedItem) {
        setExportHistory(prev => prev.filter(item => item.id !== selectedItem.id))
      } else {
        setImportHistory(prev => prev.filter(item => item.id !== selectedItem.id))
      }
      
      setShowDeleteDialog(false)
      setSelectedItem(null)
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  const filteredExportHistory = exportHistory.filter(item => {
    const matchesSearch = item.filename.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const filteredImportHistory = importHistory.filter(item => {
    const matchesSearch = item.filename.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getFileIcon = (format: string) => {
    switch (format) {
      case 'csv':
        return <FileSpreadsheet className="w-5 h-5 text-green-600" />
      case 'xlsx':
        return <FileSpreadsheet className="w-5 h-5 text-blue-600" />
      case 'json':
        return <FileText className="w-5 h-5 text-yellow-600" />
      case 'sql':
        return <Database className="w-5 h-5 text-purple-600" />
      default:
        return <FileText className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Concluído</span>
      case 'processing':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Processando</span>
      case 'failed':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Falhou</span>
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{status}</span>
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Export/Import</h1>
          <p className="text-gray-600">Gerencie backup e restauração de dados dos tenants</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={fetchHistory}
            disabled={isLoading}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('export')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'export'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Download className="w-4 h-4 inline mr-2" />
              Export
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'import'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Import
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <History className="w-4 h-4 inline mr-2" />
              Histórico
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Export/Import Manager */}
          {(activeTab === 'export' || activeTab === 'import') && (
            <ExportImportManager
              tenants={tenants}
              onImportComplete={handleImportComplete}
            />
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Buscar arquivos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">Todos os status</option>
                    <option value="completed">Concluídos</option>
                    <option value="processing">Processando</option>
                    <option value="failed">Falharam</option>
                  </select>
                </div>
              </div>

              {/* Export History */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Exportações</h3>
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Arquivo
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Formato
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Registros
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tamanho
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Data
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredExportHistory.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {getFileIcon(item.format)}
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{item.filename}</div>
                                  <div className="text-sm text-gray-500">{item.created_by}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-900 uppercase">{item.format}</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {item.records.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {formatFileSize(item.size)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {new Date(item.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              {getStatusBadge(item.status)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {item.status === 'completed' && item.download_url && (
                                  <button
                                    onClick={() => handleDownload(item)}
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    <DownloadCloud className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDelete(item)}
                                  className="text-red-600 hover:text-red-800"
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
                  
                  {filteredExportHistory.length === 0 && (
                    <div className="text-center py-12">
                      <Archive className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">{t('exportImport.noExportFound')}</h3>
                      <p className="mt-1 text-sm text-gray-500">{t('exportImport.startExporting')}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Import History */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('exportImport.importHistory')}</h3>
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('exportImport.table.file')}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('exportImport.table.format')}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('exportImport.table.records')}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('exportImport.table.processed')}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('exportImport.table.createdUpdated')}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('exportImport.table.date')}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('exportImport.table.status')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredImportHistory.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {getFileIcon(item.format)}
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{item.filename}</div>
                                  <div className="text-sm text-gray-500">{item.created_by}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-900 uppercase">{item.format}</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {item.records.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {item.processed.toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm">
                                <span className="text-green-600">{item.created} criados</span>
                                <span className="text-gray-400"> / </span>
                                <span className="text-blue-600">{item.updated} atualizados</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {new Date(item.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              {getStatusBadge(item.status)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {filteredImportHistory.length === 0 && (
                    <div className="text-center py-12">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma importação encontrada</h3>
                      <p className="mt-1 text-sm text-gray-500">Comece importando dados dos tenants.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowDeleteDialog(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Confirmar Exclusão
              </h3>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600">
                Tem certeza que deseja excluir permanentemente este arquivo?
              </p>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-900">
                  {selectedItem.filename}
                </p>
                <p className="text-sm text-gray-600">
                  {'processed' in selectedItem ? 'Importação' : 'Exportação'} • {getItemRecordsCount(selectedItem)} registros
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-medium">Ação Irreversível</span>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
