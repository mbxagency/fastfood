# 🚨 Troubleshooting - FastFood API

Guia para resolver problemas comuns durante o deploy e desenvolvimento.

## 🔍 Problemas Comuns

### **1. Erro de DATABASE_URL**

#### **Sintoma:**
```
sqlalchemy.exc.ArgumentError: Could not parse SQLAlchemy URL from string 'DATABASE_URL=postgresql://...'
```

#### **Causa:**
A variável de ambiente `DATABASE_URL` está sendo definida incorretamente no Render.

#### **Solução:**

1. **Verifique no Render Dashboard:**
   - Acesse [render.com](https://render.com)
   - Vá no seu Web Service
   - Clique em **Environment**
   - Verifique a variável `DATABASE_URL`

2. **Formato Correto:**
   ```
   ✅ CORRETO: postgresql://postech:lqIYZ8F3PcPCQBxeViQUbJZh0fw6dRDN@dpg-d1p7s4juibrs73dfuceg-a.ohio-postgres.render.com:5432/fastfood_vi5x
   ❌ INCORRETO: DATABASE_URL=postgresql://postech:lqIYZ8F3PcPCQBxeViQUbJZh0fw6dRDN@dpg-d1p7s4juibrs73dfuceg-a.ohio-postgres.render.com:5432/fastfood_vi5x
   ```

3. **Como Corrigir:**
   - No Render, clique em **Edit** na variável `DATABASE_URL`
   - **Key**: `DATABASE_URL`
   - **Value**: `postgresql://postech:lqIYZ8F3PcPCQBxeViQUbJZh0fw6dRDN@dpg-d1p7s4juibrs73dfuceg-a.ohio-postgres.render.com:5432/fastfood_vi5x`
   - Clique em **Save**

### **2. Erro de Conexão com Banco**

#### **Sintoma:**
```
psycopg2.OperationalError: could not connect to server
```

#### **Solução:**
1. Verifique se o PostgreSQL está ativo no Render
2. Confirme se a URL está correta
3. Teste a conexão localmente

### **3. Erro de CORS**

#### **Sintoma:**
```
Access to fetch at 'https://api.onrender.com' from origin 'https://frontend.vercel.app' has been blocked by CORS policy
```

#### **Solução:**
1. Verifique se `CORS_ALLOW_ORIGINS` está configurado corretamente
2. Deve incluir o domínio do Vercel: `https://fastfood-murex.vercel.app`

### **4. Erro de Build**

#### **Sintoma:**
```
ModuleNotFoundError: No module named 'fastapi'
```

#### **Solução:**
1. Verifique se `requirements.txt` está atualizado
2. Confirme se o `Dockerfile` está correto
3. Verifique os logs de build no Render

## 🛠️ Scripts de Debug

### **Debug de Variáveis de Ambiente**
```bash
cd backend
python debug_env.py
```

### **Teste de Conexão Local**
```bash
cd backend
python -c "
import os
from src.config import settings
print(f'DATABASE_URL: {settings.DATABASE_URL}')
print(f'ENVIRONMENT: {settings.ENVIRONMENT}')
"
```

## 📋 Checklist de Deploy

### **Antes do Deploy:**
- [ ] Todas as variáveis de ambiente configuradas no Render
- [ ] `DATABASE_URL` no formato correto (sem "DATABASE_URL=")
- [ ] `SECRET_KEY` definida
- [ ] `ADMIN_USERNAME` e `ADMIN_PASSWORD` configurados
- [ ] `CORS_ALLOW_ORIGINS` apontando para o Vercel

### **Após o Deploy:**
- [ ] Health check: `https://api.onrender.com/health`
- [ ] Documentação: `https://api.onrender.com/docs`
- [ ] Teste de login admin
- [ ] Teste de produtos
- [ ] Teste de CORS

## 🔧 Comandos Úteis

### **Local:**
```bash
# Testar localmente
cd backend
python -m uvicorn src.main:app --reload

# Verificar variáveis
python debug_env.py

# Testar conexão
python -c "from src.infrastructure.db.session import engine; print('✅ Connected')"
```

### **Render:**
```bash
# Ver logs
render logs

# Redeploy
render deploy
```

## 📞 Suporte

Se o problema persistir:
1. Verifique os logs no Render
2. Execute o script de debug
3. Teste localmente primeiro
4. Consulte a documentação da API 