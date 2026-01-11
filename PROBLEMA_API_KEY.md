# ⚠️ PROBLEMA: API Key de OpenRouter inválida

## Error:
```
OpenRouter Embeddings API error: 401 - {"error":{"message":"User not found.","code":401}}
```

## Causa:
La API key de OpenRouter está **mal o expirada**.

## Solución:

### 1️⃣ Genera una NUEVA API key en OpenRouter

1. Ve a: https://openrouter.ai/keys
2. Login con tu cuenta (mysticcbrand@gmail.com)
3. Click en **Create Key**
4. Copia la nueva key (empieza con `sk-or-v1-...`)

### 2️⃣ Actualiza en Vercel

1. Ve a: https://vercel.com/dashboard
2. Tu proyecto → Settings → Environment Variables
3. Busca `OPENROUTER_API_KEY`
4. Click en los 3 puntos → **Edit**
5. Pega la nueva key
6. Save
7. Redeploy (Deployments → último deploy → 3 puntos → Redeploy)

### 3️⃣ Actualiza en local

Edita `/Users/mario/Desktop/app/.env.local`:
```
OPENROUTER_API_KEY=sk-or-v1-NUEVA_KEY_AQUI
```

---

## 🔍 Verifica que la nueva key funcione:

Ve a: https://openrouter.ai/keys

Debería mostrar tu key activa con créditos disponibles ($5 gratis).

---

**Una vez hecho esto, el chat funcionará perfectamente** ✅
