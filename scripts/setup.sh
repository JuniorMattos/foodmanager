#!/bin/bash

# FoodManager Setup Script
# Este script configura o ambiente de desenvolvimento

set -e

echo "🍔 FoodManager - Setup Script"
echo "================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções de helper
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Verificar pré-requisitos
check_prerequisites() {
    print_info "Verificando pré-requisitos..."
    
    # Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js não encontrado. Por favor, instale Node.js 18+"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2)
    REQUIRED_NODE="18.0.0"
    if [ "$(printf '%s\n' "$REQUIRED_NODE" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_NODE" ]; then
        print_error "Node.js versão $NODE_VERSION encontrada. Versão 18+ requerida."
        exit 1
    fi
    print_success "Node.js $NODE_VERSION encontrado"
    
    # Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker não encontrado. Por favor, instale Docker"
        exit 1
    fi
    print_success "Docker encontrado"
    
    # Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose não encontrado. Por favor, instale Docker Compose"
        exit 1
    fi
    print_success "Docker Compose encontrado"
    
    # Git
    if ! command -v git &> /dev/null; then
        print_error "Git não encontrado. Por favor, instale Git"
        exit 1
    fi
    print_success "Git encontrado"
}

# Configurar ambiente
setup_environment() {
    print_info "Configurando ambiente..."
    
    # Backend .env
    if [ ! -f "backend/.env" ]; then
        if [ -f "backend/.env.example" ]; then
            cp backend/.env.example backend/.env
            print_success "backend/.env criado a partir do exemplo"
        else
            print_warning "backend/.env.example não encontrado. Criando arquivo básico..."
            cat > backend/.env << EOF
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/foodmanager"

# JWT Secrets
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:3000
EOF
        fi
    else
        print_info "backend/.env já existe"
    fi
    
    # Frontend .env
    if [ ! -f "frontend/.env" ]; then
        if [ -f "frontend/.env.example" ]; then
            cp frontend/.env.example frontend/.env
            print_success "frontend/.env criado a partir do exemplo"
        else
            print_warning "frontend/.env.example não encontrado. Criando arquivo básico..."
            cat > frontend/.env << EOF
# API Configuration
VITE_API_URL=http://localhost:3001/api

# Admin Configuration
VITE_ADMIN_TOKEN=admin-mock-token

# Feature Flags
VITE_ENABLE_TENANT_CUSTOMIZATION=true
VITE_ENABLE_ADMIN_PANEL=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_REAL_TIME=true

# Environment
VITE_NODE_ENV=development
EOF
        fi
    else
        print_info "frontend/.env já existe"
    fi
}

# Iniciar banco de dados
setup_database() {
    print_info "Iniciando banco de dados..."
    
    cd backend
    docker-compose up -d postgres
    
    # Esperar PostgreSQL estar pronto
    print_info "Aguardando PostgreSQL iniciar..."
    sleep 10
    
    # Verificar se PostgreSQL está pronto
    until docker-compose exec -T postgres pg_isready -U postgres; do
        print_warning "PostgreSQL não está pronto, aguardando..."
        sleep 2
    done
    
    print_success "PostgreSQL está pronto"
    
    # Rodar migrations
    print_info "Rodando migrations do Prisma..."
    npx prisma migrate dev --name init || npx prisma migrate push
    
    # Gerar client
    print_info "Gerando Prisma client..."
    npx prisma generate
    
    cd ..
    print_success "Banco de dados configurado"
}

# Instalar dependências
install_dependencies() {
    print_info "Instalando dependências..."
    
    # Backend
    print_info "Instalando dependências do backend..."
    cd backend
    npm install
    cd ..
    print_success "Dependências do backend instaladas"
    
    # Frontend
    print_info "Instalando dependências do frontend..."
    cd frontend
    npm install
    cd ..
    print_success "Dependências do frontend instaladas"
}

# Criar dados iniciais
seed_database() {
    print_info "Criando dados iniciais..."
    
    cd backend
    
    # Verificar se já existe usuário admin
    if npx prisma db seed 2>/dev/null || true; then
        print_success "Dados iniciais criados"
    else
        print_warning "Seed não executado (pode já existir dados)"
    fi
    
    cd ..
}

# Verificar instalação
verify_installation() {
    print_info "Verificando instalação..."
    
    # Verificar se os arquivos principais existem
    local files=(
        "backend/package.json"
        "frontend/package.json"
        "backend/.env"
        "frontend/.env"
        "backend/docker-compose.yml"
        "backend/prisma/schema.prisma"
    )
    
    for file in "${files[@]}"; do
        if [ -f "$file" ]; then
            print_success "$file encontrado"
        else
            print_error "$file não encontrado"
        fi
    done
}

# Mostrar próximos passos
show_next_steps() {
    print_info "Setup concluído! 🎉"
    echo ""
    echo "📋 Próximos passos:"
    echo ""
    echo "1. Iniciar o backend:"
    echo "   cd backend && npm run dev"
    echo ""
    echo "2. Iniciar o frontend (em outro terminal):"
    echo "   cd frontend && npm run dev"
    echo ""
    echo "3. Acessar a aplicação:"
    echo "   🌐 Frontend: http://localhost:3000"
    echo "   🔧 Backend API: http://localhost:3001"
    echo "   👨‍💼 Admin Panel: http://localhost:3000/admin"
    echo ""
    echo "📚 Documentação:"
    echo "   📖 README-ADMIN.md - Guia do painel admin"
    echo "   🏢 README-TENANT.md - Sistema multi-tenant"
    echo "   🔗 README-API-INTEGRATION.md - Integração API"
    echo ""
    echo "🔧 Configuração:"
    echo "   Editar backend/.env para configurar banco de dados"
    echo "   Editar frontend/.env para configurar API"
    echo ""
    echo "🚀 Deploy:"
    echo "   docker-compose -f docker-compose.prod.yml up -d"
    echo ""
}

# Função principal
main() {
    echo ""
    print_info "Iniciando setup do FoodManager..."
    echo ""
    
    check_prerequisites
    setup_environment
    setup_database
    install_dependencies
    seed_database
    verify_installation
    show_next_steps
    
    print_success "Setup concluído com sucesso! 🎉"
}

# Executar script
main "$@"
