#!/usr/bin/env python3
"""
Script para testar as validações de domínio implementadas na Fase 2
"""

import sys
import os
from uuid import uuid4
from decimal import Decimal

# Adicionar o diretório backend ao path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from src.domain.models.cliente import Cliente
from src.domain.models.produto import Produto
from src.domain.models.pedido import Pedido, ItemPedido
from src.domain.models.status_pedido import StatusPedido


def test_cliente_validations():
    """Testa validações de cliente"""
    print("🧪 Testando validações de Cliente...")
    
    # Teste 1: Cliente válido
    try:
        cliente = Cliente.criar("João Silva", "joao@email.com", "12345678901")
        print("✅ Cliente válido criado com sucesso")
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
    
    # Teste 2: Nome vazio
    try:
        cliente = Cliente.criar("", "joao@email.com")
        print("❌ Deveria ter falhado com nome vazio")
    except ValueError as e:
        print(f"✅ Erro esperado capturado: {e}")
    
    # Teste 3: Email inválido
    try:
        cliente = Cliente.criar("João", "email-invalido")
        print("❌ Deveria ter falhado com email inválido")
    except ValueError as e:
        print(f"✅ Erro esperado capturado: {e}")
    
    # Teste 4: CPF inválido
    try:
        cliente = Cliente.criar("João", "joao@email.com", "123")
        print("❌ Deveria ter falhado com CPF inválido")
    except ValueError as e:
        print(f"✅ Erro esperado capturado: {e}")
    
    # Teste 5: Cliente anônimo
    try:
        cliente = Cliente.criar_anonimo()
        print("✅ Cliente anônimo criado com sucesso")
        assert cliente.eh_anonimo()
        print("✅ Cliente anônimo validado corretamente")
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")


def test_produto_validations():
    """Testa validações de produto"""
    print("\n🧪 Testando validações de Produto...")
    
    categoria_id = uuid4()
    
    # Teste 1: Produto válido
    try:
        produto = Produto.criar(
            "X-Burger",
            "Hambúrguer com queijo e salada",
            Decimal("15.90"),
            categoria_id,
            estoque_disponivel=10
        )
        print("✅ Produto válido criado com sucesso")
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
    
    # Teste 2: Nome vazio
    try:
        produto = Produto.criar("", "Descrição", Decimal("15.90"), categoria_id)
        print("❌ Deveria ter falhado com nome vazio")
    except ValueError as e:
        print(f"✅ Erro esperado capturado: {e}")
    
    # Teste 3: Preço negativo
    try:
        produto = Produto.criar("Produto", "Descrição", Decimal("-10.00"), categoria_id)
        print("❌ Deveria ter falhado com preço negativo")
    except ValueError as e:
        print(f"✅ Erro esperado capturado: {e}")
    
    # Teste 4: Preço muito alto
    try:
        produto = Produto.criar("Produto", "Descrição", Decimal("1500.00"), categoria_id)
        print("❌ Deveria ter falhado com preço muito alto")
    except ValueError as e:
        print(f"✅ Erro esperado capturado: {e}")
    
    # Teste 5: Estoque negativo
    try:
        produto = Produto.criar("Produto", "Descrição", Decimal("15.90"), categoria_id, estoque_disponivel=-1)
        print("❌ Deveria ter falhado com estoque negativo")
    except ValueError as e:
        print(f"✅ Erro esperado capturado: {e}")


def test_pedido_validations():
    """Testa validações de pedido"""
    print("\n🧪 Testando validações de Pedido...")
    
    cliente_id = uuid4()
    produto_id = uuid4()
    
    # Teste 1: Pedido válido
    try:
        itens = [ItemPedido(produto_id=produto_id, quantidade=2)]
        pedido = Pedido.criar(cliente_id, itens)
        print("✅ Pedido válido criado com sucesso")
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
    
    # Teste 2: Pedido sem itens
    try:
        pedido = Pedido.criar(cliente_id, [])
        print("❌ Deveria ter falhado sem itens")
    except ValueError as e:
        print(f"✅ Erro esperado capturado: {e}")
    
    # Teste 3: Quantidade zero
    try:
        itens = [ItemPedido(produto_id=produto_id, quantidade=0)]
        pedido = Pedido.criar(cliente_id, itens)
        print("❌ Deveria ter falhado com quantidade zero")
    except ValueError as e:
        print(f"✅ Erro esperado capturado: {e}")
    
    # Teste 4: Quantidade muito alta
    try:
        itens = [ItemPedido(produto_id=produto_id, quantidade=100)]
        pedido = Pedido.criar(cliente_id, itens)
        print("❌ Deveria ter falhado com quantidade muito alta")
    except ValueError as e:
        print(f"✅ Erro esperado capturado: {e}")
    
    # Teste 5: Muitos itens
    try:
        itens = [ItemPedido(produto_id=uuid4(), quantidade=1) for _ in range(25)]
        pedido = Pedido.criar(cliente_id, itens)
        print("❌ Deveria ter falhado com muitos itens")
    except ValueError as e:
        print(f"✅ Erro esperado capturado: {e}")


def test_status_transitions():
    """Testa transições de status"""
    print("\n🧪 Testando transições de status...")
    
    cliente_id = uuid4()
    produto_id = uuid4()
    itens = [ItemPedido(produto_id=produto_id, quantidade=1)]
    pedido = Pedido.criar(cliente_id, itens)
    
    # Teste 1: Transição válida
    try:
        pedido.atualizar_status(StatusPedido.PAGO)
        print("✅ Transição Recebido -> Pago válida")
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
    
    # Teste 2: Transição inválida
    try:
        pedido.atualizar_status(StatusPedido.FINALIZADO)
        print("❌ Deveria ter falhado com transição inválida")
    except ValueError as e:
        print(f"✅ Erro esperado capturado: {e}")
    
    # Teste 3: Transição válida
    try:
        pedido.atualizar_status(StatusPedido.PREPARANDO)
        print("✅ Transição Pago -> Em preparação válida")
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")


def main():
    """Executa todos os testes"""
    print("🚀 Iniciando testes de validações de domínio - Fase 2\n")
    
    test_cliente_validations()
    test_produto_validations()
    test_pedido_validations()
    test_status_transitions()
    
    print("\n🎉 Todos os testes concluídos!")


if __name__ == "__main__":
    main() 