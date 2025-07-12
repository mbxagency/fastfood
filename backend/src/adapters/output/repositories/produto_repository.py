from decimal import Decimal

from sqlalchemy.orm import Session

from src.domain.models.produto import Produto
from src.infrastructure.db.models.produto_model import ProdutoModel
from src.ports.repositories.produto_repository_port import ProdutoRepositoryPort


class ProdutoRepository(ProdutoRepositoryPort):
    def __init__(self, db: Session):
        self.db = db

    def buscar_por_id(self, produto_id: int) -> Produto | None:
        model = self.db.query(ProdutoModel).filter_by(id=produto_id).first()
        return self._to_domain(model) if model else None

    def listar(self) -> list[Produto]:
        models = self.db.query(ProdutoModel).all()
        return [self._to_domain(m) for m in models]

    def salvar(self, produto: Produto) -> Produto:
        model = ProdutoModel(
            nome=produto.nome,
            categoria=produto.categoria,
            preco=float(produto.preco),
        )
        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)
        produto.id = model.id
        return self._to_domain(model)

    def deletar(self, produto_id: int) -> None:
        model = self.db.query(ProdutoModel).filter_by(id=produto_id).first()
        if not model:
            raise ValueError("Produto não encontrado")
        self.db.delete(model)
        self.db.commit()

    def buscar_por_categoria(self, categoria: str) -> list[Produto]:
        models = self.db.query(ProdutoModel).filter_by(categoria=categoria).all()
        return [self._to_domain(m) for m in models]


    def _to_domain(self, model: ProdutoModel) -> Produto:
        return Produto(
            id=model.id,
            nome=model.nome,
            categoria=model.categoria,
            preco=Decimal(str(model.preco)),
        )
