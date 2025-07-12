import os
import sys
from pathlib import Path

# Add the src directory to the Python path
sys.path.append(str(Path(__file__).parent.parent / "src"))

from sqlalchemy import create_engine, text
from src.config import settings

def popular_produtos():
    """Popula a tabela de produtos com dados iniciais"""
    
    # Use settings for database connection
    DATABASE_URL = settings.DATABASE_URL
    
    try:
        # Create engine
        engine = create_engine(DATABASE_URL)
        
        # Test connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("✅ Conexão com banco estabelecida")
        
        # SQL para inserir produtos
        produtos_sql = """
        INSERT INTO produtos (nome, descricao, preco, categoria, disponivel) VALUES
        ('Hambúrguer Clássico', 'Pão, carne, alface, tomate e queijo', 15.90, 'burgers', true),
        ('Hambúrguer Duplo', 'Dois hambúrgueres, queijo, bacon e molho especial', 22.50, 'burgers', true),
        ('X-Bacon', 'Hambúrguer com bacon crocante e queijo', 18.90, 'burgers', true),
        ('X-Salada', 'Hambúrguer com salada completa', 16.90, 'burgers', true),
        ('Refrigerante', 'Coca-Cola, Pepsi ou Sprite', 5.00, 'drinks', true),
        ('Suco Natural', 'Laranja, limão ou abacaxi', 6.50, 'drinks', true),
        ('Água', 'Água mineral com ou sem gás', 3.50, 'drinks', true),
        ('Batata Frita', 'Porção de batatas fritas crocantes', 8.50, 'sides', true),
        ('Onion Rings', 'Anéis de cebola empanados', 7.90, 'sides', true),
        ('Nuggets', '6 unidades de nuggets de frango', 9.90, 'sides', true),
        ('Sorvete', 'Sorvete de chocolate, baunilha ou morango', 4.50, 'desserts', true),
        ('Pudim', 'Pudim de leite condensado', 5.90, 'desserts', true)
        ON CONFLICT (nome) DO NOTHING;
        """
        
        # Execute insert
        with engine.connect() as conn:
            conn.execute(text(produtos_sql))
            conn.commit()
            print("✅ Produtos inseridos com sucesso!")
        
        # Verify insertion
        with engine.connect() as conn:
            result = conn.execute(text("SELECT COUNT(*) FROM produtos"))
            count = result.scalar()
            print(f"📊 Total de produtos na tabela: {count}")
            
    except Exception as e:
        print(f"❌ Erro ao popular produtos: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("🚀 Iniciando população da tabela produtos...")
    success = popular_produtos()
    
    if success:
        print("🎉 População concluída com sucesso!")
    else:
        print("💥 Falha na população da tabela")
        sys.exit(1)
