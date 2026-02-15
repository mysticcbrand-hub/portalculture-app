'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

// Types
interface FormData {
  nombre: string
  email: string
  codigoPais: string
  telefono: string
  edad: string
  vidaActual: number
  descripcion: string
  frenos: string[]
  intentosCambio: string // NUEVA: ¿Qué has intentado cambiar?
  horasSemanales: number // NUEVA: Horas a la semana
  aportacion: string // NUEVA: ¿Qué vas a aportar?
  porqueEntrar: string
}

// Country codes with flags and phone format patterns
const countryCodes = [
  { code: '+34', country: 'ES', flag: '🇪🇸', format: 'XXX XX XX XX', maxLength: 9 },
  { code: '+1', country: 'US', flag: '🇺🇸', format: '(XXX) XXX-XXXX', maxLength: 10 },
  { code: '+52', country: 'MX', flag: '🇲🇽', format: 'XX XXXX XXXX', maxLength: 10 },
  { code: '+54', country: 'AR', flag: '🇦🇷', format: 'XX XXXX-XXXX', maxLength: 10 },
  { code: '+57', country: 'CO', flag: '🇨🇴', format: 'XXX XXX XXXX', maxLength: 10 },
  { code: '+56', country: 'CL', flag: '🇨🇱', format: 'X XXXX XXXX', maxLength: 9 },
  { code: '+51', country: 'PE', flag: '🇵🇪', format: 'XXX XXX XXX', maxLength: 9 },
  { code: '+58', country: 'VE', flag: '🇻🇪', format: 'XXX-XXX-XXXX', maxLength: 10 },
  { code: '+593', country: 'EC', flag: '🇪🇨', format: 'XX XXX XXXX', maxLength: 9 },
  { code: '+44', country: 'UK', flag: '🇬🇧', format: 'XXXX XXXXXX', maxLength: 10 },
  { code: '+33', country: 'FR', flag: '🇫🇷', format: 'X XX XX XX XX', maxLength: 9 },
  { code: '+49', country: 'DE', flag: '🇩🇪', format: 'XXXX XXXXXXX', maxLength: 11 },
  { code: '+39', country: 'IT', flag: '🇮🇹', format: 'XXX XXX XXXX', maxLength: 10 },
  { code: '+351', country: 'PT', flag: '🇵🇹', format: 'XXX XXX XXX', maxLength: 9 },
  { code: '+55', country: 'BR', flag: '🇧🇷', format: '(XX) XXXXX-XXXX', maxLength: 11 },
]

// Format phone number based on country pattern
const formatPhoneNumber = (value: string, countryCode: string): string => {
  // Remove all non-numeric characters
  const numbers = value.replace(/\D/g, '')
  
  // Find the country format
  const country = countryCodes.find(c => c.code === countryCode)
  if (!country) return numbers
  
  const format = country.format
  let result = ''
  let numberIndex = 0
  
  // Apply the format pattern
  for (let i = 0; i < format.length && numberIndex < numbers.length; i++) {
    if (format[i] === 'X') {
      result += numbers[numberIndex]
      numberIndex++
    } else {
      // Add the separator (space, dash, parenthesis, etc.)
      result += format[i]
      // Check if we need to skip to next X
      if (format[i + 1] !== 'X' && format[i + 1] !== undefined) {
        continue
      }
    }
  }
  
  return result
}

// Get raw phone number without formatting
const getRawPhoneNumber = (formatted: string): string => {
  return formatted.replace(/\D/g, '')
}

// Get placeholder based on country format
const getPhonePlaceholder = (countryCode: string): string => {
  const country = countryCodes.find(c => c.code === countryCode)
  return country?.format.replace(/X/g, '0') || '600 000 000'
}

// Age options for dropdown
// Generate age emojis based on ranges
const getAgeEmoji = (age: number): string => {
  if (age <= 14) return '🎮'
  if (age <= 17) return '📚'
  if (age <= 21) return '🎓'
  if (age <= 25) return '💼'
  if (age <= 30) return '🚀'
  if (age <= 35) return '⚡'
  if (age <= 40) return '🎯'
  if (age <= 45) return '💪'
  return '🏆'
}

// Description options
const descripcionOptions = [
  { id: 'A', text: 'Acabo de empezar en el desarrollo personal' },
  { id: 'B', text: 'He intentado cambiar pero no lo consigo' },
  { id: 'C', text: 'Ya llevo tiempo, y quiero rodearme de gente con mi mentalidad' },
]

