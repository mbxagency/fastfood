from uuid import uuid4

from src.adapters.input.dto.produto_dto import ProdutoCreate, ProdutoResponse
from src.domain.models.produto import Produto
from src.ports.repositories.produto_repository_port import ProdutoRepositoryPort
from src.ports.services.produto_service_port import ProdutoServicePort


class ProdutoService(ProdutoServicePort):
    def __init__(self, produto_repository: ProdutoRepositoryPort):
        self.produto_repository = produto_repository

    def criar_produto(self, produto_create: ProdutoCreate) -> ProdutoResponse:
        produto = Produto(
            id=uuid4(),
            nome=produto_create.nome,
            categoria=produto_create.categoria,
            preco=produto_create.preco
        )
        self.produto_repository.salvar(produto)
        return ProdutoResponse(**produto.__dict__)

    def listar_produtos(self) -> list[ProdutoResponse]:
        produtos = self.produto_repository.listar()
        return [ProdutoResponse(**p.__dict__) for p in produtos]

    def buscar_produto(self, produto_id: str) -> ProdutoResponse | None:
        produto = self.produto_repository.buscar_por_id(produto_id)
        if produto:
            return ProdutoResponse(**produto.__dict__)
        return None

    def buscar_por_categoria(self, categoria: str) -> list[ProdutoResponse]:
        produtos = self.produto_repository.buscar_por_categoria(categoria)
        return [ProdutoResponse(**p.__dict__) for p in produtos]

    def deletar_produto(self, produto_id: str) -> None:
        self.produto_repository.deletar(produto_id)
