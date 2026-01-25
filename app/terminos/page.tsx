'use client'

import Link from 'next/link'
import MeshGradient from '@/components/MeshGradient'

export default function TerminosPage() {
  return (
    <main className="min-h-screen relative">
      <MeshGradient variant="subtle" intensity="low" />
      
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-black/60 border-b border-white/[0.04]">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <svg className="w-5 h-5 text-white/40 group-hover:text-white/70 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-white/60 group-hover:text-white transition-colors text-sm">Volver</span>
          </Link>
          <span className="text-lg font-bold text-white tracking-tight">Portal Culture</span>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Términos y Condiciones de Uso</h1>
          <p className="text-white/40 text-sm">Última actualización: 25 de enero de 2026</p>
        </div>

        <div className="prose prose-invert prose-sm md:prose-base max-w-none">
          {/* Intro */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 mb-8">
            <p className="text-white/60 leading-relaxed m-0">
              Bienvenido a Portal Culture. Al acceder y utilizar nuestra plataforma, aceptas estos términos y condiciones en su totalidad. Si no estás de acuerdo con alguna parte de estos términos, no debes usar nuestros servicios.
            </p>
          </div>

          {/* Section 1 */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">1</span>
              Definiciones
            </h2>
            <div className="space-y-3 text-white/50 pl-11">
              <p><strong className="text-white/70">«Portal Culture»</strong>, <strong className="text-white/70">«nosotros»</strong> o <strong className="text-white/70">«la Plataforma»</strong> se refiere a la comunidad de desarrollo personal operada bajo este nombre.</p>
              <p><strong className="text-white/70">«Usuario»</strong>, <strong className="text-white/70">«tú»</strong> o <strong className="text-white/70">«miembro»</strong> se refiere a cualquier persona que acceda, se registre o utilice la Plataforma.</p>
              <p><strong className="text-white/70">«Contenido»</strong> incluye todos los cursos, materiales educativos, recursos, comunicaciones y cualquier otro material disponible en la Plataforma.</p>
              <p><strong className="text-white/70">«Servicios»</strong> incluye el acceso a los 5 Templos, la comunidad Discord, NOVA AI y cualquier otra funcionalidad ofrecida.</p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">2</span>
              Elegibilidad y Registro
            </h2>
            <div className="space-y-3 text-white/50 pl-11">
              <p>Para usar Portal Culture, debes:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Proporcionar información veraz y actualizada durante el registro.</li>
                <li>Mantener la confidencialidad de tu cuenta y contraseña.</li>
                <li>Ser admitido a través de nuestro proceso de selección (lista de espera) o mediante pago directo.</li>
              </ul>
              <p>Nos reservamos el derecho de rechazar o revocar el acceso a cualquier usuario sin necesidad de justificación, de conformidad con la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información (LSSI).</p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">3</span>
              Acceso y Modalidades
            </h2>
            <div className="space-y-3 text-white/50 pl-11">
              <p><strong className="text-white/70">Acceso de Pago (17€):</strong> Otorga acceso inmediato y permanente a todos los servicios de la Plataforma. Este es un pago único, no recurrente.</p>
              <p><strong className="text-white/70">Lista de Espera (Gratuito):</strong> Los usuarios pueden solicitar acceso gratuito completando un cuestionario. La aprobación está sujeta a revisión manual y no está garantizada. El tiempo de espera típico es de 3-7 días.</p>
              <p>Ambas modalidades otorgan los mismos beneficios una vez aprobado el acceso.</p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">4</span>
              Uso Aceptable
            </h2>
            <div className="space-y-3 text-white/50 pl-11">
              <p>Al usar Portal Culture, te comprometes a:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>No compartir, redistribuir o revender el contenido de la Plataforma.</li>
                <li>No grabar, capturar o reproducir los materiales sin autorización expresa.</li>
                <li>Mantener un comportamiento respetuoso en la comunidad Discord.</li>
                <li>No utilizar la Plataforma para actividades ilegales o dañinas.</li>
                <li>No intentar acceder a cuentas de otros usuarios o sistemas internos.</li>
                <li>No hacer spam, acoso o conductas que afecten negativamente a otros miembros.</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">5</span>
              Propiedad Intelectual
            </h2>
            <div className="space-y-3 text-white/50 pl-11">
              <p>Todo el contenido de Portal Culture, incluyendo pero no limitado a:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Cursos, videos, textos y materiales educativos</li>
                <li>Diseños, logotipos e identidad visual</li>
                <li>Software, código y tecnología propietaria (incluyendo NOVA AI)</li>
                <li>Metodologías y sistemas de enseñanza</li>
              </ul>
              <p>Están protegidos por derechos de autor y son propiedad exclusiva de Portal Culture. El acceso a la Plataforma no transfiere ningún derecho de propiedad intelectual al usuario.</p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">6</span>
              Pagos y Reembolsos
            </h2>
            <div className="space-y-3 text-white/50 pl-11">
              <p>Los pagos se procesan a través de plataformas de pago seguras (Whop). Al realizar un pago:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Confirmas que estás autorizado a usar el método de pago proporcionado.</li>
                <li>Aceptas que el pago de 17€ es único y otorga acceso de por vida.</li>
                <li>Los reembolsos se considerarán caso por caso dentro de los primeros 7 días si no has accedido al contenido principal.</li>
              </ul>
              <p>Para solicitar un reembolso, contacta con nosotros a través de los canales oficiales.</p>
            </div>
          </section>

          {/* Section 7 */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">7</span>
              Limitación de Responsabilidad
            </h2>
            <div className="space-y-3 text-white/50 pl-11">
              <p>Portal Culture proporciona contenido educativo y de desarrollo personal con fines informativos. No garantizamos resultados específicos, ya que estos dependen del esfuerzo individual de cada usuario.</p>
              <p>No somos responsables de:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Decisiones que tomes basándote en nuestro contenido.</li>
                <li>Pérdidas económicas, emocionales o de cualquier tipo derivadas del uso de la Plataforma.</li>
                <li>Interrupciones temporales del servicio por mantenimiento o causas técnicas.</li>
                <li>Conductas de otros usuarios en la comunidad.</li>
              </ul>
            </div>
          </section>

          {/* Section 8 */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">8</span>
              Suspensión y Terminación
            </h2>
            <div className="space-y-3 text-white/50 pl-11">
              <p>Nos reservamos el derecho de suspender o terminar tu acceso a la Plataforma si:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Violas estos términos y condiciones.</li>
                <li>Compartes tu cuenta o contenido con terceros no autorizados.</li>
                <li>Tu comportamiento afecta negativamente a la comunidad.</li>
                <li>Realizas actividades fraudulentas o ilegales.</li>
              </ul>
              <p>En caso de terminación por violación de términos, no tendrás derecho a reembolso.</p>
            </div>
          </section>

          {/* Section 9 */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">9</span>
              Modificaciones
            </h2>
            <div className="space-y-3 text-white/50 pl-11">
              <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios significativos serán notificados a través de la Plataforma o por correo electrónico.</p>
              <p>El uso continuado de Portal Culture después de cualquier modificación constituye tu aceptación de los nuevos términos.</p>
            </div>
          </section>

          {/* Section 10 */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">10</span>
              Ley Aplicable y Jurisdicción
            </h2>
            <div className="space-y-3 text-white/50 pl-11">
              <p>Estos términos se rigen por la legislación española, en particular por el Real Decreto Legislativo 1/2007 (Ley General para la Defensa de los Consumidores y Usuarios), la Ley 34/2002 (LSSI) y el Código Civil español.</p>
              <p>Cualquier disputa será sometida a la jurisdicción exclusiva de los tribunales de España, sin perjuicio de los derechos que pudieran corresponder al usuario según la normativa de protección de consumidores de su país de residencia.</p>
            </div>
          </section>

          {/* Section 11 */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">11</span>
              Contacto
            </h2>
            <div className="space-y-3 text-white/50 pl-11">
              <p>Para cualquier consulta relacionada con estos términos, puedes contactarnos a través de:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Nuestra comunidad oficial de Discord</li>
                <li>Los canales de soporte dentro de la Plataforma</li>
              </ul>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-white/[0.06]">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <p className="text-white/30 text-sm">© 2026 Portal Culture. Todos los derechos reservados.</p>
            <div className="flex gap-6">
              <Link href="/privacidad" className="text-white/40 hover:text-white/70 text-sm transition-colors">
                Política de Privacidad
              </Link>
              <Link href="/" className="text-white/40 hover:text-white/70 text-sm transition-colors">
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
