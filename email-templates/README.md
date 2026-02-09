# 📧 Email Templates para Supabase - Portal Culture

Templates premium en español para autenticación de usuarios.

---

## 📋 Templates Incluidos

1. **confirm-signup.html** - Confirmación de registro
2. **reset-password.html** - Restablecer contraseña
3. **password-changed.html** - Notificación de cambio de contraseña

---

## 🚀 Cómo Configurar en Supabase

### 1. Ve a Supabase Dashboard
https://supabase.com/dashboard/project/dzbmnumpzdhydfkjmlif/auth/templates

### 2. Configura cada template

#### **Confirm Signup (Verificación de email)**

**Subject:** `Confirma tu cuenta en Portal Culture`

**Body:** Copia y pega el contenido de `confirm-signup.html`

**Variables disponibles:**
- `{{ .ConfirmationURL }}` - URL de confirmación

---

#### **Reset Password (Restablecer contraseña)**

**Subject:** `Restablece tu contraseña - Portal Culture`

**Body:** Copia y pega el contenido de `reset-password.html`

**Variables disponibles:**
- `{{ .ConfirmationURL }}` - URL de reset

---

#### **Password Changed (Confirmación de cambio)**

Este template requiere configuración adicional ya que no es nativo de Supabase.

**Alternativa:** Usar un trigger de base de datos o webhook para enviarlo manualmente cuando cambie la contraseña.

---

## 🎨 Características del Diseño

### Visual
- ✅ Fondo oscuro premium (negro #000000)
- ✅ Glassmorphism sutil
- ✅ Gradientes de color temáticos:
  - Azul (Confirm signup)
  - Violeta (Reset password)
  - Verde (Password changed)
- ✅ Bordes con glow sutil
- ✅ Responsive (mobile-friendly)

### UX
- ✅ CTA buttons grandes y visibles
- ✅ Texto claro en español
- ✅ URL de fallback (copy-paste)
- ✅ Warnings de seguridad
- ✅ Footer con branding

---

## 🔧 Personalización

### Cambiar colores de acento

Busca y reemplaza estos valores:

**Azul (Confirm):**
- `rgba(59,130,246,0.XX)` → Tu color

**Violeta (Reset):**
- `rgba(139,92,246,0.XX)` → Tu color

**Verde (Success):**
- `rgba(16,185,129,0.XX)` → Tu color

**Rojo (Warning):**
- `rgba(239,68,68,0.XX)` → Tu color

### Cambiar textos

Edita directamente el HTML. Los textos principales están en:
- `<h1>` - Títulos
- `<p>` - Párrafos
- `<strong>` - Textos destacados

---

## 📱 Testing

### 1. Test en navegador
Abre el HTML en Chrome/Safari para ver preview.

### 2. Test en Supabase
Ve a **Authentication → Users** → Click en usuario → **Send Magic Link** (o trigger el evento)

### 3. Test en email clients
- Gmail (web + app)
- Outlook
- Apple Mail
- Mobile (iOS/Android)

---

## ⚠️ Notas Importantes

### Variables de Supabase
**Solo funciona en Supabase:**
- `{{ .ConfirmationURL }}`
- `{{ .Token }}`
- `{{ .Email }}`

**No usar fuera de Supabase** (no renderizarán).

### Compatibilidad
Estos templates usan **table-based layout** (estándar de email) para máxima compatibilidad con:
- Gmail
- Outlook
- Apple Mail
- Yahoo
- Clientes móviles

### Performance
- Sin imágenes externas (todo inline)
- Sin JavaScript
- CSS inline (máxima compatibilidad)

---

## 🎯 Mejoras Futuras (Opcional)

- [ ] Magic Link template
- [ ] Invite User template
- [ ] Welcome email (onboarding)
- [ ] Weekly digest template
- [ ] Announcement template

---

## 📞 Soporte

Si necesitas ayuda configurando:
- Revisa docs de Supabase: https://supabase.com/docs/guides/auth/auth-email-templates
- Contacto: hola@portalculture.com

---

**Creado para Portal Culture**  
Versión: 1.0  
Fecha: Febrero 2026
