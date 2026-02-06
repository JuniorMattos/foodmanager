# 🛡️ Role Management - FoodManager

## 🎯 Visão Geral

Sistema completo de gerenciamento de roles e permissões granulares para o FoodManager, permitindo controle fino de acesso e segurança em nível enterprise com hierarquia de permissões flexível.

## 🏗️ Arquitetura

### 1. Frontend Components
- **RoleManager** - Componente principal de gestão de roles
- **RoleManagementPage** - Dashboard completo com estatísticas
- **Permission Matrix** - Matriz visual de permissões
- **Role Assignment** - Sistema de atribuição de roles
- **Permission Checker** - Validador de permissões em tempo real

### 2. Backend API
- **Role Routes** - Endpoints completos para gestão de roles
- **Permission Routes** - Gestão de permissões granulares
- **Assignment Routes** - Sistema de atribuição de roles
- **Validation Routes** - Validação de permissões
- **Audit Integration** - Auditoria completa de operações

### 3. Database Schema
- **Roles Table** - Estrutura completa de roles
- **Permissions Table** - Permissões granulares
- **Role Permissions** - Relacionamento many-to-many
- **User Roles** - Atribuição de roles a usuários
- **Audit Logs** - Auditoria de operações

## 📊 Funcionalidades Principais

### 🔐 Role Management

#### 1. Comprehensive Role Operations
- ✅ **Create Roles** - Criação de roles customizadas
- ✅ **Edit Roles** - Edição de propriedades e permissões
- ✅ **Delete Roles** - Remoção segura com validações
- ✅ **Clone Roles** - Clonagem de roles existentes
- ✅ **System Roles** - Roles protegidos do sistema
- ✅ **Role Templates** - Templates predefinidos

#### 2. Role Properties
```typescript
interface Role {
  id: string
  name: string                    // Nome único da role
  description: string             // Descrição detalhada
  permissions: string[]          // Array de permission IDs
  isSystem: boolean             // Role do sistema (protegida)
  userCount: number             // Número de usuários atribuídos
  createdAt: string
  updatedAt: string
}
```

#### 3. Role Categories
- ✅ **Administrative** - Roles de administração
- ✅ **Operational** - Roles operacionais
- ✅ **View Only** - Roles somente visualização
- ✅ **Custom** - Roles customizadas
- ✅ **System** - Roles do sistema

### 🔑 Permission Management

#### 1. Granular Permissions
```typescript
interface Permission {
  id: string
  name: string                   // Nome da permissão
  description: string            // Descrição detalhada
  category: string              // Categoria (users, orders, etc.)
  resource: string              // Recurso (user, order, product)
  action: string                 // Ação (create, read, update, delete)
}
```

#### 2. Permission Categories
- ✅ **User Management** - Gestão de usuários
- ✅ **Order Management** - Gestão de pedidos
- ✅ **Product Management** - Gestão de produtos
- ✅ **Inventory Management** - Gestão de estoque
- ✅ **Financial Management** - Gestão financeira
- ✅ **Tenant Management** - Gestão de tenants
- ✅ **System Administration** - Administração do sistema
- ✅ **Reporting & Analytics** - Relatórios e analytics

#### 3. Permission Actions
- ✅ **Create** - Criar recursos
- ✅ **Read** - Visualizar recursos
- ✅ **Update** - Atualizar recursos
- ✅ **Delete** - Excluir recursos
- ✅ **List** - Listar recursos
- ✅ **Export** - Exportar dados
- ✅ **Import** - Importar dados
- ✅ **Approve** - Aprovar operações

### 👥 User Assignment

#### 1. Role Assignment System
```typescript
interface RoleAssignment {
  id: string
  userId: string                 // ID do usuário
  userName: string               // Nome do usuário
  userEmail: string              // Email do usuário
  roleId: string                 // ID da role
  roleName: string               // Nome da role
  assignedAt: string             // Data da atribuição
  assignedBy: string             // Quem atribuiu
}
```

#### 2. Assignment Operations
- ✅ **Single Assignment** - Atribuir role a usuário
- ✅ **Bulk Assignment** - Atribuição em lote
- ✅ **Role Removal** - Remover role de usuário
- ✅ **Assignment History** - Histórico de atribuições
- ✅ **Assignment Validation** - Validação de atribuições

#### 3. Multiple Roles Support
- ✅ **Multiple Roles** - Usuários com múltiplas roles
- ✅ **Role Priority** - Sistema de prioridade
- ✅ **Permission Merging** - Combinação de permissões
- ✅ **Conflict Resolution** - Resolução de conflitos

### 📈 Analytics & Statistics

