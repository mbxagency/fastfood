#!/usr/bin/env python3
"""
Test script to check backend status and products
"""
import requests
import json
import time

# Backend URL
BACKEND_URL = "https://fastfood-vwtq.onrender.com"

def test_backend_health():
    """Test if backend is responding"""
    print("🔍 Testando saúde do backend...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=10)
        print(f"✅ Health check: {response.status_code}")
        print(f"📄 Response: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_root_endpoint():
    """Test root endpoint"""
    print("\n🔍 Testando endpoint raiz...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/", timeout=10)
        print(f"✅ Root endpoint: {response.status_code}")
        print(f"📄 Response: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Root endpoint failed: {e}")
        return False

def test_products_endpoint():
    """Test products endpoint"""
    print("\n🔍 Testando endpoint de produtos...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/v1/api/public/produtos", timeout=10)
        print(f"✅ Products endpoint: {response.status_code}")
        
        if response.status_code == 200:
            products = response.json()
            print(f"📦 Produtos encontrados: {len(products)}")
            
            if products:
                print("📋 Primeiros 3 produtos:")
                for i, product in enumerate(products[:3]):
                    print(f"  {i+1}. {product.get('nome', 'N/A')} - R$ {product.get('preco', 'N/A')}")
            else:
                print("⚠️ Nenhum produto encontrado no banco")
        else:
            print(f"❌ Erro na resposta: {response.text}")
        
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Products endpoint failed: {e}")
        return False

def test_database_connection():
    """Test database connection through API"""
    print("\n🔍 Testando conexão com banco de dados...")
    
    try:
        # Try to get products which requires database connection
        response = requests.get(f"{BACKEND_URL}/v1/api/public/produtos", timeout=15)
        
        if response.status_code == 200:
            print("✅ Conexão com banco OK")
            return True
        elif response.status_code == 500:
            print("❌ Erro interno do servidor (possível problema no banco)")
            return False
        else:
            print(f"⚠️ Status inesperado: {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print("❌ Timeout na conexão com banco")
        return False
    except Exception as e:
        print(f"❌ Erro na conexão: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Iniciando testes do backend...")
    print(f"📍 URL: {BACKEND_URL}")
    print("=" * 50)
    
    # Test 1: Health check
    health_ok = test_backend_health()
    
    # Test 2: Root endpoint
    root_ok = test_root_endpoint()
    
    # Test 3: Database connection
    db_ok = test_database_connection()
    
    # Test 4: Products endpoint
    products_ok = test_products_endpoint()
    
    print("\n" + "=" * 50)
    print("📊 RESUMO DOS TESTES:")
    print(f"✅ Health Check: {'OK' if health_ok else '❌'}")
    print(f"✅ Root Endpoint: {'OK' if root_ok else '❌'}")
    print(f"✅ Database Connection: {'OK' if db_ok else '❌'}")
    print(f"✅ Products Endpoint: {'OK' if products_ok else '❌'}")
    
    if not products_ok:
        print("\n🔧 POSSÍVEIS SOLUÇÕES:")
        print("1. Verificar se o banco de dados está inicializado")
        print("2. Verificar se o script de população de produtos foi executado")
        print("3. Verificar logs do Render para erros de conexão")
        print("4. Verificar se as variáveis de ambiente estão corretas")

if __name__ == "__main__":
    main() 