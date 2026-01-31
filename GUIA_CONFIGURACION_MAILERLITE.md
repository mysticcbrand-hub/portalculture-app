# 🚀 Guía Paso a Paso: Configurar Mailerlite para Portal Culture

**Tiempo estimado**: 15-20 minutos  
**Dificultad**: Fácil (con screenshots guía)

---

## 📋 RESUMEN: ¿Qué vamos a crear?

### 3 Grupos (YA EXISTEN) + 3 Automatizaciones

1. **Grupo "pending"** (YA EXISTE - ID: 175223345689659296)
   → Email automático: "Solicitud recibida"
   → Usuario completa cuestionario → se añade aquí

2. **Grupo "approved"** (YA EXISTE - el que ya tienes)
   → Email automático: "¡Bienvenido a Portal Culture!"
   → Admin aprueba → se mueve de pending a approved

3. **Grupo "rejected"** (YA EXISTE - ID: 178144659100403395)
   → Email automático: "Sobre tu solicitud"
   → Admin rechaza → se mueve de pending a rejected
   → Auto-limpieza 24h: TÚ lo harás después

---

## PASO 1: Login en Mailerlite

1. Ve a: https://dashboard.mailerlite.com
2. Login con tu cuenta (mysticcbrand@gmail.com)
3. Una vez dentro, verás el Dashboard principal

---

## PASO 2: Verificar que tienes los 3 Grupos

### 2.1 Ir a Grupos
```
Dashboard → Subscribers → Groups
```

### 2.2 Verificar que existen estos 3 grupos:

✅ **1. "pending"** (o "waitlist_pending")
   - ID: `175223345689659296`
   - Descripción: Usuarios que completaron el cuestionario

✅ **2. "approved"** (o nombre que le hayas puesto)
   - ID: Lo necesitas copiar
   - Descripción: Usuarios aprobados

✅ **3. "rejected"** (o "waitlist_rejected")
   - ID: `178144659100403395`
   - Descripción: Usuarios rechazados

### 2.3 Copiar el Group ID de "approved"

1. Click en tu grupo de usuarios aprobados
2. En la URL verás algo como:
   ```
   https://dashboard.mailerlite.com/subscribers/groups/123456789
   ```
3. **COPIA el número al final** (ese es el Group ID)

📝 **Anota aquí tu Group ID:**
```
MAILERLITE_GROUP_APPROVED = _____________________
```

**Los otros dos ya los tienes:**
```
MAILERLITE_GROUP_PENDING = 175223345689659296
MAILERLITE_GROUP_REJECTED = 178144659100403395
```

---

## PASO 3: Crear Template de Email #1 - "Solicitud Recibida"

### 4.1 Ir a Campaigns
```
Dashboard → Campaigns → Email campaigns
```

### 4.2 Crear Nueva Campaign
1. Click **"Create campaign"**
2. Selecciona **"Regular"** (no Newsletter)
3. Click **"Continue"**

### 4.3 Configurar Campaign
**Campaign name**: `Email 1 - Solicitud Recibida`

**Subject line**:
```
✅ Solicitud recibida - Portal Culture
```

**Preview text**:
```
Gracias por tu interés. Te contactaremos en 2-3 días.
```

**From name**: `Portal Culture` (o `Anxo`)

**From email**: Tu email verificado en Mailerlite

### 4.4 Diseñar Email

Click **"Design email"** → Selecciona **"Drag & Drop editor"**

**Contenido del email**:

```html
[LOGO O IMAGEN HEADER - opcional]

Hola {$name},

Gracias por tu interés en Portal Culture.

✅ Hemos recibido tu solicitud correctamente.

¿Qué sigue ahora?

1. Revisaremos tu cuestionario en los próximos 2-3 días
2. Te contactaremos por este email con nuestra decisión
3. Si entras, te enviaremos los pasos siguientes

Portal Culture no es para todos. Buscamos personas que:
• Estén 100% comprometidas con su crecimiento
• Quieran aportar valor a la comunidad
• Tomen acción, no solo consuman contenido

Mantente atento a tu email.

— Anxo
Portal Culture

───────────────────────────────

Portal Culture | Comunidad Exclusiva de Desarrollo Personal
```

### 4.5 NO enviar ahora
1. Click **"Continue"**
2. Click **"Save as draft"** (NO "Send now")
3. Este email lo usaremos en la automatización

---

## PASO 4: Crear Template de Email #2 - "¡Bienvenido!"

