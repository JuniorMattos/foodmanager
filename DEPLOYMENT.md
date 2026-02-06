# 🚀 Deployment Guide - FoodManager

Guia completo para deploy da plataforma FoodManager em diferentes ambientes.

## 📋 Índice

- [Pré-requisitos](#pré-requisitos)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Deploy Local](#deploy-local)
- [Deploy com Docker](#deploy-com-docker)
- [Deploy em Cloud](#deploy-em-cloud)
- [Monitoramento](#monitoramento)
- [Backup](#backup)
- [Troubleshooting](#troubleshooting)

## 🎯 Pré-requisitos

### Sistema Operacional
- Linux (Ubuntu 20.04+ recomendado)
- macOS 10.15+
- Windows 10+ (com WSL2)

### Software
- Docker 20.10+
- Docker Compose 2.0+
- Node.js 18+
- Git 2.30+

### Hardware Mínimo
- CPU: 2 cores
- RAM: 4GB
- Storage: 20GB SSD
- Network: 100Mbps

## 🔧 Variáveis de Ambiente

### Backend (.env)
```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/foodmanager"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"

# Server
PORT=3001
NODE_ENV=production

# CORS
FRONTEND_URL="https://yourdomain.com"

# Redis (opcional)
REDIS_URL="redis://localhost:6379"

# Email (opcional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# File Storage (opcional)
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="foodmanager-uploads"

# Monitoring (opcional)
SENTRY_DSN="https://your-sentry-dsn"
```

### Frontend (.env)
```bash
# API
VITE_API_URL="https://api.yourdomain.com/api"

# Features
VITE_ENABLE_TENANT_CUSTOMIZATION=true
VITE_ENABLE_ADMIN_PANEL=true
VITE_ENABLE_ANALYTICS=true

# External Services
VITE_STRIPE_PUBLISHABLE_KEY="pk_live_your-stripe-key"
VITE_GOOGLE_MAPS_API_KEY="your-google-maps-key"

# Environment
VITE_NODE_ENV=production
```

## 🏠 Deploy Local

### 1. Setup Automático
```bash
# Clonar repositório
git clone https://github.com/seu-usuario/foodmanager.git
cd foodmanager

# Rodar setup (Windows)
npm run setup:windows

# Rodar setup (Linux/macOS)
npm run setup:unix
```

### 2. Iniciar Serviços
```bash
# Iniciar banco de dados
npm run docker:dev

# Rodar migrations
npm run db:migrate

# Gerar Prisma client
npm run db:generate

# Iniciar aplicação
npm run dev
```

### 3. Acessar Aplicação
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Admin Panel: http://localhost:3000/admin

## 🐳 Deploy com Docker

### 1. Docker Compose (Desenvolvimento)
```bash
# Iniciar todos os serviços
docker-compose up -d

# Verificar logs
docker-compose logs -f

# Parar serviços
docker-compose down
```

### 2. Docker Compose (Produção)
```bash
# Build e iniciar produção
docker-compose -f docker-compose.prod.yml up -d

# Verificar status
docker-compose -f docker-compose.prod.yml ps

# Verificar logs
docker-compose -f docker-compose.prod.yml logs -f

# Atualizar aplicação
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Dockerfile Personalizado
```bash
# Build backend
cd backend
docker build -f Dockerfile.prod -t foodmanager-backend .

# Build frontend
cd ../frontend
docker build -f Dockerfile.prod -t foodmanager-frontend .

# Rodar containers
docker run -d -p 3001:3001 foodmanager-backend
docker run -d -p 3000:80 foodmanager-frontend
```

## ☁️ Deploy em Cloud

### Vercel (Frontend)

#### 1. Instalar Vercel CLI
```bash
npm i -g vercel
```

#### 2. Configurar Projeto
```bash
cd frontend
vercel --prod
```

#### 3. Variáveis de Ambiente
```bash
vercel env add VITE_API_URL production
vercel env add VITE_ENABLE_ADMIN_PANEL production
```

### Railway (Backend)

#### 1. Conectar Repositório
- Acesse railway.app
- Importe o repositório GitHub
- Configure as variáveis de ambiente

#### 2. Deploy Automático
```bash
# Railway faz deploy automático em cada push
# Para deploy manual:
railway up
```

### Render (Backend + Frontend)

#### 1. Criar Web Services
- Backend Service: Node.js
- Frontend Service: Static Site
- PostgreSQL Service: Database

#### 2. Configurar Variáveis
```bash
# No painel do Render
DATABASE_URL="postgresql://user:pass@host:5432/db"
JWT_SECRET="your-secret"
FRONTEND_URL="https://your-app.onrender.com"
```

### AWS (Produção Enterprise)

#### 1. EC2 (Backend)
```bash
# Instalar Docker na EC2
sudo yum update -y
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# Clonar e rodar
git clone https://github.com/seu-usuario/foodmanager.git
cd foodmanager
docker-compose -f docker-compose.prod.yml up -d
```

#### 2. S3 (File Storage)
```bash
# Criar bucket S3
aws s3 mb s3://foodmanager-uploads

# Configurar CORS
aws s3api put-bucket-cors --bucket foodmanager-uploads --cors-configuration file://cors.json
```

#### 3. RDS (Database)
```bash
# Criar instância RDS
aws rds create-db-instance \
  --db-instance-identifier foodmanager-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username postgres \
  --master-user-password your-password \
  --allocated-storage 20
```

## 📊 Monitoramento

### 1. Health Checks
```bash
# Backend health
curl https://api.yourdomain.com/api/health

# Frontend health
curl https://yourdomain.com

# Database health
curl https://api.yourdomain.com/api/admin/system-health
```

### 2. Logs
```bash
# Docker logs
docker-compose -f docker-compose.prod.yml logs -f

# Application logs
tail -f /var/log/foodmanager/app.log

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 3. Metrics
```bash
# CPU e Memory
docker stats

# Disk usage
df -h

# Network connections
netstat -tulpn
```

## 💾 Backup

### 1. Database Backup
```bash
# Backup automático (cron)
0 2 * * * pg_dump foodmanager > /backups/foodmanager-$(date +\%Y\%m\%d).sql

# Backup manual
pg_dump foodmanager > backup.sql

# Restore
psql foodmanager < backup.sql
```

### 2. File Backup
```bash
# Backup de uploads
rsync -av /var/www/uploads/ /backups/uploads/

# Backup de configurações
tar -czf config-backup.tar.gz .env docker-compose.yml
```

### 3. Automatização com Script
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/foodmanager"

# Criar diretório
mkdir -p $BACKUP_DIR

# Backup database
pg_dump foodmanager > $BACKUP_DIR/db_$DATE.sql

# Backup files
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/uploads/

# Limpar backups antigos (7 dias)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Database Connection
```bash
# Verificar se PostgreSQL está rodando
docker-compose ps postgres

# Verificar logs
docker-compose logs postgres

# Testar conexão
psql postgresql://postgres:password@localhost:5432/foodmanager
```

#### 2. Frontend Build Errors
```bash
# Limpar cache
cd frontend
rm -rf node_modules package-lock.json
npm install

# Verificar variáveis de ambiente
cat .env

# Build em modo verbose
npm run build -- --verbose
```

#### 3. Backend API Errors
```bash
# Verificar logs
docker-compose logs backend

# Testar API diretamente
curl -X GET http://localhost:3001/api/health

# Verificar variáveis de ambiente
docker-compose exec backend env
```

#### 4. SSL/Certificate Issues
```bash
# Gerar certificado Let's Encrypt
certbot --nginx -d yourdomain.com

# Renovar certificado
certbot renew

# Verificar certificado
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/fullchain.pem -text -noout
```

### Performance Issues

#### 1. Slow Database
```bash
# Analisar queries lentas
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

# Criar índices
CREATE INDEX CONCURRENTLY idx_tenant_slug ON tenants(slug);
```

#### 2. High Memory Usage
```bash
# Analisar uso de memória
docker stats

# Otimizar Node.js
NODE_OPTIONS="--max-old-space-size=2048"

# Configurar swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## 📱 Deploy Checklist

### Pre-Deploy
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Database migrations testadas
- [ ] Testes passando
- [ ] Build de produção funcionando
- [ ] Backup do ambiente atual

### Post-Deploy
- [ ] Health checks passando
- [ ] Logs sem erros
- [ ] Performance aceitável
- [ ] SSL funcionando
- [ ] Monitoramento ativo

### Security
- [ ] Senhas fortes
- [ ] JWT secrets únicos
- [ ] HTTPS habilitado
- [ ] Firewall configurado
- [ ] Backup automático

---

**Para suporte adicional, consulte:**
- 📖 [Documentação completa](./docs/)
- 🐛 [Issues no GitHub](https://github.com/seu-usuario/foodmanager/issues)
- 📧 [Suporte por email](mailto:suporte@foodmanager.com)
