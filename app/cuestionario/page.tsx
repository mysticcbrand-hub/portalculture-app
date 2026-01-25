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
  porqueEntrar: string
}

// Country codes with flags
const countryCodes = [
  { code: '+34', country: 'ES', flag: '🇪🇸' },
  { code: '+1', country: 'US', flag: '🇺🇸' },
  { code: '+52', country: 'MX', flag: '🇲🇽' },
  { code: '+54', country: 'AR', flag: '🇦🇷' },
  { code: '+57', country: 'CO', flag: '🇨🇴' },
  { code: '+56', country: 'CL', flag: '🇨🇱' },
  { code: '+51', country: 'PE', flag: '🇵🇪' },
  { code: '+58', country: 'VE', flag: '🇻🇪' },
  { code: '+593', country: 'EC', flag: '🇪🇨' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+33', country: 'FR', flag: '🇫🇷' },
  { code: '+49', country: 'DE', flag: '🇩🇪' },
  { code: '+39', country: 'IT', flag: '🇮🇹' },
  { code: '+351', country: 'PT', flag: '🇵🇹' },
  { code: '+55', country: 'BR', flag: '🇧🇷' },
]

// Age options for dropdown
const edadOptions = [
  { value: '16-18', label: '16 - 18 años' },
  { value: '19-21', label: '19 - 21 años' },
  { value: '22-25', label: '22 - 25 años' },
  { value: '26-30', label: '26 - 30 años' },
  { value: '31+', label: '31 años o más' },
]

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
    edad: '',
    vidaActual: 5,
    descripcion: '',
    frenos: [],
    porqueEntrar: '',
  })
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [showAgeDropdown, setShowAgeDropdown] = useState(false)

  const totalSteps = 6

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
        const { data: profile } = await supabase
          .from('profiles')
          .select('access_status')
          .eq('id', user.id)
          .single()

        const status = profile?.access_status

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
  }, [router, supabase.auth])

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
        return formData.nombre.trim() && emailValid && formData.telefono.trim().length >= 6
      case 2:
        return formData.edad !== ''
      case 3:
        return true // Slider always has value
      case 4:
        return formData.descripcion !== ''
      case 5:
        return formData.frenos.length > 0
      case 6:
        return formData.porqueEntrar.trim().length >= 20
      default:
        return false
    }
  }

  // Format phone number with country code
  const getFullPhone = () => {
    return `${formData.codigoPais} ${formData.telefono}`
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
            porqueEntrar: formData.porqueEntrar,
          }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar')
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

      // Redirect to pending page after animation
      setTimeout(() => {
        router.push('/pendiente-aprobacion')
      }, 2500)
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

  // Completion screen
  if (isComplete) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0" style={{
            background: `radial-gradient(ellipse 80% 60% at 50% 45%, rgba(255,255,255,0.08) 0%, rgba(200,200,200,0.04) 30%, transparent 70%)`
          }} />
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            opacity: 0.05,
            mixBlendMode: 'soft-light',
          }} />
        </div>

        <div className="text-center animate-fadeIn">
          {/* Animated checkmark */}
          <div className="w-20 h-20 mx-auto mb-8 relative">
            <svg 
              className="w-20 h-20 text-white animate-checkmark"
              viewBox="0 0 52 52"
            >
              <circle 
                className="animate-circle"
                cx="26" cy="26" r="24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                strokeLinecap="round"
                style={{
                  strokeDasharray: 166,
                  strokeDashoffset: 166,
                  animation: 'stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards'
                }}
              />
              <path 
                className="animate-check"
                fill="none" 
                stroke="currentColor" 
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14 27l7 7 16-16"
                style={{
                  strokeDasharray: 48,
                  strokeDashoffset: 48,
                  animation: 'stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.5s forwards'
                }}
              />
            </svg>
          </div>

          <h1 className="text-2xl md:text-3xl font-semibold text-white mb-3">
            Solicitud enviada
          </h1>
          <p className="text-white/50 text-sm md:text-base max-w-sm mx-auto mb-8">
            Revisaremos tu perfil y te contactaremos pronto
          </p>

          <button
            onClick={() => router.push('/')}
            className="text-white/40 text-sm hover:text-white/60 transition-colors"
          >
            Volver al inicio
          </button>
        </div>

        <style jsx>{`
          @keyframes stroke {
            100% { stroke-dashoffset: 0; }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.5s ease-out forwards;
          }
        `}</style>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0" style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 45%, rgba(255,255,255,0.08) 0%, rgba(200,200,200,0.04) 30%, transparent 70%)`
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          opacity: 0.05,
          mixBlendMode: 'soft-light',
        }} />
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
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-white/25 transition-all duration-200 hover:border-white/15"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-2">Correo electrónico</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-white/25 transition-all duration-200 hover:border-white/15"
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
                    
                    {/* Phone number input */}
                    <input
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => {
                        // Only allow numbers and format nicely
                        const value = e.target.value.replace(/[^0-9]/g, '')
                        updateField('telefono', value)
                      }}
                      placeholder="600 000 000"
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-white/25 transition-all duration-200 hover:border-white/15"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Age - Dropdown */}
          {step === 2 && (
            <div className="animate-fadeIn space-y-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">
                  ¿Cuántos años tienes?
                </h2>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAgeDropdown(!showAgeDropdown)}
                  className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border transition-all duration-300 ${
                    formData.edad 
                      ? 'bg-white/10 border-white/25 text-white' 
                      : 'bg-white/5 border-white/10 text-white/40'
                  } hover:border-white/20`}
                >
                  <span>{formData.edad ? edadOptions.find(o => o.value === formData.edad)?.label : 'Selecciona tu edad'}</span>
                  <svg className={`w-5 h-5 text-white/40 transition-transform duration-300 ${showAgeDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {showAgeDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-black/95 backdrop-blur-xl border border-white/15 rounded-xl overflow-hidden z-50 shadow-2xl animate-fadeIn">
                    {edadOptions.map((option, index) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          updateField('edad', option.value)
                          setShowAgeDropdown(false)
                        }}
                        className={`w-full text-left px-5 py-4 transition-all duration-200 ${
                          formData.edad === option.value 
                            ? 'bg-white/15 text-white' 
                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                        } ${index !== edadOptions.length - 1 ? 'border-b border-white/5' : ''}`}
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
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
                    className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 flex items-start gap-4 ${
                      formData.descripcion === option.id
                        ? 'bg-white/15 border-white/30 text-white'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/8 hover:border-white/15'
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

          {/* Step 5: Frenos */}
          {step === 5 && (
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

          {/* Step 6: Why should we let you in */}
          {step === 6 && (
            <div className="animate-fadeIn space-y-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">
                  ¿Por qué te deberíamos dejar entrar?
                </h2>
                <p className="text-white/40 text-sm">Descríbete y destaca lo mejor de ti</p>
              </div>

              <div>
                <textarea
                  value={formData.porqueEntrar}
                  onChange={(e) => updateField('porqueEntrar', e.target.value)}
                  placeholder="Escribe aquí..."
                  rows={5}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-white/25 transition-colors resize-none"
                />
                <p className="text-white/30 text-xs mt-2 text-right">
                  {formData.porqueEntrar.length} / 20 mínimo
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
                ? 'bg-white text-black hover:bg-white/90'
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
        
        /* Custom slider thumb */
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        .slider-thumb::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </main>
  )
}
