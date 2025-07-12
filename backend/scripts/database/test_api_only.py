#!/usr/bin/env python3
"""
Test API endpoints only (without database dependency)
"""
import requests
import json

# Backend URL
BACKEND_URL = "https://fastfood-vwtq.onrender.com"

def test_api_endpoints():
    """Test API endpoints"""
    print("🔍 Testando endpoints da API...")
    
    endpoints = [
        ("/", "Root"),
        ("/health", "Health"),
        ("/docs", "Documentation"),
        ("/v1/api/public/produtos", "Products"),
        ("/v1/api/public/login", "Login")
    ]
    
    results = []
    
    for endpoint, name in endpoints:
        try:
            print(f"\n📍 Testando {name} ({endpoint})...")
            response = requests.get(f"{BACKEND_URL}{endpoint}", timeout=10)
            
            print(f"  Status: {response.status_code}")
            
            if response.status_code == 200:
                if endpoint == "/docs":
                    print(f"  ✅ {name} OK (HTML response)")
                else:
                    try:
                        data = response.json()
                        print(f"  ✅ {name} OK: {json.dumps(data, indent=2)[:100]}...")
                    except:
                        print(f"  ✅ {name} OK (non-JSON response)")
            elif response.status_code == 500:
                print(f"  ❌ {name} - Erro interno do servidor")
                print(f"  📄 Response: {response.text[:200]}...")
            else:
                print(f"  ⚠️ {name} - Status {response.status_code}")
            
            results.append((name, response.status_code))
            
        except Exception as e:
            print(f"  ❌ {name} - Erro: {e}")
            results.append((name, "ERROR"))
    
    return results

def test_login_endpoint():
    """Test login endpoint specifically"""
    print("\n🔑 Testando endpoint de login...")
    
    try:
        # Test with form data
        form_data = {
            'username': 'admin',
            'password': 'admin123'
        }
        
        response = requests.post(
            f"{BACKEND_URL}/v1/api/public/login",
            data=form_data,
            timeout=10
        )
        
        print(f"  Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"  ✅ Login OK: {json.dumps(data, indent=2)}")
            return True
        else:
            print(f"  ❌ Login failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"  ❌ Login error: {e}")
        return False

def main():
    """Main function"""
    print("🚀 Testando API endpoints...")
    print("=" * 50)
    
    # Test all endpoints
    results = test_api_endpoints()
    
    # Test login specifically
    login_ok = test_login_endpoint()
    
    print("\n" + "=" * 50)
    print("📊 RESUMO DOS TESTES:")
    
    for name, status in results:
        status_str = "OK" if status == 200 else "❌" if status == 500 else f"⚠️ {status}"
        print(f"  {name}: {status_str}")
    
    print(f"  Login: {'OK' if login_ok else '❌'}")
    
    print("\n🔧 DIAGNÓSTICO:")
    if any(status == 500 for _, status in results if isinstance(status, int)):
        print("  - Há erros 500 indicando problemas no servidor")
        print("  - Verifique os logs do Render")
    elif login_ok:
        print("  - API funcionando, problema pode ser específico dos produtos")
    else:
        print("  - Problemas de conectividade ou configuração")

if __name__ == "__main__":
    main() 