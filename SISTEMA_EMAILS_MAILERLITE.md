# 📧 Sistema de Emails - Portal Culture

## 🎯 Estrategia de Grupos en Mailerlite

### Grupos Necesarios

1. **`waitlist_pending`** (ID: 175223345689659296) - Ya existe
   - Usuario completa cuestionario
   - Estado: Pendiente de revisión
   - **Automatización**: Email de confirmación inmediato

2. **`waitlist_approved`** (NUEVO - Crear en Mailerlite)
   - Admin aprueba usuario
   - Estado: Aprobado
   - **Automatización**: Email de bienvenida con instrucciones

3. **`waitlist_rejected`** (NUEVO - Crear en Mailerlite)
   - Admin rechaza usuario
   - Estado: Rechazado
   - **Automatización**: Email de rechazo + cuándo puede volver a aplicar

---

## 🔄 Flow Completo del Sistema

### 1. Usuario Completa Cuestionario
```
Usuario → Completa cuestionario → API guarda en DB
↓
Mailerlite: Añade a grupo "waitlist_pending"
↓
Email automático: "Solicitud recibida"
```

### 2. Admin Aprueba
```
Admin → Click "Aprobar" en /admin/waitlist
↓
API actualiza status a "approved" en DB
↓
API mueve de "waitlist_pending" a "waitlist_approved"
↓
Email automático: "¡Has sido aceptado!"
```

### 3. Admin Rechaza
```
Admin → Click "Rechazar" en /admin/waitlist
↓
API actualiza status a "rejected" en DB
↓
API mueve de "waitlist_pending" a "waitlist_rejected"
↓
Email automático: "Lamentamos informarte..."
↓
IMPORTANTE: Usuario se quita automáticamente del grupo después de 24h
```

---

## 📝 Templates de Emails

### Email 1: Solicitud Recibida (Automático al completar cuestionario)

**Asunto**: ✅ Solicitud recibida - Portal Culture

**Contenido**:
```
Hola {name},

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
```

---

### Email 2: Aprobado ✅ (Cuando admin aprueba)

**Asunto**: 🎉 ¡Bienvenido a Portal Culture!

**Contenido**:
```
Hola {name},

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

3. Únete al Discord: [Link dentro del dashboard]

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
```

---

### Email 3: Rechazado ❌ (Cuando admin rechaza)

**Asunto**: Sobre tu solicitud a Portal Culture

**Contenido**:
```
Hola {name},

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
```

---

## 🛠️ Implementación Técnica

### Paso 1: Crear Grupos en Mailerlite

1. Ir a https://dashboard.mailerlite.com
2. Ir a "Subscribers" → "Groups"
3. Crear 2 grupos nuevos:
   - `waitlist_approved`
   - `waitlist_rejected`
4. Copiar los IDs de los grupos

### Paso 2: Configurar Automatizaciones

Para cada grupo, crear una **Automation**:

#### Automation 1: "waitlist_pending"
```
Trigger: Subscriber joins group "waitlist_pending"
↓
Action: Send email "Solicitud recibida"
```

#### Automation 2: "waitlist_approved"
```
Trigger: Subscriber joins group "waitlist_approved"
↓
Action 1: Remove from group "waitlist_pending"
↓
Action 2: Send email "Bienvenido a Portal Culture"
```

#### Automation 3: "waitlist_rejected"
```
Trigger: Subscriber joins group "waitlist_rejected"
↓
Action 1: Remove from group "waitlist_pending"
↓
Action 2: Send email "Sobre tu solicitud"
↓
Action 3: Wait 24 hours
↓
Action 4: Remove from group "waitlist_rejected"
```

**Nota**: El paso 4 limpia automáticamente el grupo para no tener usuarios rechazados acumulados.

---

## 💻 Código Backend Necesario

### Actualizar `.env.local`

Añadir las nuevas variables:
```bash
MAILERLITE_GROUP_PENDING=175223345689659296
MAILERLITE_GROUP_APPROVED=<ID_del_grupo_approved>
MAILERLITE_GROUP_REJECTED=<ID_del_grupo_rejected>
```

### Crear API Route para Aprobar

