# 🍔 FoodManager - Sistema Multi-Tenant SaaS

Plataforma completa de gestão de restaurantes com arquitetura multi-tenant, painel administrativo e personalização total de marca.

## 🎯 Visão Geral

FoodManager é uma solução SaaS (Software as a Service) que permite gerenciar múltiplos restaurantes/estabelecimentos a partir de uma única plataforma, cada um com sua identidade visual, configurações e dados independentes.

### 🏗️ Arquitetura

- **Frontend**: React + TypeScript + TailwindCSS + Zustand
- **Backend**: Fastify + TypeScript + Prisma + PostgreSQL
- **Multi-Tenant**: Isolamento completo de dados por tenant
- **Admin Panel**: Gestão centralizada de todos os tenants
- **Customização**: Branding, temas e configurações por tenant

## 🚀 Funcionalidades Principais

### 🏢 Multi-Tenant SaaS
- ✅ **Isolamento Completo**: Dados separados por tenant
- ✅ **Branding Personalizado**: Logo, cores, fontes por cliente
- ✅ **Configurações Independentes**: Moeda, idioma, delivery
- ✅ **Gestão Centralizada**: Painel admin para todos os tenants

### 🎨 Personalização por Tenant
- ✅ **Visual Identity**: Logo, nome, slogan personalizados
- ✅ **Theme System**: Cores, fontes, estilos de botões
- ✅ **Business Settings**: Moeda, delivery, horários
- ✅ **Payment Methods**: Múltiplos métodos de pagamento

### 📊 Painel Administrativo
- ✅ **Dashboard Analytics**: Estatísticas gerais do sistema
- ✅ **Tenant Management**: CRUD completo de tenants
- ✅ **Bulk Operations**: Ações em lote
- ✅ **Export/Import**: CSV para dados
- ✅ **System Health**: Monitoramento do sistema

### 🍽️ Sistema de Pedidos
- ✅ **Menu Digital**: Cardápio com categorias
- ✅ **Carrinho de Compras**: Adicionar/remover itens
- ✅ **Checkout**: Processo de pedido completo
- ✅ **Delivery/Pickup**: Opções de entrega
- ✅ **Payment Integration**: Múltiplos métodos

### 👥 Gestão de Usuários
- ✅ **Authentication**: Login seguro com JWT
- ✅ **Role Management**: Admin, gerente, cliente
- ✅ **User Profiles**: Informações personalizadas
- ✅ **Session Management**: Persistência de sessão

## 📁 Estrutura do Projeto

```
foodmanager/
├── frontend/                 # Aplicação React
│   ├── src/
│   │   ├── components/       # Componentes reutilizáveis
│   │   │   ├── layout/      # Header, Sidebar, Layout
│   │   │   ├── tenant/      # TenantThemeProvider, BrandingHeader
│   │   │   └── ui/          # Componentes UI genéricos
│   │   ├── pages/           # Páginas da aplicação
│   │   │   ├── admin/       # Painel administrativo
│   │   │   ├── auth/        # Login, registro
│   │   │   ├── customer/    # Menu, checkout
│   │   │   ├── dashboard/   # Dashboard principal
│   │   │   └── tenant/      # Configurações do tenant
│   │   ├── stores/          # Estado global (Zustand)
│   │   │   ├── adminStore.ts # Estado admin
│   │   │   ├── authStore.ts # Estado autenticação
│   │   │   └── tenantStore.ts # Estado tenant
│   │   ├── services/        # API services
│   │   │   ├── api.ts       # Configuração Axios
│   │   │   └── adminApi.ts # API admin
│   │   ├── types/           # Tipos TypeScript
│   │   │   ├── admin.ts     # Tipos admin
│   │   │   ├── tenant.ts    # Tipos tenant
│   │   │   └── auth.ts      # Tipos autenticação
│   │   ├── hooks/           # Hooks personalizados
│   │   │   └── useTenantTheme.ts # Hook de tema
│   │   └── utils/           # Utilitários
│   ├── public/              # Arquivos estáticos
│   ├── package.json         # Dependências frontend
│   └── vite.config.ts       # Configuração Vite
├── backend/                 # API Fastify
│   ├── src/
│   │   ├── routes/          # Rotas da API
│   │   │   ├── admin.ts     # Rotas admin
│   │   │   ├── auth.ts      # Autenticação
│   │   │   ├── public.ts    # Rotas públicas
│   │   │   └── *-simple.ts # Rotas simples
│   │   ├── middleware/      # Middlewares
│   │   │   ├── auth.ts      # Autenticação
│   │   │   ├── adminAuth.ts # Auth admin
│   │   │   └── tenant.ts    # Tenant middleware
│   │   ├── lib/             # Bibliotecas
│   │   │   └── prisma.ts    # Cliente Prisma
│   │   ├── prisma/          # Schema e migrations
│   │   │   └── schema.prisma # Schema do banco
│   │   └── server.ts        # Servidor principal
│   ├── package.json         # Dependências backend
│   └── docker-compose.yml   # Docker PostgreSQL
├── docs/                    # Documentação
│   ├── README-ADMIN.md       # Guia do admin
│   ├── README-TENANT.md      # Guia de tenants
│   └── README-API-INTEGRATION.md # Integração API
└── README.md               # Este arquivo
```

