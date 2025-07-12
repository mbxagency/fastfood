# 🚀 Guia de Deploy - FastFood

Guia completo para fazer deploy do sistema FastFood usando Vercel (Frontend) e Render (Backend + Database).

## 📋 Arquitetura de Deploy

```
Frontend (Vercel) → Backend (Render) → Database (Render PostgreSQL)
```

## 🎯 Pré-requisitos

- ✅ Conta na [Vercel](https://vercel.com)
- ✅ Conta no [Render](https://render.com)
- ✅ Repositório no GitHub

## 🚀 Deploy do Backend (Render)

### **1. Preparar o Backend**

```bash
# Certifique-se de que o backend está na pasta correta
ls backend/
# Deve mostrar: src/, alembic/, requirements.txt, render.yaml, etc.
```

### **2. Deploy no Render**

1. **Acesse [Render.com](https://render.com)**
2. **Clique em "New +" → "Web Service"**
3. **Conecte seu repositório GitHub**
4. **Selecione o repositório `fastfood`**

### **3. Configurar Build**

No Render, configure:

- **Name**: `fastfood-api`
- **Environment**: `Python 3`
- **Build Command**: `cd backend && pip install -r requirements.txt && alembic upgrade head`
- **Start Command**: `cd backend && uvicorn src.main:app --host 0.0.0.0 --port $PORT`
- **Plan**: Free

### **4. Configurar Variáveis de Ambiente**

No Render, vá em **Environment** e adicione:

```env
DATABASE_URL=postgresql://postech:lqIYZ8F3PcPCQBxeViQUbJZh0fw6dRDN@dpg-d1p7s4juibrs73dfuceg-a.ohio-postgres.render.com:5432/fastfood_vi5x
SECRET_KEY=fastfood-secret-key-2025-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ENVIRONMENT=production
DEBUG=false
CORS_ALLOW_ORIGINS=https://fastfood-murex.vercel.app
API_PREFIX=/v1
PROJECT_NAME=FastFood API
VERSION=1.0.0
LOG_LEVEL=INFO
```

### **5. Deploy**

Clique em **Create Web Service** e aguarde a conclusão.

## 🌐 Deploy do Frontend (Vercel)

### **1. Preparar o Frontend**

```bash
# Certifique-se de que o frontend está na pasta correta
ls frontend/
# Deve mostrar: index.html, styles.css, script.js, README.md
```

### **2. Deploy no Vercel**

1. **Acesse [Vercel.com](https://vercel.com)**
2. **Clique em "New Project"**
3. **Conecte seu repositório GitHub**
4. **Selecione o repositório `fastfood`**

### **3. Configurar Build**

No Vercel, configure:

- **Framework Preset**: Other
- **Build Command**: (deixe vazio)
- **Output Directory**: frontend
- **Install Command**: (deixe vazio)

### **4. Configurar Variáveis de Ambiente**

No Vercel, vá em **Environment Variables** e adicione:

```env
API_URL=https://fastfood-api.onrender.com
```

### **5. Deploy**

Clique em **Deploy** e aguarde a conclusão.

## 🔧 Configurações Adicionais

### **CORS Configuration**

O backend já está configurado para aceitar requisições do Vercel. Se necessário, atualize em `backend/src/config.py`:

```python
CORS_ALLOW_ORIGINS=["https://seu-dominio.vercel.app"]
```

### **Health Check**

O Render fará health checks automáticos no endpoint `/health`.

### **Logs e Monitoramento**

- **Vercel**: Analytics e logs no dashboard
- **Render**: Logs no dashboard do projeto
- **Render PostgreSQL**: Logs no dashboard do banco

## 🧪 Testando o Deploy

### **1. Testar Backend**

```bash
# Teste o health check
curl https://fastfood-api.onrender.com/health

# Teste os produtos
curl https://fastfood-api.onrender.com/v1/api/public/produtos
```

### **2. Testar Frontend**

Acesse a URL do Vercel e teste:
- ✅ Navegação
- ✅ Carregamento de produtos
- ✅ Carrinho de compras
- ✅ Checkout

## 🔄 Deploy Automático

### **GitHub Actions (Opcional)**

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Render

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        uses: johnbeynon/render-deploy-action@v1.0.0
        with:
          service-id: ${{ secrets.RENDER_SERVICE_ID }}
          api-key: ${{ secrets.RENDER_API_KEY }}
```

## 📊 Monitoramento

### **Vercel Dashboard**
- Analytics de visitantes
- Performance do frontend
- Deploy history

### **Render Dashboard**
- Logs em tempo real
- Métricas de performance
- Uptime monitoring

### **Render PostgreSQL Dashboard**
- Queries e performance
- Storage usage
- Database metrics

## 🚨 Troubleshooting

### **Problemas Comuns**

1. **CORS Errors**
   - Verifique se a URL do frontend está em `CORS_ALLOW_ORIGINS`

2. **Database Connection**
   - Verifique se a variável `DATABASE_URL` está configurada corretamente
   - Teste a conexão com o Render PostgreSQL

3. **Build Failures**
   - Verifique os logs no Render
   - Teste localmente primeiro 