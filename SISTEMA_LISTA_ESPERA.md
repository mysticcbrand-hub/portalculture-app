# 🎯 Sistema de Lista de Espera + Aprobación - Portal Culture

## 📋 Flujo Completo:

```
Usuario → Typeform → Webhook → Supabase → [Pending]
                                    ↓
                          Tú apruebas manualmente
                                    ↓
                            [Status: Approved]
                                    ↓
                        Mailerlite envía email
                                    ↓
                      Usuario recibe link de acceso
```

---

## 🗄️ **1. Base de Datos en Supabase**

### Crear tabla `waitlist`:

```sql
CREATE TABLE waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  typeform_response_id TEXT UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  approved_by UUID REFERENCES auth.users(id),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index para búsquedas rápidas
CREATE INDEX idx_waitlist_email ON waitlist(email);
CREATE INDEX idx_waitlist_status ON waitlist(status);

-- Row Level Security
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden ver/editar
CREATE POLICY "Admins can view all waitlist"
  ON waitlist FOR SELECT
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE email = 'mysticcbrand@gmail.com'
  ));

CREATE POLICY "Admins can update waitlist"
  ON waitlist FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE email = 'mysticcbrand@gmail.com'
  ));
```

---

## 🔗 **2. Webhook de Typeform**

### A. Crear el endpoint en tu app:

Archivo: `app/api/typeform-webhook/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Clave secreta
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Extraer datos de Typeform
    const formResponse = body.form_response
    const answers = formResponse.answers
    
    // Mapear respuestas (ajusta según tus campos)
    const email = answers.find((a: any) => a.type === 'email')?.email
    const name = answers.find((a: any) => a.field.id === 'name')?.text
    
    // Guardar en Supabase
    const { data, error } = await supabase
      .from('waitlist')
      .insert({
        email,
        name,
        typeform_response_id: formResponse.response_id,
        status: 'pending',
        metadata: formResponse
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error saving to waitlist:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ success: true, data })
    
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

### B. Configurar webhook en Typeform:

1. Ve a tu Typeform → Connect → Webhooks
2. URL: `https://app-portalculture.vercel.app/api/typeform-webhook`
3. Activa: "Send me responses"
4. Guarda

---

## 📧 **3. Integración con Mailerlite**

### A. Obtener API Key:

1. Ve a: https://dashboard.mailerlite.com/integrations/api
2. Copia tu API Key

### B. Agregar a .env.local:

```env
MAILERLITE_API_KEY=tu_api_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

### C. Crear función para enviar email:

Archivo: `app/lib/mailerlite.ts`

```typescript
export async function addToMailerlite(email: string, name: string, status: string) {
  const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}`,
    },
    body: JSON.stringify({
      email,
      fields: {
        name,
        status,
      },
      groups: [status === 'approved' ? 'approved_group_id' : 'waitlist_group_id'],
    }),
  })
  
  return response.json()
}
```

---

## 👨‍💼 **4. Panel de Admin para Aprobar Usuarios**

### Crear página: `app/admin/waitlist/page.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminWaitlist() {
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadPending()
  }, [])
  
  const loadPending = async () => {
    const { data } = await supabase
      .from('waitlist')
      .select('*')
      .eq('status', 'pending')
      .order('submitted_at', { ascending: false })
    
    setPending(data || [])
    setLoading(false)
  }
  
  const approveUser = async (id: string, email: string, name: string) => {
    // 1. Actualizar en Supabase
    await supabase
      .from('waitlist')
      .update({ 
        status: 'approved',
        approved_at: new Date().toISOString()
      })
      .eq('id', id)
    
    // 2. Enviar a Mailerlite
    await fetch('/api/approve-user', {
      method: 'POST',
      body: JSON.stringify({ email, name })
    })
    
    // 3. Recargar lista
    loadPending()
  }
  
  return (
    <div className="min-h-screen bg-black p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Lista de Espera</h1>
      
      <div className="space-y-4">
        {pending.map((user: any) => (
          <div key={user.id} className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-white font-semibold">{user.name}</h3>
                <p className="text-white/60">{user.email}</p>
                <p className="text-white/40 text-sm">{new Date(user.submitted_at).toLocaleString()}</p>
              </div>
              
              <button
                onClick={() => approveUser(user.id, user.email, user.name)}
                className="px-6 py-3 bg-green-500/20 border border-green-500/40 rounded-lg
                         text-green-400 hover:bg-green-500/30 transition"
              >
                Aprobar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 🚀 **5. Endpoint de Aprobación**

Archivo: `app/api/approve-user/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { addToMailerlite } from '../../lib/mailerlite'

export async function POST(request: Request) {
  const { email, name } = await request.json()
  
  try {
    // Agregar a Mailerlite con status approved
    await addToMailerlite(email, name, 'approved')
    
    // Mailerlite automáticamente enviará el email según la automatización
    // que configures en su dashboard
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 })
  }
}
```

---

## 📝 **Checklist de Implementación:**

- [ ] Crear tabla `waitlist` en Supabase
- [ ] Obtener Service Role Key de Supabase
- [ ] Crear webhook endpoint `/api/typeform-webhook`
- [ ] Configurar webhook en Typeform
- [ ] Obtener API Key de Mailerlite
- [ ] Crear grupos en Mailerlite (pending, approved)
- [ ] Configurar automatización de email en Mailerlite
- [ ] Crear página admin `/admin/waitlist`
- [ ] Crear endpoint `/api/approve-user`
- [ ] Proteger rutas de admin con RLS

---

## 🎨 **Email de Bienvenida en Mailerlite:**

1. Ve a Mailerlite → Automation
2. Crea workflow: "Cuando usuario es añadido al grupo 'approved'"
3. Acción: Enviar email con:
   - Link de acceso a la app
   - Link al Discord vía Whop
   - Instrucciones de bienvenida

---

¿Quieres que implemente todo esto ahora? 🚀
