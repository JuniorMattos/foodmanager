# FoodManager Frontend

Frontend moderno e responsivo para o sistema de gestão de restaurantes FoodManager.

## 🚀 Tecnologias

- **React 18** - Biblioteca principal de UI
- **TypeScript** - Tipagem segura
- **Vite** - Build tool ultra-rápido
- **TailwindCSS** - Framework CSS utilitário
- **React Router** - Navegação client-side
- **Zustand** - Gerenciamento de estado
- **React Hook Form** - Formulários com validação
- **Axios** - Cliente HTTP
- **Socket.io Client** - Comunicação real-time
- **React Hot Toast** - Notificações toast
- **Lucide React** - Ícones modernos

## 🛠️ Desenvolvimento

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Instalação

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Rodar testes
npm run test

# Testes com UI
npm run test:ui

# Testes E2E
npm run test:e2e
```

### Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build
- `npm run test` - Testes unitários
- `npm run test:ui` - Interface de testes
- `npm run test:coverage` - Cobertura de testes
- `npm run test:e2e` - Testes E2E
- `npm run lint` - Linting
- `npm run lint:fix` - Corrigir linting
- `npm run type-check` - Verificação de tipos

## 🏗️ Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── layout/        # Layout components
│   ├── pdv/          # PDV components
│   └── ui/           # UI components
├── hooks/             # Custom hooks
├── pages/             # Page components
│   ├── auth/         # Authentication pages
│   ├── dashboard/    # Dashboard
│   ├── pdv/          # Ponto de Venda
│   └── ...
├── services/          # API services
├── stores/            # Zustand stores
├── types/             # TypeScript types
├── utils/             # Utility functions
└── test/              # Test files
```

## 🔐 Autenticação

O sistema usa JWT com refresh tokens:

- **Access Token**: 15 minutos de validade
- **Refresh Token**: 7 dias de validade
- **Storage**: Persistido no localStorage
- **Auto-refresh**: Renovação automática de tokens

## 📱 Features Implementadas

### ✅ Core Features
- [x] Autenticação multi-tenant
- [x] Dashboard administrativo
- [x] PDV (Ponto de Venda)
- [x] Cardápio online
- [x] Gestão de produtos
- [x] Gestão de pedidos
- [x] Controle de estoque
- [x] Gestão financeira

### ✅ Technical Features
- [x] Lazy loading de componentes
- [x] Code splitting automático
- [x] Real-time updates via WebSocket
- [x] Estado persistido
- [x] Tratamento de erros global
- [x] Loading states
- [x] Responsividade completa
- [x] Acessibilidade (ARIA)

### ✅ Performance
- [x] Bundle optimization
- [x] Tree shaking
- [x] Minificação automática
- [x] Cache strategies
- [x] Image optimization
- [x] Font optimization

## 🧪 Testes

### Testes Unitários
```bash
# Rodar todos os testes
npm run test

# Com cobertura
npm run test:coverage

# Interface visual
npm run test:ui
```

### Testes E2E
```bash
# Rodar testes E2E
npm run test:e2e

# Interface visual
npm run test:e2e:ui
```

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente:
   - `VITE_API_URL`: URL da API
   - `VITE_WS_URL`: URL do WebSocket
3. Deploy automático

### Railway
1. Crie novo projeto no Railway
2. Conecte o repositório
3. Configure as variáveis de ambiente
4. Deploy automático

### Manual
```bash
# Build
npm run build

# Deploy da pasta /dist
```

## 🌍 Variáveis de Ambiente

### Development
```env
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001
```

### Production
```env
VITE_API_URL=https://sua-api.com/api
VITE_WS_URL=https://sua-api.com
```

## 📊 Performance

- **First Load**: ~200KB gzipped
- **Time to Interactive**: <2s
- **Lighthouse Score**: 95+
- **Bundle Size**: Otimizado com code splitting

## 🔧 Configuração

### Vite
- Hot Module Replacement
- Path aliases (`@/`)
- Proxy para API e WebSocket
- Optimização de build

### TailwindCSS
- Design system customizado
- Cores primárias
- Animações customizadas
- Componentes reutilizáveis

## 🤝 Contribuição

1. Fork o projeto
2. Crie branch feature (`git checkout -b feature/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'Add amazing feature'`)
4. Push para o branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

## 📝 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

Para suporte, abra uma issue no GitHub ou contate a equipe de desenvolvimento.
