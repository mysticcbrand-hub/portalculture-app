# 🚀 PRÓXIMOS PASOS - ACTIVAR AI COACH

## ✅ LO QUE YA ESTÁ HECHO

1. **Base de datos**: SQL script creado (`supabase-setup.sql`)
2. **Sistema de ingesta**: Script para PDFs + webs (`scripts/ingest-knowledge.ts`)
3. **APIs del backend**: 
   - `/api/ai/chat` - Chat con streaming
   - `/api/ai/usage` - Estadísticas de uso
   - `/api/ai/history` - Historial de conversaciones
4. **Frontend**: Componente `AICoach` integrado en dashboard
5. **Librerías**: OpenRouter, RAG, prompts NOVA

---

## 📋 PASOS PARA ACTIVAR (En orden)

### 1️⃣ SETUP BASE DE DATOS (5 minutos)

**Ve al archivo**: `SETUP_INSTRUCTIONS.md` y sigue las instrucciones.

**Resumen rápido**:
1. Abre Supabase Dashboard
2. Ve a SQL Editor
3. Copia y ejecuta `supabase-setup.sql`
4. Verifica que las 3 tablas se crearon

---

### 2️⃣ INGESTAR CONOCIMIENTO (30-60 minutos)

Una vez la base de datos esté lista:

```bash
cd /Users/mario/Desktop/app
npx tsx scripts/ingest-knowledge.ts
```

**Esto hará**:
- ✅ Extraer texto de Atomic Habits PDF
- ✅ Extraer texto de Charisma Myth PDF
- ✅ Scrape Huberman Lab, James Clear, Examine, Stronger by Science
- ✅ Dividir en chunks inteligentes
- ✅ Generar embeddings con OpenRouter
- ✅ Guardar en knowledge_base

**Tiempo**: ~30-60 minutos (depende de APIs)
**Costo**: $0 (usa tus $5 gratis de OpenRouter)

⚠️ **Nota**: Si alguna web falla, no pasa nada. El script continúa con las demás.

---

### 3️⃣ DEPLOY A VERCEL (2 minutos)

**Agregar variable de entorno en Vercel**:

1. Ve a: https://vercel.com/dashboard
2. Proyecto: `app-portalculture`
3. Settings → Environment Variables
4. Añade:
   - **Name**: `OPENROUTER_API_KEY`
   - **Value**: `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`
   - **Environment**: Production, Preview, Development

5. Redeploy:
```bash
git add .
git commit -m "feat: AI Coach NOVA con RAG"
git push origin main
```

---

### 4️⃣ TESTING (10 minutos)

**Local**:
```bash
npm run dev
```

1. Ve a http://localhost:3000/dashboard
2. Deberías ver un botón flotante abajo a la derecha (⚡ icon)
3. Click para abrir el chat
4. Prueba preguntas como:
   - "¿Cómo ganar músculo?"
   - "Dame un plan de hábitos atómicos"
   - "¿Qué dice Huberman sobre el sueño?"

**Producción**:
- Ve a: https://app-portalculture.vercel.app/dashboard
- Mismo testing

---

## 🎯 VERIFICACIÓN DE ÉXITO

✅ Chat se abre y cierra correctamente
✅ Respuestas streaming en tiempo real
✅ Responde con conocimiento de PDFs/webs
✅ Personalidad NOVA (directo, científico, motivador)
✅ Rate limit: 20 mensajes/día por usuario
✅ Historial se guarda y persiste

---

## 🔧 TROUBLESHOOTING

### Error: "knowledge_base table not found"
→ Ejecuta `supabase-setup.sql` primero

### Error: "OpenRouter API error"
→ Verifica que la API key esté en `.env.local` y Vercel

### No responde o responde genérico
→ Ejecuta el script de ingesta primero (`npx tsx scripts/ingest-knowledge.ts`)

### Error: "Invalid embedding dimension"
→ Asegúrate que la tabla `knowledge_base` usa `vector(1536)`

---

## 📊 MÉTRICAS ESPERADAS

**Después de ingesta**:
- ~200-500 chunks en `knowledge_base`
- Embeddings generados para todos

**En producción**:
- Respuestas en ~2-5 segundos
- Streaming suave
- Rate limit funcionando

---

## 🎨 PERSONALIZACIÓN FUTURA

Si quieres ajustar:

1. **Prompt NOVA**: Edita `/lib/prompts.ts`
2. **Rate limit**: Cambia `DAILY_MESSAGE_LIMIT` en APIs
3. **Apariencia**: Edita `/components/AICoach.tsx`
4. **Más conocimiento**: Añade PDFs/URLs en `scripts/ingest-knowledge.ts`

---

**¿Listo para empezar?** 🔥
**Paso 1**: Ejecuta el SQL en Supabase (ver `SETUP_INSTRUCTIONS.md`)
