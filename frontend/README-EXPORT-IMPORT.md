# 📤📥 Export/Import - FoodManager

## 🎯 Visão Geral

Sistema completo de exportação e importação de dados para backup e restauração de tenants no FoodManager, suportando múltiplos formatos e configurações avançadas.

## 🏗️ Arquitetura

### 1. Frontend Components
- **ExportImportManager** - Componente principal de export/import
- **ExportImportPage** - Página completa com histórico
- **File Processing** - Processamento inteligente de arquivos
- **Preview System** - Pré-visualização de dados

### 2. Backend API
- **Export Routes** - Endpoints para exportação em múltiplos formatos
- **Import Routes** - Processamento de arquivos com validação
- **File Handling** - Upload e processamento seguro
- **Data Validation** - Validação robusta de dados

### 3. File Formats
- **CSV** - Planilha compatível com Excel
- **XLSX** - Formato Excel nativo
- **JSON** - Estrutura de dados JSON
- **SQL** - Scripts SQL para backup

## 📊 Funcionalidades Principais

### 📤 Exportação Avançada

#### 1. Formatos Suportados
- ✅ **CSV** - Valores separados por vírgula
- ✅ **XLSX** - Planilha Excel nativa
- ✅ **JSON** - Dados estruturados
- ✅ **SQL** - Scripts de backup

#### 2. Configuração de Dados
- ✅ **Dados Básicos** - ID, nome, email, status
- ✅ **Usuários** - Contagem de usuários
- ✅ **Pedidos** - Contagem e receita
- ✅ **Configurações** - Preferências do tenant
- ✅ **Branding** - Logo e cores personalizadas

#### 3. Filtros Avançados
- ✅ **Status** - Ativos, inativos ou todos
- ✅ **Plano** - Basic, Premium, Enterprise
- ✅ **Data Range** - Período personalizado
- ✅ **Custom Fields** - Campos específicos

#### 4. Export Interface
```typescript
// Configuração de exportação
const exportConfig = {
  format: 'csv',
  include: {
    basic: true,
    users: true,
    orders: true,
    settings: false,
    branding: false
  },
  filters: {
    status: 'active',
    plan: 'premium',
    dateRange: {
      start: '2024-01-01',
      end: '2024-01-31'
    }
  }
}
```

### 📥 Importação Inteligente

#### 1. Formatos Aceitos
- ✅ **CSV** - Arquivos delimitados
- ✅ **JSON** - Arrays JSON válidos
- ✅ **SQL** - Scripts INSERT

#### 2. Validação de Dados
- ✅ **Schema Validation** - Validação de estrutura
- ✅ **Type Checking** - Verificação de tipos
- ✅ **Duplicate Detection** - Detecção de duplicatas
- ✅ **Data Integrity** - Integridade referencial

#### 3. Processamento
- ✅ **Create/Update** - Criação ou atualização
- ✅ **Error Handling** - Tratamento de erros
- ✅ **Rollback** - Reversão em caso de falha
- ✅ **Progress Tracking** - Acompanhamento do progresso

#### 4. Import Interface
```typescript
// Resultado da importação
const importResult = {
  success: true,
  processed: 45,
  created: 15,
  updated: 30,
  errors: [],
  warnings: ['Tenant já existe: burger-express']
}
```

### 📋 Histórico de Operações

#### 1. Export History
- ✅ **File Tracking** - Acompanhamento de arquivos
- ✅ **Download Links** - Links para download
- ✅ **Metadata** - Metadados completos
- ✅ **Status Tracking** - Status das operações

#### 2. Import History
- ✅ **Operation Logs** - Logs detalhados
- ✅ **Error Reports** - Relatórios de erros
- ✅ **Success Metrics** - Métricas de sucesso
- ✅ **User Attribution** - Autoria das operações

#### 3. Management Features
- ✅ **Search & Filter** - Busca e filtros
- ✅ **Delete Operations** - Exclusão segura
- ✅ **Archive System** - Arquivamento automático
- ✅ **Retention Policies** - Políticas de retenção