## �️ Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem forte
- **Vite** - Build tool rápido
- **TailwindCSS** - Framework CSS
- **Zustand** - Estado global
- **React Router** - Navegação
- **Axios** - Cliente HTTP
- **Lucide React** - Ícones
- **React Hook Form** - Formulários

### Backend
- **Fastify** - Servidor web rápido
- **TypeScript** - Tipagem forte
- **Prisma** - ORM de banco de dados
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **Zod** - Validação de dados
- **Bun** - Runtime JavaScript

### DevOps
- **Docker** - Containers
- **Docker Compose** - Orquestração
- **ESLint** - Linting
- **Prettier** - Formatação
- **Husky** - Git hooks

## �🚀 Quick Start

### Pré-requisitos
- Node.js 18+
- Docker e Docker Compose
- Git

### 1. Clonar Repositório
```bash
git clone https://github.com/seu-usuario/foodmanager.git
cd foodmanager
```

### 2. Configurar Ambiente
```bash
# Copiar arquivos de ambiente
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Editar configurações
nano backend/.env
nano frontend/.env
```

### 3. Iniciar Banco de Dados
```bash
# Iniciar PostgreSQL
cd backend
docker-compose up -d

# Rodar migrations
npx prisma migrate dev
npx prisma generate
```

### 4. Instalar Dependências
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 5. Iniciar Aplicação
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 6. Acessar Aplicação
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Admin Panel**: http://localhost:3000/admin
- **API Docs**: http://localhost:3001/docs

## 🔧 Configuração

### Backend (.env)
```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/foodmanager"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"

# Server
PORT=3001
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```bash
# API
VITE_API_URL=http://localhost:3001/api

# Admin
VITE_ADMIN_TOKEN=admin-mock-token

# Features
VITE_ENABLE_TENANT_CUSTOMIZATION=true
VITE_ENABLE_ADMIN_PANEL=true
```

## 📚 Documentação

### 📖 Guias
- [📋 README-ADMIN.md](./docs/README-ADMIN.md) - Guia completo do painel admin
- [🏢 README-TENANT.md](./docs/README-TENANT.md) - Sistema de multi-tenancy
- [🔗 README-API-INTEGRATION.md](./docs/README-API-INTEGRATION.md) - Integração API

### 🎯 Features
- **Multi-Tenant**: Suporte a infinitos clientes
- **Customização**: Branding e temas por cliente
- **Admin Panel**: Gestão centralizada completa
- **API REST**: Documentação completa
- **Real-time**: WebSocket para atualizações
- **Security**: JWT, CORS, rate limiting
- **Performance**: Caching, otimizações
- **Scalability**: Arquitetura horizontal

## 🧪 Testes

### Backend
```bash
cd backend
npm run test          # Unit tests
npm run test:e2e      # Integration tests
npm run test:coverage # Coverage report
```

### Frontend
```bash
cd frontend
npm run test          # Unit tests
npm run test:e2e      # Playwright tests
npm run test:coverage # Coverage report
```

## 📦 Deploy

### Docker Production
```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Start production
docker-compose -f docker-compose.prod.yml up -d
```

### Vercel (Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

### Railway/Render (Backend)
```bash
# Deploy backend
cd backend
# Conectar ao repositório no Railway/Render
```

## 🔒 Segurança

- ✅ **JWT Authentication**: Tokens seguros
- ✅ **CORS Protection**: Controle de origem
- ✅ **Rate Limiting**: Proteção contra abuse
- ✅ **Input Validation**: Validação rigorosa
- ✅ **SQL Injection**: Proteção via Prisma
- ✅ **XSS Protection**: Sanitização de dados
- ✅ **HTTPS**: SSL em produção

## 📈 Performance

- ✅ **Code Splitting**: Lazy loading
- ✅ **Caching**: Redis para dados frequentes
- ✅ **Database Indexes**: Queries otimizadas
- ✅ **Image Optimization**: WebP, lazy load
- ✅ **Bundle Analysis**: Tamanho otimizado
- ✅ **CDN**: Assets distribuídos

## 🤝 Contribuição

1. Fork o projeto
2. Criar feature branch: `git checkout -b feature/nova-feature`
3. Commit mudanças: `git commit -m 'Add nova feature'`
4. Push: `git push origin feature/nova-feature`
5. Pull Request

## 📄 Licença

MIT License - ver arquivo [LICENSE](LICENSE)

## 📞 Suporte

- 📧 Email: contato@foodmanager.com
- 📖 Docs: docs.foodmanager.com
- 🐛 Issues: github.com/seu-usuario/foodmanager/issues
- 💬 Discord: discord.gg/foodmanager

---

## 🎉 Roadmap

### v1.0 (Atual)
- ✅ Multi-tenant SaaS
- ✅ Admin panel
- ✅ Tenant customization
- ✅ API integration

### v1.1 (Próximo)
- 🔄 Real-time updates
- 📱 Mobile app
- 📊 Advanced analytics
- 🌍 Multi-language

### v2.0 (Futuro)
- 🤖 AI recommendations
- 📦 Inventory management
- 💳 Payment gateway
- 🚀 Microservices

---

**FoodManager - Plataforma SaaS para gestão de restaurantes** 🍔

Sistema completo, escalável e personalizável para múltiplos clientes.
- Redis 7+

### Desenvolvimento Local

1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd foodmanager
   ```

2. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env.local
   # Configure suas credenciais do Supabase
   ```

3. **Inicie com Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Acesse as aplicações**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Grafana: http://localhost:3002
   - Prometheus: http://localhost:9090

### Desenvolvimento Manual

1. **Backend**
   ```bash
   cd backend
   npm install
   npm run db:generate
   npm run db:push
   npm run db:seed
   npm run dev
   ```

2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## � Módulos Principais

### 📱 Cardápio Online (Cliente)
- Interface responsiva para clientes
- Busca e filtragem de produtos
- Carrinho com personalizações
- Múltiplos métodos de pagamento
- Sistema de entrega/retirada

### 🛒 PDV (Ponto de Venda)
- Interface para vendas presenciais
- Gestão de caixa
- Impressão de comprovantes
- Integração com estoque

### 📊 Dashboard Administrativo
- Gestão de pedidos em tempo real
- Controle de estoque
- Relatórios financeiros
- Gestão de cardápio

### 🔐 Autenticação Multi-tenant
- Isolamento completo de dados
- Controle de acesso por roles
- JWT com refresh tokens

### ⚡ Recursos em Tempo Real
- Atualizações instantâneas via Socket.io
- Sincronização entre PDV e Dashboard
- Notificações de novos pedidos

## 🏗️ Arquitetura

### Backend
- **Framework**: Node.js + Fastify
- **Banco**: PostgreSQL + Prisma ORM
- **Cache**: Redis
- **Real-time**: Socket.io
- **Auth**: JWT + Refresh Tokens

### Frontend
- **Framework**: Next.js 14 + TypeScript
- **Estilização**: TailwindCSS + shadcn/ui
- **Estado**: React Hooks + Context API
- **Gráficos**: Recharts

### DevOps
- **Containerização**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoramento**: Prometheus + Grafana
- **Deploy**: Railway/Fly.io

## 📊 Estrutura do Projeto

```
foodmanager/
├── backend/                 # API Node.js
│   ├── src/
│   │   ├── routes/        # Endpoints da API
│   │   ├── middleware/    # Middlewares
│   │   ├── services/       # Lógica de negócio
│   │   └── utils/          # Utilitários
│   ├── prisma/             # Schema e seeds
│   └── Dockerfile
├── frontend/               # Aplicação Next.js
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/          # Páginas
│   │   ├── hooks/          # Hooks personalizados
│   │   └── types/          # Tipos TypeScript
│   └── Dockerfile
├── docs/                   # Documentação
├── database/               # Scripts SQL
├── monitoring/             # Configurações de monitoramento
├── nginx/                  # Configurações do Nginx
├── .github/workflows/      # CI/CD
└── docker-compose.yml      # Orquestração dos serviços
```

## � Configuração

### Variáveis de Ambiente

#### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/foodmanager
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

## 🧪 Testes

### Backend
```bash
cd backend
npm run test              # Unit tests
npm run test:e2e          # Integration tests
npm run test:coverage     # Coverage report
```

### Frontend
```bash
cd frontend
npm run test              # Unit tests
npm run test:e2e          # E2E tests com Playwright
npm run test:coverage     # Coverage report
```

## 📊 Monitoramento

### Métricas Disponíveis
- Performance da API
- Uso de recursos
- Taxa de erro
- Tempo de resposta
- Sessões ativas

### Acesso
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3002 (admin/admin123)

## 🚀 Deploy

### Railway
1. Conecte seu repositório ao Railway
2. Configure as variáveis de ambiente
3. Deploy automático via GitHub Actions

### Manual
```bash
# Build e push das imagens
docker-compose build
docker-compose push

# Deploy no servidor
docker-compose -f docker-compose.prod.yml up -d
```

## 📚 Documentação

- [API Contracts](./docs/api-contracts.md) - Documentação completa da API
- [Database Schema](./database/schema.sql) - Estrutura do banco de dados
- [Architecture](./docs/system-architecture.md) - Arquitetura detalhada
- [MVP Definition](./docs/product-manager-mvp.md) - Definição do MVP

## 🔐 Segurança

- Isolamento multi-tenant via Row Level Security
- Autenticação JWT com refresh tokens
- Rate limiting em endpoints sensíveis
- Validação de entrada com Zod
- CORS configurado
- Headers de segurança

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'Add amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

- **Documentação**: https://docs.foodmanager.com
- **API Reference**: https://api.foodmanager.com/docs
- **Issues**: https://github.com/username/foodmanager/issues
- **Email**: support@foodmanager.com

## 🎯 Roadmap

- [ ] Integração com gateways de pagamento
- [ ] App mobile (React Native)
- [ ] Sistema de fidelidade
- [ ] Analytics avançado
- [ ] Multi-idioma
- [ ] Temas customizáveis
