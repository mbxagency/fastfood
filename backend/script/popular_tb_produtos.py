import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.infrastructure.db.models.produto_model import ProdutoModel

# Usar DATABASE_URL do ambiente
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/tech_challenge")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

produtos = [
    {"nome": "X-Burguer", "categoria": "Lanche", "preco": 15.90},
    {"nome": "X-Salada", "categoria": "Lanche", "preco": 16.90},
    {"nome": "Batata Frita", "categoria": "Acompanhamento", "preco": 9.90},
    {"nome": "Refrigerante", "categoria": "Bebida", "preco": 6.00},
    {"nome": "Suco Natural", "categoria": "Bebida", "preco": 7.50},
    {"nome": "Sorvete", "categoria": "Sobremesa", "preco": 8.00},
]

def popular_produtos():
    session = SessionLocal()
    try:
        for p in produtos:
            produto = ProdutoModel(nome=p["nome"], categoria=p["categoria"], preco=p["preco"])
            session.add(produto)
        session.commit()
        print("Produtos inseridos com sucesso.")
    except Exception as e:
        session.rollback()
        print("Erro ao inserir produtos:", e)
    finally:
        session.close()

if __name__ == "__main__":
    popular_produtos()