#### 1. Role Statistics Dashboard
```typescript
interface RoleStats {
  totalRoles: number             // Total de roles
  systemRoles: number           // Roles do sistema
  customRoles: number           // Roles customizadas
  activeRoles: number           // Roles ativas
  unusedRoles: number           // Roles não utilizadas
  totalUsers: number            // Total de usuários
  usersWithRoles: number        // Usuários com roles
  usersWithoutRoles: number     // Usuários sem roles
  recentActivity: Array<{       // Atividade recente
    id: string
    action: string
    roleName: string
    userName: string
    timestamp: string
    severity: 'low' | 'medium' | 'high'
  }>
  roleDistribution: Array<{     // Distribuição de roles
    roleName: string
    userCount: number
    percentage: number
  }>
  permissionUsage: Array<{      // Uso de permissões
    category: string
    usageCount: number
    totalPermissions: number
  }>
}
```

#### 2. Visual Analytics
- ✅ **Role Distribution Chart** - Gráfico de distribuição
- ✅ **Permission Usage Matrix** - Matriz de uso
- ✅ **User Assignment Trends** - Tendências de atribuição
- ✅ **Activity Timeline** - Linha do tempo de atividades
- ✅ **Security Metrics** - Métricas de segurança

#### 3. Advanced Metrics
- ✅ **Role Utilization** - Taxa de utilização
- ✅ **Permission Coverage** - Cobertura de permissões
- ✅ **Security Gaps** - Lacunas de segurança
- ✅ **Compliance Score** - Score de conformidade

### 🔍 Advanced Features

#### 1. Role Hierarchy
```typescript
interface RoleHierarchy {
  id: string
  name: string
  parentId?: string              // Role pai
  level: number                  // Nível na hierarquia
  children?: RoleHierarchy[]     // Roles filhas
}
```

#### 2. Permission Inheritance
- ✅ **Inherited Permissions** - Permissões herdadas
- ✅ **Override Rules** - Regras de override
- ✅ **Cascade Effects** - Efeitos em cascata
- ✅ **Dependency Management** - Gestão de dependências

#### 3. Dynamic Permissions
- ✅ **Context-based Permissions** - Permissões contextuais
- ✅ **Time-based Access** - Acesso baseado em tempo
- ✅ **Location-based Access** - Acesso baseado em localização
- ✅ **Conditional Permissions** - Permissões condicionais

## 🎨 Interface do Usuário

### Main Dashboard
```typescript
// Layout principal
const RoleDashboard = {
  header: 'stats overview with role metrics',
  statsCards: 'total roles, active roles, users, assignments',
  charts: 'role distribution, permission usage',
  recentActivity: 'latest role operations',
  quickActions: 'create role, assign roles, review permissions',
  roleTable: 'paginated role list with actions'
}
```

### Role Management Interface
```typescript
// Interface de gestão de roles
const RoleManagement = {
  searchFilters: 'name, description, category, system status',
  roleTable: 'comprehensive role listing',
  permissionMatrix: 'visual permission assignment',
  bulkActions: 'bulk assign, bulk delete, bulk update',
  roleDetails: 'expanded view with all permissions',
  userAssignments: 'list of assigned users'
}
```

### Permission Matrix
```typescript
// Matriz de permissões
const PermissionMatrix = {
  rows: 'roles list',
  columns: 'permission categories',
  cells: 'checkboxes for permission assignment',
  bulkControls: 'select all by category or resource',
  search: 'filter permissions by category',
  preview: 'show selected permissions summary'
}
```

## 🔧 Implementação Técnica

### Frontend (React + TypeScript)

#### Component Architecture
```typescript
// Componente principal
interface RoleManagerProps {
  tenantId?: string
  showSystemRoles?: boolean
  maxRoles?: number
  onRoleSelect?: (role: Role) => void
}

// Estado do componente
const [roles, setRoles] = useState<Role[]>([])
const [permissions, setPermissions] = useState<Permission[]>([])
const [selectedRole, setSelectedRole] = useState<Role | null>(null)
const [formData, setFormData] = useState<RoleFormData>({
  name: '',
  description: '',
  permissions: []
})
```

#### Permission Matrix Component
```typescript
// Matriz de permissões
const PermissionMatrix = ({ 
  permissions, 
  selectedPermissions, 
  onPermissionToggle 
}) => {
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = []
    }
    acc[permission.category].push(permission)
    return acc
  }, {} as Record<string, Permission[]>)
  
  return (
    <div className="permission-matrix">
      {Object.entries(groupedPermissions).map(([category, perms]) => (
        <PermissionCategory 
          key={category}
          category={category}
          permissions={perms}
          selectedPermissions={selectedPermissions}
          onToggle={onPermissionToggle}
        />
      ))}
    </div>
  )
}
```

