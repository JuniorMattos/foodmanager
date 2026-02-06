# 📊 Advanced Analytics - FoodManager

## 🎯 Visão Geral

Sistema completo de analytics avançados para o FoodManager, fornecendo insights detalhados sobre performance, usuários, receitas e tendências do negócio.

## 🏗️ Arquitetura

### 1. Frontend Components
- **AnalyticsDashboard** - Dashboard principal com gráficos
- **AnalyticsPage** - Página completa de analytics
- **Real-time Updates** - Atualizações em tempo real

### 2. Backend API
- **Analytics Routes** - Endpoints especializados
- **Data Aggregation** - Processamento eficiente de dados
- **Performance Metrics** - Monitoramento do sistema

### 3. Visualização
- **Recharts** - Biblioteca de gráficos
- **Responsive Design** - Adaptável a todos os dispositivos
- **Interactive Charts** - Gráficos interativos

## 📊 Funcionalidades Principais

### 🎯 Dashboard Analytics
- ✅ **KPI Cards** - Métricas principais em cards
- ✅ **Revenue Charts** - Gráficos de receita ao longo do tempo
- ✅ **Tenant Analytics** - Análise por tenant
- ✅ **User Growth** - Crescimento de usuários
- ✅ **Order Analytics** - Análise de pedidos
- ✅ **Performance Metrics** - Performance do sistema

### 📈 Visualizações Disponíveis

#### 1. Gráficos de Linha (Line Charts)
- **Revenue Trend** - Tendência de receita
- **User Growth** - Crescimento de usuários
- **Order Volume** - Volume de pedidos

#### 2. Gráficos de Área (Area Charts)
- **Cumulative Revenue** - Receita acumulada
- **Active Users** - Usuários ativos
- **Daily Orders** - Pedidos diários

#### 3. Gráficos de Barras (Bar Charts)
- **Top Performers** - Melhores tenants
- **User Distribution** - Distribuição de usuários
- **Plan Comparison** - Comparação de planos

#### 4. Gráficos de Pizza (Pie Charts)
- **Tenants by Plan** - Tenants por plano
- **Order Status** - Status dos pedidos
- **Revenue Distribution** - Distribuição de receita

### 🔧 Filtros e Configurações

#### Period Selection
- **7 days** - Últimos 7 dias
- **30 days** - Últimos 30 dias
- **90 days** - Últimos 90 dias
- **1 year** - Último ano

#### Tenant Filtering
- **All Tenants** - Todos os tenants
- **Individual Tenant** - Tenant específico
- **Plan-based** - Por tipo de plano

#### Comparison Options
- **Previous Period** - Período anterior
- **Last Year** - Ano anterior
- **No Comparison** - Sem comparação

### 📱 Real-time Analytics

#### Live Metrics
- **Active Users** - Usuários online
- **Current Orders** - Pedidos em andamento
- **Server Load** - Carga do servidor
- **API Response Time** - Tempo de resposta

#### Activity Feed
- **New Orders** - Novos pedidos
- **User Signups** - Novos cadastros
- **Payments** - Pagamentos recebidos
- **System Events** - Eventos do sistema

### 📊 Performance Metrics

#### System Performance
- **API Response Time** - Tempo de resposta da API
- **Uptime** - Tempo de atividade
- **Error Rate** - Taxa de erros
- **Database Queries** - Queries do banco

#### Resource Usage
- **Memory Usage** - Uso de memória
- **CPU Usage** - Uso de CPU
- **Storage Used** - Armazenamento utilizado
- **Active Connections** - Conexões ativas

### 📤 Export e Relatórios

#### Export Formats
- **CSV** - Para análise em Excel
- **XLSX** - Formato Excel nativo
- **PDF** - Relatórios em PDF

#### Report Types
- **Complete Report** - Relatório completo
- **Trend Analysis** - Análise de tendências
- **User Report** - Relatório de usuários
- **Custom Reports** - Relatórios personalizados

### 🎨 Interface do Usuário

#### Dashboard Layout
- **Responsive Grid** - Grid responsivo
- **Card-based Design** - Design baseado em cards
- **Interactive Filters** - Filtros interativos
- **Real-time Updates** - Atualizações em tempo real

