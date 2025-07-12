# 🚀 Guia de Deploy - FastFood

Guia completo para fazer deploy do sistema FastFood usando Vercel (Frontend) e Railway (Backend).

## 📋 Arquitetura de Deploy

```
Frontend (Vercel) → Backend (Railway) → Database (Supabase)
```

## 🎯 Pré-requisitos

- ✅ Conta na [Vercel](https://vercel.com)
- ✅ Conta na [Railway](https://railway.app)
- ✅ Conta no [Supabase](https://supabase.com) (já configurado)
- ✅ Repositório no GitHub

## 🚀 Deploy do Backend (Railway)

### **1. Preparar o Backend**

```bash
# Certifique-se de que as migrações estão prontas
cd backend
make db-migrate

# Teste a conexão com o Supabase
make db-test
```

### **2. Deploy no Railway**

1. **Acesse [Railway.app](https://railway.app)**
2. **Clique em "New Project"**
3. **Selecione "Deploy from GitHub repo"**
4. **Conecte seu repositório GitHub**
5. **Selecione o repositório `fastfood`**

### **3. Configurar Variáveis de Ambiente**

No Railway, vá em **Variables** e adicione:

```env
DATABASE_URL=postgresql://postgres.cpntprlstlhubeivkpzq:postech_fiap_2025@aws-0-us-east-2.pooler.supabase.com:6543/postgres
SECRET_KEY=fastfood-secret-key-2025-change-in-production
ENVIRONMENT=production
DEBUG=false
CORS_ALLOW_ORIGINS=https://fastfood.vercel.app,https://fastfood-frontend.vercel.app
```

### **4. Configurar Deploy**

O Railway detectará automaticamente o `railway.json` e fará o deploy.

### **5. Obter URL da API**

Após o deploy, copie a URL gerada (ex: `https://fastfood-api.railway.app`)

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
API_URL=https://fastfood-api.railway.app
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

O Railway fará health checks automáticos no endpoint `/health`.

### **Logs e Monitoramento**

- **Railway**: Logs automáticos no dashboard
- **Vercel**: Analytics e logs no dashboard
- **Supabase**: Logs no dashboard do projeto

## 🧪 Testando o Deploy

### **1. Testar API**

```bash
# Teste o health check
curl https://fastfood-api.railway.app/health

# Teste os produtos
curl https://fastfood-api.railway.app/v1/api/public/produtos
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
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        uses: railway/deploy@v1
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📊 Monitoramento

### **Railway Dashboard**
- Uptime e performance
- Logs em tempo real
- Métricas de uso

### **Vercel Dashboard**
- Analytics de visitantes
- Performance do frontend
- Deploy history

### **Supabase Dashboard**
- Queries e performance
- Storage usage
- Real-time subscriptions

## 🚨 Troubleshooting

### **Problemas Comuns**

1. **CORS Errors**
   - Verifique se a URL do frontend está em `CORS_ALLOW_ORIGINS`

2. **Database Connection**
   - Teste a conexão com `make db-test`
   - Verifique as variáveis de ambiente

3. **Build Failures**
   - Verifique os logs no Railway/Vercel
   - Teste localmente primeiro

### **Comandos Úteis**

```bash
# Testar conexão com banco
make db-test

# Executar migrações
make db-migrate

# Testar API localmente
make dev

# Verificar logs
railway logs
```

## 🎉 URLs Finais

Após o deploy, você terá:

- **Frontend**: `https://fastfood.vercel.app`
- **Backend**: `https://fastfood-api.railway.app`
- **Database**: Supabase (já configurado)
- **Docs**: `https://fastfood-api.railway.app/docs`

## 📈 Próximos Passos

1. **Configurar domínio customizado**
2. **Implementar CI/CD completo**
3. **Adicionar monitoramento avançado**
4. **Configurar backups automáticos**
5. **Implementar rate limiting**
6. **Adicionar autenticação JWT**

---

**🎯 Sistema pronto para produção!** 