**Archivo**: `app/api/admin/approve-user/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()
    
    const supabase = createClient()
    
    // Verificar que quien hace el request es admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== 'mysticcbrand@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    // Obtener datos del usuario
    const { data: waitlistUser } = await supabase
      .from('waitlist')
      .select('email, name')
      .eq('id', userId)
      .single()
    
    if (!waitlistUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // 1. Actualizar status en DB
    await supabase
      .from('waitlist')
      .update({ 
        status: 'approved',
        approved_at: new Date().toISOString()
      })
      .eq('id', userId)
    
    // 2. Mover a grupo "approved" en Mailerlite
    const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY
    const GROUP_APPROVED = process.env.MAILERLITE_GROUP_APPROVED
    
    await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
      },
      body: JSON.stringify({
        email: waitlistUser.email,
        fields: { name: waitlistUser.name },
        groups: [GROUP_APPROVED]
      })
    })
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error approving user:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

### Crear API Route para Rechazar

**Archivo**: `app/api/admin/reject-user/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  try {
    const { userId, reason } = await request.json()
    
    const supabase = createClient()
    
    // Verificar admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== 'mysticcbrand@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    // Obtener datos del usuario
    const { data: waitlistUser } = await supabase
      .from('waitlist')
      .select('email, name')
      .eq('id', userId)
      .single()
    
    if (!waitlistUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // 1. Actualizar status en DB
    await supabase
      .from('waitlist')
      .update({ 
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejection_reason: reason || 'No especificado'
      })
      .eq('id', userId)
    
    // 2. Mover a grupo "rejected" en Mailerlite
    const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY
    const GROUP_REJECTED = process.env.MAILERLITE_GROUP_REJECTED
    
    await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
      },
      body: JSON.stringify({
        email: waitlistUser.email,
        fields: { name: waitlistUser.name },
        groups: [GROUP_REJECTED]
      })
    })
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error rejecting user:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

---

## 📊 Actualización de la Tabla Waitlist

Añadir nuevas columnas a la tabla `waitlist`:

```sql
ALTER TABLE waitlist 
ADD COLUMN rejected_at TIMESTAMP,
ADD COLUMN rejection_reason TEXT;
```

---

## 🎨 Actualizar Admin Panel

En `/admin/waitlist/page.tsx`, añadir botones:

```typescript
// Aprobar usuario
const handleApprove = async (userId: string) => {
  const response = await fetch('/api/admin/approve-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  })
  
  if (response.ok) {
    alert('Usuario aprobado. Email enviado automáticamente.')
    refetch()
  }
}

// Rechazar usuario
const handleReject = async (userId: string) => {
  const reason = prompt('Razón del rechazo (opcional):')
  
  const response = await fetch('/api/admin/reject-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, reason })
  })
  
  if (response.ok) {
    alert('Usuario rechazado. Email enviado automáticamente.')
    refetch()
  }
}
```

---

## ✅ Checklist de Implementación

### En Mailerlite (Dashboard)
- [ ] Crear grupo `waitlist_approved`
- [ ] Crear grupo `waitlist_rejected`
- [ ] Copiar IDs de ambos grupos
- [ ] Crear automatización para "waitlist_pending" (Email 1)
- [ ] Crear automatización para "waitlist_approved" (Email 2)
- [ ] Crear automatización para "waitlist_rejected" (Email 3)
- [ ] Testear cada automatización con email de prueba

### En el Código
- [ ] Añadir variables de entorno (GROUP_APPROVED, GROUP_REJECTED)
- [ ] Crear `app/api/admin/approve-user/route.ts`
- [ ] Crear `app/api/admin/reject-user/route.ts`
- [ ] Actualizar tabla waitlist (rejected_at, rejection_reason)
- [ ] Actualizar admin panel con botones de aprobar/rechazar
- [ ] Testear flujo completo en local
- [ ] Deploy a producción

### Testing
- [ ] Crear usuario de prueba
- [ ] Completar cuestionario
- [ ] Verificar email "Solicitud recibida"
- [ ] Aprobar desde admin panel
- [ ] Verificar email "Bienvenido"
- [ ] Verificar que usuario puede crear cuenta
- [ ] Crear otro usuario de prueba
- [ ] Rechazar desde admin panel
- [ ] Verificar email "Rechazado"
- [ ] Verificar que usuario se limpia después de 24h

---

## 🚨 Importante

### Auto-limpieza de Rechazados

La automatización en Mailerlite que elimina usuarios rechazados después de 24h es **crucial** para:
1. **Privacidad**: No almacenar usuarios que no entraron
2. **Clean data**: Mantener listas limpias
3. **Compliance**: GDPR-friendly

Si el usuario quiere volver a aplicar en 3 meses, será un "nuevo" subscriber en Mailerlite.

---

## 💡 Extras Opcionales

### Email de Recordatorio (Para Pending)

Si un usuario está en "pending" más de 7 días:
```
Trigger: Subscriber in group "waitlist_pending" for 7 days
↓
Action: Send email "Aún estamos revisando tu solicitud"
```

### Segmentación Adicional

Puedes crear campos custom en Mailerlite:
- `application_score` (0-100)
- `commitment_level` (low/medium/high)
- `areas_expertise` (gym, finanzas, salud, etc.)

Esto permite enviar emails más personalizados.

---

**Última actualización**: 30 Enero 2026
**Responsable**: Portal Culture Team

¡Sistema de emails profesional listo para escalar! 🚀
