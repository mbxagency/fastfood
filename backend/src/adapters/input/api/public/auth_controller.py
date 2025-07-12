from fastapi import APIRouter, Form, HTTPException, status
from fastapi.responses import JSONResponse
from src.adapters.input.api.security.jwt_handler import create_access_token

router = APIRouter(prefix="/v1/api/public", tags=["Autenticação"])

@router.post("/login", summary="Login do Admin")
def login_admin(
    username: str = Form(...),
    password: str = Form(...)
):
    if username != "admin" or password != "admin123":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuário ou senha inválidos")

    token = create_access_token(data={"sub": username, "role": "admin"})
    return JSONResponse(content={"access_token": token, "token_type": "bearer"})
