@echo off
REM FoodManager Setup Script for Windows
REM Este script configura o ambiente de desenvolvimento

echo 🍔 FoodManager - Setup Script
echo ================================

REM Verificar pré-requisitos
echo Verificando pré-requisitos...

REM Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado. Por favor, instale Node.js 18+
    pause
    exit /b 1
)
echo ✅ Node.js encontrado

REM Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker não encontrado. Por favor, instale Docker
    pause
    exit /b 1
)
echo ✅ Docker encontrado

REM Docker Compose
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose não encontrado. Por favor, instale Docker Compose
    pause
    exit /b 1
)
echo ✅ Docker Compose encontrado

REM Git
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git não encontrado. Por favor, instale Git
    pause
    exit /b 1
)
echo ✅ Git encontrado

REM Configurar ambiente
echo Configurando ambiente...

REM Backend .env
if not exist "backend\.env" (
    if exist "backend\.env.example" (
        copy "backend\.env.example" "backend\.env" >nul
        echo ✅ backend\.env criado a partir do exemplo
    ) else (
        echo ⚠️  backend\.env.example não encontrado. Criando arquivo básico...
        (
            echo # Database
            echo DATABASE_URL="postgresql://postgres:password@localhost:5432/foodmanager"
            echo.
            echo # JWT Secrets
            echo JWT_SECRET="your-super-secret-jwt-key-change-in-production"
            echo JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"
            echo.
            echo # Server Configuration
            echo PORT=3001
            echo NODE_ENV=development
            echo.
            echo # CORS
            echo FRONTEND_URL=http://localhost:3000
        ) > "backend\.env"
    )
) else (
    echo ℹ️  backend\.env já existe
)

REM Frontend .env
if not exist "frontend\.env" (
    if exist "frontend\.env.example" (
        copy "frontend\.env.example" "frontend\.env" >nul
        echo ✅ frontend\.env criado a partir do exemplo
    ) else (
        echo ⚠️  frontend\.env.example não encontrado. Criando arquivo básico...
        (
            echo # API Configuration
            echo VITE_API_URL=http://localhost:3001/api
            echo.
            echo # Admin Configuration
            echo VITE_ADMIN_TOKEN=admin-mock-token
            echo.
            echo # Feature Flags
            echo VITE_ENABLE_TENANT_CUSTOMIZATION=true
            echo VITE_ENABLE_ADMIN_PANEL=true
            echo VITE_ENABLE_ANALYTICS=true
            echo VITE_ENABLE_REAL_TIME=true
            echo.
            echo # Environment
            echo VITE_NODE_ENV=development
        ) > "frontend\.env"
    )
) else (
    echo ℹ️  frontend\.env já existe
)

REM Iniciar banco de dados
echo Iniciando banco de dados...
cd backend
docker-compose up -d postgres

REM Esperar PostgreSQL estar pronto
echo Aguardando PostgreSQL iniciar...
timeout /t 10 /nobreak >nul

REM Verificar se PostgreSQL está pronto
:check_postgres
docker-compose exec -T postgres pg_isready -U postgres >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  PostgreSQL não está pronto, aguardando...
    timeout /t 2 /nobreak >nul
    goto check_postgres
)
echo ✅ PostgreSQL está pronto

REM Rodar migrations
echo Rodando migrations do Prisma...
npx prisma migrate dev --name init 2>nul || npx prisma migrate push

REM Gerar client
echo Gerando Prisma client...
npx prisma generate
cd ..
echo ✅ Banco de dados configurado

REM Instalar dependências
echo Instalando dependências...

REM Backend
echo Instalando dependências do backend...
cd backend
npm install
cd ..
echo ✅ Dependências do backend instaladas

REM Frontend
echo Instalando dependências do frontend...
cd frontend
npm install
cd ..
echo ✅ Dependências do frontend instaladas

REM Criar dados iniciais
echo Criando dados iniciais...
cd backend
npx prisma db seed 2>nul || echo ⚠️  Seed não executado (pode já existir dados)
cd ..

REM Verificar instalação
echo Verificando instalação...

set files=backend\package.json frontend\package.json backend\.env frontend\.env backend\docker-compose.yml backend\prisma\schema.prisma

for %%f in (%files%) do (
    if exist "%%f" (
        echo ✅ %%f encontrado
    ) else (
        echo ❌ %%f não encontrado
    )
)

REM Mostrar próximos passos
echo.
echo ℹ️  Setup concluído! 🎉
echo.
echo 📋 Próximos passos:
echo.
echo 1. Iniciar o backend:
echo    cd backend ^&^& npm run dev
echo.
echo 2. Iniciar o frontend (em outro terminal):
echo    cd frontend ^&^& npm run dev
echo.
echo 3. Acessar a aplicação:
echo    🌐 Frontend: http://localhost:3000
echo    🔧 Backend API: http://localhost:3001
echo    👨‍💼 Admin Panel: http://localhost:3000/admin
echo.
echo 📚 Documentação:
echo    📖 README-ADMIN.md - Guia do painel admin
echo    🏢 README-TENANT.md - Sistema multi-tenant
echo    🔗 README-API-INTEGRATION.md - Integração API
echo.
echo 🔧 Configuração:
echo    Editar backend\.env para configurar banco de dados
echo    Editar frontend\.env para configurar API
echo.
echo 🚀 Deploy:
echo    docker-compose -f docker-compose.prod.yml up -d
echo.

echo ✅ Setup concluído com sucesso! 🎉
pause