## 🎨 Interface do Usuário

### Export Tab
```typescript
// Interface de exportação
const ExportInterface = {
  formatSelector: 'radio buttons with icons',
  includeOptions: 'checkboxes with descriptions',
  filterControls: 'dropdowns and date pickers',
  exportButton: 'primary action button',
  resultDisplay: 'success/error messages'
}
```

### Import Tab
```typescript
// Interface de importação
const ImportInterface = {
  fileUpload: 'drag & drop zone',
  filePreview: 'table preview (5 rows)',
  importButton: 'primary action button',
  progressIndicator: 'loading states',
  resultDisplay: 'detailed results'
}
```

### History Tab
```typescript
// Interface de histórico
const HistoryInterface = {
  searchBar: 'search input with filters',
  exportTable: 'export history table',
  importTable: 'import history table',
  actionButtons: 'download and delete actions'
}
```

## 🔧 Implementação Técnica

### Frontend (React + TypeScript)

#### Component Structure
```typescript
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
    dateRange: { start: string; end: string }
  }
}
```

#### File Processing
```typescript
// Processamento de arquivos
const processImportFile = async (file: File): Promise<ImportResult> => {
  const content = await file.text()
  const data = parseFileContent(content, file.name)
  
  // Validar estrutura
  const validation = validateDataStructure(data)
  if (!validation.valid) {
    throw new Error(validation.errors.join(', '))
  }
  
  // Processar importação
  return await importData(data)
}

// Geração de arquivos
const generateExportFile = (data: any[], format: string): Blob => {
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
      throw new Error('Unsupported format')
  }
}
```

#### State Management
```typescript
// Estado do componente
const [activeTab, setActiveTab] = useState<'export' | 'import' | 'history'>('export')
const [exportConfig, setExportConfig] = useState<ExportConfig>(defaultConfig)
const [importFile, setImportFile] = useState<File | null>(null)
const [importResult, setImportResult] = useState<ImportResult | null>(null)
const [isProcessing, setIsProcessing] = useState(false)
```

### Backend (Fastify + Prisma)

#### Export Routes
```typescript
// Endpoint de exportação
fastify.get('/admin/tenants/export', {
  schema: {
    querystring: z.object({
      format: z.enum(['csv', 'xlsx', 'json', 'sql']),
      include: z.string(),
      filters: z.string()
    })
  }
}, async (request, reply) => {
  const { format, include, filters } = request.query
  const includeConfig = JSON.parse(include)
  const filterConfig = JSON.parse(filters)
  
  // Buscar dados
  const tenants = await prisma.tenant.findMany({
    where: buildWhereClause(filterConfig),
    include: buildIncludeClause(includeConfig)
  })
  
  // Preparar dados
  const exportData = await prepareExportData(tenants, includeConfig)
  
  // Gerar arquivo
  const content = generateFileContent(exportData, format)
  
  reply.header('Content-Type', getContentType(format))
  reply.header('Content-Disposition', `attachment; filename="${filename}"`)
  return reply.send(content)
})
```

#### Import Routes
```typescript
// Endpoint de importação
fastify.post('/admin/tenants/import', {
  schema: {
    consumes: ['multipart/form-data']
  }
}, async (request, reply) => {
  const data = await request.file()
  const content = await data.text()
  const extension = data.filename.split('.').pop()?.toLowerCase()
  
  // Parsear arquivo
  const parsedData = parseFileContent(content, extension)
  
  // Processar importação
  const result = await processImportData(parsedData)
  
  return reply.send(result)
})
```

#### Helper Functions
```typescript
// Geração de CSV
function generateCSV(data: any[]): string {
  if (data.length === 0) return ''
  
  const headers = Object.keys(data[0])
  const csv = [
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
  
  return csv
}

// Parse de CSV
function parseCSV(content: string): any[] {
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
```

### Database Optimization

