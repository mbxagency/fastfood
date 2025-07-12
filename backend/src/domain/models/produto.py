from uuid import UUID, uuid4
from datetime import UTC, datetime
from typing import Optional
from decimal import Decimal


class Produto:
    def __init__(
        self,
        id: UUID,
        nome: str,
        descricao: str,
        preco: Decimal,
        categoria_id: UUID,
        ativo: bool = True,
        data_criacao: datetime | None = None,
        imagem_url: Optional[str] = None,
        estoque_disponivel: int = 0,
    ):
        self.id = id
        self.nome = nome
        self.descricao = descricao
        self.preco = preco
        self.categoria_id = categoria_id
        self.ativo = ativo
        self.data_criacao = data_criacao or datetime.now(UTC)
        self.imagem_url = imagem_url
        self.estoque_disponivel = estoque_disponivel
        
        # Validações de domínio
        self._validar_produto()

    @classmethod
    def criar(
        cls,
        nome: str,
        descricao: str,
        preco: Decimal,
        categoria_id: UUID,
        imagem_url: Optional[str] = None,
        estoque_disponivel: int = 0,
    ) -> "Produto":
        """Factory method para criar um novo produto com validações"""
        if not nome or not nome.strip():
            raise ValueError("Nome é obrigatório")
        
        if len(nome.strip()) < 2:
            raise ValueError("Nome deve ter pelo menos 2 caracteres")
        
        if len(nome.strip()) > 100:
            raise ValueError("Nome não pode ter mais de 100 caracteres")
        
        if not descricao or not descricao.strip():
            raise ValueError("Descrição é obrigatória")
        
        if len(descricao.strip()) < 10:
            raise ValueError("Descrição deve ter pelo menos 10 caracteres")
        
        if len(descricao.strip()) > 500:
            raise ValueError("Descrição não pode ter mais de 500 caracteres")
        
        if preco <= 0:
            raise ValueError("Preço deve ser maior que zero")
        
        if preco > 1000:
            raise ValueError("Preço não pode ser maior que R$ 1000,00")
        
        if estoque_disponivel < 0:
            raise ValueError("Estoque não pode ser negativo")
        
        if estoque_disponivel > 10000:
            raise ValueError("Estoque não pode ser maior que 10.000")
        
        return cls(
            id=uuid4(),
            nome=nome.strip(),
            descricao=descricao.strip(),
            preco=preco,
            categoria_id=categoria_id,
            ativo=True,
            data_criacao=datetime.now(UTC),
            imagem_url=imagem_url,
            estoque_disponivel=estoque_disponivel,
        )

    def atualizar_dados(
        self,
        nome: Optional[str] = None,
        descricao: Optional[str] = None,
        preco: Optional[Decimal] = None,
        categoria_id: Optional[UUID] = None,
        imagem_url: Optional[str] = None,
    ) -> None:
        """Atualiza os dados do produto com validações"""
        if nome is not None:
            if not nome.strip():
                raise ValueError("Nome não pode ser vazio")
            if len(nome.strip()) < 2:
                raise ValueError("Nome deve ter pelo menos 2 caracteres")
            if len(nome.strip()) > 100:
                raise ValueError("Nome não pode ter mais de 100 caracteres")
            self.nome = nome.strip()
        
        if descricao is not None:
            if not descricao.strip():
                raise ValueError("Descrição não pode ser vazia")
            if len(descricao.strip()) < 10:
                raise ValueError("Descrição deve ter pelo menos 10 caracteres")
            if len(descricao.strip()) > 500:
                raise ValueError("Descrição não pode ter mais de 500 caracteres")
            self.descricao = descricao.strip()
        
        if preco is not None:
            if preco <= 0:
                raise ValueError("Preço deve ser maior que zero")
            if preco > 1000:
                raise ValueError("Preço não pode ser maior que R$ 1000,00")
            self.preco = preco
        
        if categoria_id is not None:
            self.categoria_id = categoria_id
        
        if imagem_url is not None:
            self.imagem_url = imagem_url

    def ativar(self) -> None:
        """Ativa o produto"""
        self.ativo = True

    def desativar(self) -> None:
        """Desativa o produto"""
        self.ativo = False

    def atualizar_estoque(self, quantidade: int) -> None:
        """Atualiza o estoque disponível"""
        if quantidade < 0:
            raise ValueError("Quantidade não pode ser negativa")
        
        if quantidade > 10000:
            raise ValueError("Estoque não pode ser maior que 10.000")
        
        self.estoque_disponivel = quantidade

    def reservar_estoque(self, quantidade: int) -> bool:
        """Reserva estoque para um pedido"""
        if quantidade <= 0:
            raise ValueError("Quantidade deve ser maior que zero")
        
        if not self.ativo:
            raise ValueError("Produto não está ativo")
        
        if self.estoque_disponivel < quantidade:
            return False
        
        self.estoque_disponivel -= quantidade
        return True

    def liberar_estoque(self, quantidade: int) -> None:
        """Libera estoque reservado"""
        if quantidade <= 0:
            raise ValueError("Quantidade deve ser maior que zero")
        
        self.estoque_disponivel += quantidade
        
        if self.estoque_disponivel > 10000:
            self.estoque_disponivel = 10000

    def esta_disponivel(self, quantidade: int = 1) -> bool:
        """Verifica se o produto está disponível para a quantidade solicitada"""
        return (
            self.ativo and
            self.estoque_disponivel >= quantidade
        )

    def calcular_preco_com_desconto(self, percentual_desconto: float) -> Decimal:
        """Calcula o preço com desconto"""
        if percentual_desconto < 0 or percentual_desconto > 100:
            raise ValueError("Percentual de desconto deve estar entre 0 e 100")
        
        desconto = self.preco * (Decimal(str(percentual_desconto)) / 100)
        return self.preco - desconto

    def _validar_produto(self) -> None:
        """Validações internas do produto"""
        if not self.nome or not self.nome.strip():
            raise ValueError("Nome é obrigatório")
        
        if not self.descricao or not self.descricao.strip():
            raise ValueError("Descrição é obrigatória")
        
        if self.preco <= 0:
            raise ValueError("Preço deve ser maior que zero")
        
        if self.estoque_disponivel < 0:
            raise ValueError("Estoque não pode ser negativo")

    def __str__(self) -> str:
        return f"{self.nome} - R$ {self.preco:.2f}"

    def __repr__(self) -> str:
        return f"Produto(id={self.id}, nome='{self.nome}', preco={self.preco}, ativo={self.ativo})"