### 5.1 Repetir proceso
**Campaign name**: `Email 2 - Bienvenido Portal Culture`

**Subject line**:
```
🎉 ¡Bienvenido a Portal Culture!
```

**Preview text**:
```
Has sido aceptado. Aquí están tus próximos pasos.
```

### 5.2 Contenido del Email

```html
[LOGO O IMAGEN HEADER - opcional]

Hola {$name},

Buenas noticias: Has sido aceptado en Portal Culture. 🎉

¿Por qué te elegimos?

Vimos en tu solicitud algo que nos convenció. Tu compromiso, tu honestidad, y tu potencial para aportar a la comunidad.

Próximos pasos:

1. Crea tu cuenta aquí: https://app-portalculture.vercel.app/login

2. Una vez dentro, tendrás acceso a:
   • 5 Templos de conocimiento (Atenas, Ares, Apolo, Zeus, Adonis)
   • NOVA AI Coach personalizado
   • Discord exclusivo con la comunidad
   • Desafíos semanales

3. Únete al Discord: [Verás el link dentro del dashboard]

⚠️ Importante:

Este acceso es DE POR VIDA, pero conlleva responsabilidad:
• Aporta valor a la comunidad
• Participa activamente
• Aplica lo que aprendes

No queremos consumidores pasivos. Queremos creadores activos.

¿Listo para empezar?

Crea tu cuenta y nos vemos dentro.

— Anxo
Portal Culture

P.D: Si tienes alguna duda, responde a este email.

───────────────────────────────

Portal Culture | Comunidad Exclusiva de Desarrollo Personal
```

### 5.3 Guardar como Draft
Click **"Save as draft"**

---

## PASO 5: Crear Template de Email #3 - "Sobre tu solicitud"

### 6.1 Crear Campaign
**Campaign name**: `Email 3 - Solicitud Rechazada`

**Subject line**:
```
Sobre tu solicitud a Portal Culture
```

**Preview text**:
```
Gracias por tu interés. Aquí te explicamos nuestra decisión.
```

### 6.2 Contenido del Email

```html
[LOGO O IMAGEN HEADER - opcional]

Hola {$name},

Gracias por tu interés en Portal Culture.

Después de revisar tu solicitud, hemos decidido no aceptarte en este momento.

¿Por qué?

No es personal. Puede ser por varias razones:
• Las respuestas no mostraron suficiente compromiso
• Sentimos que aún no es el momento adecuado
• La comunidad está enfocada en perfiles diferentes

¿Puedo volver a aplicar?

Sí. Puedes intentarlo de nuevo en 3 meses.

En ese tiempo, te recomendamos:
• Trabaja en tu desarrollo personal por tu cuenta
• Define mejor tus objetivos
• Prepara una solicitud más sólida

Portal Culture no es para todos. Y eso está bien.

Cuando estés listo, vuelve a aplicar aquí:
https://app-portalculture.vercel.app

Te deseamos lo mejor en tu camino.

— Anxo
Portal Culture

P.D: No te rindas. A veces, un "no" ahora puede ser un "sí" después.

───────────────────────────────

Portal Culture | Comunidad Exclusiva de Desarrollo Personal
```

### 6.3 Guardar como Draft
Click **"Save as draft"**

---

## PASO 6: Crear Automatización #1 - "pending"

### 7.1 Ir a Automations
```
Dashboard → Automations
```

### 7.2 Crear Nueva Automation
1. Click **"Create automation"**
2. Selecciona **"Start from scratch"**
3. **Automation name**: `Auto 1 - Solicitud Recibida`

### 6.3 Configurar Trigger
1. En el canvas, click en **"Choose a trigger"**
2. Selecciona **"Joins a group"**
3. **Select group**: `pending` (ID: 175223345689659296)
4. Click **"Done"**

### 7.4 Añadir Acción: Enviar Email
1. Click en el **"+"** debajo del trigger
2. Selecciona **"Send email"**
3. **Email to send**: Selecciona `Email 1 - Solicitud Recibida` (el draft que creaste)
4. **Send immediately**: ✓ (activado)
5. Click **"Done"**

### 7.5 Activar Automation
1. En la esquina superior derecha, verás un switch **"Off"**
2. Click para cambiar a **"On"** (verde)
3. Confirma: **"Enable automation"**

✅ **Automation #1 completada!**

---

## PASO 7: Crear Automatización #2 - "approved"

