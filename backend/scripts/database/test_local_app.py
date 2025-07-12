#!/usr/bin/env python3
"""
Test local FastAPI app with Render DATABASE_URL
"""
import os
import sys
import requests
import time
from pathlib import Path

# Add the src directory to the Python path
current_dir = Path(__file__).parent
backend_dir = current_dir.parent.parent
src_dir = backend_dir / "src"
sys.path.insert(0, str(src_dir))

def test_local_app():
    """Test local FastAPI app"""
    print("🚀 Testando aplicação local...")
    
    # Set DATABASE_URL
    os.environ["DATABASE_URL"] = "postgresql://postech:lqIYZ8F3PcPCQBxeViQUbJZh0fw6dRDN@dpg-d1p7s4juibrs73dfuceg-a.ohio-postgres.render.com/fastfood_vi5x"
    
    try:
        # Import and test database connection
        from infrastructure.db.session import engine
        from sqlalchemy import text
        
        print("✅ Engine importado com sucesso")
        
        # Test database connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT COUNT(*) FROM tb_produtos"))
            count = result.scalar()
            print(f"✅ Conexão com banco OK - {count} produtos")
        
        # Test repository
        from adapters.output.repositories.produto_repository import ProdutoRepository
        from infrastructure.db.session import SessionLocal
        
        db = SessionLocal()
        repo = ProdutoRepository(db)
        
        try:
            produtos = repo.listar()
            print(f"✅ Repository OK - {len(produtos)} produtos")
        except Exception as e:
            print(f"❌ Repository error: {e}")
        finally:
            db.close()
        
        # Test service
        from application.services.produto_service import ProdutoService
        
        db = SessionLocal()
        repo = ProdutoRepository(db)
        service = ProdutoService(repo)
        
        try:
            produtos = service.listar_produtos()
            print(f"✅ Service OK - {len(produtos)} produtos")
        except Exception as e:
            print(f"❌ Service error: {e}")
        finally:
            db.close()
        
        return True
        
    except Exception as e:
        print(f"❌ Erro ao testar aplicação local: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Main function"""
    print("🔍 Testando aplicação local com DATABASE_URL do Render...")
    print("=" * 60)
    
    success = test_local_app()
    
    print("\n" + "=" * 60)
    print("📊 RESULTADO:")
    print(f"✅ Aplicação Local: {'OK' if success else '❌'}")
    
    if success:
        print("\n🎉 Aplicação local funcionando!")
        print("🔧 O problema pode estar na configuração do Render")
    else:
        print("\n⚠️ Problema na aplicação local")

if __name__ == "__main__":
    main() 