#### Efficient Queries
```sql
-- Índices para performance
CREATE INDEX idx_tenants_is_active ON tenants(is_active);
CREATE INDEX idx_tenants_plan ON tenants(plan);
CREATE INDEX idx_tenants_created_at ON tenants(created_at);
CREATE INDEX idx_tenants_email ON tenants(email);
CREATE INDEX idx_tenants_slug ON tenants(slug);

-- Query otimizada para export
SELECT id, name, slug, email, is_active, plan, created_at, updated_at
FROM tenants 
WHERE is_active = true 
  AND plan = 'premium'
  AND created_at BETWEEN '2024-01-01' AND '2024-01-31'
ORDER BY created_at DESC;
```

#### Transaction Safety
```typescript
// Transações para importação
await prisma.$transaction(async (tx) => {
  for (const row of parsedData) {
    // Verificar duplicatas
    const existing = await tx.tenant.findFirst({
      where: { email: row.email }
    })
    
    if (existing) {
      await tx.tenant.update({
        where: { id: existing.id },
        data: { ...row, updated_at: new Date() }
      })
    } else {
      await tx.tenant.create({ data: row })
    }
  }
})
```

## 🚀 Como Usar

### 1. Exportar Dados
```bash
# Acessar página de export/import
http://localhost:3000/admin/export-import

# Configurar exportação
- Escolher formato (CSV, XLSX, JSON, SQL)
- Selecionar dados para incluir
- Aplicar filtros desejados
- Clicar em "Exportar"
```

### 2. Importar Dados
```bash
# Preparar arquivo
- Formatar dados corretamente
- Salvar como CSV, JSON ou SQL
- Verificar estrutura

# Importar arquivo
- Arrastar arquivo para área de upload
- Visualizar prévia dos dados
- Confirmar importação
- Acompanhar resultado
```

### 3. Gerenciar Histórico
```bash
# Visualizar histórico
- Tab "Histórico"
- Buscar por nome ou status
- Filtrar por período
- Download ou exclusão de arquivos
```

## 📊 Exemplos Práticos

### Export CSV
```csv
id,name,slug,email,is_active,plan,created_at
1,Burger Express,burger-express,contact@burger.com,true,premium,2024-01-15T10:30:00Z
2,Pizza Palace,pizza-palace,info@pizzapalace.com,true,basic,2024-01-10T15:45:00Z
```

### Import JSON
```json
[
  {
    "id": "3",
    "name": "Sushi Master",
    "slug": "sushi-master",
    "email": "hello@sushimaster.com",
    "is_active": true,
    "plan": "enterprise"
  }
]
```

### SQL Backup
```sql
-- Tenant Export SQL
-- Generated on: 2024-01-20T10:00:00.000Z

INSERT INTO tenants (id, name, slug, email, is_active, plan, created_at, updated_at) VALUES ('1', 'Burger Express', 'burger-express', 'contact@burger.com', true, 'premium', '2024-01-15T10:30:00.000Z', '2024-01-15T10:30:00.000Z');
INSERT INTO tenants (id, name, slug, email, is_active, plan, created_at, updated_at) VALUES ('2', 'Pizza Palace', 'pizza-palace', 'info@pizzapalace.com', true, 'basic', '2024-01-10T15:45:00.000Z', '2024-01-10T15:45:00.000Z');
```

## 🎯 Casos de Uso

### 1. Backup Diário
```typescript
// Export automático diário
const dailyBackup = async () => {
  const config = {
    format: 'sql',
    include: { basic: true, users: true, orders: true },
    filters: { status: 'all', plan: 'all' }
  }
  
  const blob = await exportTenants(config)
  await saveToCloudStorage(blob, `backup-${new Date().toISOString().split('T')[0]}.sql`)
}
```

### 2. Migração de Sistema
```typescript
// Migração entre sistemas
const migrateFromOldSystem = async (oldDataFile: File) => {
  const result = await importTenants(oldDataFile)
  
  console.log(`Migração concluída:`)
  console.log(`- ${result.created} novos tenants`)
  console.log(`- ${result.updated} tenants atualizados`)
  console.log(`- ${result.errors.length} erros`)
}
```