#### Visual Elements
- **Color Coding** - Codificação por cores
- **Progress Indicators** - Indicadores de progresso
- **Hover Effects** - Efeitos hover
- **Smooth Transitions** - Transições suaves

## 🔧 Implementação Técnica

### Frontend (React + TypeScript)

#### Component Structure
```typescript
// AnalyticsDashboard Component
interface AnalyticsData {
  revenue: RevenueData
  tenants: TenantData
  users: UserData
  orders: OrderData
  performance: PerformanceData
}

// AnalyticsPage Component
interface AnalyticsPageProps {
  period?: '7d' | '30d' | '90d' | '1y'
  tenantId?: string
}
```

#### Chart Integration
```typescript
// Recharts Integration
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie } from 'recharts'

<ResponsiveContainer width="100%" height={300}>
  <LineChart data={revenueData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Line type="monotone" dataKey="revenue" stroke="#ea580c" />
  </LineChart>
</ResponsiveContainer>
```

### Backend (Fastify + Prisma)

#### API Routes
```typescript
// Analytics Routes
GET /admin/analytics/dashboard
GET /admin/analytics/revenue
GET /admin/analytics/tenants
GET /admin/analytics/users
GET /admin/analytics/orders
GET /admin/analytics/performance
GET /admin/analytics/top-performers
GET /admin/analytics/realtime
GET /admin/analytics/export
```

#### Data Aggregation
```typescript
// Revenue Analytics
const revenueData = await prisma.order.groupBy({
  by: ['created_at'],
  where: {
    created_at: { gte: startDate, lte: endDate },
    ...(tenantId && { tenant_id: tenantId })
  },
  _sum: { total_amount: true },
  _count: { id: true }
})
```

### Database Optimization

#### Indexes
```sql
-- Performance indexes
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_tenant_id ON orders(tenant_id);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_tenants_plan ON tenants(plan);
```

#### Queries Otimizadas
```typescript
// Efficient data fetching
const analytics = await prisma.$queryRaw`
  SELECT 
    DATE(created_at) as date,
    COUNT(*) as orders,
    COALESCE(SUM(total_amount), 0) as revenue
  FROM orders 
  WHERE created_at >= ${startDate}
  GROUP BY DATE(created_at)
  ORDER BY date ASC
`
```

## 🚀 Como Usar

### 1. Acessar Analytics
```bash
# Navegar para página de analytics
http://localhost:3000/analytics
```

### 2. Configurar Filtros
```typescript
// Aplicar filtros
const filters = {
  period: '30d',
  tenantId: 'all',
  compareWith: 'previous'
}
```

### 3. Visualizar Dados
- **KPI Cards** - Métricas principais
- **Interactive Charts** - Gráficos interativos
- **Real-time Updates** - Dados em tempo real

### 4. Exportar Relatórios
```typescript
// Exportar dados
const blob = await analyticsApi.exportAnalytics(filters, 'csv')
downloadFile(blob, 'analytics.csv')
```

## 📋 Métricas Disponíveis

### Revenue Metrics
- **Total Revenue** - Receita total
- **Daily Revenue** - Receita diária
- **Monthly Revenue** - Receita mensal
- **Growth Rate** - Taxa de crescimento

### Tenant Metrics
- **Active Tenants** - Tenants ativos
- **New Tenants** - Novos tenants
- **Churn Rate** - Taxa de cancelamento
- **Plan Distribution** - Distribuição por plano

### User Metrics
- **Total Users** - Usuários totais
- **Active Users** - Usuários ativos
- **New Users** - Novos usuários
- **Retention Rate** - Taxa de retenção

### Order Metrics
- **Total Orders** - Pedidos totais
- **Daily Orders** - Pedidos diários
- **Average Value** - Valor médio
- **Completion Rate** - Taxa de conclusão

### Performance Metrics
- **API Response Time** - Tempo de resposta
- **Uptime** - Tempo de atividade
- **Error Rate** - Taxa de erros
- **Resource Usage** - Uso de recursos

## 🎯 Casos de Uso

