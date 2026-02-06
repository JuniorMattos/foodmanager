import 'jest'

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-secret'
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/foodmanager_test'

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn(() => ({
    customers: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
      del: jest.fn(),
      list: jest.fn(),
    },
    checkout: {
      sessions: {
        create: jest.fn(),
        retrieve: jest.fn(),
      },
    },
    billingPortal: {
      sessions: {
        create: jest.fn(),
      },
    },
    subscriptions: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
      cancel: jest.fn(),
      list: jest.fn(),
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
    invoices: {
      create: jest.fn(),
      retrieve: jest.fn(),
      list: jest.fn(),
    },
    paymentMethods: {
      create: jest.fn(),
      retrieve: jest.fn(),
      list: jest.fn(),
    },
  }))
})

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $transaction: jest.fn(),
    tenant: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
      findFirst: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
      findFirst: jest.fn(),
    },
    session: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    activity: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    subscription: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    invoice: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    usage: {
      findMany: jest.fn(),
      create: jest.fn(),
      aggregate: jest.fn(),
    },
  })),
}))

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}))

// Mock fs for JWT keys
jest.mock('fs', () => ({
  readFileSync: jest.fn(() => 'mock-key-content'),
  existsSync: jest.fn(() => true),
}))

// Global test utilities
global.createMockTenant = (overrides = {}) => ({
  id: 'test-tenant-id',
  name: 'Test Tenant',
  slug: 'test-tenant',
  domain: 'test.foodmanager.com',
  logoUrl: null,
  address: null,
  phone: '+1234567890',
  status: 'ACTIVE',
  planId: 'standard',
  subscriptionId: 'test-subscription-id',
  settings: {
    timezone: 'America/Sao_Paulo',
    currency: 'BRL',
    language: 'pt-BR',
    theme: {
      primaryColor: '#000000',
      secondaryColor: '#ffffff',
      logo: null,
    },
    features: {
      onlineOrders: true,
      delivery: true,
      pickup: true,
      reservations: false,
      loyalty: false,
      analytics: true,
    },
    notifications: {
      email: true,
      sms: false,
      push: true,
    },
    integrations: {
      stripe: true,
      pos: false,
      inventory: true,
      accounting: false,
    },
  },
  usage: {
    users: 5,
    products: 100,
    orders: 500,
    apiCalls: 10000,
    storage: 1000000,
  },
  limits: {
    users: 10,
    products: 200,
    orders: 1000,
    apiCalls: 20000,
    storage: 2000000,
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
})

global.createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  role: 'ADMIN',
  tenantId: 'test-tenant-id',
  avatar: null,
  phone: '+1234567890',
  lastLoginAt: new Date('2024-01-01'),
  isActive: true,
  emailVerified: true,
  phoneVerified: false,
  preferences: {
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    theme: 'light',
    notifications: {
      email: true,
      sms: false,
      push: true,
      desktop: false,
    },
    dashboard: {
      layout: 'default',
      widgets: ['orders', 'revenue', 'customers'],
      refreshInterval: 30000,
    },
    privacy: {
      shareData: false,
      analytics: true,
      marketing: false,
    },
  },
  permissions: ['read', 'write', 'delete', 'manage_users', 'manage_billing'],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
})

global.createMockBillingPlan = (overrides = {}) => ({
  id: 'standard',
  name: 'Standard Plan',
  description: 'Standard plan for growing businesses',
  priceId: 'price_standard',
  amount: 9900,
  currency: 'BRL',
  interval: 'month',
  features: [
    'Até 10 usuários',
    'Até 200 produtos',
    'Dashboard avançado',
    'PDV completo',
  ],
  limits: {
    users: 10,
    products: 200,
    orders: 1000,
    apiCalls: 20000,
    storage: 2000000,
  },
  stripePriceId: 'price_stripe_standard',
  isActive: true,
  trialDays: 14,
  ...overrides,
})

// Test helpers
global.createMockRequest = (overrides = {}) => ({
  body: {},
  query: {},
  params: {},
  headers: {},
  user: {
    userId: 'test-user-id',
    email: 'test@example.com',
    role: 'ADMIN',
    tenantId: 'test-tenant-id',
  },
  tenant: {
    id: 'test-tenant-id',
    name: 'Test Tenant',
    slug: 'test-tenant',
  },
  ...overrides,
})

global.createMockReply = () => {
  const reply = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    code: jest.fn().mockReturnThis(),
    redirect: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
    type: jest.fn().mockReturnThis(),
    header: jest.fn().mockReturnThis(),
  }
  return reply
}

// Async test timeout
jest.setTimeout(10000)
