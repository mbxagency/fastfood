# FastFood API

API para sistema de autoatendimento de fast food desenvolvida com FastAPI.

## Estrutura

```
src/
├── adapters/          # Controllers e repositories
├── application/       # Services (casos de uso)
├── domain/           # Entidades e regras de negócio
├── infrastructure/   # Configurações de banco
├── ports/           # Interfaces
├── config.py        # Configurações
├── constants.py     # Constantes
├── exceptions.py    # Exceções customizadas
├── utils.py         # Utilitários
└── main.py          # Ponto de entrada
```

## Instalação

1. Clone o repositório
2. Instale as dependências:
   ```bash
   pip install -e .
   ```

3. Configure as variáveis de ambiente:
   ```bash
   cp env.example .env
   # Edite o arquivo .env
   ```

4. Execute as migrações:
   ```bash
   alembic upgrade head
   ```

5. Inicie a aplicação:
   ```bash
   uvicorn src.main:app --reload
   ```

## Comandos Úteis

```bash
make install    # Instala dependências
make dev        # Inicia servidor de desenvolvimento
make test       # Executa testes
make lint       # Executa linter
make format     # Formata código
make migrate    # Executa migrações
make clean      # Remove arquivos temporários
```

## Documentação

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Funcionalidades

- Autenticação de clientes
- Gerenciamento de produtos
- Criação e acompanhamento de pedidos
- Processamento de pagamentos
- Interface administrativa 