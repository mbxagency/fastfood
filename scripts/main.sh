#!/bin/bash

# 🍔 FastFood - Script Principal
# Script centralizado para gerenciar o projeto

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

show_help() {
    echo "🍔 FastFood - Script Principal"
    echo "=============================="
    echo ""
    echo "Comandos disponíveis:"
    echo ""
    echo "  setup     - Configurar variáveis de ambiente"
    echo "  verify    - Verificar deploy"
    echo "  deploy    - Deploy completo"
    echo "  k8s       - Deploy Kubernetes"
    echo "  dev       - Desenvolvimento local"
    echo "  test      - Executar testes"
    echo "  clean     - Limpar arquivos temporários"
    echo "  help      - Mostrar esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  ./scripts/main.sh setup"
    echo "  ./scripts/main.sh verify"
    echo "  ./scripts/main.sh deploy"
}

run_setup() {
    print_info "Executando setup..."
    ./scripts/setup/setup-env.sh
}

run_verify() {
    print_info "Verificando deploy..."
    ./scripts/verify/verify-deploy.sh
}

run_deploy() {
    print_info "Executando deploy..."
    ./scripts/deploy/deploy.sh
}

run_k8s() {
    print_info "Deploy Kubernetes..."
    ./scripts/kubernetes/deploy-k8s.sh
}

run_dev() {
    print_info "Iniciando desenvolvimento local..."
    
    # Check if Python is installed
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 não está instalado"
        exit 1
    fi
    
    # Check if pip is installed
    if ! command -v pip &> /dev/null; then
        print_error "pip não está instalado"
        exit 1
    fi
    
    cd backend
    
    # Install dependencies
    print_info "Instalando dependências..."
    pip install -r requirements.txt
    
    # Run database initialization
    print_info "Inicializando banco de dados..."
    python scripts/database/init_database.py
    
    # Start development server
    print_info "Iniciando servidor de desenvolvimento..."
    uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
}

run_test() {
    print_info "Executando testes..."
    
    cd backend
    
    # Check if pytest is installed
    if ! python -c "import pytest" 2>/dev/null; then
        print_info "Instalando pytest..."
        pip install pytest
    fi
    
    # Run tests
    python -m pytest tests/ -v
}

run_clean() {
    print_info "Limpando arquivos temporários..."
    
    # Remove Python cache
    find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
    find . -name "*.pyc" -delete 2>/dev/null || true
    
    # Remove node modules (if any)
    rm -rf node_modules/ 2>/dev/null || true
    
    # Remove build artifacts
    rm -rf build/ dist/ *.egg-info/ 2>/dev/null || true
    
    print_success "Limpeza concluída!"
}

# Main script logic
case "${1:-help}" in
    setup)
        run_setup
        ;;
    verify)
        run_verify
        ;;
    deploy)
        run_deploy
        ;;
    k8s)
        run_k8s
        ;;
    dev)
        run_dev
        ;;
    test)
        run_test
        ;;
    clean)
        run_clean
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Comando inválido: $1"
        echo ""
        show_help
        exit 1
        ;;
esac 