# 🍔 FastFood - Sistema de Autoatendimento

Sistema completo de autoatendimento para restaurantes fast food, desenvolvido com arquitetura hexagonal e tecnologias modernas.

## 🚀 Demo

- **Frontend**: [https://fastfood.vercel.app](https://fastfood.vercel.app)
- **API Docs**: [https://fastfood-api.onrender.com/docs](https://fastfood-api.onrender.com/docs)
- **Health Check**: [https://fastfood-api.onrender.com/health](https://fastfood-api.onrender.com/health)

## 📋 Funcionalidades

### **👥 Cliente**
- ✅ Menu interativo com categorias
- ✅ Carrinho de compras
- ✅ Sistema de pedidos
- ✅ Acompanhamento em tempo real
- ✅ Pagamento integrado

### **👨‍💼 Administrador**
- ✅ Gestão de produtos
- ✅ Controle de pedidos
- ✅ Relatórios de vendas
- ✅ Gestão de clientes
- ✅ Dashboard administrativo

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Vercel)      │◄──►│   (Render)      │◄──►│  (Render)       │
│                 │    │                 │    │                 │
│ • HTML/CSS/JS   │    │ • FastAPI       │    │ • PostgreSQL    │
│ • Responsive    │    │ • Hexagonal     │    │ • Managed       │
│ • PWA Ready     │    │ • Clean Code    │    │ • Backups       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Backend - Arquitetura Hexagonal**
- **API Layer**: Controllers e DTOs
- **Application Layer**: Services e Use Cases
- **Domain Layer**: Models e Business Logic
- **Infrastructure Layer**: Repositories e External Services

## 🛠️ Tecnologias

### **Backend**
- **Framework**: FastAPI (Python 3.11)
- **Database**: PostgreSQL (Render)
- **ORM**: SQLAlchemy + Alembic
- **Auth**: JWT
- **Validation**: Pydantic
- **Testing**: pytest

### **Frontend**
- **Language**: Vanilla JavaScript
- **Styling**: CSS3 + Flexbox/Grid
- **Icons**: Font Awesome
- **Responsive**: Mobile-first

### **Infrastructure**
- **Frontend Host**: Vercel
- **Backend Host**: Render
- **Database**: Render PostgreSQL
- **Container**: Docker
- **CI/CD**: GitHub Actions (opcional)

## 📁 Estrutura do Projeto

```
fastfood/
├── 📁 backend/                 # API FastAPI
│   ├── 📁 src/
│   │   ├── 📁 adapters/        # Controllers e DTOs
│   │   ├── 📁 application/     # Services
│   │   ├── 📁 domain/          # Models
│   │   ├── 📁 infrastructure/  # Repositories
│   │   └── 📁 ports/           # Interfaces
│   ├── 📁 alembic/             # Migrations
│   ├── 📁 script/              # Scripts utilitários
│   ├── 🐳 Dockerfile           # Container
│   ├── 📋 Makefile             # Comandos
│   ├── 📦 requirements.txt     # Dependências Python
│   └── 📦 pyproject.toml       # Dependências
├── 📁 frontend/                # Interface web
│   ├── 🎨 styles.css           # Estilos
│   ├── ⚡ script.js            # Lógica
│   ├── 📄 index.html           # Página principal
│   └── 📖 README.md            # Documentação
├── 📁 docs/                    # Documentação
│   ├── 📊 architecture.puml    # Diagramas
│   ├── 🔄 fluxos-*.puml        # Fluxos
│   └── 🧪 postman-collection.json
├── 📁 k8s/                     # Kubernetes (opcional)
├── 📁 scripts/                 # Scripts de automação
├── 🚀 DEPLOY_GUIDE.md          # Guia de deploy
├── 🌐 vercel.json              # Config Vercel
├── 🎯 render.yaml              # Config Render
└── 📖 README.md                # Este arquivo
```

## 🚀 Deploy Rápido

### **1. Pré-requisitos**
```bash
# Clone o repositório
git clone https://github.com/mbxagency/fastfood.git
cd fastfood

# Execute o script de deploy
./scripts/deploy.sh
```

### **2. Deploy Manual**

#### **Backend (Render)**
1. Acesse [Render.com](https://render.com)
2. New Web Service → Connect Repository
3. Selecione o repositório `fastfood`
4. Configure:
   - **Build Command**: `cd backend && pip install -r requirements.txt && alembic upgrade head`
   - **Start Command**: `cd backend && uvicorn src.main:app --host 0.0.0.0 --port $PORT`
5. Adicione variáveis de ambiente
6. Deploy

#### **Frontend (Vercel)**
1. Acesse [Vercel.com](https://vercel.com)
2. New Project → Import Git Repository
3. Configure Output Directory: `frontend`
4. Adicione variável: `API_URL`
5. Deploy

### **3. Variáveis de Ambiente**

#### **Render (Backend)**
```env
DATABASE_URL=postgresql://user:pass@host:port/db
SECRET_KEY=your-secret-key
ENVIRONMENT=production
DEBUG=false
CORS_ALLOW_ORIGINS=https://fastfood.vercel.app
```

#### **Vercel (Frontend)**
```env
API_URL=https://fastfood-api.onrender.com
```

## 🧪 Desenvolvimento Local

### **Frontend**
```bash
cd frontend

# Servir localmente
python -m http.server 3000
# ou
npx serve .
```

## 📊 API Endpoints

### **Públicos**
- `GET /health` - Health check
- `GET /v1/api/public/produtos` - Listar produtos
- `POST /v1/api/public/pedidos` - Criar pedido
- `GET /v1/api/public/pedidos/{id}` - Consultar pedido

### **Administrativos**
- `POST /v1/api/admin/auth/login` - Login admin
- `GET /v1/api/admin/produtos` - Gestão produtos
- `GET /v1/api/admin/pedidos` - Gestão pedidos
- `GET /v1/api/admin/clientes` - Gestão clientes

## 🔧 Comandos Úteis

```bash
# Deploy completo
./scripts/deploy.sh

# Verificar qualidade do código
make lint

# Testar API localmente
make dev
```

## 📈 Monitoramento

- **Vercel**: Analytics e performance do frontend
- **Render**: Logs e métricas do backend e database
- **Render PostgreSQL**: Queries e storage do banco

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Equipe

- **Desenvolvimento**: [Seu Nome]
- **Arquitetura**: Clean Architecture + Hexagonal
- **Deploy**: Vercel + Render

## 📞 Suporte

- **Issues**: [GitHub Issues](https://github.com/mbxagency/fastfood/issues)
- **Documentação**: [docs/](docs/)
- **API Docs**: [https://fastfood-api.onrender.com/docs](https://fastfood-api.onrender.com/docs)

---

**🍔 FastFood - Sistema de Autoatendimento Moderno**


