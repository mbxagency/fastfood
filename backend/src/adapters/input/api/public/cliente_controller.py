from fastapi import APIRouter, Depends

from src.adapters.input.api.dependencies import get_cliente_service
from src.adapters.input.dto.cliente_dto import ClienteCreate, ClienteResponse
from src.ports.services.cliente_service_port import ClienteServicePort

router = APIRouter(
    prefix="/v1/api/public/clientes",
    tags=["Painel de Clientes"]
)

@router.post("/", response_model=ClienteResponse, summary="Criar ou obter cliente")
def criar_ou_obter_cliente(
    dto: ClienteCreate,
    service: ClienteServicePort = Depends(get_cliente_service)
):
    return service.criar_ou_obter_cliente(dto)
