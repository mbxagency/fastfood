#!/usr/bin/env python3
"""
Test database connection directly
"""
import os
import sys
from pathlib import Path

def test_database_connection():
    """Test direct database connection"""
    print("🔍 Testando conexão direta com o banco...")
    
    try:
        # Get DATABASE_URL from environment
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            print("❌ DATABASE_URL não encontrada no ambiente")
            return False
            
        print(f"📍 DATABASE_URL: {database_url[:50]}...")
        
        # Import SQLAlchemy
        try:
            from sqlalchemy import create_engine, text
        except ImportError:
            print("❌ SQLAlchemy não instalado. Execute: pip install sqlalchemy psycopg2-binary")
            return False
        
        # Create engine with SSL
        engine = create_engine(
            database_url,
            pool_pre_ping=True,
            pool_recycle=300,
            connect_args={
                "sslmode": "require"
            } if "render.com" in database_url else {}
        )
        
        print("✅ Engine criado com sucesso")
        
        # Test connection
        with engine.connect() as conn:
            print("✅ Conexão estabelecida")
            
            # Test simple query
            result = conn.execute(text("SELECT 1"))
            print("✅ Query simples executada")
            
            # Check if products table exists
            result = conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'tb_produtos'
                )
            """))
            table_exists = result.scalar()
            print(f"📋 Tabela tb_produtos existe: {table_exists}")
            
            if table_exists:
                # Count products
                result = conn.execute(text("SELECT COUNT(*) FROM tb_produtos"))
                count = result.scalar()
                print(f"📦 Produtos no banco: {count}")
                
                # Get first few products
                result = conn.execute(text("SELECT id, nome, categoria, preco FROM tb_produtos LIMIT 3"))
                products = result.fetchall()
                print("📋 Primeiros produtos:")
                for product in products:
                    print(f"  - {product[1]} ({product[2]}) - R$ {product[3]}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro na conexão: {e}")
        print(f"❌ Tipo do erro: {type(e).__name__}")
        return False

def main():
    """Main function"""
    print("🚀 Testando conexão direta com banco de dados...")
    print("=" * 50)
    
    success = test_database_connection()
    
    print("\n" + "=" * 50)
    print("📊 RESULTADO:")
    print(f"✅ Conexão: {'OK' if success else '❌'}")
    
    if success:
        print("\n🎉 Conexão com banco funcionando!")
    else:
        print("\n⚠️ Problema na conexão com banco.")

if __name__ == "__main__":
    main() 