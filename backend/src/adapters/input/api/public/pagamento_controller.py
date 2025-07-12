from fastapi import APIRouter, Depends, HTTPException
from uuid import UUID

from src.adapters.input.api.dependencies import get_pagamento_service
from src.adapters.input.dto.pagamento_dto import PagamentoQRCodeResponse, WebhookPagamentoDTO
from src.application.services.pagamento_service import PagamentoService

router = APIRouter(prefix="/v1/api/public/pagamento", tags=["Painel de Pagamento"])

@router.get("/qrcode", response_model=PagamentoQRCodeResponse, summary="Gerar QRCode do Mercado Pago")
def gerar_qrcode(
    service: PagamentoService = Depends(get_pagamento_service)
):
    """Gera QRCode para pagamento do pedido"""
    return service.gerar_qrcode()

@router.get("/status/{pedido_id}", summary="Consultar status de pagamento do pedido")
def consultar_status_pagamento(
    pedido_id: UUID,
    service: PagamentoService = Depends(get_pagamento_service)
):
    """Consulta o status de pagamento de um pedido específico"""
    try:
        return service.consultar_status_pagamento(pedido_id)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/webhook", summary="Webhook para confirmação de pagamento")
def webhook_pagamento(
    webhook_data: WebhookPagamentoDTO,
    service: PagamentoService = Depends(get_pagamento_service)
):
    """Webhook para receber confirmação de pagamento aprovado ou recusado"""
    try:
        return service.processar_webhook(webhook_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
