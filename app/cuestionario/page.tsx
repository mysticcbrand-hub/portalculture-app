'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Types
interface FormData {
  nombre: string
  email: string
  telefono: string
  edad: string
  vidaActual: number
  descripcion: string
  frenos: string[]
  porqueEntrar: string
}

// Age options
const edadOptions = ['16-18', '19-21', '22-25', '26-30', '31+']

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
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    email: '',
    telefono: '',
    edad: '',
    vidaActual: 5,
    descripcion: '',
    frenos: [],
    porqueEntrar: '',
  })

  const totalSteps = 6

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
        return formData.nombre.trim() && formData.email.trim() && formData.telefono.trim()
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

  // Submit form
  const handleSubmit = async () => {
    if (!canProceed()) return
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/waitlist/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.nombre,
          email: formData.email.toLowerCase().trim(),
          phone: formData.telefono,
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

      setIsComplete(true)
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
                  Dónde te contacto
                </h2>
                <p className="text-white/40 text-sm">Información básica para poder comunicarnos</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-white/60 text-sm mb-2">Cómo quieres que te llamemos</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => updateField('nombre', e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-white/25 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-2">Correo electrónico</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-white/25 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-2">Número de teléfono</label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => updateField('telefono', e.target.value)}
                    placeholder="+34 600 000 000"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-white/25 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Age */}
          {step === 2 && (
            <div className="animate-fadeIn space-y-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">
                  Cuántos años tienes
                </h2>
              </div>

              <div className="space-y-3">
                {edadOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => updateField('edad', option)}
                    className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 ${
                      formData.edad === option
                        ? 'bg-white/15 border-white/30 text-white'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/8 hover:border-white/15'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Life Rating */}
          {step === 3 && (
            <div className="animate-fadeIn space-y-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">
                  Del 1 al 10, cómo describirías tu vida actual
                </h2>
                <p className="text-white/40 text-sm">Se honesto. De aquí solo va hacia arriba</p>
              </div>

              <div className="space-y-6">
                <div className="text-center">
                  <span className="text-6xl font-light text-white">{formData.vidaActual}</span>
                </div>
                
                <div className="relative">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.vidaActual}
                    onChange={(e) => updateField('vidaActual', parseInt(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer slider-thumb"
                  />
                  <div className="flex justify-between mt-2 text-xs text-white/30">
                    <span>1</span>
                    <span>10</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Description */}
          {step === 4 && (
            <div className="animate-fadeIn space-y-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">
                  Cuál de estas opciones te describe mejor
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
                  Cuál de estas cosas te está frenando
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
                  Por qué te deberíamos dejar entrar
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
