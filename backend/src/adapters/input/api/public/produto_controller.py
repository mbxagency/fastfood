from fastapi import APIRouter, Depends

from src.adapters.input.api.dependencies import get_produto_service
from src.adapters.input.dto.produto_dto import ProdutoResponse
from src.ports.services.produto_service_port import ProdutoServicePort

router = APIRouter(prefix="/v1/api/public/produtos", tags=["Painel de Produtos"])

@router.get("/", response_model=list[ProdutoResponse], summary="Listar produtos disponíveis")
def listar_produtos(service: ProdutoServicePort = Depends(get_produto_service)):
    return service.listar_produtos()