### 8.1 Crear Nueva Automation
1. Click **"Create automation"**
2. **Start from scratch**
3. **Automation name**: `Auto 2 - Usuario Aprobado`

### 7.2 Configurar Trigger
1. **Trigger**: `Joins a group`
2. **Select group**: `approved` (tu grupo de aprobados)
3. Click **"Done"**

### 7.3 Añadir Acción #1: Remover de pending
1. Click **"+"**
2. Selecciona **"Remove from group"**
3. **Select group**: `pending` (ID: 175223345689659296)
4. Click **"Done"**

### 8.4 Añadir Acción #2: Enviar Email
1. Click **"+"** debajo de la acción anterior
2. Selecciona **"Send email"**
3. **Email to send**: `Email 2 - Bienvenido Portal Culture`
4. **Send immediately**: ✓
5. Click **"Done"**

### 8.5 Activar Automation
Switch **"On"** (verde)

✅ **Automation #2 completada!**

---

## PASO 8: Crear Automatización #3 - "rejected"

### 9.1 Crear Nueva Automation
1. Click **"Create automation"**
2. **Start from scratch**
3. **Automation name**: `Auto 3 - Usuario Rechazado`

### 8.2 Configurar Trigger
1. **Trigger**: `Joins a group`
2. **Select group**: `rejected` (ID: 178144659100403395)
3. Click **"Done"**

### 8.3 Añadir Acción #1: Remover de pending
1. Click **"+"**
2. **Action**: `Remove from group`
3. **Select group**: `pending` (ID: 175223345689659296)
4. Click **"Done"**

### 8.4 Añadir Acción #2: Enviar Email
1. Click **"+"**
2. **Action**: `Send email`
3. **Email to send**: `Email 3 - Solicitud Rechazada`
4. **Send immediately**: ✓
5. Click **"Done"**

**NOTA**: La auto-limpieza de rechazados (después de 24h) la harás tú después. Por ahora solo enviamos el email.

### 8.5 Activar Automation
Switch **"On"** (verde)

✅ **Automation #3 completada!**

---

## PASO 9: Añadir Variables de Entorno en Vercel

Ahora que tienes los Group IDs, añádelos a Vercel:

### 9.1 Ir a Vercel Dashboard
1. Ve a: https://vercel.com
2. Selecciona proyecto: `portalculture-app`
3. Ve a **Settings** → **Environment Variables**

### 9.2 Verificar/Actualizar Variables

Asegúrate de tener estas **3 variables**:

**Variable 1: (Ya existe - NO tocar)**
```
Name: MAILERLITE_GROUP_ID
Value: 175223345689659296
Environment: Production, Preview, Development
```
Este es el grupo "pending" donde se añaden al completar el cuestionario.

**Variable 2: (AÑADIR o VERIFICAR)**
```
Name: MAILERLITE_GROUP_APPROVED
Value: [El ID que copiaste en PASO 2.3 - tu grupo approved]
Environment: Production, Preview, Development
```

**Variable 3: (AÑADIR)**
```
Name: MAILERLITE_GROUP_REJECTED
Value: 178144659100403395
Environment: Production, Preview, Development
```

### 9.3 Redeploy
1. Ve a **Deployments** tab
2. Click en el último deployment
3. Click **"Redeploy"** (menú con 3 puntos)
4. Confirma

Espera 2-3 minutos a que termine el redeploy.

---

## ✅ VERIFICACIÓN: ¿Todo funcionando?

### Test 1: Email de Solicitud Recibida
1. Ve a: https://app-portalculture.vercel.app/cuestionario
2. Completa el cuestionario con un email de prueba
3. **Verifica**: ¿Recibiste el email "Solicitud recibida"?
4. ✅ Si lo recibes → Automation #1 funciona

### Test 2: Email de Aprobación
1. Ve a: https://app-portalculture.vercel.app/admin/waitlist
2. Encuentra tu solicitud de prueba
3. Click **"Aprobar"**
4. **Verifica**: ¿Recibiste el email "Bienvenido"?
5. ✅ Si lo recibes → Automation #2 funciona

### Test 3: Email de Rechazo
1. Crea otra solicitud de prueba
2. En admin panel, click **"Rechazar"**
3. **Verifica**: ¿Recibiste el email "Sobre tu solicitud"?
4. ✅ Si lo recibes → Automation #3 funciona

### Test 4: Auto-limpieza (LO HARÁS DESPUÉS)
La auto-limpieza de usuarios rechazados después de 24h la implementarás tú después manualmente o con otra automatización.

