# 🔐 Guía: Acceder al Admin y Configurar Webhook

## 📋 PASO 1: ACCEDER AL PANEL DE ADMIN

### 1.1 Servidor Local Corriendo
✅ Ya está corriendo en: `http://localhost:3000`

### 1.2 Crear Cuenta de Admin
1. Abre tu navegador
2. Ve a: **http://localhost:3000/login**
3. Click en **"Crear cuenta"**
4. Introduce:
   - Email: `mysticcbrand@gmail.com`
   - Contraseña: La que quieras (mínimo 6 caracteres)
5. Click **"Crear cuenta"**

✅ **Tu email ya está aprobado en la waitlist**, así que la cuenta se creará sin problemas.

### 1.3 Acceder al Panel Admin
Después de crear la cuenta, serás redirigido automáticamente a `/dashboard`.

Para acceder al panel de admin:
- Ve a: **http://localhost:3000/admin/waitlist**
- O en el dashboard, añade `/admin/waitlist` a la URL

✅ Solo tu email (`mysticcbrand@gmail.com`) tiene acceso a esta página.

---

## 🔗 PASO 2: CONFIGURAR WEBHOOK DE TYPEFORM

Tienes **2 opciones**:

---

### **OPCIÓN A: Webhook en Producción (RECOMENDADO)**

Esta es la mejor opción para producción y es más fácil de configurar.

#### A.1 Deploy en Vercel (10-15 minutos)

1. **Ve a Vercel**
   - URL: https://vercel.com/new
   - Login con tu cuenta

2. **Importa el Repositorio**
   - Busca: `mysticcbrand-hub/portalculture-app`
   - Click "Import"

3. **Configurar Variables de Entorno**
   
   Copia estos valores desde tu archivo `.env.local`:
   
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   NEXT_PUBLIC_TYPEFORM_ID=01KDNY02YBPCQYJ5MTTVWPCZ2J
   SUPABASE_SERVICE_ROLE_KEY=
   MAILERLITE_API_KEY=
   MAILERLITE_GROUP_ID=175223345689659296
   ```

4. **Deploy**
   - Click "Deploy"
   - Espera 2-3 minutos
   - Anota tu URL: `https://portalculture-app.vercel.app` (o similar)

#### A.2 Configurar Webhook en Typeform

1. **Ve a Typeform**
   - URL: https://admin.typeform.com
   - Login con tu cuenta

2. **Selecciona tu Formulario**
   - ID: `01KDNY02YBPCQYJ5MTTVWPCZ2J`
   - O busca por nombre

3. **Ir a Webhooks**
   - Click en "Connect" (en el menú superior)
   - Click en "Webhooks"
   - O ve directamente a: Settings → Integrations → Webhooks

4. **Añadir Webhook**
   - Click "Add a webhook"
   - **Destination URL**: `https://TU-URL-VERCEL.vercel.app/api/typeform-webhook`
   - **Secret**: (déjalo vacío por ahora)
   - Click "Save webhook"

5. **Probar el Webhook**
   - Click en "View deliveries" o "Test webhook"
   - Typeform enviará una respuesta de prueba
   - Deberías ver status 200 (success)

6. **Verificar en Vercel**
   - Ve a Vercel Dashboard → tu proyecto → Functions
   - Verás los logs del webhook
   - Busca: `/api/typeform-webhook`

---

### **OPCIÓN B: Webhook Local con ngrok (Para Testing)**

Usa esta opción si quieres probar el webhook localmente antes de deploy.

#### B.1 Instalar ngrok (si no lo tienes)

```bash
# Ya se está instalando con:
brew install ngrok/ngrok/ngrok
```

#### B.2 Exponer tu localhost

```bash
# En una nueva terminal:
ngrok http 3000
```

Verás algo como:
```
Forwarding    https://abc123.ngrok.io -> http://localhost:3000
```

**Copia la URL**: `https://abc123.ngrok.io`

#### B.3 Configurar Webhook en Typeform

Sigue los mismos pasos que en Opción A.2, pero usa:
- **URL**: `https://abc123.ngrok.io/api/typeform-webhook`

⚠️ **Nota**: La URL de ngrok cambia cada vez que lo reinicias (en la versión gratuita).

#### B.4 Probar el Webhook

1. Ve a Typeform y haz click en "Test webhook"
2. En tu terminal donde corre `npm run dev`, verás:
   ```
   Typeform webhook received: {...}
   Successfully saved to waitlist: {...}
   ```
