# 🍔 FoodManager

Sistema completo multi-tenant para gestão de estabelecimentos alimentícios, incluindo PDV, cardápio online, gestão de pedidos, estoque, financeiro e painel administrativo.

## 🚀 Quick Start

### Pré-requisitos
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+
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