---

## 🎨 PERSONALIZACIÓN OPCIONAL

### Mejorar Diseño de Emails

En Mailerlite, puedes:
1. **Añadir logo**: Sube tu logo de Portal Culture
2. **Colores**: Usa amarillo/naranja para botones
3. **Imágenes**: Añade imágenes de los templos
4. **Botones CTA**: Hazlos grandes y llamativos

### Variables Personalizadas

En los emails puedes usar:
- `{$name}` - Nombre del usuario
- `{$email}` - Email del usuario
- Añade más en Mailerlite → Settings → Custom fields

---

## 🚨 PROBLEMAS COMUNES

### "No recibo el email de prueba"
1. Revisa carpeta de Spam
2. Verifica que la automation está **"On"** (verde)
3. Verifica el email en Mailerlite → Campaigns → Drafts
4. Asegúrate de que el usuario está en el grupo correcto

### "Error al aprobar en admin panel"
1. Verifica las variables de entorno en Vercel
2. Asegúrate de que NO hay espacios en los valores
3. Verifica que los Group IDs son correctos
4. Redeploy de Vercel si cambiaste algo

### "Usuario no se limpia después de 24h"
1. Verifica la Automation #3 tiene el paso "Wait 24 hours"
2. Verifica el último paso es "Remove from group"
3. Asegúrate de que la automation está activa

---

## 📊 RESUMEN FINAL

### Lo que has configurado:

✅ **3 Grupos en Mailerlite** (YA EXISTÍAN)
- pending (ID: 175223345689659296)
- approved (tu grupo)
- rejected (ID: 178144659100403395)

✅ **3 Templates de Email**
- Email 1: Solicitud recibida
- Email 2: Bienvenido
- Email 3: Rechazado

✅ **3 Automatizaciones**
- Auto 1: Usuario se une a "pending" → Envía Email 1 (Solicitud recibida)
- Auto 2: Usuario se mueve a "approved" → Remove de pending + Envía Email 2 (Bienvenido)
- Auto 3: Usuario se mueve a "rejected" → Remove de pending + Envía Email 3 (Rechazado)

✅ **3 Variables en Vercel**
- MAILERLITE_GROUP_ID (pending: 175223345689659296)
- MAILERLITE_GROUP_APPROVED (tu ID)
- MAILERLITE_GROUP_REJECTED (178144659100403395)

---

## 🎯 PRÓXIMOS PASOS

1. **Implementar API routes** (opcional - ver `SISTEMA_EMAILS_MAILERLITE.md`)
   - `/api/admin/approve-user`
   - `/api/admin/reject-user`

2. **Personalizar emails** con tu branding

3. **Monitorear** las automatizaciones durante la primera semana

4. **Ajustar** textos según feedback de usuarios

---

## 💡 TIPS PRO

### Email Marketing Best Practices
- **Subject lines cortos**: 30-50 caracteres
- **Preview text atractivo**: Complementa el subject
- **CTA claro**: Un solo botón principal
- **Mobile-first**: 60% de emails se leen en móvil
- **Test antes de activar**: Envíate pruebas a ti mismo

### Monitoreo
En Mailerlite → Reports verás:
- Open rate (tasa de apertura)
- Click rate (tasa de clicks)
- Unsubscribe rate

**Objetivo**: >30% open rate, >5% click rate

---

## ✅ CHECKLIST FINAL

Marca lo que ya completaste:

- [ ] Verificar que tienes los 3 grupos (pending, approved, rejected)
- [ ] Copiar el Group ID de "approved"
- [ ] Crear Email 1 - Solicitud Recibida
- [ ] Crear Email 2 - Bienvenido
- [ ] Crear Email 3 - Rechazado
- [ ] Crear Automation 1 (pending → email)
- [ ] Crear Automation 2 (approved → remove + email)
- [ ] Crear Automation 3 (rejected → remove + email + wait + remove)
- [ ] Añadir variables en Vercel
- [ ] Redeploy Vercel
- [ ] Test completo con email de prueba
- [ ] Personalizar diseño de emails (opcional)

---

**¡Listo para escalar!** 🚀

Si tienes alguna duda durante la configuración, revisa las secciones correspondientes o consulta la documentación de Mailerlite: https://www.mailerlite.com/help

---

**Última actualización**: 30 Enero 2026  
**Tiempo de setup**: 15-20 minutos  
**Dificultad**: ⭐⭐ (Fácil con esta guía)
