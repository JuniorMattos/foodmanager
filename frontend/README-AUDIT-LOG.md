# 🔍 Audit Log - FoodManager

## 🎯 Visão Geral

Sistema completo de auditoria e monitoramento de atividades no FoodManager, rastreando todas as alterações importantes do sistema com detalhes granulares e segurança robusta.

## 🏗️ Arquitetura

### 1. Frontend Components
- **AuditLog** - Componente principal de visualização de logs
- **AuditLogPage** - Página completa com estatísticas e configurações
- **Real-time Monitoring** - Monitoramento em tempo real
- **Advanced Filtering** - Filtros avançados e busca

### 2. Backend API
- **Audit Routes** - Endpoints completos para auditoria
- **Middleware Integration** - Captura automática de eventos
- **Security Events** - Detecção de eventos de segurança
- **Performance Optimization** - Consultas otimizadas

### 3. Database Schema
- **Audit Logs Table** - Estrutura completa de logs
- **Indexing Strategy** - Índices otimizados para performance
- **Retention Policies** - Políticas de retenção configuráveis
- **Archive System** - Sistema de arquivamento

## 📊 Funcionalidades Principais

### 🔍 Log Tracking

#### 1. Comprehensive Event Capture
- ✅ **CRUD Operations** - Create, Read, Update, Delete
- ✅ **Authentication Events** - Login, logout, falhas
- ✅ **System Events** - Configurações, manutenção
- ✅ **Security Events** - Tentativas de acesso, violações
- ✅ **Business Events** - Pedidos, pagamentos, etc.

#### 2. Detailed Information
- ✅ **User Context** - ID, nome, email, role
- ✅ **Entity Information** - Tipo, ID, nome da entidade
- ✅ **Value Changes** - Valores antigos e novos
- ✅ **Metadata** - Informações adicionais
- ✅ **Technical Details** - IP, user agent, timestamp

#### 3. Severity Classification
- ✅ **Low** - Operações normais do sistema
- ✅ **Medium** - Alterações importantes
- ✅ **High** - Operações críticas
- ✅ **Critical** - Eventos de segurança

### 📈 Analytics & Statistics

#### 1. Real-time Dashboard
```typescript
interface AuditLogStats {
  total: number           // Total de logs no período
  today: number          // Logs de hoje
  thisWeek: number       // Logs desta semana
  thisMonth: number      // Logs deste mês
  byCategory: Record<string, number>    // Por categoria
  bySeverity: Record<string, number>    // Por severidade
  byEntity: Record<string, number>      // Por entidade
  recentActivity: Array<{               // Atividade recente
    timestamp: string
    action: string
    entity: string
    user: string
    severity: string
  }>
}
```

#### 2. Visual Analytics
- ✅ **Category Distribution** - Gráficos por categoria
- ✅ **Severity Breakdown** - Distribuição por severidade
- ✅ **Entity Analysis** - Análise por tipo de entidade
- ✅ **Timeline View** - Visualização temporal
- ✅ **User Activity** - Atividade por usuário

#### 3. Trend Analysis
- ✅ **Growth Metrics** - Crescimento de logs
- ✅ **Security Trends** - Tendências de segurança
- ✅ **Usage Patterns** - Padrões de uso
- ✅ **Anomaly Detection** - Detecção de anomalias

### 🔍 Advanced Search & Filtering

#### 1. Multi-dimensional Filters
```typescript
interface AuditLogFilters {
  search: string           // Busca textual
  category: string         // Categoria específica
  severity: string         // Nível de severidade
  entity: string           // Tipo de entidade
  dateRange: {             // Período
    start: string
    end: string
  }
  userId?: string          // Filtro por usuário
  tenantId?: string        // Filtro por tenant
}
```

#### 2. Smart Search
- ✅ **Full-text Search** - Busca em todos os campos
- ✅ **Fuzzy Matching** - Correspondência aproximada
- ✅ **Auto-complete** - Sugestões automáticas
- ✅ **Saved Searches** - Buscas salvas

