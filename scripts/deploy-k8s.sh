#!/bin/bash

# Script para deploy da aplicação no Kubernetes
# Uso: ./scripts/deploy-k8s.sh [ambiente]

set -e

ENVIRONMENT=${1:-local}
NAMESPACE="postech-fase2"

echo "🚀 Iniciando deploy da aplicação Postech Fase 2..."
echo "📋 Ambiente: $ENVIRONMENT"
echo "🏷️  Namespace: $NAMESPACE"

# Função para verificar se o kubectl está disponível
check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        echo "❌ kubectl não encontrado. Por favor, instale o kubectl."
        exit 1
    fi
}

# Função para verificar se o Docker está disponível
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker não encontrado. Por favor, instale o Docker."
        exit 1
    fi
}

# Função para build da imagem
build_image() {
    echo "🔨 Build da imagem Docker..."
    docker build -f backend/Dockerfile.prod -t postech-app:latest ./backend
    echo "✅ Imagem buildada com sucesso"
}

# Função para criar namespace
create_namespace() {
    echo "📦 Criando namespace..."
    kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
    echo "✅ Namespace criado"
}

# Função para aplicar recursos
apply_resources() {
    echo "📋 Aplicando recursos Kubernetes..."
    kubectl apply -k k8s/
    echo "✅ Recursos aplicados"
}

# Função para aguardar pods ficarem prontos
wait_for_pods() {
    echo "⏳ Aguardando pods ficarem prontos..."
    kubectl wait --for=condition=ready pod -l app=postech-app -n $NAMESPACE --timeout=300s
    kubectl wait --for=condition=ready pod -l app=postgres -n $NAMESPACE --timeout=300s
    echo "✅ Pods prontos"
}

# Função para mostrar status
show_status() {
    echo "📊 Status dos recursos:"
    kubectl get all -n $NAMESPACE
    echo ""
    echo "🔍 Logs da aplicação:"
    kubectl logs -n $NAMESPACE deployment/postech-app-deployment --tail=10
}

# Função para executar migrações
run_migrations() {
    echo "🗄️  Executando migrações do banco..."
    kubectl exec -n $NAMESPACE deployment/postech-app-deployment -- alembic upgrade head
    echo "✅ Migrações executadas"
}

# Função para mostrar informações de acesso
show_access_info() {
    echo ""
    echo "🎉 Deploy concluído com sucesso!"
    echo ""
    echo "📋 Informações de acesso:"
    echo "   Namespace: $NAMESPACE"
    echo "   API: http://localhost:8080 (após port-forward)"
    echo "   Swagger: http://localhost:8080/docs"
    echo ""
    echo "🔧 Comandos úteis:"
    echo "   Port-forward: kubectl port-forward -n $NAMESPACE svc/postech-app-service 8080:80"
    echo "   Logs: kubectl logs -n $NAMESPACE deployment/postech-app-deployment -f"
    echo "   Status: kubectl get all -n $NAMESPACE"
    echo "   Delete: kubectl delete namespace $NAMESPACE"
}

# Execução principal
main() {
    check_kubectl
    check_docker
    
    build_image
    create_namespace
    apply_resources
    wait_for_pods
    run_migrations
    show_status
    show_access_info
}

# Executar função principal
main 