#### Role Assignment Component
```typescript
// Componente de atribuição
const RoleAssignment = ({ users, roles, onAssign }) => {
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [selectedRole, setSelectedRole] = useState<string>('')
  
  const handleAssign = () => {
    if (selectedUser && selectedRole) {
      onAssign(selectedUser, selectedRole)
      setSelectedUser('')
      setSelectedRole('')
    }
  }
  
  return (
    <div className="role-assignment">
      <UserSelect users={users} onSelect={setSelectedUser} />
      <RoleSelect roles={roles} onSelect={setSelectedRole} />
      <Button onClick={handleAssign}>Assign Role</Button>
    </div>
  )
}
```

### Backend (Fastify + Prisma)

#### Database Schema
```sql
-- Tabela de roles
CREATE TABLE roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabela de permissões
CREATE TABLE permissions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Relacionamento Role-Permission
CREATE TABLE role_permissions (
  id TEXT PRIMARY KEY,
  role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id TEXT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- Relacionamento User-Role
CREATE TABLE user_roles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);

-- Índices otimizados
CREATE INDEX idx_roles_name ON roles(name);
CREATE INDEX idx_roles_system ON roles(is_system);
CREATE INDEX idx_permissions_category ON permissions(category);
CREATE INDEX idx_permissions_resource ON permissions(resource);
CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission ON role_permissions(permission_id);
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);
```

#### API Routes Implementation
```typescript
// Endpoint principal de roles
fastify.get('/admin/roles', { 
  preHandler: [authenticateAdmin],
  schema: { querystring: roleFiltersSchema } 
}, async (request, reply) => {
  const { search, category, isSystem, hasUsers, page, limit } = request.query
  
  const where = buildRoleWhereClause({
    search,
    category,
    isSystem,
    hasUsers
  })
  
  const [roles, total] = await Promise.all([
    prisma.role.findMany({
      where,
      include: {
        _count: { select: { user_roles: true } }
      },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.role.count({ where })
  ])
  
  return reply.send({
    data: roles.map(role => ({
      ...role,
      userCount: role._count.user_roles
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  })
})

// Endpoint de criação de role
fastify.post('/admin/roles', { 
  preHandler: [authenticateAdmin],
  schema: { body: createRoleSchema } 
}, async (request, reply) => {
  const data = createRoleSchema.parse(request.body)
  const user = request.user
  
  // Validações
  const existingRole = await prisma.role.findFirst({
    where: { name: data.name }
  })
  
  if (existingRole) {
    return reply.status(400).send({ error: 'Role name already exists' })
  }
  
  // Criação da role
  const role = await prisma.role.create({
    data: {
      id: generateId('role'),
      name: data.name,
      description: data.description,
      is_system: false
    }
  })
  
  // Atribuição de permissões
  if (data.permissions.length > 0) {
    await prisma.rolePermission.createMany({
      data: data.permissions.map(permissionId => ({
        id: generateId('rp'),
        role_id: role.id,
        permission_id: permissionId
      }))
    })
  }
  
  // Auditoria
  await createAuditLog({
    action: 'role_created',
    entityType: 'role',
    entityId: role.id,
    entityName: role.name,
    userId: user.id,
    newValues: data,
    severity: 'medium',
    category: 'create'
  })
  
  return reply.status(201).send({ data: role })
})
```

#### Permission Checking Middleware
```typescript
// Middleware de verificação de permissões
const checkPermission = (resource: string, action: string) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user
    
    if (!user) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }
    
    // Obter permissões do usuário
    const userPermissions = await getUserPermissions(user.id)
    
    // Verificar permissão específica
    const hasPermission = userPermissions.some(permission =>
      permission.resource === resource && permission.action === action
    )
    
    if (!hasPermission) {
      return reply.status(403).send({ error: 'Forbidden' })
    }
    
    // Continuar com a requisição
  }
}

// Uso em rotas
fastify.get('/admin/users', { 
  preHandler: [authenticateAdmin, checkPermission('user', 'read')] 
}, getUsersHandler)
```

### Performance Optimization

#### Database Optimization
```sql
-- Query otimizada com joins
SELECT 
  r.*,
  COUNT(ur.user_id) as user_count,
  COUNT(rp.permission_id) as permission_count
FROM roles r
LEFT JOIN user_roles ur ON r.id = ur.role_id
LEFT JOIN role_permissions rp ON r.id = rp.role_id
WHERE r.is_system = false
GROUP BY r.id
ORDER BY r.created_at DESC;

-- Cache de permissões
CREATE MATERIALIZED VIEW user_permissions AS
SELECT DISTINCT
  u.id as user_id,
  p.id as permission_id,
  p.name as permission_name,
  p.category,
  p.resource,
  p.action
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id;
```