#### 3. Filter Combinations
- ✅ **AND/OR Logic** - Lógica combinatória
- ✅ **Date Ranges** - Intervalos de data
- ✅ **Value Ranges** - Intervalos de valores
- ✅ **Exclude Filters** - Filtros de exclusão

### 🛡️ Security Monitoring

#### 1. Security Events
- ✅ **Failed Login Attempts** - Tentativas falhas
- ✅ **Brute Force Attacks** - Ataques de força bruta
- ✅ **Unauthorized Access** - Acesso não autorizado
- ✅ **Privilege Escalation** - Escalonamento de privilégios
- ✅ **Data Breaches** - Vazamentos de dados

#### 2. Real-time Alerts
```typescript
interface SecurityAlert {
  type: 'critical' | 'high' | 'medium' | 'low'
  event: string
  description: string
  user?: string
  ip: string
  timestamp: string
  actions: string[]
}
```

#### 3. Automated Responses
- ✅ **IP Blocking** - Bloqueio automático de IPs
- ✅ **Account Locking** - Bloqueio de contas
- ✅ **Notification System** - Sistema de notificações
- ✅ **Escalation Rules** - Regras de escalonamento

### 📋 Configuration & Management

#### 1. Retention Policies
```typescript
interface AuditConfig {
  retention: number              // Dias de retenção
  alertOnCritical: boolean       // Alertar eventos críticos
  alertOnMassDelete: boolean      // Alertar exclusões em massa
  alertOnConfigChanges: boolean  // Alertar mudanças de config
  autoExportCritical: boolean    // Exportar eventos críticos
  autoArchiveOld: boolean        // Arquivar logs antigos
}
```

#### 2. Export Capabilities
- ✅ **CSV Export** - Exportação em CSV
- ✅ **JSON Export** - Exportação em JSON
- ✅ **PDF Reports** - Relatórios em PDF
- ✅ **Scheduled Exports** - Exportações agendadas
- ✅ **Custom Formats** - Formatos personalizados

#### 3. Archive Management
- ✅ **Automatic Archiving** - Arquivamento automático
- ✅ **Compression** - Compressão de dados
- ✅ **Cold Storage** - Armazenamento frio
- ✅ **Data Recovery** - Recuperação de dados

## 🎨 Interface do Usuário

### Main Dashboard
```typescript
// Layout principal
const AuditDashboard = {
  header: 'stats overview with refresh',
  charts: 'category, severity, entity distributions',
  recentActivity: 'latest 5 activities with severity indicators',
  mainTable: 'paginated audit log with expandable details',
  filters: 'advanced filtering panel',
  actions: 'export, refresh, configuration'
}
```

### Log Details View
```typescript
// Visualização detalhada
const LogDetails = {
  summary: 'basic information with severity badge',
  userContext: 'user details and role information',
  entityInfo: 'entity details and relationship',
  changes: 'before/after comparison',
  metadata: 'additional context and technical details',
  relatedLogs: 'linked events and timeline'
}
```

### Search Interface
```typescript
// Interface de busca
const SearchInterface = {
  searchBox: 'smart search with auto-complete',
  quickFilters: 'common filter presets',
  advancedFilters: 'comprehensive filtering options',
  savedSearches: 'user-saved search configurations',
  results: 'paginated results with highlighting'
}
```

## 🔧 Implementação Técnica

### Frontend (React + TypeScript)

#### Component Architecture
```typescript
interface AuditLogProps {
  tenantId?: string
  userId?: string
  showFilters?: boolean
  maxHeight?: string
}

interface AuditLogEntry {
  id: string
  action: string
  entity_type: 'tenant' | 'user' | 'order' | 'product' | 'system' | 'admin'
  entity_id: string
  entity_name: string
  old_values: Record<string, any>
  new_values: Record<string, any>
  user_id: string
  user_name: string
  user_email: string
  user_role: string
  ip_address: string
  user_agent: string
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'system' | 'security'
  description: string
  metadata: Record<string, any>
}
```

#### State Management
```typescript
// Estado do componente
const [logs, setLogs] = useState<AuditLogEntry[]>([])
const [loading, setLoading] = useState(false)
const [filters, setFilters] = useState<AuditLogFilters>(defaultFilters)
const [showDetails, setShowDetails] = useState<string | null>(null)
const [stats, setStats] = useState<AuditLogStats | null>(null)
```

