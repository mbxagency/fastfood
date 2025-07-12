# 🍔 FastFood Backend - Makefile

.PHONY: help install dev test lint clean db-test db-migrate db-seed docker-build docker-run

# Default target
help:
	@echo "🚀 FastFood Backend - Comandos Disponíveis"
	@echo ""
	@echo "📦 Desenvolvimento:"
	@echo "  install     - Instalar dependências"
	@echo "  dev         - Executar servidor de desenvolvimento"
	@echo "  test        - Executar testes"
	@echo "  lint        - Verificar qualidade do código"
	@echo ""
	@echo "🗄️  Database:"
	@echo "  db-test     - Testar conexão com banco"
	@echo "  db-migrate  - Executar migrações"
	@echo "  db-seed     - Popular banco com dados"
	@echo ""
	@echo "🐳 Docker:"
	@echo "  docker-build - Construir imagem Docker"
	@echo "  docker-run   - Executar container"
	@echo ""
	@echo "🧹 Manutenção:"
	@echo "  clean       - Limpar arquivos temporários"

# Development
install:
	@echo "📦 Instalando dependências..."
	poetry install

dev:
	@echo "🚀 Iniciando servidor de desenvolvimento..."
	uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

test:
	@echo "🧪 Executando testes..."
	pytest tests/ -v

lint:
	@echo "🔍 Verificando qualidade do código..."
	flake8 src/
	black --check src/
	isort --check-only src/

# Database
db-test:
	@echo "🗄️  Testando conexão com banco..."
	python -c "from src.infrastructure.db.session import engine; print('✅ Conexão OK') if engine else print('❌ Falha na conexão')"

db-migrate:
	@echo "🔄 Executando migrações..."
	alembic upgrade head

db-seed:
	@echo "🌱 Populando banco com dados..."
	python script/popular_tb_produtos.py

# Docker
docker-build:
	@echo "🐳 Construindo imagem Docker..."
	docker build -t fastfood-backend .

docker-run:
	@echo "🐳 Executando container..."
	docker run -p 8000:8000 --env-file .env fastfood-backend

# Maintenance
clean:
	@echo "🧹 Limpando arquivos temporários..."
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	find . -type d -name ".mypy_cache" -exec rm -rf {} + 