# 🚀 Configuração de Variáveis de Ambiente no Render

Este guia explica como configurar as variáveis de ambiente no Render para conectar com o PostgreSQL do Render.

## 📋 Variáveis Necessárias

### **1. Acesse o Dashboard do Render**
1. Vá para [render.com](https://render.com)
2. Faça login na sua conta
3. Selecione seu projeto FastFood

### **2. Configure as Variáveis de Ambiente**

No seu **Web Service** do backend, vá em **Environment** e adicione as seguintes variáveis:

```env
# Database Configuration - Render PostgreSQL
DATABASE_URL=postgresql://postech:lqIYZ8F3PcPCQBxeViQUbJZh0fw6dRDN@dpg-d1p7s4juibrs73dfuceg-a.ohio-postgres.render.com:5432/fastfood_vi5x

# Security
SECRET_KEY=fastfood-secret-key-2025-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Environment
ENVIRONMENT=production
DEBUG=false

# CORS Configuration - Main Vercel domain
CORS_ALLOW_ORIGINS=https://fastfood-murex.vercel.app

# API Configuration
API_PREFIX=/v1
PROJECT_NAME=FastFood API
VERSION=1.0.0

# Logging
LOG_LEVEL=INFO
```

## 🔧 Como Adicionar no Render

### **Passo a Passo:**

1. **Acesse seu Web Service**
   - Vá para o dashboard do Render
   - Clique no seu serviço FastFood API

2. **Vá para Environment**
   - No menu lateral, clique em **Environment**
   - Clique em **Add Environment Variable**

3. **Adicione cada variável:**
   - **Key**: `DATABASE_URL`
   - **Value**: `postgresql://postech:lqIYZ8F3PcPCQBxeViQUbJZh0fw6dRDN@dpg-d1p7s4juibrs73dfuceg-a.ohio-postgres.render.com:5432/fastfood_vi5x`
   - Clique em **Save**

4. **Repita para todas as variáveis:**
   - `SECRET_KEY`
   - `ALGORITHM`
   - `ACCESS_TOKEN_EXPIRE_MINUTES`
   - `ENVIRONMENT`
   - `DEBUG`
   - `CORS_ALLOW_ORIGINS`
   - `API_PREFIX`
   - `PROJECT_NAME`
   - `VERSION`
   - `LOG_LEVEL`

5. **Salve as Mudanças**
   - Clique em **Save Changes**
   - O serviço será redeployado automaticamente

## 🔍 Verificação

### **1. Verifique o Deploy**
- Vá para a aba **Logs**
- Verifique se não há erros de conexão com o banco

### **2. Teste a API**
- Acesse: `https://seu-app.onrender.com/health`
- Deve retornar: `{"status": "healthy", "version": "1.0.0"}`

### **3. Teste a Documentação**
- Acesse: `https://seu-app.onrender.com/docs`
- Deve mostrar a documentação Swagger

## ⚠️ Importante

- **Nunca commite** as credenciais no Git
- Use sempre variáveis de ambiente
- O arquivo `.env` está no `.gitignore`
- As credenciais do banco são sensíveis

## 🆘 Troubleshooting

### **Erro de Conexão com Banco:**
1. Verifique se o `DATABASE_URL` está correto
2. Confirme se o PostgreSQL está ativo no Render
3. Verifique os logs do serviço

### **Erro de CORS:**
1. Verifique se `CORS_ALLOW_ORIGINS` está correto
2. Deve apontar para o domínio do Vercel

### **Erro de Build:**
1. Verifique se todas as dependências estão no `requirements.txt`
2. Confirme se o `Dockerfile` está correto

## 📞 Suporte

Se tiver problemas:
1. Verifique os logs no Render
2. Teste a conexão localmente
3. Consulte a documentação da API 