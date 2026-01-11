# 🔥 INSTRUCCIONES SETUP BASE DE DATOS

## PASO 1: Ejecutar SQL en Supabase

1. Ve a: https://supabase.com/dashboard/project/dzbmnumpzdhydfkjmlif
2. Click en **SQL Editor** (menú izquierdo)
3. Click en **New Query**
4. Copia TODO el contenido del archivo `supabase-setup.sql`
5. Pégalo en el editor
6. Click en **RUN** (o Ctrl/Cmd + Enter)

**Esto creará:**
- ✅ Tablas: `knowledge_base`, `chat_messages`, `chat_usage`
- ✅ Extensión pgvector para embeddings
- ✅ Índices optimizados para búsqueda vectorial
- ✅ Funciones helper para RAG y rate limiting
- ✅ Row Level Security policies

**Tiempo estimado:** 1 minuto

---

## PASO 2: Verificar que funcionó

En el mismo SQL Editor, ejecuta:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('knowledge_base', 'chat_messages', 'chat_usage');
```

**Deberías ver:** 3 filas con esos nombres de tablas

---

## ⚠️ SI HAY ERROR

Si da error de pgvector:
1. Ve a **Database** → **Extensions**
2. Busca "vector"
3. Actívala manualmente
4. Vuelve a ejecutar el SQL

---

**AVÍSAME CUANDO ESTÉ LISTO Y CONTINÚO** 🚀