#### Performance Optimization
```typescript
// Otimizações de performance
const useMemoizedLogs = useMemo(() => {
  return logs.filter(log => applyFilters(log, filters))
}, [logs, filters])

const debouncedSearch = useMemo(
  () => debounce((searchTerm: string) => {
    fetchLogs({ ...filters, search: searchTerm })
  }, 300),
  [filters]
)
```

### Backend (Fastify + Prisma)

#### Database Schema
```sql
-- Tabela principal de auditoria
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  entity_name TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_role TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  user_agent TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  severity TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices otimizados
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX idx_audit_logs_category ON audit_logs(category);
CREATE INDEX idx_audit_logs_search ON audit_logs USING gin(to_tsvector('english', action || ' ' || entity_name || ' ' || description));
```

#### API Routes
```typescript
// Endpoint principal de logs
fastify.get('/admin/audit/logs', { 
  schema: { querystring: auditLogFiltersSchema } 
}, async (request, reply) => {
  const filters = request.query
  
  // Build dynamic where clause
  const whereClause = buildWhereClause(filters)
  
  // Get paginated results
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit
    }),
    prisma.auditLog.count({ where: whereClause })
  ])
  
  return reply.send({
    data: logs,
    total,
    page: filters.page,
    limit: filters.limit,
    totalPages: Math.ceil(total / filters.limit)
  })
})

// Endpoint de estatísticas
fastify.get('/admin/audit/stats', async (request, reply) => {
  const { period } = request.query
  const dateRange = calculateDateRange(period)
  
  const stats = await getAuditStats(dateRange)
  return reply.send({ data: stats })
})
```

#### Middleware Integration
```typescript
// Middleware automático de auditoria
const auditMiddleware = async (request, reply, next) => {
  const startTime = Date.now()
  
  // Continue com a requisição
  await next()
  
  // Registra log se necessário
  if (shouldAudit(request, reply)) {
    await createAuditLog({
      action: determineAction(request),
      entity_type: determineEntityType(request),
      entity_id: determineEntityId(request),
      entity_name: determineEntityName(request),
      old_values: getOldValues(request),
      new_values: getNewValues(request),
      user: request.user,
      request: request,
      severity: determineSeverity(request, reply),
      category: determineCategory(request),
      description: generateDescription(request, reply)
    })
  }
}
```

### Performance Optimization

#### Database Optimization
```sql
-- Query otimizada com índices
SELECT * FROM audit_logs 
WHERE timestamp >= '2024-01-01' 
  AND timestamp <= '2024-01-31'
  AND severity = 'critical'
  AND category = 'security'
ORDER BY timestamp DESC
LIMIT 100;

-- Particionamento por data (se necessário)
CREATE TABLE audit_logs_2024_01 PARTITION OF audit_logs
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

#### Caching Strategy
```typescript
// Cache de estatísticas
const statsCache = new Map<string, { data: any; timestamp: number }>()

const getCachedStats = (period: string) => {
  const cacheKey = `stats:${period}`
  const cached = statsCache.get(cacheKey)
  
  if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
    return cached.data
  }
  
  return null
}
```

## 🚀 Como Usar

### 1. Acessar Audit Log
```bash
# Navegar para página de auditoria
http://localhost:3000/admin/audit-log

# Visualizar dashboard completo
- Estatísticas em tempo real
- Gráficos interativos
- Atividade recente
- Logs detalhados
```

### 2. Buscar Logs
```bash
# Busca simples
- Digitar termo na caixa de busca
- Resultados aparecem instantaneamente

# Filtros avançados
- Categoria: create, update, delete, login, logout, system, security
- Severidade: low, medium, high, critical
- Entidade: tenant, user, order, product, system, admin
- Período: intervalo de datas personalizado
```

### 3. Analisar Eventos
```bash
# Visualizar detalhes
- Clique no ícone de olho em qualquer log
- Expande para mostrar informações completas

