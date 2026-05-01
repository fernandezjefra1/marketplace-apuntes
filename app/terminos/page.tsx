'use client'
export default function Terminos() {
  return (
    <div className="min-h-screen bg-white">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📖</span>
            <span className="font-bold text-gray-800 text-lg">ApuntesUA</span>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="text-sm text-gray-500 hover:text-gray-700 transition"
          >
            Volver al inicio
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Terminos y Condiciones</h1>
          <p className="text-gray-400 text-sm">Ultima actualizacion: Mayo 2026</p>
        </div>

        <div className="space-y-8 text-gray-600 text-sm leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">1. Acerca de ApuntesUA</h2>
            <p>ApuntesUA es una plataforma digital de marketplace de apuntes academicos exclusiva para estudiantes de la Universidad Autonoma del Peru. Nuestra mision es facilitar el acceso al conocimiento academico y permitir que los estudiantes moneticen su esfuerzo intelectual.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">2. Elegibilidad</h2>
            <p>Para usar ApuntesUA debes ser estudiante activo de la Universidad Autonoma del Peru y contar con un correo institucional valido terminado en <strong>@autonoma.edu.pe</strong>. Nos reservamos el derecho de suspender cuentas que no cumplan este requisito.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">3. Contenido y Propiedad Intelectual</h2>
            <p className="mb-3">Al subir apuntes a la plataforma, el usuario declara que:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Es el autor original del contenido o tiene permisos para compartirlo.</li>
              <li>El contenido no infringe derechos de autor de terceros, incluyendo material de profesores o libros de texto reproducidos integralmente.</li>
              <li>Otorga a ApuntesUA una licencia no exclusiva para mostrar y distribuir el contenido en la plataforma.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">4. Modelo de Comisiones</h2>
            <p>ApuntesUA opera bajo un modelo de comision sobre ventas:</p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="rounded-xl p-4 text-center" style={{ backgroundColor: '#FFF7ED' }}>
                <p className="text-2xl font-bold mb-1" style={{ color: '#EA580C' }}>70%</p>
                <p className="text-sm font-semibold text-gray-700">Para el creador</p>
                <p className="text-xs text-gray-400 mt-1">Del precio de venta</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold mb-1 text-gray-700">30%</p>
                <p className="text-sm font-semibold text-gray-700">Para ApuntesUA</p>
                <p className="text-xs text-gray-400 mt-1">Por el servicio de la plataforma</p>
              </div>
            </div>
            <p className="mt-4">El precio minimo para apuntes de pago es de <strong>S/. 3.00</strong>. Los apuntes gratuitos no generan comision.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">5. Conducta del Usuario</h2>
            <p className="mb-3">Esta prohibido en la plataforma:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Subir contenido plagiado, ofensivo o inapropiado.</li>
              <li>Crear multiples cuentas para manipular el sistema de valoraciones.</li>
              <li>Intentar evadir el sistema de pagos de la plataforma.</li>
              <li>Compartir credenciales de acceso con terceros.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">6. Privacidad de Datos</h2>
            <p>ApuntesUA recopila unicamente los datos necesarios para el funcionamiento de la plataforma: correo electronico institucional y contenido subido por el usuario. No vendemos ni compartimos datos personales con terceros. Los datos son almacenados de forma segura mediante Supabase.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">7. Pagos y Reembolsos</h2>
            <p>Los pagos se procesan a traves de pasarelas de pago seguras. Una vez completada una compra, no se aceptan reembolsos salvo que el contenido adquirido no corresponda a lo descrito en la publicacion. En ese caso, el usuario puede reportar el problema a nuestro equipo.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">8. Modificaciones</h2>
            <p>ApuntesUA se reserva el derecho de modificar estos terminos en cualquier momento. Los cambios seran notificados a los usuarios mediante correo electronico institucional.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">9. Contacto</h2>
            <p>Para consultas sobre estos terminos puedes contactarnos a traves de tu correo institucional. Responderemos en un plazo maximo de 48 horas habiles.</p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 text-center">
          <p className="text-gray-400 text-xs">ApuntesUA — Universidad Autonoma del Peru — 2026</p>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-4 text-white px-8 py-3 rounded-xl font-semibold text-sm"
            style={{ backgroundColor: '#EA580C' }}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  )
}