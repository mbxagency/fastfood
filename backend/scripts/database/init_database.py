#!/usr/bin/env python3
"""
Database Initialization Script
Combines Alembic migrations and data population
Uses environment variables from Render
"""
import os
import sys
import time
from pathlib import Path

# Add the src directory to the Python path
sys.path.append(str(Path(__file__).parent.parent.parent / "src"))

from sqlalchemy import create_engine, text
from alembic.config import Config
from alembic import command

def get_database_url():
    """Get DATABASE_URL from environment"""
    return os.getenv("DATABASE_URL")

def wait_for_database(max_retries=30, delay=2):
    """Wait for database to be ready"""
    print("🔄 Aguardando banco de dados ficar disponível...")
    
    database_url = get_database_url()
    if not database_url:
        print("❌ DATABASE_URL não configurada")
        return False
    
    for attempt in range(max_retries):
        try:
            engine = create_engine(database_url)
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print("✅ Banco de dados disponível!")
            return True
        except Exception as e:
            print(f"⏳ Tentativa {attempt + 1}/{max_retries}: {e}")
            if attempt < max_retries - 1:
                time.sleep(delay)
    
    print("❌ Banco de dados não ficou disponível")
    return False

def run_migrations():
    """Run Alembic migrations"""
    print("🔄 Executando migrações Alembic...")
    
    try:
        # Get the alembic.ini path from the config directory
        alembic_cfg = Config(str(Path(__file__).parent.parent.parent / "config" / "alembic.ini"))
        
        # Run migrations
        command.upgrade(alembic_cfg, "head")
        print("✅ Migrações executadas com sucesso!")
        return True
    except Exception as e:
        print(f"❌ Erro ao executar migrações: {e}")
        return False

def populate_products():
    """Populate products table"""
    print("🔄 Populando tabela de produtos...")
    
    try:
        database_url = get_database_url()
        if not database_url:
            print("❌ DATABASE_URL não configurada")
            return False
            
        engine = create_engine(database_url)
        
        # SQL para inserir produtos (usando tb_produtos e apenas colunas existentes)
        produtos_sql = """
        INSERT INTO tb_produtos (nome, categoria, preco) VALUES
        ('Hambúrguer Clássico', 'burgers', 15.90),
        ('Hambúrguer Duplo', 'burgers', 22.50),
        ('X-Bacon', 'burgers', 18.90),
        ('X-Salada', 'burgers', 16.90),
        ('X-Frango', 'burgers', 17.90),
        ('Refrigerante Cola', 'drinks', 5.00),
        ('Suco Natural', 'drinks', 6.50),
        ('Água Mineral', 'drinks', 3.50),
        ('Batata Frita', 'sides', 8.50),
        ('Onion Rings', 'sides', 7.90),
        ('Nuggets', 'sides', 9.90),
        ('Sorvete de Chocolate', 'desserts', 4.50),
        ('Pudim', 'desserts', 5.90),
        ('Milk Shake', 'desserts', 12.90)
        ON CONFLICT (nome) DO NOTHING;
        """
        
        with engine.connect() as conn:
            conn.execute(text(produtos_sql))
            conn.commit()
        
        # Verify insertion
        with engine.connect() as conn:
            result = conn.execute(text("SELECT COUNT(*) FROM tb_produtos"))
            count = result.scalar()
            print(f"✅ {count} produtos inseridos com sucesso!")
        
        return True
    except Exception as e:
        print(f"❌ Erro ao popular produtos: {e}")
        return False

def verify_database():
    """Verify database setup"""
    print("🔍 Verificando configuração do banco...")
    
    try:
        database_url = get_database_url()
        if not database_url:
            print("❌ DATABASE_URL não configurada")
            return False
            
        engine = create_engine(database_url)
        
        with engine.connect() as conn:
            # Check tables (usando nomes corretos com prefixo tb_)
            tables = ['tb_produtos', 'tb_categorias', 'tb_clientes', 'tb_pedidos', 'tb_pagamentos']
            for table in tables:
                try:
                    result = conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
                    count = result.scalar()
                    print(f"📊 Tabela {table}: {count} registros")
                except Exception as e:
                    print(f"⚠️ Tabela {table}: {e}")
        
        print("✅ Verificação concluída!")
        return True
    except Exception as e:
        print(f"❌ Erro na verificação: {e}")
        return False

def main():
    """Main initialization function"""
    print("🚀 Iniciando configuração do banco de dados...")
    
    database_url = get_database_url()
    if database_url:
        print(f"📡 Conectando em: {database_url}")
    else:
        print("❌ DATABASE_URL não configurada")
        sys.exit(1)
    
    # Step 1: Wait for database
    if not wait_for_database():
        sys.exit(1)
    
    # Step 2: Run migrations
    if not run_migrations():
        sys.exit(1)
    
    # Step 3: Populate products
    if not populate_products():
        sys.exit(1)
    
    # Step 4: Verify setup
    if not verify_database():
        sys.exit(1)
    
    print("🎉 Configuração do banco concluída com sucesso!")

if __name__ == "__main__":
    main() 