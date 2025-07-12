#!/bin/bash

# 🛠️ FastFood Environment Setup Script
# Script para configurar variáveis de ambiente

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

echo "🍔 FastFood Environment Setup"
echo "=============================="

# Check if we're in the right directory
if [ ! -f "backend/env.render" ]; then
    print_error "Execute este script na raiz do projeto FastFood"
    exit 1
fi

# Create .env file from template
if [ ! -f "backend/.env" ]; then
    print_info "Criando arquivo .env..."
    cp backend/env.render backend/.env
    print_success "Arquivo .env criado com sucesso!"
else
    print_warning "Arquivo .env já existe"
fi

echo ""
print_info "📋 Variáveis de Ambiente para o Render:"
echo ""

# Display environment variables
cat << 'EOF'
DATABASE_URL=postgresql://postech:lqIYZ8F3PcPCQBxeViQUbJZh0fw6dRDN@dpg-d1p7s4juibrs73dfuceg-a.ohio-postgres.render.com:5432/fastfood_vi5x
SECRET_KEY=fastfood-secret-key-2025-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ENVIRONMENT=production
DEBUG=false
CORS_ALLOW_ORIGINS=https://fastfood-murex.vercel.app
API_PREFIX=/v1
PROJECT_NAME=FastFood API
VERSION=1.0.0
LOG_LEVEL=INFO
EOF

echo ""
print_info "🚀 Como adicionar no Render:"
echo ""
echo "1. Acesse: https://render.com"
echo "2. Vá no seu Web Service"
echo "3. Clique em 'Environment'"
echo "4. Adicione cada variável acima"
echo "5. Clique em 'Save Changes'"
echo "6. O serviço será redeployado automaticamente"
echo ""

print_success "✅ Setup concluído!"
print_info "💡 Dica: Você pode copiar e colar as variáveis acima diretamente no Render" 