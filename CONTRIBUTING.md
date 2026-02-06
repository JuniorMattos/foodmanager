# Contributing to FoodManager

Obrigado pelo seu interesse em contribuir com o FoodManager! Este guia irá ajudá-lo a começar.

## 🚀 Como Começar

### 1. Fork o Repositório

Clique no botão "Fork" no topo da página do GitHub para criar uma cópia do repositório na sua conta.

### 2. Clone o Repositório

```bash
git clone https://github.com/SEU-USUARIO/foodmanager.git
cd foodmanager
```

### 3. Configure o Ambiente

Siga as instruções no [README.md](./README.md) para configurar o ambiente de desenvolvimento.

## 📋 Processo de Contribuição

### 1. Crie uma Branch

Crie uma branch para sua feature ou bugfix:

```bash
git checkout -b feature/nova-feature
# ou
git checkout -b fix/correcao-de-bug
```

### 2. Faça as Mudanças

- Siga as convenções de código do projeto
- Adicione testes se necessário
- Atualize a documentação se relevante

### 3. Teste suas Mudanças

```bash
# Rodar testes
npm run test

# Verificar lint
npm run lint

# Verificar build
npm run build
```

### 4. Commit suas Mudanças

Use mensagens de commit claras e descritivas:

```bash
git commit -m "feat: adicionar nova funcionalidade de pagamento"
# ou
git commit -m "fix: corrigir bug no carrinho de compras"
```

### 5. Push para o seu Fork

```bash
git push origin feature/nova-feature
```

### 6. Crie um Pull Request

- Vá para a página do seu fork no GitHub
- Clique em "New Pull Request"
- Selecione a branch correta
- Preencha o template do PR
- Aguarde a revisão

## 📝 Convenções de Código

### TypeScript

- Use tipagem forte
- Evite `any` sempre que possível
- Defina interfaces para objetos complexos

### React

- Use componentes funcionais
- Siga os hooks rules
- Use TypeScript para props

### CSS/Tailwind

- Use as classes utilitárias do Tailwind
- Evite CSS inline
- Mantenha consistência visual

### Nomenclatura

- Arquivos: `PascalCase` para componentes, `camelCase` para utilitários
- Variáveis: `camelCase`
- Constantes: `UPPER_SNAKE_CASE`
- Funções: `camelCase`

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

## 📋 Tipos de Contribuições

### 🐛 Bug Reports

- Use o template de bug report
- Inclua passos para reproduzir
- Adicione screenshots se relevante

### ✨ Features

- Abra uma issue para discussão antes de começar
- Descreva o problema que a feature resolve
- Inclua exemplos de uso

### 📖 Documentação

- Corrija erros de digitação
- Melhore explicações
- Adicione exemplos

### 🎨 UI/UX

- Melhore a experiência do usuário
- Corrija problemas de acessibilidade
- Otimize para mobile

## 🔧 Configuração de Desenvolvimento

### Environment Variables

Copie os arquivos `.env.example`:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### Database Setup

```bash
cd backend
docker-compose up -d postgres
npx prisma migrate dev
npx prisma generate
```

### Running Localmente

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

## 📋 Code Review

### O que revisamos:

- ✅ Funcionalidade funciona como esperado
- ✅ Testes adicionados/atualizados
- ✅ Código segue as convenções
- ✅ Performance não é impactada negativamente
- ✅ Segurança não é comprometida
- ✅ Documentação atualizada

### Processo:

1. Revisão automática (CI/CD)
2. Revisão por outro desenvolvedor
3. Aprovação e merge

## 🚀 Deploy

### Staging

- Automaticamente deployado em cada push para `main`
- Disponível em: `staging.foodmanager.com`

### Production

- Deployado manualmente após aprovação
- Disponível em: `app.foodmanager.com`

## 📞 Ajuda

### Comunicação

- 📧 Email: dev@foodmanager.com
- 💬 Discord: discord.gg/foodmanager
- 🐛 Issues: GitHub Issues

### Recursos

- 📖 [Documentação](./docs/)
- 🎨 [Design System](./docs/design-system.md)
- 📊 [API Docs](https://api.foodmanager.com/docs)

## 🏆 Reconhecimento

Contribuidores são reconhecidos em:

- 📋 README.md - Seção de contribuidores
- 🏆 Release notes
- 🎖️ Badges especiais

## 📄 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a [MIT License](./LICENSE).

---

**Obrigado por contribuir com o FoodManager!** 🎉

Sua ajuda torna esta plataforma melhor para todos os usuários.
