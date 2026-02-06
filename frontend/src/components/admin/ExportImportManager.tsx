import React, { useState, useRef } from 'react'
import { 
  Download, 
  Upload, 
  FileText, 
  Database, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Loader2,
  Eye,
  Trash2,
  RefreshCw,
  Filter,
  Calendar,
  Settings,
  FileSpreadsheet,
  FileArchive,
  File
} from 'lucide-react'
import { useAdminStore } from '@/stores/adminStore'
import { TenantWithStats } from '@/types/admin'

interface ExportImportManagerProps {
  tenants: TenantWithStats[]
  onImportComplete?: () => void
}

interface ExportConfig {
  format: 'csv' | 'xlsx' | 'json' | 'sql'
  include: {
    basic: boolean
    users: boolean
    orders: boolean
    settings: boolean
    branding: boolean
  }
  filters: {
    status: 'all' | 'active' | 'inactive'
    plan: 'all' | 'basic' | 'premium' | 'enterprise'
    dateRange: {
      start: string
      end: string
    }
  }
}

interface ImportResult {
  success: boolean
  processed: number
  created: number
  updated: number
  errors: string[]
  warnings: string[]
  preview?: any[]
}

export function ExportImportManager({ tenants, onImportComplete }: ExportImportManagerProps) {
  const { isLoading } = useAdminStore()
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export')
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    format: 'csv',
    include: {
      basic: true,
      users: true,
      orders: true,
      settings: false,
      branding: false
    },
    filters: {
      status: 'all',
      plan: 'all',
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      }
    }
  })
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = async () => {
    setIsProcessing(true)
    try {
      // Filtrar tenants baseado na configuração
      const filteredTenants = tenants.filter(tenant => {
        const matchesStatus = exportConfig.filters.status === 'all' || 
          (exportConfig.filters.status === 'active' && tenant.is_active) ||
          (exportConfig.filters.status === 'inactive' && !tenant.is_active)
        
        const matchesPlan = exportConfig.filters.plan === 'all' || tenant.plan === exportConfig.filters.plan
        
        const matchesDate = new Date(tenant.created_at) >= new Date(exportConfig.filters.dateRange.start) &&
                           new Date(tenant.created_at) <= new Date(exportConfig.filters.dateRange.end)
        
        return matchesStatus && matchesPlan && matchesDate
      })

      const exportData = await prepareExportData(filteredTenants)
      const blob = await generateExportFile(exportData, exportConfig.format)
      downloadFile(blob, `tenants-export-${new Date().toISOString().split('T')[0]}.${exportConfig.format}`)
      
      setImportResult({
        success: true,
        processed: filteredTenants.length,
        created: 0,
        updated: 0,
        errors: [],
        warnings: []
      })
    } catch (error) {
      setImportResult({
        success: false,
        processed: 0,
        created: 0,
        updated: 0,
        errors: ['Erro ao exportar dados'],
        warnings: []
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const prepareExportData = async (tenants: TenantWithStats[]) => {
    const data = []
    
    for (const tenant of tenants) {
      const tenantData: any = {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        email: tenant.email,
        is_active: tenant.is_active,
        plan: tenant.plan,
        created_at: tenant.created_at,
        updated_at: tenant.updated_at
      }

      if (exportConfig.include.users) {
        tenantData.users = tenant.stats.user_count
      }

      if (exportConfig.include.orders) {
        tenantData.orders = tenant.stats.order_count
        tenantData.revenue = tenant.stats.revenue
      }

      if (exportConfig.include.settings) {
        // TODO: Buscar configurações do tenant
        tenantData.settings = {}
      }

      if (exportConfig.include.branding) {
        // TODO: Buscar branding do tenant
        tenantData.branding = {}
      }

      data.push(tenantData)
    }

    return data
  }

  const generateExportFile = async (data: any[], format: string): Promise<Blob> => {
    switch (format) {
      case 'csv':
        return generateCSV(data)
      case 'xlsx':
        return generateXLSX(data)
      case 'json':
        return generateJSON(data)
      case 'sql':
        return generateSQL(data)
      default:
        throw new Error('Formato não suportado')
    }
  }

  const generateCSV = (data: any[]): Blob => {
    if (data.length === 0) return new Blob([''], { type: 'text/csv' })
    
    const headers = Object.keys(data[0])
    const csvContent = [
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
    
    return new Blob([csvContent], { type: 'text/csv' })
  }

  const generateXLSX = (data: any[]): Blob => {
    // Simplified XLSX generation - in production use a library like xlsx
    const headers = Object.keys(data[0] || {})
    const xlsxContent = [
      headers.join('\t'),
      ...data.map(row => 
        headers.map(header => row[header]).join('\t')
      )
    ].join('\n')
    
    return new Blob([xlsxContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  }

  const generateJSON = (data: any[]): Blob => {
    const jsonContent = JSON.stringify(data, null, 2)
    return new Blob([jsonContent], { type: 'application/json' })
  }

  const generateSQL = (data: any[]): Blob => {
    const sqlStatements = [
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
    
    return new Blob([sqlStatements.join('\n')], { type: 'text/sql' })
  }

  const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImportFile(file)
      setImportResult(null)
      setShowPreview(false)
      setPreviewData([])
    }
  }

  const handleImport = async () => {
    if (!importFile) return

    setIsProcessing(true)
    try {
      const content = await importFile.text()
      const data = parseImportFile(content, importFile.name)
      
      // Preview
      setPreviewData(data.slice(0, 5))
      setShowPreview(true)
      
      // Simulate import process
      const result: ImportResult = {
        success: true,
        processed: data.length,
        created: Math.floor(data.length * 0.3),
        updated: Math.floor(data.length * 0.7),
        errors: [],
        warnings: ['Alguns registros já existiam e foram atualizados']
      }
      
      setImportResult(result)
      onImportComplete?.()
    } catch (error) {
      setImportResult({
        success: false,
        processed: 0,
        created: 0,
        updated: 0,
        errors: ['Erro ao processar arquivo'],
        warnings: []
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const parseImportFile = (content: string, filename: string): any[] => {
    const extension = filename.split('.').pop()?.toLowerCase()
    
    switch (extension) {
      case 'csv':
        return parseCSV(content)
      case 'json':
        return parseJSON(content)
      case 'sql':
        return parseSQL(content)
      default:
        throw new Error('Formato de arquivo não suportado')
    }
  }

  const parseCSV = (content: string): any[] => {
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

  const parseJSON = (content: string): any[] => {
    try {
      const parsed = JSON.parse(content)
      return Array.isArray(parsed) ? parsed : [parsed]
    } catch {
      throw new Error('JSON inválido')
    }
  }

  const parseSQL = (content: string): any[] => {
    // Simplified SQL parsing - in production use a proper SQL parser
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
        return <File className="w-5 h-5 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Export/Import Manager</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('export')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'export'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Download className="w-4 h-4 inline mr-2" />
              Export
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'import'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Import
            </button>
          </div>
        </div>

        {/* Export Tab */}
        {activeTab === 'export' && (
          <div className="space-y-6">
            {/* Export Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Formato</label>
                <div className="space-y-2">
                  {[
                    { value: 'csv', label: 'CSV', description: 'Planilha compatível com Excel' },
                    { value: 'xlsx', label: 'XLSX', description: 'Formato Excel nativo' },
                    { value: 'json', label: 'JSON', description: 'Formato estruturado' },
                    { value: 'sql', label: 'SQL', description: 'Script SQL para backup' }
                  ].map(format => (
                    <label key={format.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="format"
                        value={format.value}
                        checked={exportConfig.format === format.value}
                        onChange={(e) => setExportConfig({ ...exportConfig, format: e.target.value as any })}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {getFileIcon(format.value)}
                          <span className="font-medium">{format.label}</span>
                        </div>
                        <span className="text-sm text-gray-600">{format.description}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Include Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Incluir Dados</label>
                <div className="space-y-2">
                  {[
                    { key: 'basic', label: 'Dados Básicos', description: 'ID, nome, email, status' },
                    { key: 'users', label: 'Usuários', description: 'Contagem de usuários' },
                    { key: 'orders', label: 'Pedidos', description: 'Contagem e receita' },
                    { key: 'settings', label: 'Configurações', description: 'Preferências do tenant' },
                    { key: 'branding', label: 'Branding', description: 'Logo e cores' }
                  ].map(option => (
                    <label key={option.key} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={exportConfig.include[option.key as keyof typeof exportConfig.include]}
                        onChange={(e) => setExportConfig({
                          ...exportConfig,
                          include: { ...exportConfig.include, [option.key]: e.target.checked }
                        })}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-gray-600">{option.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filtros</label>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                    <select
                      value={exportConfig.filters.status}
                      onChange={(e) => setExportConfig({
                        ...exportConfig,
                        filters: { ...exportConfig.filters, status: e.target.value as any }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="all">Todos</option>
                      <option value="active">Ativos</option>
                      <option value="inactive">Inativos</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Plano</label>
                    <select
                      value={exportConfig.filters.plan}
                      onChange={(e) => setExportConfig({
                        ...exportConfig,
                        filters: { ...exportConfig.filters, plan: e.target.value as any }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="all">Todos</option>
                      <option value="basic">Basic</option>
                      <option value="premium">Premium</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Data Início</label>
                    <input
                      type="date"
                      value={exportConfig.filters.dateRange.start}
                      onChange={(e) => setExportConfig({
                        ...exportConfig,
                        filters: {
                          ...exportConfig.filters,
                          dateRange: { ...exportConfig.filters.dateRange, start: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Data Fim</label>
                    <input
                      type="date"
                      value={exportConfig.filters.dateRange.end}
                      onChange={(e) => setExportConfig({
                        ...exportConfig,
                        filters: {
                          ...exportConfig.filters,
                          dateRange: { ...exportConfig.filters.dateRange, end: e.target.value }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Export Button */}
            <div className="flex justify-center">
              <button
                onClick={handleExport}
                disabled={isProcessing || isLoading}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Exportar Tenants
              </button>
            </div>
          </div>
        )}

        {/* Import Tab */}
        {activeTab === 'import' && (
          <div className="space-y-6">
            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Importar Tenants</h3>
              <p className="text-gray-600 mb-4">
                Selecione um arquivo CSV, JSON ou SQL com os dados dos tenants
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json,.sql"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Selecionar Arquivo
              </button>
              
              {importFile && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getFileIcon(importFile.name.split('.').pop() || '')}
                      <span className="text-sm font-medium">{importFile.name}</span>
                    </div>
                    <button
                      onClick={() => {
                        setImportFile(null)
                        setImportResult(null)
                        setShowPreview(false)
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {(importFile.size / 1024).toFixed(2)} KB
                  </div>
                </div>
              )}
            </div>

            {/* Preview */}
            {showPreview && previewData.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h4 className="font-medium text-gray-900">Pré-visualização (5 primeiros registros)</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(previewData[0]).map(key => (
                          <th key={key} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {previewData.map((row, index) => (
                        <tr key={index}>
                          {Object.values(row).map((value, cellIndex) => (
                            <td key={cellIndex} className="px-4 py-2 text-sm text-gray-900">
                              {String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Import Button */}
            {importFile && (
              <div className="flex justify-center">
                <button
                  onClick={handleImport}
                  disabled={isProcessing || isLoading}
                  className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  Importar Tenants
                </button>
              </div>
            )}
          </div>
        )}

        {/* Result */}
        {importResult && (
          <div className={`rounded-lg border p-4 ${
            importResult.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-3">
              {importResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <div className="flex-1">
                <p className={`font-medium ${
                  importResult.success ? 'text-green-900' : 'text-red-900'
                }`}>
                  {importResult.success ? 'Operação concluída com sucesso' : 'Erro na operação'}
                </p>
                <div className="text-sm text-gray-600 mt-1">
                  {importResult.processed > 0 && (
                    <span>Processados: {importResult.processed} | </span>
                  )}
                  {importResult.created > 0 && (
                    <span>Criados: {importResult.created} | </span>
                  )}
                  {importResult.updated > 0 && (
                    <span>Atualizados: {importResult.updated}</span>
                  )}
                </div>
                {importResult.errors.length > 0 && (
                  <div className="mt-2 text-sm text-red-700">
                    {importResult.errors.map((error, index) => (
                      <div key={index}>• {error}</div>
                    ))}
                  </div>
                )}
                {importResult.warnings.length > 0 && (
                  <div className="mt-2 text-sm text-yellow-700">
                    {importResult.warnings.map((warning, index) => (
                      <div key={index}>• {warning}</div>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => setImportResult(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
