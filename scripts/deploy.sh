#!/bin/bash

# 🚀 FastFood Deploy Script
# Script para automatizar o deploy do sistema FastFood

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  🚀 FastFood Deploy Script${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_step() {
    echo -e "${YELLOW}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
check_directory() {
    if [ ! -f "backend/pyproject.toml" ] || [ ! -f "frontend/index.html" ]; then
        print_error "Execute este script na raiz do projeto FastFood"
        exit 1
    fi
}

# Test database connection
test_database() {
    print_step "Testando conexão com o banco de dados..."
    
    cd backend
    if make db-test > /dev/null 2>&1; then
        print_success "Conexão com banco OK"
    else
        print_error "Falha na conexão com banco"
        print_info "Verifique as variáveis de ambiente"
        exit 1
    fi
    cd ..
}

# Run migrations
run_migrations() {
    print_step "Executando migrações..."
    
    cd backend
    if make db-migrate > /dev/null 2>&1; then
        print_success "Migrações executadas"
    else
        print_error "Falha nas migrações"
        exit 1
    fi
    cd ..
}

# Test backend locally
test_backend() {
    print_step "Testando backend localmente..."
    
    cd backend
    if timeout 10s make dev > /dev/null 2>&1 & then
        sleep 5
        if curl -f http://localhost:8000/health > /dev/null 2>&1; then
            print_success "Backend funcionando"
            pkill -f "uvicorn"
        else
            print_error "Backend não respondeu"
            pkill -f "uvicorn"
            exit 1
        fi
    else
        print_error "Falha ao iniciar backend"
        exit 1
    fi
    cd ..
}

# Check frontend files
check_frontend() {
    print_step "Verificando arquivos do frontend..."
    
    required_files=("frontend/index.html" "frontend/styles.css" "frontend/script.js")
    
    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            print_success "✓ $file"
        else
            print_error "✗ $file não encontrado"
            exit 1
        fi
    done
}

# Generate deployment info
generate_deploy_info() {
    print_step "Gerando informações de deploy..."
    
    cat > DEPLOY_INFO.md << EOF
# 📊 Informações de Deploy

## 🕐 Data/Hora
$(date)

## 🔧 Configurações

### Backend (Railway)
- **Framework**: FastAPI + Python 3.11
- **Database**: Supabase PostgreSQL
- **Health Check**: \`/health\`
- **API Docs**: \`/docs\`

### Frontend (Vercel)
- **Framework**: Vanilla HTML/CSS/JS
- **Build**: Static files
- **API URL**: \`https://fastfood-api.railway.app\`

## 🚀 URLs de Deploy

### Railway (Backend)
1. Acesse: https://railway.app
2. New Project → Deploy from GitHub
3. Selecione o repositório
4. Configure variáveis de ambiente
5. Deploy automático

### Vercel (Frontend)
1. Acesse: https://vercel.com
2. New Project → Import Git Repository
3. Configure:
   - Framework: Other
   - Output Directory: frontend
4. Adicione variável: \`API_URL\`
5. Deploy

## 🔑 Variáveis de Ambiente

### Railway
\`\`\`env
DATABASE_URL=postgresql://postgres.cpntprlstlhubeivkpzq:postech_fiap_2025@aws-0-us-east-2.pooler.supabase.com:6543/postgres
SECRET_KEY=fastfood-secret-key-2025-change-in-production
ENVIRONMENT=production
DEBUG=false
CORS_ALLOW_ORIGINS=https://fastfood.vercel.app,https://fastfood-frontend.vercel.app
\`\`\`

### Vercel
\`\`\`env
API_URL=https://fastfood-api.railway.app
\`\`\`

## 🧪 Testes

### Backend
\`\`\`bash
# Health check
curl https://fastfood-api.railway.app/health

# Produtos
curl https://fastfood-api.railway.app/v1/api/public/produtos
\`\`\`

### Frontend
- Acesse a URL do Vercel
- Teste navegação e funcionalidades
- Verifique integração com API

## 📈 Monitoramento

- **Railway**: Logs e métricas no dashboard
- **Vercel**: Analytics e performance
- **Supabase**: Queries e storage

---
*Gerado automaticamente em $(date)*
EOF

    print_success "Informações salvas em DEPLOY_INFO.md"
}

# Main deployment process
main() {
    print_header
    
    print_step "Iniciando processo de deploy..."
    
    # Checks
    check_directory
    test_database
    run_migrations
    test_backend
    check_frontend
    
    # Generate info
    generate_deploy_info
    
    print_success "Sistema pronto para deploy!"
    echo ""
    print_info "Próximos passos:"
    echo "1. Deploy no Railway (Backend)"
    echo "2. Deploy no Vercel (Frontend)"
    echo "3. Configure variáveis de ambiente"
    echo "4. Teste as URLs"
    echo ""
    print_info "Veja DEPLOY_INFO.md para detalhes completos"
}

# Help function
show_help() {
    echo "Uso: $0 [opção]"
    echo ""
    echo "Opções:"
    echo "  -h, --help     Mostra esta ajuda"
    echo "  --test-only    Apenas executa os testes"
    echo "  --info-only    Apenas gera informações de deploy"
    echo ""
    echo "Exemplos:"
    echo "  $0              # Executa deploy completo"
    echo "  $0 --test-only  # Apenas testes"
    echo "  $0 --info-only  # Apenas gera info"
}

# Parse arguments
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    --test-only)
        print_header
        check_directory
        test_database
        run_migrations
        test_backend
        check_frontend
        print_success "Todos os testes passaram!"
        exit 0
        ;;
    --info-only)
        print_header
        check_directory
        generate_deploy_info
        exit 0
        ;;
    "")
        main
        ;;
    *)
        print_error "Opção inválida: $1"
        show_help
        exit 1
        ;;
esac 