// Frenos options
const frenosOptions = [
  { id: 'A', text: 'No soy consistente' },
  { id: 'B', text: 'Tengo mala salud mental' },
  { id: 'C', text: 'No me gusta mi físico' },
  { id: 'D', text: 'No encuentro gente con mi mindset' },
  { id: 'E', text: 'No sé por dónde empezar' },
]

export default function Cuestionario() {
  const router = useRouter()
  const supabase = createClient()
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    email: '',
    codigoPais: '+34',
    telefono: '',
    edad: '25', // Initialize with default age
    vidaActual: 5,
    descripcion: '',
    frenos: [],
    intentosCambio: '', // NUEVA
    horasSemanales: 5, // NUEVA - Default 5 horas
    aportacion: '', // NUEVA
    porqueEntrar: '',
  })
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [ageValue, setAgeValue] = useState<number>(25) // Default to 25
  const [showNotification, setShowNotification] = useState(true) // NUEVA: Notificación Apple

  const totalSteps = 9 // Aumentado de 6 a 9

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(false)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  // Check if user is authenticated and their status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          // Not logged in - redirect to login
          router.replace('/')
          return
        }

        // Check user's access status
        const { data: profiles } = await supabase
          .from('profiles')
          .select('access_status')
          .eq('id', user.id)
          .limit(1)

        const status = profiles?.[0]?.access_status

        if (status === 'approved' || status === 'paid') {
          // Already has access - go to dashboard
          router.replace('/dashboard')
          return
        } else if (status === 'pending') {
          // Already submitted - go to pending page
          router.replace('/pendiente-aprobacion')
          return
        }
        
        // Status is 'none' or null - can fill questionnaire
        setCheckingAuth(false)
      } catch (error) {
        console.error('Auth check error:', error)
        setCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router, supabase])

  // Handle input changes
  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle frenos toggle (max 2)
  const toggleFreno = (id: string) => {
    setFormData(prev => {
      const current = prev.frenos
      if (current.includes(id)) {
        return { ...prev, frenos: current.filter(f => f !== id) }
      }
      if (current.length >= 2) {
        return prev // Max 2 selected
      }
      return { ...prev, frenos: [...current, id] }
    })
  }

  // Validation per step
  const canProceed = () => {
    switch (step) {
      case 1:
        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
        const rawPhone = getRawPhoneNumber(formData.telefono)
        const country = countryCodes.find(c => c.code === formData.codigoPais)
        const requiredPhoneLength = country ? country.maxLength : 9
        return formData.nombre.trim() && emailValid && rawPhone.length === requiredPhoneLength
      case 2:
        return formData.edad !== ''
      case 3:
        return true // Slider always has value
      case 4:
        return formData.descripcion !== ''
      case 5:
        return formData.intentosCambio.trim().length >= 20 // NUEVA validación
      case 6:
        return formData.frenos.length > 0
      case 7:
        return true // Slider always has value (horasSemanales)
      case 8:
        return formData.aportacion.trim().length >= 20 // NUEVA validación
      case 9:
        return formData.porqueEntrar.trim().length >= 50 // ACTUALIZADA (era 20, ahora 50)
      default:
        return false
    }
  }

  // Format phone number with country code (sends raw number)
  const getFullPhone = () => {
    const rawPhone = getRawPhoneNumber(formData.telefono)
    return `${formData.codigoPais} ${rawPhone}`
  }

  // Submit form
  const handleSubmit = async () => {
    if (!canProceed()) return
    
    setIsSubmitting(true)
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/')
        return
      }

      // Submit to waitlist API
      const response = await fetch('/api/waitlist/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          name: formData.nombre,
          email: user.email, // Use auth email
          phone: getFullPhone(),
          metadata: {
            edad: formData.edad,
            vidaActual: formData.vidaActual,
            descripcion: formData.descripcion,
            frenos: formData.frenos,
            intentosCambio: formData.intentosCambio, // NUEVA
            horasSemanales: formData.horasSemanales, // NUEVA
            aportacion: formData.aportacion, // NUEVA
            porqueEntrar: formData.porqueEntrar,
          }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Error al enviar')
      }

      // Update user's profile to pending
      await supabase
        .from('profiles')
        .update({ 
          access_status: 'pending',
          full_name: formData.nombre
        })
        .eq('id', user.id)

      setIsComplete(true)

      // Don't auto-redirect, user clicks button to Notion
      // setTimeout removed
    } catch (error: any) {
      console.error('Submit error:', error)
      alert(error.message || 'Error al enviar. Intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Next step
  const nextStep = () => {
    if (step === totalSteps) {
      handleSubmit()
    } else if (canProceed()) {
      setStep(prev => prev + 1)
    }
  }

  // Previous step
  const prevStep = () => {
    if (step > 1) {
      setStep(prev => prev - 1)
    }
  }

  // Loading screen while checking auth
  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-white/50 text-sm">Verificando...</p>
        </div>
      </main>
    )
  }

  // Completion screen - Face ID Style
  if (isComplete) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
        {/* Subtle gradient background (no banding) */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 via-black to-cyan-950/15" />
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            opacity: 0.015,
          }} />
        </div>

        <div className="max-w-md mx-auto text-center space-y-8">
          {/* Face ID Animation */}
          <div className="w-32 h-32 mx-auto mb-6 relative">
            {/* Outer pulsing rings */}
            <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping" style={{ animationDuration: '2s' }} />
            <div className="absolute inset-4 rounded-full border-2 border-emerald-500/30 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.3s' }} />
            
            {/* Checkmark circle */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 backdrop-blur-xl border border-white/10 flex items-center justify-center">
              <svg 
                className="w-16 h-16 text-emerald-400"
                viewBox="0 0 52 52"
                style={{ animation: 'scaleIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
              >
                <circle 
                  cx="26" cy="26" r="24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  style={{
                    strokeDasharray: 166,
                    strokeDashoffset: 166,
                    animation: 'drawCircle 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards'
                  }}
                />
                <path 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="3"
                  strokeLinecap="round"
                  d="M14 27l7 7 16-16"
                  style={{
                    strokeDasharray: 48,
                    strokeDashoffset: 48,
                    animation: 'drawCheck 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.6s forwards'
                  }}
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-semibold text-white">
            Completado ✓
          </h1>

          {/* CTA Button to Notion */}
          <a
            href="https://portalculture.notion.site/EVOLUCIONA-PORTAL-CULTURE-f110e93696d583e481ec8164b6a5e55f?pvs=74"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-full max-w-xs mx-auto"
          >
            <button className="w-full px-8 py-4 rounded-2xl text-white font-medium transition-all duration-300 active:scale-95 group relative overflow-hidden">
              {/* Glassmorphism background */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl" />
              
              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-cyan-500/0 group-hover:from-emerald-500/10 group-hover:to-cyan-500/10 transition-all duration-500 rounded-2xl" />
              
              <span className="relative flex items-center justify-center gap-2">
                Recoge tu regalo 🎁
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </button>
          </a>

          <p className="mt-3 text-xs text-white/55">
            Dale clic a &quot;Duplicar&quot; para hacerlo tuyo
          </p>
          <p className="text-white/40 text-sm">
            Tu solicitud ha sido enviada
          </p>
        </div>

        <style jsx>{`
          @keyframes drawCircle {
            to { strokeDashoffset: 0; }
          }
          @keyframes drawCheck {
            to { strokeDashoffset: 0; }
          }
          @keyframes scaleIn {
            from { transform: scale(0.8); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      {/* Background gradient mesh - Premium sin banding */}
      <div className="fixed inset-0 -z-10">
        {/* Multi-layer gradient mesh */}
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(255, 200, 87, 0.12) 0%, transparent 35%),
            radial-gradient(circle at 80% 20%, rgba(255, 150, 50, 0.10) 0%, transparent 40%),
            radial-gradient(circle at 40% 70%, rgba(255, 180, 70, 0.08) 0%, transparent 45%),
            radial-gradient(circle at 90% 80%, rgba(255, 140, 40, 0.09) 0%, transparent 38%),
            radial-gradient(ellipse 120% 80% at 50% 50%, rgba(255, 165, 60, 0.06) 0%, rgba(255, 130, 50, 0.04) 25%, rgba(200, 100, 30, 0.02) 50%, transparent 75%),
            #000000
          `
        }} />
        
        {/* Animated subtle glow orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute top-[20%] left-[15%] w-[500px] h-[500px] rounded-full opacity-[0.15]"
            style={{
              background: 'radial-gradient(circle, rgba(255, 200, 87, 0.4) 0%, transparent 70%)',
              filter: 'blur(80px)',
              animation: 'float 20s ease-in-out infinite',
            }}
          />
          <div 
            className="absolute top-[60%] right-[20%] w-[400px] h-[400px] rounded-full opacity-[0.12]"
            style={{
              background: 'radial-gradient(circle, rgba(255, 150, 50, 0.4) 0%, transparent 70%)',
              filter: 'blur(70px)',
              animation: 'float 25s ease-in-out infinite reverse',
            }}
          />
          <div 
            className="absolute top-[40%] left-[60%] w-[350px] h-[350px] rounded-full opacity-[0.10]"
            style={{
              background: 'radial-gradient(circle, rgba(255, 180, 70, 0.4) 0%, transparent 70%)',
              filter: 'blur(90px)',
              animation: 'float 30s ease-in-out infinite',
              animationDelay: '-5s',
            }}
          />
        </div>
        
        {/* Fine grain texture */}
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundSize: '150px 150px',
          opacity: 0.03,
          mixBlendMode: 'overlay',
        }} />
      </div>

      {/* Notificación estilo Apple - "< 5 minutos" */}
      <div 
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out ${
          showNotification ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <div 
          className="relative px-6 py-3.5 rounded-2xl shadow-2xl max-w-sm"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
            backdropFilter: 'blur(30px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.25)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(255, 200, 87, 0.2)',
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setShowNotification(false)}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-white/30 flex items-center justify-center transition-all duration-200"
          >
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div 
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 200, 87, 0.3) 0%, rgba(255, 150, 50, 0.3) 100%)',
                boxShadow: '0 0 20px rgba(255, 180, 70, 0.4)',
              }}
            >
              <svg className="w-5 h-5 text-yellow-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            {/* Text */}
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">Regalo al final 🎁</p>
            </div>
          </div>
        </div>
      </div>

      {/* Header with progress */}
      <header className="p-4 md:p-6">
        <div className="max-w-xl mx-auto">
          {/* Back button */}
          <button
            onClick={step > 1 ? prevStep : () => router.push('/')}
            className="flex items-center gap-2 text-white/40 hover:text-white/60 transition-colors text-sm mb-6"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {step > 1 ? 'Anterior' : 'Salir'}
          </button>

          {/* Progress bar */}
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white/80 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
          <p className="text-white/30 text-xs mt-2">{step} de {totalSteps}</p>
        </div>
      </header>

      {/* Form content */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-xl">
          
          {/* Step 1: Contact Info */}
          {step === 1 && (
            <div className="animate-fadeIn space-y-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">
                  ¿Dónde te contactamos?
                </h2>
                <p className="text-white/40 text-sm">Información básica para poder comunicarnos</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-white/60 text-sm mb-2">¿Cómo quieres que te llamemos?</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => updateField('nombre', e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none transition-all duration-200 hover:border-white/15 hover:bg-white/[0.07]"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-2">Correo electrónico</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none transition-all duration-200 hover:border-white/15 hover:bg-white/[0.07]"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-2">Número de teléfono</label>
                  <div className="flex gap-2">
                    {/* Country code selector */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                        className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-3.5 text-white hover:border-white/20 transition-all duration-200 min-w-[100px]"
                      >
                        <span className="text-lg">{countryCodes.find(c => c.code === formData.codigoPais)?.flag}</span>
                        <span className="text-sm">{formData.codigoPais}</span>
                        <svg className={`w-4 h-4 text-white/40 transition-transform duration-200 ${showCountryDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {/* Dropdown */}
                      {showCountryDropdown && (
                        <div className="absolute top-full left-0 mt-2 w-48 bg-black/95 backdrop-blur-xl border border-white/15 rounded-xl overflow-hidden z-50 shadow-xl animate-fadeIn">
                          <div className="max-h-60 overflow-y-auto">
                            {countryCodes.map((country) => (
                              <button
                                key={country.code}
                                type="button"
                                onClick={() => {
                                  updateField('codigoPais', country.code)
                                  setShowCountryDropdown(false)
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/10 transition-colors ${formData.codigoPais === country.code ? 'bg-white/10' : ''}`}
                              >
                                <span className="text-lg">{country.flag}</span>
                                <span className="text-white/80 text-sm">{country.code}</span>
                                <span className="text-white/40 text-xs">{country.country}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Phone number input with auto-formatting */}
                    <input
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => {
                        const country = countryCodes.find(c => c.code === formData.codigoPais)
                        const rawValue = e.target.value.replace(/\D/g, '')
                        // Limit to max length for the country
                        const maxLen = country?.maxLength || 10
                        const limitedValue = rawValue.slice(0, maxLen)
                        // Format the number
                        const formatted = formatPhoneNumber(limitedValue, formData.codigoPais)
                        updateField('telefono', formatted)
                      }}
                      placeholder={getPhonePlaceholder(formData.codigoPais)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none transition-all duration-200 hover:border-white/15 hover:bg-white/[0.07] tracking-wide"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Age - Creative Slider */}
          {step === 2 && (
            <div className="animate-fadeIn space-y-8">
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">
                  ¿Cuántos años tienes?
                </h2>
                <p className="text-white/40 text-sm">Desliza o toca para seleccionar</p>
              </div>

              {/* Large centered display */}
              <div className="flex flex-col items-center gap-6">
                {/* Age display with emoji */}
                <div className="relative">
                  {/* Glow effect backdrop */}
                  <div 
                    className="absolute inset-0 -m-8 rounded-full opacity-40 blur-3xl transition-all duration-500"
                    style={{
                      background: `radial-gradient(circle, rgba(255, ${170 + ageValue}, 50, ${0.3 + (ageValue / 100)}) 0%, transparent 70%)`,
                    }}
                  />
                  
                  <div className="text-8xl md:text-9xl font-bold text-white flex items-center gap-4 relative">
                    <span className="text-6xl md:text-7xl animate-bounce-subtle">
                      {getAgeEmoji(ageValue)}
                    </span>
                    <span 
                      className="bg-gradient-to-br from-yellow-300 via-orange-400 to-amber-500 bg-clip-text text-transparent transition-all duration-300"
                      style={{
                        filter: `drop-shadow(0 0 ${15 + ageValue * 0.3}px rgba(255, 180, 70, ${0.4 + (ageValue / 100)}))`,
                      }}
                    >
                      {ageValue}
                    </span>
                  </div>
                  <p className="text-center text-white/60 text-lg mt-2">años</p>
                </div>

                {/* Custom slider */}
                <div className="w-full max-w-md space-y-4">
                  {/* Slider track */}
                  <div className="relative">
                    <div 
                      className="relative h-3 rounded-full overflow-hidden group"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      {/* Progress fill con hover glow */}
                      <div 
                        className="absolute left-0 top-0 h-full rounded-full transition-all duration-300"
                        style={{ 
                          width: `${((ageValue - 10) / 40) * 100}%`,
                          background: 'linear-gradient(90deg, rgba(255, 200, 87, 0.9) 0%, rgba(255, 150, 50, 0.9) 50%, rgba(255, 120, 40, 0.9) 100%)',
                          boxShadow: `0 0 25px rgba(255, 180, 70, ${0.4 + (ageValue / 80)}), 0 0 40px rgba(255, 140, 40, ${0.2 + (ageValue / 100)})`,
                        }}
                      />
                    </div>

                    {/* Actual input slider - invisible para interacción */}
                    <input
                      type="range"
                      min="10"
                      max="50"
                      value={ageValue}
                      onChange={(e) => {
                        const newAge = parseInt(e.target.value)
                        setAgeValue(newAge)
                        updateField('edad', newAge.toString())
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    
                    {/* Thumb glassmorphism con hover effect */}
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-7 h-7 rounded-full pointer-events-none transition-all duration-300"
                      style={{
                        left: `calc(${((ageValue - 10) / 40) * 100}% - 14px)`,
                        background: 'linear-gradient(135deg, rgba(255, 220, 120, 0.95) 0%, rgba(255, 180, 80, 0.95) 100%)',
                        backdropFilter: 'blur(10px)',
                        border: '2px solid rgba(255, 200, 100, 0.4)',
                        boxShadow: `0 4px 16px rgba(0,0,0,0.3), 0 0 30px rgba(255, 180, 70, ${0.5 + (ageValue / 60)})`,
                      }}
                    >
                      <div className="absolute inset-1.5 bg-gradient-to-br from-yellow-200 to-orange-300 rounded-full" />
                    </div>
                  </div>

                  {/* Min/Max labels */}
                  <div className="flex justify-between text-sm text-white/40 px-1">
                    <span>10 años</span>
                    <span>50 años</span>
                  </div>
                </div>

                {/* Quick select buttons */}
                <div className="flex flex-wrap gap-2 justify-center max-w-md">
                  {[15, 20, 25, 30, 35, 40, 45].map((age) => (
                    <button
                      key={age}
                      type="button"
                      onClick={() => {
                        setAgeValue(age)
                        updateField('edad', age.toString())
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        ageValue === age
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-400/50'
                          : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white/70'
                      }`}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Step 3: Life Rating - Premium Slider */}
          {step === 3 && (
            <div className="animate-fadeIn space-y-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">
                  ¿Del 1 al 10, cómo describirías tu vida actual?
                </h2>
                <p className="text-white/40 text-sm">Se honesto. De aquí solo va hacia arriba</p>
              </div>

              <div className="space-y-8">
                {/* Big number display with animation */}
                <div className="text-center">
                  <span 
                    className="text-7xl md:text-8xl font-light text-white inline-block transition-transform duration-200"
                    style={{ 
                      transform: `scale(${1 + (formData.vidaActual - 5) * 0.02})`,
                      textShadow: formData.vidaActual >= 7 ? '0 0 40px rgba(255,255,255,0.2)' : 'none'
                    }}
                  >
                    {formData.vidaActual}
                  </span>
                </div>
                
                {/* Custom slider track */}
                <div className="relative py-4">
                  <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                    {/* Filled portion */}
                    <div 
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-white/30 to-white/60 rounded-full transition-all duration-200"
                      style={{ width: `${((formData.vidaActual - 1) / 9) * 100}%` }}
                    />
                  </div>
                  
                  {/* Invisible range input for interaction */}
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.vidaActual}
                    onChange={(e) => updateField('vidaActual', parseInt(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  
                  {/* Draggable thumb */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg shadow-black/30 pointer-events-none transition-all duration-100"
                    style={{ 
                      left: `calc(${((formData.vidaActual - 1) / 9) * 100}% - 12px)`,
                      transform: 'translateY(-50%) scale(1)',
                    }}
                  >
                    <div className="absolute inset-1 bg-white rounded-full" />
                  </div>
                </div>
                
                {/* Scale markers */}
                <div className="flex justify-between px-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => updateField('vidaActual', num)}
                      className={`w-8 h-8 rounded-full text-xs font-medium transition-all duration-200 ${
                        formData.vidaActual === num 
                          ? 'bg-white text-black scale-110' 
                          : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Description */}
          {step === 4 && (
            <div className="animate-fadeIn space-y-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">
                  ¿Cuál de estas opciones te describe mejor?
                </h2>
              </div>

              <div className="space-y-3">
                {descripcionOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => updateField('descripcion', option.id)}
                    className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 flex items-start gap-4 hover:scale-[1.01] active:scale-[0.99] ${
                      formData.descripcion === option.id
                        ? 'bg-white/15 border-white/30 text-white shadow-lg shadow-white/5'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/[0.08] hover:border-white/20'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      formData.descripcion === option.id ? 'border-white bg-white/20' : 'border-white/30'
                    }`}>
                      {formData.descripcion === option.id && (
                        <span className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </span>
                    <span>{option.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: NUEVA - Intentos de cambio */}
          {step === 5 && (
            <div className="animate-fadeIn space-y-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">
                  ¿Qué has intentado cambiar en los últimos 6 meses?
                </h2>
                <p className="text-white/40 text-sm">Puede que haya funcionado o no. Queremos saberlo para poder ayudarte.</p>
              </div>

              <div>
                <textarea
                  value={formData.intentosCambio}
                  onChange={(e) => updateField('intentosCambio', e.target.value)}
                  placeholder="Ej: Intenté ir al gym 3 veces por semana pero solo aguanté 2 semanas. También probé meditación..."
                  rows={6}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none transition-all duration-200 hover:border-white/15 hover:bg-white/[0.07] resize-none"
                />
                <p className="text-white/30 text-xs mt-2 text-right">
                  {formData.intentosCambio.length} caracteres
                </p>
              </div>
            </div>
          )}

          {/* Step 6: Frenos */}
          {step === 6 && (
            <div className="animate-fadeIn space-y-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">
                  ¿Cuál de estas cosas te está frenando?
                </h2>
                <p className="text-white/40 text-sm">Puedes escoger hasta 2</p>
              </div>

              <div className="space-y-3">
                {frenosOptions.map((option) => {
                  const isSelected = formData.frenos.includes(option.id)
                  const isDisabled = !isSelected && formData.frenos.length >= 2
                  
                  return (
                    <button
                      key={option.id}
                      onClick={() => toggleFreno(option.id)}
                      disabled={isDisabled}
                      className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 flex items-start gap-4 ${
                        isSelected
                          ? 'bg-white/15 border-white/30 text-white'
                          : isDisabled
                            ? 'bg-white/2 border-white/5 text-white/30 cursor-not-allowed'
                            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/8 hover:border-white/15'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                        isSelected ? 'border-white bg-white/20' : 'border-white/30'
                      }`}>
                        {isSelected && (
                          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      <span>{option.text}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 7: NUEVA - Horas semanales con slider glassmorphism */}
          {step === 7 && (
            <div className="animate-fadeIn space-y-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">
                  ¿Cuántas horas a la semana puedes dedicar realmente a mejorar?
                </h2>
                <p className="text-white/40 text-sm leading-relaxed">
                  Siendo 100% honesto: ¿cuántas horas A LA SEMANA puedes dedicar a:<br/>
                  • Ver los cursos<br/>
                  • Participar en llamadas<br/>
                  • Aportar valor a la comunidad<br/>
                  • Aplicar lo que aprendes
                </p>
              </div>

              <div className="space-y-8">
                {/* Display de horas con glassmorphism premium */}
                <div className="relative">
                  <div 
                    className="relative overflow-hidden rounded-3xl p-8 md:p-12 group hover:scale-[1.02] transition-all duration-500"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)',
                      backdropFilter: 'blur(30px) saturate(180%)',
                      border: '1px solid rgba(255, 200, 100, 0.25)',
                      boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.4), 0 4px 20px rgba(255, 180, 70, ${0.15 + (formData.horasSemanales / 40)})`,
                    }}
                  >
                    {/* Animated glow effect que crece con las horas */}
                    <div 
                      className="absolute inset-0 opacity-40 transition-all duration-500"
                      style={{
                        background: `radial-gradient(circle at 50% 50%, rgba(255, ${180 + formData.horasSemanales * 3}, 50, ${0.15 + formData.horasSemanales * 0.02}), transparent 70%)`,
                        filter: 'blur(40px)',
                      }}
                    />
                    
                    {/* Animated particles effect */}
                    <div className="absolute inset-0 overflow-hidden opacity-20">
                      <div 
                        className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full"
                        style={{
                          background: 'radial-gradient(circle, rgba(255, 200, 87, 0.6) 0%, transparent 70%)',
                          filter: 'blur(30px)',
                          animation: 'float 8s ease-in-out infinite',
                        }}
                      />
                      <div 
                        className="absolute bottom-1/4 right-1/4 w-24 h-24 rounded-full"
                        style={{
                          background: 'radial-gradient(circle, rgba(255, 150, 50, 0.6) 0%, transparent 70%)',
                          filter: 'blur(25px)',
                          animation: 'float 10s ease-in-out infinite reverse',
                        }}
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="relative text-center space-y-4">
                      <div className="flex items-baseline justify-center gap-3">
                        <span 
                          className="text-7xl md:text-8xl font-bold bg-gradient-to-br from-yellow-200 via-orange-300 to-amber-400 bg-clip-text text-transparent transition-all duration-500"
                          style={{
                            filter: `drop-shadow(0 0 ${20 + formData.horasSemanales * 2}px rgba(255, 180, 70, ${0.5 + (formData.horasSemanales / 30)}))`,
                          }}
                        >
                          {formData.horasSemanales}
                        </span>
                        <span className="text-2xl md:text-3xl text-white/60 font-light">
                          {formData.horasSemanales === 1 ? 'hora' : 'horas'}
                        </span>
                      </div>
                      <p className="text-white/50 text-sm">por semana</p>
                    </div>
                  </div>
                </div>

                {/* Slider glassmorphism */}
                <div className="space-y-4">
                  <div className="relative">
                    {/* Track */}
                    <div 
                      className="relative h-4 rounded-full overflow-hidden group"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 200, 100, 0.15)',
                      }}
                    >
                      {/* Fill con efecto glow progresivo */}
                      <div 
                        className="absolute left-0 top-0 h-full rounded-full transition-all duration-300 group-hover:brightness-110"
                        style={{
                          width: `${(formData.horasSemanales / 20) * 100}%`,
                          background: 'linear-gradient(90deg, rgba(255, 200, 87, 0.95) 0%, rgba(255, 150, 50, 0.95) 50%, rgba(255, 120, 40, 0.95) 100%)',
                          boxShadow: `0 0 30px rgba(255, 180, 70, ${0.4 + (formData.horasSemanales / 30)}), 0 0 50px rgba(255, 140, 40, ${0.2 + (formData.horasSemanales / 40)})`,
                        }}
                      />
                    </div>

                    {/* Input range */}
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={formData.horasSemanales}
                      onChange={(e) => updateField('horasSemanales', parseInt(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    
                    {/* Thumb glassmorphism mejorado */}
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-9 h-9 rounded-full pointer-events-none transition-all duration-300 hover:scale-110"
                      style={{
                        left: `calc(${(formData.horasSemanales / 20) * 100}% - 18px)`,
                        background: 'linear-gradient(135deg, rgba(255, 220, 120, 0.98) 0%, rgba(255, 180, 80, 0.98) 100%)',
                        backdropFilter: 'blur(15px)',
                        border: '2.5px solid rgba(255, 200, 100, 0.5)',
                        boxShadow: `0 4px 20px rgba(0,0,0,0.4), 0 0 35px rgba(255, 180, 70, ${0.6 + (formData.horasSemanales / 30)})`,
                      }}
                    >
                      <div className="absolute inset-2 bg-gradient-to-br from-yellow-200 to-orange-300 rounded-full" />
                      {/* Animated pulse ring */}
                      <div 
                        className="absolute inset-0 rounded-full animate-ping opacity-30"
                        style={{
                          background: 'rgba(255, 180, 70, 0.5)',
                          animationDuration: '2s',
                        }}
                      />
                    </div>
                  </div>

                  {/* Helper markers */}
                  <div className="flex justify-between px-1 text-xs text-white/30">
                    <span>1h</span>
                    <span>7h</span>
                    <span>14h</span>
                    <span>20h</span>
                  </div>

                  {/* Dynamic feedback mejorado */}
                  <div className="text-center">
                    <p className="text-sm font-medium transition-all duration-300" style={{
                      color: formData.horasSemanales < 5 ? 'rgba(239, 68, 68, 0.8)' : 
                             formData.horasSemanales < 10 ? 'rgba(34, 197, 94, 0.8)' :
                             formData.horasSemanales < 15 ? 'rgba(249, 115, 22, 0.9)' :
                             'rgba(255, 200, 87, 1)',
                    }}>
                      {formData.horasSemanales < 5 && '⚠️ Mínimo recomendado para ver resultados'}
                      {formData.horasSemanales >= 5 && formData.horasSemanales < 10 && '✓ Suficiente para empezar con buen ritmo'}
                      {formData.horasSemanales >= 10 && formData.horasSemanales < 15 && '🔥 Excelente compromiso. Verás cambios rápidos'}
                      {formData.horasSemanales >= 15 && '⚡ Nivel élite. Transformación garantizada'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 8: NUEVA - Aportación */}
          {step === 8 && (
            <div className="animate-fadeIn space-y-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">
                  Si entras, ¿qué vas a aportar al resto?
                </h2>
                <p className="text-white/40 text-sm">Portal Culture funciona porque todos aportan. ¿Cuáles son las áreas que más dominas?</p>
              </div>

              <div>
                <textarea
                  value={formData.aportacion}
                  onChange={(e) => updateField('aportacion', e.target.value)}
                  placeholder="Ej: Llevo 2 años entrenando y puedo ayudar con rutinas. También soy bueno con finanzas personales..."
                  rows={6}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none transition-all duration-200 hover:border-white/15 hover:bg-white/[0.07] resize-none"
                />
                <p className="text-white/30 text-xs mt-2 text-right">
                  {formData.aportacion.length} caracteres
                </p>
              </div>
            </div>
          )}

          {/* Step 9: Why should we let you in - MEJORADA */}
          {step === 9 && (
            <div className="animate-fadeIn space-y-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">
                  ¿Por qué te deberíamos dejar entrar?
                </h2>
                <p className="text-white/40 text-sm">Última pregunta. Convéncenos de que mereces estar aquí.</p>
              </div>

              <div>
                <textarea
                  value={formData.porqueEntrar}
                  onChange={(e) => updateField('porqueEntrar', e.target.value)}
                  placeholder="Escribe aquí por qué deberíamos elegirte..."
                  rows={6}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none transition-all duration-200 hover:border-white/15 hover:bg-white/[0.07] resize-none"
                />
                <p className="text-white/30 text-xs mt-2 text-right">
                  {formData.porqueEntrar.length} caracteres (mín. 50)
                </p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer with CTA */}
      <footer className="p-4 md:p-6">
        <div className="max-w-xl mx-auto">
          <button
            onClick={nextStep}
            disabled={!canProceed() || isSubmitting}
            className={`w-full py-4 rounded-xl font-medium transition-all duration-200 ${
              canProceed() && !isSubmitting
                ? 'bg-gradient-to-r from-yellow-200 via-orange-300 to-amber-400 text-black hover:shadow-xl hover:shadow-orange-400/20 hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Enviando...
              </span>
            ) : step === totalSteps ? 'Enviar solicitud' : 'Continuar'}
          </button>
        </div>
      </footer>

      {/* Global styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(10px, -10px) scale(1.05);
          }
          50% {
            transform: translate(-5px, 10px) scale(0.95);
          }
          75% {
            transform: translate(-10px, -5px) scale(1.02);
          }
        }
        
        @keyframes bounce-subtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 3s ease-in-out infinite;
        }
        
        /* Hover effects para inputs */
        input[type="text"]:focus,
        input[type="email"]:focus,
        input[type="tel"]:focus,
        textarea:focus {
          border-color: rgba(255, 200, 100, 0.3) !important;
          box-shadow: 0 0 0 3px rgba(255, 180, 70, 0.1), 0 0 20px rgba(255, 180, 70, 0.15) !important;
        }
        
        /* Smooth transitions para todos los elementos interactivos */
        button, input, textarea {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        button:active {
          transform: scale(0.98);
        }
        
        /* Glassmorphism hover effect */
        .glass-hover:hover {
          backdrop-filter: blur(40px) saturate(200%) !important;
          border-color: rgba(255, 200, 100, 0.3) !important;
        }
      `}</style>
    </main>
  )
}
