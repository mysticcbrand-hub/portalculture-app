# 🔍 CÓMO VER LOS LOGS DE VERCEL

## El error es 500 en el backend. Necesitamos ver qué está fallando.

### Opción 1: Ver logs en Vercel Dashboard (MÁS FÁCIL)

1. Ve a: https://vercel.com/dashboard
2. Click en tu proyecto: `app-portalculture`
3. Click en la pestaña **Deployments**
4. Click en el último deployment (el más reciente, arriba)
5. Click en **Functions** (menú izquierdo)
6. Busca `/api/ai/chat`
7. Click y verás los **logs de error**

---

### Opción 2: Vercel CLI (si tienes instalado)

```bash
vercel logs app-portalculture --follow
```

---

## 🎯 Lo que buscamos:

El log dirá algo como:
- `Error: OPENROUTER_API_KEY not found`
- `Error: Cannot find module...`
- `Error: ...` (cualquier error específico)

---

**POR FAVOR manda screenshot o copia el error del log aquí** y lo arreglo inmediatamente.