# Comparar alterações
- Valores antigos vs novos
- Metadados adicionais
- Contexto do usuário
```

### 4. Exportar Dados
```bash
# Exportar logs
- Botão "Exportar" no header
- Formato CSV com todos os campos
- Inclui filtros aplicados

# Configurar exportação automática
- Painel de configurações
- Agendar exports periódicos
- Definir retenção de dados
```

## 📊 Exemplos Práticos

### Security Event Detection
```typescript
// Detecção de tentativa de brute force
const bruteForceDetection = {
  threshold: 5,                    // 5 tentativas falhas
  timeWindow: 300,                // 5 minutos
  action: 'block_ip',             // Bloquear IP
  severity: 'critical',           // Severidade crítica
  category: 'security'           // Categoria de segurança
}

// Log gerado automaticamente
{
  id: 'audit-123',
  action: 'security_breach_attempt',
  entity_type: 'system',
  entity_name: 'Authentication System',
  old_values: {},
  new_values: {
    failed_attempts: 5,
    ip_blocked: '192.168.1.200'
  },
  user_id: 'system',
  user_name: 'System',
  user_email: 'system@foodmanager.com',
  user_role: 'system',
  ip_address: '192.168.1.200',
  user_agent: 'curl/7.68.0',
  timestamp: '2024-01-15T16:20:00Z',
  severity: 'critical',
  category: 'security',
  description: 'Tentativa de acesso não autorizado detectada',
  metadata: {
    attack_type: 'brute_force',
    blocked_duration: 3600,
    user_agent: 'curl/7.68.0'
  }
}
```

### Business Operation Tracking
```typescript
// Alteração de plano de tenant
const tenantUpgrade = {
  action: 'tenant_updated',
  entity_type: 'tenant',
  entity_id: 'tenant-123',
  entity_name: 'Burger Express',
  old_values: {
    plan: 'basic',
    max_users: 50,
    monthly_price: 99.90
  },
  new_values: {
    plan: 'premium',
    max_users: 200,
    monthly_price: 299.90
  },
  user_id: 'admin-1',
  user_name: 'Admin User',
  user_email: 'admin@foodmanager.com',
  user_role: 'super_admin',
  severity: 'medium',
  category: 'update',
  description: 'Plano do tenant atualizado de Basic para Premium'
}
```

### System Configuration Changes
```typescript
// Alteração de configuração do sistema
const configChange = {
  action: 'system_config_updated',
  entity_type: 'system',
  entity_id: 'config-1',
  entity_name: 'Email Configuration',
  old_values: {
    smtp_host: 'old.smtp.com',
    smtp_port: 587,
    encryption: 'tls'
  },
  new_values: {
    smtp_host: 'new.smtp.com',
    smtp_port: 465,
    encryption: 'ssl'
  },
  user_id: 'admin-1',
  user_name: 'Admin User',
  severity: 'high',
  category: 'system',
  description: 'Configuração de email atualizada'
}
```

## 🎯 Casos de Uso

### 1. Compliance & Auditing
```typescript
// Relatório de conformidade
const generateComplianceReport = async (period: string) => {
  const logs = await auditApi.getAuditLogs({
    dateRange: getDateRange(period),
    category: 'all',
    severity: 'all'
  })
  
  // Filtrar eventos regulatórios
  const complianceEvents = logs.data.filter(log => 
    isComplianceRelevant(log)
  )
  
  return generateComplianceReport(complianceEvents)
}
```

### 2. Security Monitoring
```typescript
// Monitoramento de segurança em tempo real
const securityMonitor = {
  checkForAnomalies: async () => {
    const recentEvents = await auditApi.getSecurityEvents('24h')
    const anomalies = detectAnomalies(recentEvents)
    
    if (anomalies.length > 0) {
      await sendSecurityAlert(anomalies)
    }
  },
  
  blockSuspiciousIPs: async (ip: string) => {
    await securityService.blockIP(ip, 3600) // 1 hora
    await auditApi.createAuditLog({
      action: 'ip_blocked',
      entity_type: 'system',
      entity_id: ip,
      entity_name: `IP ${ip}`,
      description: `IP bloqueado por atividade suspeita`,
      severity: 'high',
      category: 'security'
    })
  }
}
```

### 3. Performance Analysis
```typescript
// Análise de performance do sistema
const performanceAnalysis = {
  getSystemMetrics: async (period: string) => {
    const metrics = await auditApi.getAuditMetrics(period)
    
    return {
      totalOperations: metrics.totalLogs,
      averageResponseTime: calculateAvgResponseTime(metrics.logsPerHour),
      errorRate: calculateErrorRate(metrics.logsPerHour),
      peakHours: identifyPeakHours(metrics.logsPerHour)
    }
  },
  
  detectPerformanceIssues: async () => {
    const recentLogs = await auditApi.getRecentActivity(100)
    const slowOperations = recentLogs.filter(log => 
      log.metadata.duration > 5000 // > 5 segundos
    )
    
    if (slowOperations.length > 10) {
      await sendPerformanceAlert(slowOperations)
    }
  }
}
```

## 🧪 Testes

### Unit Tests
```typescript
describe('AuditLog', () => {
  test('should filter logs by severity', () => {
    const logs = [
      { severity: 'low', action: 'test' },
      { severity: 'high', action: 'test' }
    ]
    
    const filtered = logs.filter(log => log.severity === 'high')
    expect(filtered).toHaveLength(1)
  })
  
  test('should format timestamp correctly', () => {
    const timestamp = '2024-01-15T10:30:00Z'
    const formatted = formatTimestamp(timestamp)
    expect(formatted).toBe('15/01/2024 10:30:00')
  })
})
```

### Integration Tests
```typescript
describe('Audit API', () => {
  test('GET /admin/audit/logs', async () => {
    const response = await request(app)
      .get('/admin/audit/logs')
      .query({ page: 1, limit: 10 })
      .set('Authorization', 'Bearer valid-token')
    
    expect(response.status).toBe(200)
    expect(response.body.data).toHaveLength(10)
  })
  
  test('POST /admin/audit/logs', async () => {
    const logData = {
      action: 'test_action',
      entity_type: 'user',
      entity_id: 'user-123',
      entity_name: 'Test User',
      description: 'Test log entry'
    }
    
    const response = await request(app)
      .post('/admin/audit/logs')
      .send(logData)
      .set('Authorization', 'Bearer valid-token')
    
    expect(response.status).toBe(201)
    expect(response.body.data.action).toBe('test_action')
  })
})
```

## 📞 Troubleshooting

### Common Issues
1. **Performance Issues** - Usar paginação e índices adequados
2. **Memory Usage** - Implementar cache e limpeza periódica
3. **Storage Growth** - Configurar políticas de retenção
4. **Query Optimization** - Otimizar consultas complexas

### Debug Tools
- **Query Analyzer** - Analisador de consultas SQL
- **Performance Monitor** - Monitor de performance
- **Log Inspector** - Inspetor de logs em tempo real
- **Metrics Dashboard** - Dashboard de métricas

## 🎉 Benefícios

### Para o Negócio
- ✅ **Compliance** - Conformidade com regulamentações
- ✅ **Security** - Monitoramento de segurança robusto
- ✅ **Transparency** - Transparência total das operações
- ✅ **Accountability** - Responsabilização clara

### Para os Usuários
- ✅ **Traceability** - Rastreabilidade completa
- ✅ **Debugging** - Facilita debugging de problemas
- ✅ **Performance** - Identificação de gargalos
- ✅ **Insights** - Insights valiosos sobre o sistema

### Para Desenvolvedores
- ✅ **Debugging** - Debugging facilitado
- ✅ **Monitoring** - Monitoramento proativo
- ✅ **Testing** - Testes mais eficazes
- ✅ **Documentation** - Documentação automática

---

**O FoodManager agora tem audit log enterprise-level!** 🔍

Sistema completo de auditoria e monitoramento com rastreamento detalhado, analytics em tempo real, alertas de segurança e conformidade regulatória. Total visibilidade sobre todas as atividades do sistema com performance otimizada e interface intuitiva.