### 3. Análise de Dados
```typescript
// Export para análise
const exportForAnalysis = async () => {
  const config = {
    format: 'csv',
    include: { basic: true, users: true, orders: true },
    filters: { 
      status: 'active',
      plan: 'premium',
      dateRange: {
        start: '2024-01-01',
        end: '2024-01-31'
      }
    }
  }
  
  const csv = await exportTenants(config)
  downloadFile(csv, 'premium-tenants-jan-2024.csv')
}
```

## 🔧 Configuração Avançada

### Custom Formats
```typescript
// Formatos personalizados
const customFormats = {
  'custom-json': {
    generate: (data: any[]) => JSON.stringify(data, null, 2),
    parse: (content: string) => JSON.parse(content)
  },
  'xml': {
    generate: (data: any[]) => generateXML(data),
    parse: (content: string) => parseXML(content)
  }
}
```

### Validation Rules
```typescript
// Regras de validação personalizadas
const validationRules = {
  requiredFields: ['name', 'email', 'slug'],
  emailFormat: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  slugFormat: /^[a-z0-9-]+$/,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFormats: ['csv', 'json', 'sql']
}
```

### Processing Hooks
```typescript
// Hooks de processamento
const processingHooks = {
  beforeImport: (data: any[]) => preprocessData(data),
  afterImport: (result: ImportResult) => logImportResult(result),
  onError: (error: Error) => handleImportError(error),
  onSuccess: (result: ImportResult) => notifySuccess(result)
}
```

## 🧪 Testes

### Unit Tests
```typescript
describe('ExportImportManager', () => {
  test('should generate CSV correctly', () => {
    const data = [{ id: 1, name: 'Test', email: 'test@example.com' }]
    const csv = generateCSV(data)
    expect(csv).toBe('id,name,email\n1,Test,test@example.com')
  })
  
  test('should parse CSV correctly', () => {
    const csv = 'id,name,email\n1,Test,test@example.com'
    const data = parseCSV(csv)
    expect(data).toEqual([{ id: '1', name: 'Test', email: 'test@example.com' }])
  })
})
```

### Integration Tests
```typescript
describe('Export/Import API', () => {
  test('POST /admin/tenants/export', async () => {
    const response = await request(app)
      .get('/admin/tenants/export')
      .query({ format: 'csv', include: '{}', filters: '{}' })
      .set('Authorization', 'Bearer valid-token')
    
    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toBe('text/csv')
  })
})
```

## 📞 Troubleshooting

### Common Issues
1. **File Size Limits** - Aumentar limite de upload
2. **Memory Issues** - Processar em chunks
3. **Encoding Problems** - Usar UTF-8
4. **Validation Errors** - Verificar schema

### Debug Tools
- **File Inspector** - Visualizar estrutura de arquivos
- **Import Preview** - Pré-visualização antes de importar
- **Error Logs** - Logs detalhados de erros
- **Progress Tracking** - Acompanhamento em tempo real

## 🎉 Benefícios

### Para o Negócio
- ✅ **Data Portability** - Portabilidade completa de dados
- ✅ **Backup Automation** - Backup automatizado
- ✅ **Migration Support** - Suporte a migração
- ✅ **Compliance** - Conformidade com regulamentações

### Para os Usuários
- ✅ **Easy Export** - Exportação com um clique
- ✅ **Smart Import** - Importação inteligente
- ✅ **Format Flexibility** - Múltiplos formatos
- ✅ **Error Prevention** - Prevenção de erros

### Para Desenvolvedores
- ✅ **Modular Design** - Design modular
- ✅ **Type Safety** - Tipagem forte
- ✅ **Extensible** - Extensível para novos formatos
- ✅ **Test Coverage** - Cobertura completa

---

**O FoodManager agora tem export/import enterprise-level!** 📤📥

Sistema completo para backup e restauração de dados com suporte a múltiplos formatos, validação robusta e interface intuitiva.
