'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

// Types
interface FormData {
  valorMensual: number
  top3Cosas: string[]
  otroTop3: string
  probabilidad6Meses: number
  motivacionSeguir: string
  ayudaPortal: string
  menosGustado: string
  preferenciaAprendizaje: string
  vidaEn2Anos: string
}

export default function RegaloPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [step, setStep] = useState(1)
  const [isComplete, setIsComplete] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<FormData>({
    valorMensual: 25,
    top3Cosas: [],
    otroTop3: '',
    probabilidad6Meses: 8,
    motivacionSeguir: '',
    ayudaPortal: '',
    menosGustado: '',
    preferenciaAprendizaje: '',
    vidaEn2Anos: '',
  })

  const totalSteps = 8

  // Check auth
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUserId(user.id)
    }
    checkAuth()
  }, [])

  // Update field
  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle checkbox with max 3 selections
  const toggleTop3 = (value: string) => {
    setFormData(prev => {
      const current = prev.top3Cosas
      if (current.includes(value)) {
        return { ...prev, top3Cosas: current.filter(v => v !== value) }
      } else if (current.length < 3) {
        return { ...prev, top3Cosas: [...current, value] }
      }
      return prev
    })
  }

  // Validation
  const canProceed = () => {
    switch (step) {
      case 1:
        return true // Slider always has value
      case 2:
        return formData.top3Cosas.length > 0
      case 3:
        return true // Slider always has value
      case 4:
        return formData.motivacionSeguir.trim().length >= 10
      case 5:
        return formData.ayudaPortal.trim().length >= 10
      case 6:
        return formData.menosGustado.trim().length >= 10
      case 7:
        return formData.preferenciaAprendizaje !== ''
      case 8:
        return formData.vidaEn2Anos.trim().length >= 20
      default:
        return false
    }
  }

  // Next step
  const nextStep = () => {
    if (canProceed() && step < totalSteps) {
      setStep(step + 1)
    }
  }

  // Previous step
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  // Submit
  const handleSubmit = async () => {
    if (!userId) return
    
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/post-compra/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          ...formData
        })
      })

      if (!response.ok) {
        throw new Error('Error al enviar respuestas')
      }

      setIsComplete(true)
    } catch (error: any) {
      console.error('Error submitting:', error)
      alert('Error al enviar. Por favor intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const top3Options = [
    'Cursos',
    'Llamadas semanales',
    'Comunidad/chat',
    'Valor diario',
    'Conexiones 1-on-1',
    'Sistema de niveles',
    'Recursos/vault',
    'Acceso al fundador',
  ]

  const aprendizajeOptions = [
    'Masterclass largas',
    'Masterclass cortas',
    'Ebooks y Playbooks',
    'Audios',
  ]

  // Completion screen
  if (isComplete) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background premium */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0" style={{
            background: `
              radial-gradient(circle at 20% 30%, rgba(255, 200, 87, 0.15) 0%, transparent 40%),
              radial-gradient(circle at 80% 70%, rgba(255, 150, 50, 0.12) 0%, transparent 45%),
              radial-gradient(ellipse 120% 80% at 50% 50%, rgba(255, 165, 60, 0.08) 0%, transparent 70%),
              #000000
            `
          }} />
          
          {/* Animated orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="absolute top-[20%] left-[15%] w-[500px] h-[500px] rounded-full opacity-20"
              style={{
                background: 'radial-gradient(circle, rgba(255, 200, 87, 0.5) 0%, transparent 70%)',
                filter: 'blur(80px)',
                animation: 'float 20s ease-in-out infinite',
              }}
            />
            <div 
              className="absolute top-[60%] right-[20%] w-[400px] h-[400px] rounded-full opacity-15"
              style={{
                background: 'radial-gradient(circle, rgba(255, 150, 50, 0.5) 0%, transparent 70%)',
                filter: 'blur(70px)',
                animation: 'float 25s ease-in-out infinite reverse',
              }}
            />
          </div>
        </div>

        <div className="text-center animate-fadeIn space-y-8 max-w-2xl">
          {/* Checkmark animado */}
          <div className="w-24 h-24 mx-auto mb-8 relative">
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 200, 87, 0.3) 0%, rgba(255, 150, 50, 0.3) 100%)',
                filter: 'blur(20px)',
              }}
            />
            <svg 
              className="w-24 h-24 text-white relative z-10"
              viewBox="0 0 52 52"
            >
              <circle 
                cx="26" cy="26" r="24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="150"
                strokeDashoffset="0"
                style={{
                  animation: 'drawCircle 0.6s ease-out forwards'
                }}
              />
              <path 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14 27l7 7 16-16"
                strokeDasharray="40"
                strokeDashoffset="40"
                style={{
                  animation: 'drawCheck 0.4s 0.6s ease-out forwards'
                }}
              />
            </svg>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            ¡Gracias por tu{' '}
            <span className="bg-gradient-to-r from-yellow-300 via-orange-400 to-amber-500 bg-clip-text text-transparent">
              tiempo
            </span>
            !
          </h1>

          <div 
            className="p-8 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(255, 200, 100, 0.2)',
            }}
          >
            <p className="text-white/80 text-lg leading-relaxed mb-6">
              Tus respuestas son oro para nosotros. Nos ayudan a crear el mejor Portal Culture posible.
            </p>
            
            <p className="text-white font-semibold text-xl mb-4">
              Aquí está tu regalo 🎁
            </p>
            
            <a
              href="#"
              className="inline-block px-8 py-4 bg-gradient-to-r from-yellow-300 via-orange-400 to-amber-500 text-black font-bold rounded-xl hover:shadow-2xl hover:shadow-orange-400/30 hover:scale-105 transition-all duration-300"
            >
              Acceder al regalo →
            </a>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="text-white/50 hover:text-white/80 text-sm transition-colors"
          >
            Volver al dashboard
          </button>
        </div>

        <style jsx>{`
          @keyframes drawCircle {
            to { strokeDashoffset: 0; }
          }
          @keyframes drawCheck {
            to { strokeDashoffset: 0; }
          }
          @keyframes float {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(10px, -10px) scale(1.05); }
            50% { transform: translate(-5px, 10px) scale(0.95); }
            75% { transform: translate(-10px, -5px) scale(1.02); }
          }
        `}</style>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background gradient mesh premium */}
      <div className="fixed inset-0 -z-10">
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

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-12 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Cuéntanos tu{' '}
            <span className="bg-gradient-to-r from-yellow-300 via-orange-400 to-amber-500 bg-clip-text text-transparent">
              experiencia
            </span>
          </h1>
          <p className="text-white/60 text-sm">
            Menos de 5 minutos • Tu feedback vale oro
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-white/40 mb-2">
            <span>Pregunta {step} de {totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-amber-500 transition-all duration-500 ease-out"
              style={{ 
                width: `${(step / totalSteps) * 100}%`,
                boxShadow: `0 0 20px rgba(255, 180, 70, 0.5)`
              }}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="min-h-[400px]">
          {/* Step 1: Valor mensual - Slider premium */}
          {step === 1 && (
            <div className="animate-fadeIn space-y-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">
                  ¿Cuánto vale para ti estar en Portal Culture?
                </h2>
                <p className="text-white/50 text-sm">
                  Si Portal Culture costara dinero...<br/>
                  ¿Cuánto estarías dispuesto a pagar mensualmente por seguir dentro?
                </p>
              </div>

              {/* Display glassmorphism premium */}
              <div className="relative">
                <div 
                  className="relative overflow-hidden rounded-3xl p-10 md:p-14 group hover:scale-[1.01] transition-all duration-500"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)',
                    backdropFilter: 'blur(30px) saturate(180%)',
                    border: '1px solid rgba(255, 200, 100, 0.25)',
                    boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.4), 0 4px 20px rgba(255, 180, 70, ${0.15 + (formData.valorMensual / 200)})`,
                  }}
                >
                  {/* Animated glow */}
                  <div 
                    className="absolute inset-0 opacity-40 transition-all duration-500"
                    style={{
                      background: `radial-gradient(circle at 50% 50%, rgba(255, ${180 + formData.valorMensual * 0.5}, 50, ${0.2 + formData.valorMensual * 0.003}), transparent 70%)`,
                      filter: 'blur(40px)',
                    }}
                  />
                  
                  {/* Content */}
                  <div className="relative text-center space-y-4">
                    <div className="flex items-baseline justify-center gap-3">
                      <span 
                        className="text-7xl md:text-8xl font-bold bg-gradient-to-br from-yellow-200 via-orange-300 to-amber-400 bg-clip-text text-transparent transition-all duration-500"
                        style={{
                          filter: `drop-shadow(0 0 ${20 + formData.valorMensual * 0.3}px rgba(255, 180, 70, ${0.5 + (formData.valorMensual / 100)}))`,
                        }}
                      >
                        {formData.valorMensual}€
                      </span>
                    </div>
                    <p className="text-white/60 text-lg">por mes</p>
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
                        width: `${(formData.valorMensual / 100) * 100}%`,
                        background: 'linear-gradient(90deg, rgba(255, 200, 87, 0.95) 0%, rgba(255, 150, 50, 0.95) 50%, rgba(255, 120, 40, 0.95) 100%)',
                        boxShadow: `0 0 30px rgba(255, 180, 70, ${0.4 + (formData.valorMensual / 150)}), 0 0 50px rgba(255, 140, 40, ${0.2 + (formData.valorMensual / 200)})`,
                      }}
                    />
                  </div>

                  {/* Input range */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.valorMensual}
                    onChange={(e) => updateField('valorMensual', parseInt(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  
                  {/* Thumb glassmorphism */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-9 h-9 rounded-full pointer-events-none transition-all duration-300"
                    style={{
                      left: `calc(${(formData.valorMensual / 100) * 100}% - 18px)`,
                      background: 'linear-gradient(135deg, rgba(255, 220, 120, 0.98) 0%, rgba(255, 180, 80, 0.98) 100%)',
                      backdropFilter: 'blur(15px)',
                      border: '2.5px solid rgba(255, 200, 100, 0.5)',
                      boxShadow: `0 4px 20px rgba(0,0,0,0.4), 0 0 35px rgba(255, 180, 70, ${0.6 + (formData.valorMensual / 150)})`,
                    }}
                  >
                    <div className="absolute inset-2 bg-gradient-to-br from-yellow-200 to-orange-300 rounded-full" />
                    {/* Pulse ring */}
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
                  <span>0€</span>
                  <span>25€</span>
                  <span>50€</span>
                  <span>75€</span>
                  <span>100€</span>
                </div>

                {/* Dynamic feedback */}
                <div className="text-center">
                  <p className="text-sm font-medium transition-all duration-300" style={{
                    color: formData.valorMensual === 0 ? 'rgba(239, 68, 68, 0.8)' : 
                           formData.valorMensual < 20 ? 'rgba(251, 191, 36, 0.8)' :
                           formData.valorMensual < 50 ? 'rgba(34, 197, 94, 0.8)' :
                           'rgba(255, 200, 87, 1)',
                  }}>
                    {formData.valorMensual === 0 && '💭 ¿Gratis? Interesante...'}
                    {formData.valorMensual > 0 && formData.valorMensual < 20 && '💰 Valoración inicial'}
                    {formData.valorMensual >= 20 && formData.valorMensual < 50 && '✨ Buena valoración'}
                    {formData.valorMensual >= 50 && '🔥 ¡WOW! Alto valor percibido'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Top 3 cosas - Checkboxes con máximo 3 */}
          {step === 2 && (
            <div className="animate-fadeIn space-y-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">
                  Si tuvieras que elegir SOLO 3 cosas que mantener...
                </h2>
                <p className="text-white/50 text-sm">
                  ¿Cuáles serían? (Elige máximo 3)
                </p>
              </div>

              {/* Counter */}
              <div className="text-center">
                <span className="inline-block px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm font-semibold">
                  {formData.top3Cosas.length} / 3 seleccionadas
                </span>
              </div>

              {/* Options grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {top3Options.map((option, idx) => {
                  const isSelected = formData.top3Cosas.includes(option)
                  const isDisabled = !isSelected && formData.top3Cosas.length >= 3
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => !isDisabled && toggleTop3(option)}
                      disabled={isDisabled}
                      className={`p-4 rounded-xl border transition-all duration-200 text-left ${
                        isSelected
                          ? 'bg-gradient-to-br from-orange-500/20 to-amber-500/20 border-orange-400/50 shadow-lg shadow-orange-500/20'
                          : isDisabled
                          ? 'bg-white/5 border-white/10 opacity-40 cursor-not-allowed'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Checkbox custom */}
                        <div 
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                            isSelected
                              ? 'border-orange-400 bg-gradient-to-br from-orange-400 to-amber-500'
                              : 'border-white/30'
                          }`}
                        >
                          {isSelected && (
                            <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        
                        <span className={`font-medium ${isSelected ? 'text-white' : 'text-white/70'}`}>
                          {option}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Otro (opcional) */}
              {formData.top3Cosas.length < 3 && (
                <div>
                  <label className="block text-sm text-white/60 mb-2">
                    Otro (especifica):
                  </label>
                  <input
                    type="text"
                    value={formData.otroTop3}
                    onChange={(e) => updateField('otroTop3', e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && formData.otroTop3.trim() && formData.top3Cosas.length < 3) {
                        toggleTop3(`Otro: ${formData.otroTop3}`)
                        updateField('otroTop3', '')
                      }
                    }}
                    placeholder="Escribe y presiona Enter..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-orange-400/50 transition-all duration-200"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 3: Probabilidad 6 meses - Slider 1-10 */}
          {step === 3 && (
            <div className="animate-fadeIn space-y-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">
                  ¿Cuál es la probabilidad de que sigas dentro en 6 meses más?
                </h2>
                <p className="text-white/50 text-sm leading-relaxed">
                  Mirando hacia adelante...<br/>
                  Del 1 al 10, ¿qué probabilidad hay de que sigas activo en Portal dentro de 6 meses?<br/>
                  <span className="text-red-400/70">1 = Me voy pronto</span> | <span className="text-green-400/70">10 = No me voy nunca</span>
                </p>
              </div>

              {/* Display con glassmorphism */}
              <div className="relative">
                <div 
                  className="relative overflow-hidden rounded-3xl p-10 md:p-14"
                  style={{
                    background: `linear-gradient(135deg, rgba(${formData.probabilidad6Meses < 5 ? '239, 68, 68' : formData.probabilidad6Meses < 8 ? '251, 191, 36' : '34, 197, 94'}, 0.12) 0%, rgba(255,255,255,0.06) 100%)`,
                    backdropFilter: 'blur(30px) saturate(180%)',
                    border: `1px solid rgba(${formData.probabilidad6Meses < 5 ? '239, 68, 68' : formData.probabilidad6Meses < 8 ? '251, 191, 36' : '34, 197, 94'}, 0.3)`,
                    boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.4)`,
                  }}
                >
                  <div className="relative text-center space-y-4">
                    <div className="flex items-baseline justify-center gap-3">
                      <span 
                        className="text-8xl md:text-9xl font-bold bg-gradient-to-br from-yellow-200 via-orange-300 to-amber-400 bg-clip-text text-transparent"
                        style={{
                          filter: `drop-shadow(0 0 ${20 + formData.probabilidad6Meses * 3}px rgba(255, 180, 70, 0.6))`,
                        }}
                      >
                        {formData.probabilidad6Meses}
                      </span>
                      <span className="text-3xl text-white/60 font-light">/10</span>
                    </div>
                    <p className="text-lg font-semibold" style={{
                      color: formData.probabilidad6Meses < 5 ? 'rgba(239, 68, 68, 0.9)' : 
                             formData.probabilidad6Meses < 8 ? 'rgba(251, 191, 36, 0.9)' :
                             'rgba(34, 197, 94, 0.9)',
                    }}>
                      {formData.probabilidad6Meses <= 3 && '😔 Necesitamos mejorar'}
                      {formData.probabilidad6Meses > 3 && formData.probabilidad6Meses < 6 && '🤔 Hay dudas'}
                      {formData.probabilidad6Meses >= 6 && formData.probabilidad6Meses < 8 && '😊 Buena retención'}
                      {formData.probabilidad6Meses >= 8 && '🔥 ¡Comprometido al 100%!'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Slider */}
              <div className="space-y-4">
                <div className="relative">
                  <div 
                    className="relative h-4 rounded-full overflow-hidden"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255, 200, 100, 0.15)',
                    }}
                  >
                    <div 
                      className="absolute left-0 top-0 h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${(formData.probabilidad6Meses / 10) * 100}%`,
                        background: formData.probabilidad6Meses < 5 
                          ? 'linear-gradient(90deg, rgba(239, 68, 68, 0.9) 0%, rgba(220, 38, 38, 0.9) 100%)'
                          : formData.probabilidad6Meses < 8
                          ? 'linear-gradient(90deg, rgba(251, 191, 36, 0.9) 0%, rgba(245, 158, 11, 0.9) 100%)'
                          : 'linear-gradient(90deg, rgba(34, 197, 94, 0.9) 0%, rgba(22, 163, 74, 0.9) 100%)',
                        boxShadow: `0 0 30px rgba(255, 180, 70, ${0.3 + (formData.probabilidad6Meses / 20)})`,
                      }}
                    />
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.probabilidad6Meses}
                    onChange={(e) => updateField('probabilidad6Meses', parseInt(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-9 h-9 rounded-full pointer-events-none transition-all duration-300"
                    style={{
                      left: `calc(${((formData.probabilidad6Meses - 1) / 9) * 100}% - 18px)`,
                      background: 'linear-gradient(135deg, rgba(255, 220, 120, 0.98) 0%, rgba(255, 180, 80, 0.98) 100%)',
                      border: '2.5px solid rgba(255, 200, 100, 0.5)',
                      boxShadow: `0 4px 20px rgba(0,0,0,0.4), 0 0 35px rgba(255, 180, 70, 0.7)`,
                    }}
                  >
                    <div className="absolute inset-2 bg-gradient-to-br from-yellow-200 to-orange-300 rounded-full" />
                  </div>
                </div>

                <div className="flex justify-between px-1 text-xs text-white/30">
                  <span>1</span>
                  <span>3</span>
                  <span>5</span>
                  <span>7</span>
                  <span>10</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Motivación seguir - Textarea */}
          {step === 4 && (
            <div className="animate-fadeIn space-y-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">
                  Recuerda el día que me conociste...
                </h2>
                <p className="text-white/50 text-sm">
                  ¿Qué te motivó a seguirme?
                </p>
              </div>

              <div>
                <textarea
                  value={formData.motivacionSeguir}
                  onChange={(e) => updateField('motivacionSeguir', e.target.value)}
                  placeholder="Escribe aquí..."
                  rows={6}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-orange-400/50 transition-all duration-200 hover:bg-white/[0.07] resize-none"
                />
                <p className="text-white/30 text-xs mt-2 text-right">
                  {formData.motivacionSeguir.length} caracteres (mín. 10)
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Ayuda de Portal - Textarea */}
          {step === 5 && (
            <div className="animate-fadeIn space-y-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">
                  En una frase, ¿a qué te ha ayudado Portal Culture hasta ahora?
                </h2>
                <p className="text-white/50 text-sm">
                  Sé específico
                </p>
              </div>

              <div>
                <textarea
                  value={formData.ayudaPortal}
                  onChange={(e) => updateField('ayudaPortal', e.target.value)}
                  placeholder="Portal Culture me ha ayudado a..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-orange-400/50 transition-all duration-200 hover:bg-white/[0.07] resize-none"
                />
                <p className="text-white/30 text-xs mt-2 text-right">
                  {formData.ayudaPortal.length} caracteres (mín. 10)
                </p>
              </div>
            </div>
          )}

          {/* Step 6: Menos gustado - Textarea */}
          {step === 6 && (
            <div className="animate-fadeIn space-y-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">
                  ¿Cuál es el apartado que menos te ha gustado de Portal Culture?
                </h2>
                <p className="text-white/50 text-sm">
                  Algo que necesite más valor o revisarlo
                </p>
              </div>

              <div>
                <textarea
                  value={formData.menosGustado}
                  onChange={(e) => updateField('menosGustado', e.target.value)}
                  placeholder="Lo que menos me ha gustado es..."
                  rows={5}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-orange-400/50 transition-all duration-200 hover:bg-white/[0.07] resize-none"
                />
                <p className="text-white/30 text-xs mt-2 text-right">
                  {formData.menosGustado.length} caracteres (mín. 10)
                </p>
              </div>
            </div>
          )}

          {/* Step 7: Preferencia aprendizaje - Radio buttons */}
          {step === 7 && (
            <div className="animate-fadeIn space-y-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">
                  ¿Cómo prefieres aprender?
                </h2>
                <p className="text-white/50 text-sm">
                  Elige tu formato favorito
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {aprendizajeOptions.map((option, idx) => {
                  const isSelected = formData.preferenciaAprendizaje === option
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => updateField('preferenciaAprendizaje', option)}
                      className={`p-5 rounded-xl border transition-all duration-200 text-left ${
                        isSelected
                          ? 'bg-gradient-to-br from-orange-500/20 to-amber-500/20 border-orange-400/50 shadow-lg shadow-orange-500/20'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Radio custom */}
                        <div 
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                            isSelected
                              ? 'border-orange-400 bg-gradient-to-br from-orange-400 to-amber-500'
                              : 'border-white/30'
                          }`}
                        >
                          {isSelected && (
                            <div className="w-2.5 h-2.5 bg-black rounded-full" />
                          )}
                        </div>
                        
                        <span className={`font-medium ${isSelected ? 'text-white' : 'text-white/70'}`}>
                          {option}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 8: Vida en 2 años - Textarea final */}
          {step === 8 && (
            <div className="animate-fadeIn space-y-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">
                  Describe la vida que vas a tener en 2 años
                </h2>
                <p className="text-white/50 text-sm leading-relaxed">
                  Imagínate que pudieras manifestarla con precisión, ¿cómo sería?<br/>
                  <span className="text-orange-400/80">Te leo 👀</span>
                </p>
              </div>

              <div>
                <textarea
                  value={formData.vidaEn2Anos}
                  onChange={(e) => updateField('vidaEn2Anos', e.target.value)}
                  placeholder="En 2 años, mi vida será..."
                  rows={8}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-orange-400/50 transition-all duration-200 hover:bg-white/[0.07] resize-none"
                />
                <p className="text-white/30 text-xs mt-2 text-right">
                  {formData.vidaEn2Anos.length} caracteres (mín. 20)
                </p>
              </div>

              <div 
                className="p-4 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 200, 87, 0.1) 0%, rgba(255, 150, 50, 0.05) 100%)',
                  border: '1px solid rgba(255, 200, 100, 0.2)',
                }}
              >
                <p className="text-white/70 text-sm text-center">
                  💡 <strong>Tip:</strong> Sé específico. Cuanto más detalle, más real se vuelve.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mt-8">
          {step > 1 && (
            <button
              onClick={prevStep}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all duration-200"
            >
              ← Anterior
            </button>
          )}
          
          {step < totalSteps ? (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-200 ${
                canProceed()
                  ? 'bg-gradient-to-r from-yellow-300 via-orange-400 to-amber-500 text-black hover:shadow-xl hover:shadow-orange-400/20 hover:scale-[1.02]'
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              Siguiente →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-200 ${
                canProceed() && !isSubmitting
                  ? 'bg-gradient-to-r from-yellow-300 via-orange-400 to-amber-500 text-black hover:shadow-xl hover:shadow-orange-400/20 hover:scale-[1.02]'
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar y recibir regalo 🎁'}
            </button>
          )}
        </div>
      </div>

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
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(10px, -10px) scale(1.05); }
          50% { transform: translate(-5px, 10px) scale(0.95); }
          75% { transform: translate(-10px, -5px) scale(1.02); }
        }
      `}</style>
    </main>
  )
}