3. Ve a `http://localhost:3000/admin/waitlist`
4. Deberías ver la nueva solicitud

---

## 🧪 PASO 3: PROBAR EL FLUJO COMPLETO

### Test 1: Webhook funciona
1. Envía una respuesta de prueba desde Typeform
2. Verifica en `/admin/waitlist` que apareció
3. Status debe ser: `pending`

### Test 2: Aprobar usuario
1. En `/admin/waitlist`, click "Aprobar"
2. Verifica que se añade a Mailerlite
3. Status debe cambiar a: `approved`

### Test 3: Usuario crea cuenta
1. Ve a `/login`
2. Click "Crear cuenta"
3. Usa el email aprobado
4. Debe entrar al dashboard

---

## 🔍 VERIFICAR QUE TODO FUNCIONA

### ✅ Checklist de Webhook

- [ ] Webhook configurado en Typeform
- [ ] URL correcta: `/api/typeform-webhook`
- [ ] Test webhook retorna 200
- [ ] Respuesta aparece en `/admin/waitlist`
- [ ] Email y nombre se extraen correctamente
- [ ] Status es 'pending'

### ✅ Checklist de Admin

- [ ] Puedo acceder a `/admin/waitlist`
- [ ] Veo solicitudes pendientes
- [ ] Puedo aprobar usuarios
- [ ] Usuario se añade a Mailerlite
- [ ] Status cambia a 'approved'

### ✅ Checklist de Registro

- [ ] Usuario aprobado puede crear cuenta
- [ ] Usuario no aprobado recibe error
- [ ] Después de registro, entra al dashboard
- [ ] Dashboard muestra Discord y cursos

---

## 🐛 TROUBLESHOOTING

### Problema: "No puedo acceder a /admin/waitlist"
**Solución**: 
- Verifica que estés logueado con `mysticcbrand@gmail.com`
- Si usas otro email, no tendrás acceso (solo admin)

### Problema: "Webhook no recibe datos"
**Solución**:
- Verifica la URL en Typeform
- Asegúrate de que no tenga espacios o errores de tipeo
- Si es local, verifica que ngrok esté corriendo
- Revisa los logs en terminal o Vercel

### Problema: "Error al aprobar usuario"
**Solución**:
- Verifica las credenciales de Mailerlite
- Revisa los logs en Vercel Functions
- Verifica que el Group ID sea correcto: `175223345689659296`

### Problema: "No puedo crear cuenta con mi email"
**Solución**:
- Verifica que el email esté en waitlist con status 'approved'
- Ve a `/admin/waitlist` y búscalo
- Si está 'pending', apruébalo primero

---

## 📊 ENDPOINTS IMPORTANTES

| Endpoint | Método | Uso |
|----------|--------|-----|
| `/` | GET | Página principal con Typeform |
| `/login` | GET | Login/Registro |
| `/dashboard` | GET | Dashboard de usuario |
| `/admin/waitlist` | GET | Panel de administración |
| `/api/typeform-webhook` | POST | Recibe respuestas de Typeform |
| `/api/typeform-webhook` | GET | Test endpoint (retorna JSON) |
| `/api/mailerlite/add-subscriber` | POST | Añade usuario a Mailerlite |

---

## 🔐 CREDENCIALES IMPORTANTES

### Typeform
- Form ID: `01KDNY02YBPCQYJ5MTTVWPCZ2J`
- Admin: https://admin.typeform.com

### Supabase
- Project: Ver `.env.local`
- Admin: https://supabase.com/dashboard

### Mailerlite
- Group ID: `175223345689659296`
- Admin: https://dashboard.mailerlite.com

### Vercel
- Project: `portalculture-app`
- Admin: https://vercel.com/dashboard

---

## 📞 RESUMEN RÁPIDO

**Para acceder al admin**:
1. Ve a `http://localhost:3000/login`
2. Crea cuenta con `mysticcbrand@gmail.com`
3. Ve a `http://localhost:3000/admin/waitlist`

**Para configurar webhook**:
1. Deploy en Vercel (recomendado)
2. Ve a Typeform → Webhooks
3. URL: `https://tu-url.vercel.app/api/typeform-webhook`
4. Test webhook

**Para probar todo**:
1. Completa el Typeform
2. Ve a `/admin/waitlist`
3. Aprueba el usuario
4. Usuario crea cuenta en `/login`
5. Accede al dashboard

---

✅ **¡Todo listo para funcionar!**

¿Necesitas ayuda con algún paso específico?
