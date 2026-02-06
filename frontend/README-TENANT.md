# Sistema Multi-Tenant Personalizável - FoodManager

## 🎯 Visão Geral

Sistema completo de personalização para empresas que adotarem a solução FoodManager, permitindo branding total e configurações específicas por cliente.

## 🏗️ Arquitetura

### 1. Tipos e Interfaces
- **Tenant**: Dados principais do cliente
- **TenantTheme**: Cores, fontes, estilos visuais
- **TenantBranding**: Logo, nome, slogan, redes sociais
- **TenantSettings**: Configurações de negócio (moeda, entrega, etc.)

### 2. Stores (Zustand)
- **tenantStore**: Gerencia estado do tenant atual
- **authStore**: Mantido, integrado com tenant

### 3. Componentes
- **TenantThemeProvider**: Aplica tema globalmente
- **BrandingHeader**: Header personalizado com logo/nome
- **useTenantTheme**: Hook para acessar configurações

## 🎨 Personalização Disponível

### Branding
- ✅ **Logo Upload** (PNG, JPG, SVG)
- ✅ **Nome da Marca** (ex: "Burger Express")
- ✅ **Slogan** (ex: "O melhor hambúrguer da cidade")
- ✅ **Favicon** personalizado
- ✅ **Redes Sociais** (Facebook, Instagram, WhatsApp)

### Tema Visual
- ✅ **Cores Customizáveis**
  - Cor primária (botões, elementos principais)
  - Cor secundária (hover, elementos secundários)
  - Cor de destaque (badges, notificações)
  - Cor de fundo (background)
  - Cor do texto
- ✅ **Estilos de Botão** (Arredondado, Quadrado, Pílula)
- ✅ **Fontes** (Inter, Roboto, Open Sans, Poppins, Montserrat)

### Configurações de Negócio
- ✅ **Moeda** (BRL, USD, EUR)
- ✅ **Idioma** (PT-BR, EN-US, ES)
- ✅ **Fuso Horário** (São Paulo, Nova York, Londres)
- ✅ **Entrega/Retirada** (habilitar/desabilitar)
- ✅ **Valor Mínimo** do pedido
- ✅ **Métodos de Pagamento** (cartão, PIX, dinheiro)
- ✅ **Horário de Funcionamento** por dia da semana

## 🚀 Como Usar

### 1. Configuração Inicial
```typescript
// No tenantStore
const tenant = {
  id: 'tenant-001',
  name: 'Burger Express',
  branding: {
    brand_name: 'Burger Express',
    logo_url: 'https://exemplo.com/logo.png',
    tagline: 'O melhor hambúrguer da cidade'
  },
  theme: {
    primary_color: '#ea580c',
    secondary_color: '#f97316',
    button_style: 'rounded',
    font_family: 'Inter, sans-serif'
  },
  settings: {
    currency: 'BRL',
    currency_symbol: 'R$',
    language: 'pt-BR',
    delivery_enabled: true,
    pickup_enabled: true
  }
}
```

### 2. Aplicação do Tema
```typescript
// Automaticamente aplicado via TenantThemeProvider
import { TenantThemeProvider } from '@/components/tenant/TenantThemeProvider'

function App() {
  return (
    <TenantThemeProvider>
      <Router>
        <Routes />
      </Router>
    </TenantThemeProvider>
  )
}
```

### 3. Uso em Componentes
```typescript
import { useTenantTheme } from '@/hooks/useTenantTheme'
import { BrandingHeader } from '@/components/tenant/BrandingHeader'

function MenuPage() {
  const { branding, primaryColor } = useTenantTheme()
  
  return (
    <div>
      <BrandingHeader />
      {/* Componentes com tema aplicado */}
      <button style={{ backgroundColor: primaryColor }}>
        Comprar
      </button>
    </div>
  )
}
```

## 📱 Exemplos de Personalização

### Exemplo 1: Pizzaria
```typescript
{
  branding: {
    brand_name: 'Pizza Palace',
    logo_url: '/pizza-logo.png',
    tagline: 'A melhor pizza artesanal',
    primary_color: '#dc2626' // Vermelho
  },
  theme: {
    primary_color: '#dc2626',
    secondary_color: '#ef4444',
    button_style: 'rounded',
    font_family: 'Poppins, sans-serif'
  },
  settings: {
    currency: 'BRL',
    delivery_enabled: true,
    min_order_amount: 25.00
  }
}
```

### Exemplo 2: Restaurante Japonês
```typescript
{
  branding: {
    brand_name: 'Sakura Sushi',
    logo_url: '/sakura-logo.png',
    tagline: 'Tradição e sabor',
    primary_color: '#0891b2' // Azul
  },
  theme: {
    primary_color: '#0891b2',
    secondary_color: '#06b6d4',
    button_style: 'square',
    font_family: 'Montserrat, sans-serif'
  },
  settings: {
    currency: 'BRL',
    delivery_enabled: true,
    min_order_amount: 50.00
  }
}
```

## 🔧 Implementação Técnica

### 1. CSS Variables
```css
:root {
  --primary-color: #ea580c;
  --secondary-color: #f97316;
  --accent-color: #fed7aa;
  --background-color: #ffffff;
  --text-color: #1f2937;
  --font-family: 'Inter, sans-serif';
}

[data-button-style="rounded"] {
  border-radius: 0.5rem;
}

[data-button-style="square"] {
  border-radius: 0;
}

[data-button-style="pill"] {
  border-radius: 9999px;
}
```

### 2. Persistência
- Configurações salvas em `localStorage`
- Sincronização com backend via API
- Cache otimizado para performance

### 3. Performance
- Lazy loading de componentes
- CSS variables para mudanças dinâmicas
- Debounce em atualizações de tema

## 📋 Checklist de Implementação

- [x] Tipos TypeScript para tenant
- [x] Store Zustand para gerenciamento
- [x] Hook customizado para tema
- [x] Provider de tema global
- [x] Header personalizado
- [x] Página de configuração completa
- [x] Upload de logo
- [x] Preview em tempo real
- [x] Persistência de configurações
- [x] Integração com sistema existente

## 🎯 Benefícios

### Para Empresas
- ✅ **Identidade Visual** própria
- ✅ **Configurações** específicas do negócio
- ✅ **Diferenciação** no mercado
- ✅ **Experiência** personalizada para clientes

### Para Desenvolvedores
- ✅ **Escalabilidade** para N clientes
- ✅ **Manutenibilidade** do código
- ✅ **Reuso** de componentes
- ✅ **Documentação** completa

### Para Clientes Finais
- ✅ **Experiência** consistente com a marca
- ✅ **Confiança** visual
- ✅ **Usabilidade** personalizada

## 🚀 Próximos Passos

1. **Admin Multi-Tenant**: Painel para gerenciar múltiplos tenants
2. **Templates Pré-definidos**: Temas rápidos para diferentes segmentos
3. **Preview Avançado**: Visualização 3D da personalização
4. **Export/Import**: Backup e migração de configurações
5. **Analytics**: Uso das personalizações por tenant

## 📞 Suporte

Para dúvidas ou implementação:
- 📧 Email: suporte@foodmanager.com
- 📖 Documentação: docs.foodmanager.com/tenant
- 🎥 Vídeos: youtube.com/foodmanager

---

**O FoodManager agora é totalmente personalizável e escalável para qualquer negócio!** 🚀
