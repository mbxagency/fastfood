#!/bin/bash

# 🚀 FastFood Deploy Script
# Script para deploy completo do sistema FastFood

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running in test mode
TEST_ONLY=false
if [[ "$1" == "--test-only" ]]; then
    TEST_ONLY=true
    print_warning "Running in test-only mode"
fi

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if git is installed
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed"
        exit 1
    fi
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Not in a git repository"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Check environment variables
check_env_vars() {
    print_status "Checking environment variables..."
    
    # Check if .env file exists
    if [[ ! -f "backend/.env" ]]; then
        print_warning ".env file not found in backend directory"
        print_status "Creating .env from example..."
        
        if [[ -f "backend/env.example" ]]; then
            cp backend/env.example backend/.env
            print_warning "Please edit backend/.env with your actual credentials"
            print_warning "Then run this script again"
            exit 1
        else
            print_error "env.example not found"
            exit 1
        fi
    fi
    
    # Check required variables
    source backend/.env
    
    if [[ -z "$DATABASE_URL" ]]; then
        print_error "DATABASE_URL not set in .env file"
        exit 1
    fi
    
    if [[ -z "$SECRET_KEY" ]]; then
        print_error "SECRET_KEY not set in .env file"
        exit 1
    fi
    
    print_success "Environment variables check passed"
}

# Test database connection
test_database() {
    print_status "Testing database connection..."
    
    cd backend
    
    # Check if Python is available
    if ! command -v python3 &> /dev/null; then
        print_error "Python3 is not installed"
        exit 1
    fi
    
    # Test database connection
    python3 -c "
import os
import sys
from pathlib import Path
sys.path.append(str(Path('.')))
from src.config import settings
from sqlalchemy import create_engine, text

try:
    engine = create_engine(settings.DATABASE_URL)
    with engine.connect() as conn:
        result = conn.execute(text('SELECT 1'))
        print('✅ Database connection successful')
except Exception as e:
    print(f'❌ Database connection failed: {e}')
    sys.exit(1)
"
    
    cd ..
    print_success "Database connection test passed"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    cd backend
    
    # Check if alembic is available
    if ! command -v alembic &> /dev/null; then
        print_warning "Alembic not found, installing dependencies..."
        pip install alembic sqlalchemy psycopg2-binary
    fi
    
    # Run migrations
    alembic upgrade head
    
    cd ..
    print_success "Database migrations completed"
}

# Populate database with initial data
populate_database() {
    print_status "Populating database with initial data..."
    
    cd backend
    
    # Run the population script
    python3 script/popular_tb_produtos.py
    
    cd ..
    print_success "Database population completed"
}

# Test API endpoints
test_api() {
    print_status "Testing API endpoints..."
    
    # Start the API server in background
    cd backend
    python3 -m uvicorn src.main:app --host 0.0.0.0 --port 8000 &
    API_PID=$!
    cd ..
    
    # Wait for server to start
    sleep 5
    
    # Test health endpoint
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        print_success "Health endpoint working"
    else
        print_error "Health endpoint failed"
        kill $API_PID 2>/dev/null || true
        exit 1
    fi
    
    # Test products endpoint
    if curl -f http://localhost:8000/v1/api/public/produtos > /dev/null 2>&1; then
        print_success "Products endpoint working"
    else
        print_error "Products endpoint failed"
        kill $API_PID 2>/dev/null || true
        exit 1
    fi
    
    # Stop the API server
    kill $API_PID 2>/dev/null || true
    
    print_success "API endpoints test passed"
}

# Deploy to production (placeholder)
deploy_production() {
    if [[ "$TEST_ONLY" == true ]]; then
        print_warning "Skipping production deploy in test mode"
        return
    fi
    
    print_status "Deploying to production..."
    
    # Check if we're on main branch
    CURRENT_BRANCH=$(git branch --show-current)
    if [[ "$CURRENT_BRANCH" != "main" ]]; then
        print_warning "Not on main branch (current: $CURRENT_BRANCH)"
        print_status "Switching to main branch..."
        git checkout main
    fi
    
    # Push to remote
    print_status "Pushing to remote repository..."
    git push origin main
    
    print_success "Production deploy completed"
    print_status "Frontend will be deployed automatically by Vercel"
    print_status "Backend will be deployed automatically by Render"
}

# Main deployment process
main() {
    echo "🍔 FastFood Deploy Script"
    echo "=========================="
    
    check_prerequisites
    check_env_vars
    test_database
    run_migrations
    populate_database
    test_api
    deploy_production
    
    echo ""
    print_success "🎉 Deploy completed successfully!"
    echo ""
    echo "📊 System Status:"
    echo "   Frontend: https://fastfood-murex.vercel.app"
    echo "   Backend:  https://fastfood-api.onrender.com"
    echo "   API Docs: https://fastfood-api.onrender.com/docs"
    echo ""
    echo "🔧 Next Steps:"
    echo "   1. Configure your domain in Vercel"
    echo "   2. Set up monitoring and alerts"
    echo "   3. Configure backups for the database"
    echo ""
}

# Run main function
main "$@" 