#### Caching Strategy
```typescript
// Cache de permissões do usuário
const permissionCache = new Map<string, { permissions: Permission[]; timestamp: number }>()

const getUserPermissionsCached = async (userId: string): Promise<Permission[]> => {
  const cached = permissionCache.get(userId)
  
  if (cached && Date.now() - cached.timestamp < 10 * 60 * 1000) { // 10 minutos
    return cached.permissions
  }
  
  const permissions = await getUserPermissions(userId)
  permissionCache.set(userId, { permissions, timestamp: Date.now() })
  
  return permissions
}
```

## 🚀 Como Usar

### 1. Acessar Role Management
```bash
# Navegar para página de gestão de roles
http://localhost:3000/admin/role-management

# Visualizar dashboard completo
- Estatísticas de roles e usuários
- Gráficos de distribuição
- Atividade recente
- Ações rápidas
```

### 2. Criar Nova Role
```bash
# Criar role customizada
- Clicar em "Create Role"
- Preencher nome e descrição
- Selecionar permissões na matriz
- Salvar role

# Exemplo de role
{
  name: "Sales Manager",
  description: "Gerencia vendas e pedidos",
  permissions: [
    "order_read", "order_create", "order_update",
    "product_read", "customer_read", "report_view"
  ]
}
```

### 3. Gerenciar Permissões
```bash
# Matriz de permissões
- Visualizar todas as categorias
- Selecionar permissões por categoria
- Bulk selection por resource
- Preview das seleções

# Categorias de permissões
- User Management: create, read, update, delete
- Order Management: create, read, update, delete, approve
- Product Management: create, read, update, delete
- Financial: read, approve, export
```

### 4. Atribuir Roles a Usuários
```bash
# Atribuição individual
- Selecionar usuário
- Selecionar role
- Confirmar atribuição

# Atribuição em lote
- Upload CSV com usuários e roles
- Selecionar múltiplos usuários
- Bulk assign operation

# Validações automáticas
- Verificar conflitos
- Validar permissões
- Auditoria das operações
```

## 📊 Exemplos Práticos

### Role Creation Example
```typescript
// Criar role de "Gerente de Restaurante"
const restaurantManager = {
  name: "Restaurant Manager",
  description: "Gerencia operações do restaurante",
  permissions: [
    // User Management
    "user_read", "user_create", "user_update",
    
    // Order Management
    "order_read", "order_create", "order_update", "order_delete",
    
    // Product Management
    "product_read", "product_create", "product_update",
    
    // Inventory Management
    "inventory_read", "inventory_update",
    
    // Financial
    "financial_read", "financial_approve",
    
    // Reporting
    "report_view", "report_export"
  ]
}

// Resultado
const createdRole = await roleApi.createRole(restaurantManager)
```

### Permission Checking Example
```typescript
// Verificar permissão do usuário
const checkUserPermission = async (userId: string, resource: string, action: string) => {
  const hasPermission = await roleApi.checkPermission(userId, {
    resource,
    action,
    context: {
      tenantId: 'tenant-123',
      department: 'sales'
    }
  })
  
  return hasPermission.allowed
}

// Uso em middleware
const requirePermission = (resource: string, action: string) => {
  return async (req, res, next) => {
    const userId = req.user.id
    const hasPermission = await checkUserPermission(userId, resource, action)
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
    
    next()
  }
}
```

### Bulk Operations Example
```typescript
// Atribuição em lote de roles
const bulkAssignRoles = async () => {
  const assignments = [
    { userId: 'user-1', roleId: 'role-sales' },
    { userId: 'user-2', roleId: 'role-manager' },
    { userId: 'user-3', roleId: 'role-admin' }
  ]
  
  const results = await roleApi.bulkAssignRoles(assignments)
  
  console.log('Assignment results:', results)
  // [
  //   { userId: 'user-1', roleId: 'role-sales', status: 'created' },
  //   { userId: 'user-2', roleId: 'role-manager', status: 'created' },
  //   { userId: 'user-3', roleId: 'role-admin', status: 'exists' }
  // ]
}
```

## 🎯 Casos de Uso

