export default function AuthCodeError() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Error de Verificación
          </h1>
          <p className="text-white/60 mb-6">
            No pudimos verificar tu cuenta. El enlace puede haber expirado o ser inválido.
          </p>
        </div>

        <div className="space-y-3">
          <a
            href="/login"
            className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:opacity-90 transition"
          >
            Volver al Login
          </a>
          <a
            href="mailto:mysticcbrand@gmail.com"
            className="block w-full bg-white/5 text-white py-3 px-6 rounded-xl font-medium hover:bg-white/10 transition"
          >
            Contactar Soporte
          </a>
        </div>
      </div>
    </div>
  )
}
