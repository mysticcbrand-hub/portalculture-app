'use client'

import Link from 'next/link'
import MeshGradient from '@/components/MeshGradient'

export default function PrivacidadPage() {
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
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Política de Privacidad</h1>
          <p className="text-white/40 text-sm">Última actualización: 25 de enero de 2026</p>
        </div>

        <div className="prose prose-invert prose-sm md:prose-base max-w-none">
          {/* Intro */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 mb-8">
            <p className="text-white/60 leading-relaxed m-0">
              En Portal Culture nos tomamos muy en serio tu privacidad. Esta política describe cómo recopilamos, usamos, almacenamos y protegemos tu información personal cuando utilizas nuestra plataforma.
            </p>
          </div>

          {/* Section 1 */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">1</span>
              Responsable del Tratamiento
            </h2>
            <div className="space-y-3 text-white/50 pl-11">
              <p>El responsable del tratamiento de tus datos personales es <strong className="text-white/70">Portal Culture</strong>, una plataforma de desarrollo personal con sede en España.</p>
              <p>Para cualquier consulta relacionada con la protección de datos, puedes contactarnos a través de nuestra comunidad oficial de Discord o los canales de soporte de la Plataforma.</p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">2</span>
              Datos que Recopilamos
            </h2>
            <div className="space-y-4 text-white/50 pl-11">
              <div>
                <p className="font-medium text-white/70 mb-2">Datos de registro:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Nombre o apodo</li>
                  <li>Dirección de correo electrónico</li>
                  <li>Número de teléfono (opcional, exclusivamente para contacto directo en caso necesario)</li>
                  <li>Contraseña (almacenada de forma encriptada)</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-white/70 mb-2">Datos del cuestionario de admisión:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Rango de edad</li>
                  <li>Autoevaluación de tu vida actual</li>
                  <li>Respuestas sobre tu situación personal</li>
                  <li>Motivaciones para unirte a la comunidad</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-white/70 mb-2">Datos técnicos y de uso:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Dirección IP</li>
                  <li>Tipo de navegador y dispositivo</li>
                  <li>Páginas visitadas y tiempo de uso</li>
                  <li>Interacciones con el contenido</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-white/70 mb-2">Datos de pago:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Procesados por terceros (Whop) - no almacenamos datos de tarjeta</li>
                  <li>Historial de transacciones</li>
                  <li>Estado de la suscripción</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">3</span>
              Finalidad del Tratamiento
            </h2>
            <div className="space-y-3 text-white/50 pl-11">
              <p>De conformidad con el artículo 13 del Reglamento General de Protección de Datos (RGPD), utilizamos tus datos para:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-white/70">Gestionar tu cuenta:</strong> Crear y mantener tu perfil de usuario, autenticación y acceso a la Plataforma.</li>
                <li><strong className="text-white/70">Proceso de admisión:</strong> Evaluar las solicitudes de acceso a través de la lista de espera.</li>
                <li><strong className="text-white/70">Prestación de servicios:</strong> Darte acceso a los cursos, comunidad y herramientas.</li>
                <li><strong className="text-white/70">Contacto:</strong> Utilizar tu número de teléfono exclusivamente para contacto directo en caso de ser necesario para la gestión de tu cuenta.</li>
                <li><strong className="text-white/70">Mejora del servicio:</strong> Analizar el uso de la Plataforma para mejorar la experiencia.</li>
                <li><strong className="text-white/70">Seguridad:</strong> Proteger la Plataforma y a los usuarios de actividades fraudulentas.</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">4</span>
              Base Legal
            </h2>
            <div className="space-y-3 text-white/50 pl-11">
              <p>Según el artículo 6 del RGPD (Reglamento UE 2016/679), el tratamiento de tus datos se basa en:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-white/70">Ejecución de contrato (Art. 6.1.b RGPD):</strong> Para prestarte los servicios solicitados.</li>
                <li><strong className="text-white/70">Consentimiento (Art. 6.1.a RGPD):</strong> Para tratamientos específicos que requieran tu autorización expresa.</li>
                <li><strong className="text-white/70">Interés legítimo (Art. 6.1.f RGPD):</strong> Para mejorar nuestros servicios y garantizar la seguridad.</li>
                <li><strong className="text-white/70">Obligación legal (Art. 6.1.c RGPD):</strong> Cuando sea necesario cumplir con la legislación aplicable.</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">5</span>
              Compartición de Datos
            </h2>
            <div className="space-y-3 text-white/50 pl-11">
              <p>No vendemos ni alquilamos tus datos personales. Solo compartimos información con:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-white/70">Proveedores de servicios:</strong>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Supabase (autenticación y base de datos)</li>
                    <li>Vercel (hosting)</li>
                    <li>Whop (procesamiento de pagos)</li>
                    <li>Discord (comunidad)</li>
                    <li>Mailerlite (gestión de suscriptores - ver sección específica)</li>
                  </ul>
                </li>
                <li><strong className="text-white/70">Autoridades:</strong> Cuando sea requerido por ley o para proteger nuestros derechos.</li>
              </ul>
              <p>Todos nuestros proveedores están sujetos a acuerdos de protección de datos y solo procesan información según nuestras instrucciones.</p>
              
              <div className="mt-6 p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                <p className="font-medium text-white/70 mb-2">📧 Sobre Mailerlite</p>
                <p className="text-sm">Al registrarte en Portal Culture, tu dirección de correo electrónico se añade automáticamente a nuestra lista de suscriptores en Mailerlite (cuenta: holaaanxo@gmail.com). Esto nos permite enviarte información relevante sobre tu cuenta y la plataforma. Mailerlite cumple con el RGPD y puedes darte de baja en cualquier momento usando el enlace de cancelación de suscripción incluido en cada email.</p>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">6</span>
              Transferencias Internacionales
            </h2>
            <div className="space-y-3 text-white/50 pl-11">
              <p>Algunos de nuestros proveedores pueden procesar datos fuera del Espacio Económico Europeo. En estos casos, nos aseguramos de que existan garantías adecuadas:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Decisiones de adecuación de la Comisión Europea</li>
                <li>Cláusulas contractuales tipo aprobadas por la UE</li>
                <li>Certificaciones como el EU-US Data Privacy Framework</li>
              </ul>
            </div>
          </section>

          {/* Section 7 */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">7</span>
              Conservación de Datos
            </h2>
            <div className="space-y-3 text-white/50 pl-11">
              <p>Conservamos tus datos durante el tiempo necesario para cumplir con las finalidades descritas:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-white/70">Datos de cuenta:</strong> Mientras mantengas tu cuenta activa y durante 3 años adicionales tras su eliminación.</li>
                <li><strong className="text-white/70">Datos del cuestionario:</strong> Durante el proceso de admisión y 1 año adicional para solicitudes rechazadas.</li>
                <li><strong className="text-white/70">Datos de facturación:</strong> 5 años según obligaciones fiscales.</li>
                <li><strong className="text-white/70">Datos de uso:</strong> 2 años para análisis y mejora del servicio.</li>
              </ul>
            </div>
          </section>

          {/* Section 8 */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">8</span>
              Tus Derechos
            </h2>
            <div className="space-y-3 text-white/50 pl-11">
              <p>De acuerdo con los artículos 15 a 22 del RGPD y la Ley Orgánica 3/2018 de Protección de Datos (LOPDGDD), tienes derecho a:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-white/70">Acceso:</strong> Solicitar una copia de tus datos personales.</li>
                <li><strong className="text-white/70">Rectificación:</strong> Corregir datos inexactos o incompletos.</li>
                <li><strong className="text-white/70">Supresión:</strong> Solicitar la eliminación de tus datos («derecho al olvido»).</li>
                <li><strong className="text-white/70">Limitación:</strong> Restringir el tratamiento en determinadas circunstancias.</li>
                <li><strong className="text-white/70">Portabilidad:</strong> Recibir tus datos en formato estructurado.</li>
                <li><strong className="text-white/70">Oposición:</strong> Oponerte al tratamiento basado en interés legítimo.</li>
                <li><strong className="text-white/70">Retirar consentimiento:</strong> En cualquier momento, sin afectar la licitud del tratamiento previo.</li>
              </ul>
              <p>Para ejercer estos derechos, contacta con nosotros a través de los canales de soporte. Responderemos en un plazo máximo de 30 días.</p>
              <p>También tienes derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD) si consideras que tus derechos han sido vulnerados.</p>
            </div>
          </section>

          {/* Section 9 */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">9</span>
              Seguridad
            </h2>
            <div className="space-y-3 text-white/50 pl-11">
              <p>Implementamos medidas técnicas y organizativas para proteger tus datos:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Encriptación de datos en tránsito (HTTPS/TLS)</li>
                <li>Contraseñas hasheadas con algoritmos seguros</li>
                <li>Acceso restringido a datos personales</li>
                <li>Monitorización y auditoría de accesos</li>
                <li>Copias de seguridad regulares</li>
                <li>Infraestructura en proveedores certificados</li>
              </ul>
              <p>A pesar de nuestros esfuerzos, ningún sistema es 100% seguro. En caso de brecha de seguridad que afecte a tus datos, te notificaremos según los requisitos legales.</p>
            </div>
          </section>

          {/* Section 10 */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">10</span>
              Cookies y Tecnologías Similares
            </h2>
            <div className="space-y-3 text-white/50 pl-11">
              <p>Utilizamos cookies y tecnologías similares para:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-white/70">Cookies esenciales:</strong> Necesarias para el funcionamiento de la Plataforma (autenticación, sesión).</li>
                <li><strong className="text-white/70">Cookies analíticas:</strong> Para entender cómo usas la Plataforma y mejorarla.</li>
                <li><strong className="text-white/70">Cookies de preferencias:</strong> Para recordar tus configuraciones.</li>
              </ul>
              <p>Puedes configurar tu navegador para rechazar cookies, aunque esto puede afectar la funcionalidad de la Plataforma.</p>
            </div>
          </section>

          {/* Section 11 */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">11</span>
              Cambios en esta Política
            </h2>
            <div className="space-y-3 text-white/50 pl-11">
              <p>Podemos actualizar esta política de privacidad periódicamente. Los cambios significativos serán notificados a través de la Plataforma o por correo electrónico antes de entrar en vigor.</p>
              <p>Te recomendamos revisar esta política regularmente para estar informado sobre cómo protegemos tu información.</p>
            </div>
          </section>

          {/* Section 12 */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">12</span>
              Contacto
            </h2>
            <div className="space-y-3 text-white/50 pl-11">
              <p>Para cualquier consulta sobre privacidad o protección de datos:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Comunidad oficial de Discord</li>
                <li>Canales de soporte dentro de la Plataforma</li>
              </ul>
              <p>Nos comprometemos a responder a todas las consultas en un plazo razonable.</p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-white/[0.06]">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <p className="text-white/30 text-sm">© 2026 Portal Culture. Todos los derechos reservados.</p>
            <div className="flex gap-6">
              <Link href="/terminos" className="text-white/40 hover:text-white/70 text-sm transition-colors">
                Términos y Condiciones
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
