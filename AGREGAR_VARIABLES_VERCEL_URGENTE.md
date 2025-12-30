# 🚨 ERROR: Variables de Entorno Faltantes en Vercel

## ❌ **Problema:**
```
Error: supabaseKey is required
```

**Causa:** Las nuevas variables NO están en Vercel.

---

## ✅ **SOLUCIÓN INMEDIATA (5 minutos):**

### **Paso 1: Ve a Vercel Settings**
https://vercel.com/mysticcbrand-hub/portalculture-app/settings/environment-variables

### **Paso 2: Agrega estas 3 variables**

#### **Variable 1:**
- **Name**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: 
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6Ym1udW1wemRoeWRma2ptbGlmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzAzMTcyNywiZXhwIjoyMDgyNjA3NzI3fQ.Lv3wVY7z2PWfZ_-4b5IW-OJrPqFvNQgnf7xiYqbN9dw
```
- **Environment**: Production, Preview, Development (marca las 3)

#### **Variable 2:**
- **Name**: `MAILERLITE_API_KEY`
- **Value**:
```
eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI0IiwianRpIjoiMDg0OTA2OTY5MTJmZDQwNzQxODg0NmIzZWY2MDVmMjQxNmI2NDYzOTBlYjJjYTc2YzI5N2ExYTRkMGZmMDFiZDM3NjBlYTQ3M2UzZjY4ODciLCJpYXQiOjE3NjY1OTgxNTEuMTU1ODI4LCJuYmYiOjE3NjY1OTgxNTEuMTU1ODMsImV4cCI6NDkyMjI3MTc1MS4xNTA3NTIsInN1YiI6IjIwMTg1OTMiLCJzY29wZXMiOltdfQ.jXoDN8rVmzJ3__BHbZ-yYT4cFuGlYbRQw9-CsxgafBJR5-uTRkXzejCm_Ju0LmbgT093_-6_NIf53BKTvlQwl46TWbdGAnOY6jJe-IC3Hv5PnEy8xXRHsF3WUXE8znM3Xuvi4cC_QgR4u1ns777WDnchfZ2Qb-ZFmkkX4wLIkWS5TXci_2JWdGtzFVgeiPl2Q0alxODl6N__jg8X5Q31NjxI1Mwzp99JEo2OtV6ZjomGQgysi_ItjvaaIQbVEVcskuzxPA_TnYqnV4V2S2mTLH01qrNJOizEfaQHuqwZnxHSyv3HijDTRMTR0HC6Ud0OjWCvUolJ_gqWucTTqUbV6oTXVM-nx47BJ9gyq9_mbh9vjQrDs_6w_iD5movrV7j3nmUoq1T5M-RSsOpPGFOMg5BG-13MtGox5oGTVuuXa9mOn5r1hDZuZa1gndkfAiXVLGJNQHQ7rYBoSbV4WRmrCh98H8WYSoVUEkPkvz17DKEzoti-uSBf8zj50fxL8tL9N2H6tIUG_5-dYAydIF82WYz3cBaIcUbv15sh63uMFE60OJjCLJQHSRKqdxouXBuqk5Xo27Ujyl-tpgGbzkQ3KyBIEVuZwWRZ0eHcgZRywI8PWsJJNMoHOg7H2ZXatmpSfCNW23NrHK_8Uq34sUJyeg4Hpvupd3Aw0HA_gvoZNOY
```
- **Environment**: Production, Preview, Development (marca las 3)

#### **Variable 3:**
- **Name**: `MAILERLITE_GROUP_ID`
- **Value**: `175223345689659296`
- **Environment**: Production, Preview, Development (marca las 3)

### **Paso 3: Guarda**
Click en "Save" o "Add" para cada variable

### **Paso 4: REDEPLOY (CRÍTICO)**
1. Ve a: https://vercel.com/mysticcbrand-hub/portalculture-app
2. Click en el último deployment
3. Click en los 3 puntitos (...)
4. Click "Redeploy"
5. Marca "Use existing Build Cache" si aparece
6. Click "Redeploy"

---

## ⏱️ **Espera 2-3 minutos**

El nuevo deploy debería:
- ✅ Compilar sin errores
- ✅ Tener acceso a las variables
- ✅ Webhook funcional
- ✅ Admin panel funcional

---

## 🧪 **Verifica que funcionó:**

Después del redeploy:

1. Ve a: https://app-portalculture.vercel.app/api/typeform-webhook
2. Deberías ver: `{"status":"ok","message":"Typeform webhook endpoint ready"}`
3. ✅ Si lo ves = Variables cargadas correctamente

---

## ⚠️ **IMPORTANTE:**

**NO olvides hacer REDEPLOY** después de agregar las variables.
Las variables solo se cargan en el siguiente deploy.

---

¡Hazlo ahora y en 5 minutos estará funcionando! 🚀
