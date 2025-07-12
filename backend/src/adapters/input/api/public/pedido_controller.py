from uuid import UUID

from fastapi import APIRouter, Depends

from src.adapters.input.api.dependencies import get_pedido_service
from src.adapters.input.dto.pedido_dto import PedidoCreate, PedidoResponse, CheckoutPedidoDTO
from src.application.services.pedido_service import PedidoService

router = APIRouter(prefix="/v1/api/public/pedidos", tags=["Painel de Pedidos"])

@router.post("/checkout", response_model=PedidoResponse, summary="Checkout do pedido")
def checkout_pedido(
    checkout_data: CheckoutPedidoDTO,
    service: PedidoService = Depends(get_pedido_service),
):
    """Endpoint de checkout que recebe os produtos solicitados e retorna a identificação do pedido"""
    return service.criar_pedido(checkout_data)

@router.post("/", response_model=PedidoResponse, summary="Cliente cria um pedido")
def criar_pedido(
    pedido: PedidoCreate,
    service: PedidoService = Depends(get_pedido_service),
):
    """Cria um novo pedido"""
    return service.criar_pedido(pedido)

@router.get("/{pedido_id}", response_model=PedidoResponse, summary="Cliente acompanha status do pedido")
def buscar_pedido(pedido_id: UUID, service: PedidoService = Depends(get_pedido_service)):
    """Consulta o status de um pedido específico"""
    return service.buscar_pedido_por_id(pedido_id)
