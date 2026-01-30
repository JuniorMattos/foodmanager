# 🏗️ System Architecture - FoodManager SaaS

## 📐 Architecture Overview

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **Backend**: Node.js + Fastify + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Real-time**: Socket.io
- **Authentication**: JWT + Refresh Tokens
- **Infrastructure**: Docker + Railway/Fly.io

### Architecture Pattern
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Apps   │    │   API Gateway   │    │   Microservices │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ PDV Web    │ │◄──►│ │ Fastify     │ │◄──►│ │ Auth Service│ │
│ └─────────────┘ │    │ │ Server      │ │    │ └─────────────┘ │
│                 │    │ │             │ │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Customer   │ │◄──►│ │ JWT Auth    │ │◄──►│ │ Order Service│ │
│ │ Portal     │ │    │ │ Middleware  │ │    │ └─────────────┘ │
│ └─────────────┘ │    │ └─────────────┘ │    │                 │
│                 │    │                 │    │ ┌─────────────┐ │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ │ Inventory   │ │
│ │ Admin Panel│ │◄──►│ │ Tenant Isol.│ │◄──►│ │ Service     │ │
│ └─────────────┘ │    │ │ Middleware  │ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    │   + Prisma      │
                    └─────────────────┘
```

## 🔐 Multi-Tenant Strategy

### Data Isolation: Column-Based Approach
```sql
-- Every table includes tenant_id for isolation
CREATE TABLE products (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,  -- Isolation column
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    -- ... other fields
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Row Level Security (RLS) Policies
CREATE POLICY tenant_isolation ON products
    FOR ALL TO authenticated_users
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

### Tenant Resolution
```typescript
// Middleware for tenant identification
export const tenantMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
  const subdomain = request.hostname.split('.')[0]
  const tenant = await prisma.tenant.findUnique({
    where: { slug: subdomain }
  })
  
  if (!tenant) {
    throw new Error('Tenant not found')
  }
  
  // Set tenant context for database queries
  await prisma.$executeRaw`SET app.current_tenant_id = ${tenant.id}`
  request.tenant = tenant
}
```

## 🗄️ Database Architecture

### Connection Pooling Strategy
```typescript
// Prisma configuration with connection pooling
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['query', 'info', 'warn', 'error'],
})

// Connection pool configuration
const poolConfig = {
  connectionLimit: 20,
  acquireTimeoutMillis: 30000,
  createTimeoutMillis: 30000,
  destroyTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  reapIntervalMillis: 1000,
  createRetryIntervalMillis: 200,
}
```

### Database Schema Strategy
- **Shared Database, Shared Schema**: All tenants share database
- **Tenant ID Column**: Every table has `tenant_id` field
- **Row Level Security**: PostgreSQL RLS for data isolation
- **Indexing Strategy**: Composite indexes on `(tenant_id, id)` for performance

## 🚀 API Architecture

### Fastify Server Structure
```typescript
// server.ts
import fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'

const server = fastify({
  logger: true,
  trustProxy: true,
})

// Plugins
server.register(cors)
server.register(helmet)
server.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
})

// Middleware
server.register(tenantMiddleware)
server.register(authMiddleware)

// Routes
server.register(productRoutes, { prefix: '/api/products' })
server.register(orderRoutes, { prefix: '/api/orders' })
server.register(inventoryRoutes, { prefix: '/api/inventory' })
server.register(authRoutes, { prefix: '/api/auth' })
```

### Route Organization
```
src/
├── routes/
│   ├── auth/
│   │   ├── login.ts
│   │   ├── register.ts
│   │   └── refresh.ts
│   ├── products/
│   │   ├── index.ts
│   │   ├── create.ts
│   │   ├── update.ts
│   │   └── delete.ts
│   ├── orders/
│   │   ├── index.ts
│   │   ├── create.ts
│   │   ├── update.ts
│   │   └── list.ts
│   └── inventory/
│       ├── index.ts
│       ├── movements.ts
│       └── alerts.ts
├── middleware/
│   ├── auth.ts
│   ├── tenant.ts
│   └── validation.ts
├── services/
│   ├── auth.service.ts
│   ├── product.service.ts
│   ├── order.service.ts
│   └── inventory.service.ts
└── utils/
    ├── jwt.ts
    ├── encryption.ts
    └── validation.ts
```

## 🔄 Real-time Architecture

### Socket.io Integration
```typescript
// socket.ts
import { Server } from 'socket.io'
import { createServer } from 'http'

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST']
  }
})

// Tenant-specific rooms
io.on('connection', (socket) => {
  socket.on('join-tenant', (tenantId) => {
    socket.join(`tenant-${tenantId}`)
  })

  socket.on('order-update', (data) => {
    io.to(`tenant-${data.tenantId}`).emit('order-changed', data)
  })
})
```

### Event-Driven Architecture
```typescript
// Order events
export enum OrderEvents {
  CREATED = 'order.created',
  UPDATED = 'order.updated',
  CANCELLED = 'order.cancelled',
  COMPLETED = 'order.completed',
}

// Event emitter
export const eventEmitter = new EventEmitter()

// Service integration
eventEmitter.on(OrderEvents.CREATED, async (order) => {
  await updateInventory(order.items)
  await sendNotification(order)
  await updateAnalytics(order)
})
```

## 🔒 Security Architecture

### Authentication Flow
```typescript
// JWT Strategy
export const jwtAuth = async (request: FastifyRequest) => {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.JWT_SECRET!)
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { tenant: true }
    })
    
    if (!user) {
      throw new Error('User not found')
    }
    
    request.user = user
    return user
  } catch (error) {
    throw new UnauthorizedError('Invalid token')
  }
}
```

### Role-Based Access Control (RBAC)
```typescript
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  VENDOR = 'vendor',
  CUSTOMER = 'customer'
}

export const permissions = {
  [UserRole.ADMIN]: ['*'],
  [UserRole.MANAGER]: [
    'products:read', 'products:write',
    'orders:read', 'orders:write',
    'inventory:read', 'inventory:write'
  ],
  [UserRole.VENDOR]: [
    'products:read',
    'orders:read', 'orders:write'
  ],
  [UserRole.CUSTOMER]: [
    'products:read',
    'orders:write'
  ]
}
```

## 📊 Performance Architecture

### Caching Strategy
```typescript
// Redis caching
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

export const cacheMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
  const key = `cache:${request.tenant.id}:${request.url}`
  const cached = await redis.get(key)
  
  if (cached) {
    return reply.send(JSON.parse(cached))
  }
  
  // Continue with request...
  reply.addHook('onSend', async (request, reply, payload) => {
    await redis.setex(key, 300, JSON.stringify(payload)) // 5 minutes
    return payload
  })
}
```

### Database Optimization
```typescript
// Prisma query optimization
export const getProducts = async (tenantId: string, filters: ProductFilters) => {
  return prisma.product.findMany({
    where: {
      tenantId,
      isAvailable: true,
      ...filters
    },
    include: {
      category: true,
      customizations: true
    },
    orderBy: [
      { category: { orderIndex: 'asc' } },
      { orderIndex: 'asc' }
    ]
  })
}
```

## 🐳 Container Architecture

### Docker Configuration
```dockerfile
# Backend Dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS builder
COPY . .
RUN npm run build

FROM base AS runner
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/foodmanager
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=foodmanager
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

## 🚀 Deployment Architecture

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
      - run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        uses: railway-app/railway-action@v1
        with:
          api-token: ${{ secrets.RAILWAY_TOKEN }}
```

### Infrastructure as Code
```typescript
// Railway configuration
export default {
  buildCommand: "npm run build",
  startCommand: "npm start",
  healthcheckPath: "/api/health",
  env: {
    NODE_ENV: "production",
    PORT: "3000"
  }
}
```

## 📈 Monitoring & Observability

### Application Monitoring
```typescript
// Health checks
server.get('/api/health', async (request, reply) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: await checkDatabase(),
    redis: await checkRedis(),
    memory: process.memoryUsage()
  }
  
  return reply.send(health)
})

// Error handling
server.setErrorHandler((error, request, reply) => {
  server.log.error(error)
  
  reply.status(500).send({
    error: 'Internal Server Error',
    requestId: request.id,
    timestamp: new Date().toISOString()
  })
})
```

## 🔧 Development Architecture

### Project Structure
```
foodmanager/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── types/
│   ├── prisma/
│   ├── tests/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── types/
│   ├── public/
│   └── package.json
├── docs/
├── docker-compose.yml
└── README.md
```

### Development Workflow
1. **Local Development**: Docker Compose with hot reload
2. **Testing**: Jest + Supertest for backend, Cypress for E2E
3. **Code Quality**: ESLint + Prettier + Husky
4. **Documentation**: OpenAPI/Swagger for API docs
5. **Version Control**: Git with conventional commits

This architecture provides a solid foundation for a scalable, secure, and maintainable multi-tenant SaaS platform for restaurant management.