### 1. Multi-Tenant Permission Control
```typescript
// Controle de permissões por tenant
const tenantPermissionCheck = async (userId: string, tenantId: string, resource: string, action: string) => {
  // Verificar se usuário tem acesso ao tenant
  const hasTenantAccess = await checkTenantAccess(userId, tenantId)
  if (!hasTenantAccess) {
    return { allowed: false, reason: 'No tenant access' }
  }
  
  // Verificar permissão específica
  const hasPermission = await checkPermission(userId, resource, action)
  if (!hasPermission) {
    return { allowed: false, reason: 'Insufficient permissions' }
  }
  
  return { allowed: true }
}
```

### 2. Role-Based Feature Access
```typescript
// Controle de acesso a features
const featureAccess = {
  dashboard: ['admin', 'manager', 'viewer'],
  users: ['admin', 'manager'],
  orders: ['admin', 'manager', 'sales'],
  products: ['admin', 'manager', 'inventory'],
  financial: ['admin', 'finance'],
  settings: ['admin']
}

const hasFeatureAccess = (userRole: string, feature: string) => {
  return featureAccess[feature]?.includes(userRole) || false
}
```

### 3. Dynamic Permission Assignment
```typescript
// Atribuição dinâmica baseada em contexto
const getDynamicPermissions = async (userId: string, context: any) => {
  const basePermissions = await getUserPermissions(userId)
  
  // Adicionar permissões contextuais
  if (context.isOwner) {
    basePermissions.push('tenant_delete', 'tenant_update')
  }
  
  if (context.isEmergency) {
    basePermissions.push('emergency_access', 'system_override')
  }
  
  return basePermissions
}
```

## 🧪 Testes

### Unit Tests
```typescript
describe('Role Management', () => {
  test('should create role with permissions', async () => {
    const roleData = {
      name: 'Test Role',
      description: 'Test role description',
      permissions: ['user_read', 'order_read']
    }
    
    const response = await roleApi.createRole(roleData)
    
    expect(response.data.name).toBe(roleData.name)
    expect(response.data.permissions).toHaveLength(2)
  })
  
  test('should check user permissions', async () => {
    const userId = 'user-123'
    const check = {
      resource: 'user',
      action: 'read'
    }
    
    const result = await roleApi.checkPermission(userId, check)
    
    expect(result).toHaveProperty('allowed')
    expect(typeof result.allowed).toBe('boolean')
  })
})
```

### Integration Tests
```typescript
describe('Role API Integration', () => {
  test('POST /admin/roles', async () => {
    const roleData = {
      name: 'Integration Test Role',
      description: 'Role for integration testing',
      permissions: ['user_read']
    }
    
    const response = await request(app)
      .post('/admin/roles')
      .set('Authorization', 'Bearer valid-token')
      .send(roleData)
    
    expect(response.status).toBe(201)
    expect(response.body.data.name).toBe(roleData.name)
  })
  
  test('GET /admin/roles', async () => {
    const response = await request(app)
      .get('/admin/roles')
      .set('Authorization', 'Bearer valid-token')
    
    expect(response.status).toBe(200)
    expect(Array.isArray(response.body.data)).toBe(true)
  })
})
```

## 📞 Troubleshooting

### Common Issues
1. **Permission Conflicts** - Usar sistema de prioridade
2. **Role Assignment Errors** - Validar dependências
3. **Cache Issues** - Implementar cache invalidation
4. **Performance Problems** - Otimizar queries e índices

### Debug Tools
- **Permission Inspector** - Inspetor de permissões
- **Role Analyzer** - Analisador de roles
- **Assignment Tracker** - Rastreador de atribuições
- **Audit Viewer** - Visualizador de auditoria

## 🎉 Benefícios

### Para o Negócio
- ✅ **Security** - Controle de acesso granular
- ✅ **Compliance** - Conformidade com regulamentações
- ✅ **Scalability** - Sistema escalável de permissões
- ✅ **Flexibility** - Roles e permissões flexíveis

### Para os Usuários
- ✅ **Clear Access** - Acesso claro e definido
- ✅ **Role Clarity** - Roles bem definidos
- ✅ **Easy Assignment** - Atribuição simplificada
- ✅ **Self-Service** - Auto-gestão de permissões

### Para Desenvolvedores
- ✅ **Type Safety** - Tipagem forte com TypeScript
- ✅ **Reusable Components** - Componentes reutilizáveis
- ✅ **API Consistency** - API consistente e documentada
- ✅ **Easy Integration** - Integração simplificada

---

**O FoodManager agora tem role management enterprise-level!** 🛡️

Sistema completo de gestão de roles e permissões granulares com controle fino de acesso, hierarquia de permissões flexível, atribuição em lote, auditoria completa e interface intuitiva para administração de segurança em nível enterprise.
