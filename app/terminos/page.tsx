'use client'

const SECCIONES = [
  {
    num: '01', title: 'Acerca de ApuntesUA',
    content: 'ApuntesUA es una plataforma digital de marketplace de apuntes académicos exclusiva para estudiantes de la Universidad Autónoma del Perú. Nuestra misión es facilitar el acceso al conocimiento académico y permitir que los estudiantes moneticen su esfuerzo intelectual.',
  },
  {
    num: '02', title: 'Elegibilidad',
    content: 'Para usar ApuntesUA debes ser estudiante activo de la Universidad Autónoma del Perú y contar con un correo institucional válido terminado en @autonoma.edu.pe. Nos reservamos el derecho de suspender cuentas que no cumplan este requisito.',
  },
  {
    num: '03', title: 'Contenido y Propiedad Intelectual',
    content: 'Al subir apuntes a la plataforma, el usuario declara que es el autor original del contenido o tiene permisos para compartirlo, que el contenido no infringe derechos de autor de terceros, y que otorga a ApuntesUA una licencia no exclusiva para mostrar y distribuir el contenido en la plataforma.',
  },
  {
    num: '05', title: 'Conducta del Usuario',
    content: 'Está prohibido en la plataforma subir contenido plagiado, ofensivo o inapropiado; crear múltiples cuentas para manipular el sistema de valoraciones; intentar evadir el sistema de pagos; y compartir credenciales de acceso con terceros.',
  },
  {
    num: '06', title: 'Privacidad de Datos',
    content: 'ApuntesUA recopila únicamente los datos necesarios para el funcionamiento de la plataforma: correo electrónico institucional y contenido subido por el usuario. No vendemos ni compartimos datos personales con terceros. Los datos son almacenados de forma segura mediante Supabase.',
  },
  {
    num: '07', title: 'Pagos y Reembolsos',
    content: 'Los pagos se procesan a través de pasarelas de pago seguras. Una vez completada una compra, no se aceptan reembolsos salvo que el contenido adquirido no corresponda a lo descrito en la publicación. En ese caso, el usuario puede reportar el problema a nuestro equipo.',
  },
  {
    num: '08', title: 'Modificaciones',
    content: 'ApuntesUA se reserva el derecho de modificar estos términos en cualquier momento. Los cambios serán notificados a los usuarios mediante correo electrónico institucional.',
  },
  {
    num: '09', title: 'Contacto',
    content: 'Para consultas sobre estos términos puedes contactarnos a través de tu correo institucional. Responderemos en un plazo máximo de 48 horas hábiles.',
  },
]

export default function Terminos() {
  return (
    <>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp .5s ease forwards }
        .section-card { transition: all .2s ease }
        .section-card:hover { transform: translateX(4px) }
      `}</style>

      <div className="min-h-screen" style={{ background: 'linear-gradient(160deg,#FFF7ED 0%,#FFFBF5 20%,#F9FAFB 50%)' }}>

        {/* ── NAVBAR ── */}
        <nav className="sticky top-0 z-50 border-b border-orange-100/60"
          style={{ backgroundColor: 'rgba(255,251,245,.88)', backdropFilter: 'blur(16px)' }}>
          <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.location.href = '/'}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black"
                style={{ background: 'linear-gradient(135deg,#C2410C,#EA580C,#F97316)' }}>A</div>
              <span className="font-black text-gray-800">ApuntesUA</span>
            </div>
            <button onClick={() => window.location.href = '/'}
              className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition">
              ← Volver al inicio
            </button>
          </div>
        </nav>

        {/* ── HERO ── */}
        <div className="max-w-4xl mx-auto px-6 pt-12 pb-8">
          <div className="rounded-3xl p-8 mb-10 relative overflow-hidden fade-up"
            style={{ background: 'linear-gradient(135deg,#9A3412,#C2410C,#EA580C,#F97316)' }}>
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" />
            <div className="absolute right-16 -bottom-10 w-28 h-28 rounded-full bg-white/10" />
            <div className="relative z-10">
              <p className="text-orange-200 text-xs font-bold uppercase tracking-widest mb-2">Legal</p>
              <h1 className="text-white font-black text-3xl mb-2">Términos y Condiciones</h1>
              <p className="text-orange-200 text-sm">Última actualización: Mayo 2026</p>
            </div>
          </div>

          {/* Modelo de comisiones destacado */}
          <div className="bg-white rounded-3xl border border-gray-100 p-8 mb-8 fade-up"
            style={{ boxShadow: '0 4px 32px rgba(0,0,0,.06)', animationDelay: '.1s' }}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black"
                style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)' }}>04</div>
              <h2 className="font-black text-gray-800 text-lg">Modelo de Comisiones</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="rounded-2xl p-6 text-center" style={{ background: 'linear-gradient(135deg,#15803D,#16A34A)' }}>
                <p className="text-5xl font-black text-white mb-1">70%</p>
                <p className="text-green-100 font-bold text-sm">Para el creador</p>
                <p className="text-green-200 text-xs mt-1">Del precio de venta</p>
              </div>
              <div className="rounded-2xl p-6 text-center relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg,#C2410C,#EA580C)' }}>
                <p className="text-5xl font-black text-white mb-1">30%</p>
                <p className="text-orange-100 font-bold text-sm">Para ApuntesUA</p>
                <p className="text-orange-200 text-xs mt-1">Por el servicio</p>
              </div>
            </div>

            {/* Barra */}
            <div className="h-3 rounded-full overflow-hidden flex" style={{ backgroundColor: '#F3F4F6' }}>
              <div className="h-full" style={{ width: '70%', background: 'linear-gradient(90deg,#15803D,#22C55E)' }} />
              <div className="h-full" style={{ width: '30%', background: 'linear-gradient(90deg,#EA580C,#F97316)' }} />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-green-600 font-medium">Creadores 70%</span>
              <span className="text-xs text-orange-600 font-medium">Plataforma 30%</span>
            </div>
            <p className="text-gray-500 text-sm mt-4 text-center">
              El precio mínimo para apuntes de pago varía según la evaluación de la IA. Los apuntes gratuitos no generan comisión.
            </p>
          </div>

          {/* Secciones */}
          <div className="space-y-4">
            {SECCIONES.map((s, i) => (
              <div key={s.num} className="section-card bg-white rounded-2xl border border-gray-100 p-6 fade-up"
                style={{ boxShadow: '0 2px 16px rgba(0,0,0,.04)', animationDelay: `${.1 + i * .06}s` }}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-black flex-shrink-0 mt-0.5"
                    style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)' }}>
                    {s.num}
                  </div>
                  <div>
                    <h2 className="font-black text-gray-800 text-base mb-2">{s.title}</h2>
                    <p className="text-gray-500 text-sm leading-relaxed">{s.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer CTA */}
          <div className="text-center mt-12 pb-12">
            <p className="text-gray-400 text-xs mb-4">ApuntesUA · Universidad Autónoma del Perú · 2026</p>
            <button onClick={() => window.location.href = '/'}
              className="text-white px-8 py-3.5 rounded-2xl font-bold text-sm hover:opacity-90 transition-all hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)', boxShadow: '0 6px 20px rgba(234,88,12,.3)' }}>
              Volver al inicio →
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