### 1. Business Intelligence
- **Revenue Analysis** - Análise de receita
- **Growth Tracking** - Acompanhamento de crescimento
- **Performance Monitoring** - Monitoramento de performance

### 2. Operational Insights
- **User Behavior** - Comportamento dos usuários
- **Order Patterns** - Padrões de pedidos
- **System Health** - Saúde do sistema

### 3. Strategic Planning
- **Trend Analysis** - Análise de tendências
- **Forecasting** - Previsões
- **Resource Planning** - Planejamento de recursos

## 🔧 Configuração Avançada

### Custom Metrics
```typescript
// Definir métricas personalizadas
const customMetrics = {
  revenue_per_user: 'total_revenue / active_users',
  order_frequency: 'total_orders / active_users',
  customer_lifetime_value: 'total_revenue / total_customers'
}
```

### Real-time Updates
```typescript
// WebSocket para atualizações em tempo real
const socket = io('/analytics')
socket.on('metrics_update', (data) => {
  updateDashboard(data)
})
```

### Custom Reports
```typescript
// Gerar relatórios personalizados
const customReport = {
  name: 'Monthly Performance',
  metrics: ['revenue', 'users', 'orders'],
  filters: { period: '30d' },
  schedule: { frequency: 'monthly', email: ['admin@company.com'] }
}
```

## 📈 Performance Optimization

### Frontend Optimization
- **Code Splitting** - Lazy loading de componentes
- **Memoization** - Cache de dados
- **Virtual Scrolling** - Scroll virtualizado
- **Debounced Updates** - Updates debounced

### Backend Optimization
- **Database Indexing** - Índices otimizados
- **Query Caching** - Cache de queries
- **Data Aggregation** - Agregação eficiente
- **Connection Pooling** - Pool de conexões

### Caching Strategy
```typescript
// Redis caching
const cacheKey = `analytics:${JSON.stringify(filters)}`
const cached = await redis.get(cacheKey)

if (cached) {
  return JSON.parse(cached)
}

const data = await fetchAnalytics(filters)
await redis.setex(cacheKey, 300, JSON.stringify(data))
```

## 🧪 Testes

### Unit Tests
```typescript
// Teste de analytics API
test('should return dashboard analytics', async () => {
  const response = await request(app)
    .get('/admin/analytics/dashboard')
    .set('Authorization', 'Bearer valid-token')
  
  expect(response.status).toBe(200)
  expect(response.body.data).toHaveProperty('revenue')
})
```

### Integration Tests
```typescript
// Teste de integração
test('should aggregate revenue data correctly', async () => {
  await createTestOrders()
  const analytics = await getDashboardAnalytics({ period: '30d' })
  
  expect(analytics.revenue.total).toBeGreaterThan(0)
})
```

## 📞 Troubleshooting

### Common Issues
1. **Slow Queries** - Otimizar queries com índices
2. **Memory Issues** - Implementar paginação
3. **Real-time Updates** - Usar WebSocket
4. **Export Problems** - Validar filtros

### Debug Tools
- **Browser DevTools** - Performance profiling
- **Database Logs** - Query analysis
- **API Logs** - Request/Response tracking
- **Error Tracking** - Sentry integration

## 🎉 Benefícios

### Para o Negócio
- ✅ **Data-Driven Decisions** - Decisões baseadas em dados
- ✅ **Performance Monitoring** - Monitoramento contínuo
- ✅ **Growth Insights** - Insights de crescimento
- ✅ **Operational Efficiency** - Eficiência operacional

### Para os Usuários
- ✅ **Intuitive Interface** - Interface intuitiva
- ✅ **Real-time Data** - Dados em tempo real
- ✅ **Custom Reports** - Relatórios personalizados
- ✅ **Mobile Friendly** - Responsivo para mobile

### Para Desenvolvedores
- ✅ **Scalable Architecture** - Arquitetura escalável
- ✅ **Type Safety** - Tipagem forte
- ✅ **Modular Design** - Design modular
- ✅ **Easy Integration** - Fácil integração

---

**O FoodManager agora tem analytics avançados completos!** 📊

Sistema de business intelligence poderoso com visualizações interativas e insights detalhados para tomada de decisões estratégicas.
