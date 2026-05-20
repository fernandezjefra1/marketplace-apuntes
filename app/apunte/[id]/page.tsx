'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useParams } from 'next/navigation'

function scoreColor(score: number) {
  if (score >= 90) return { bg: 'linear-gradient(135deg,#15803D,#16A34A)', light: '#F0FDF4', text: '#15803D' }
  if (score >= 75) return { bg: 'linear-gradient(135deg,#2563EB,#3B82F6)', light: '#EFF6FF', text: '#2563EB' }
  if (score >= 60) return { bg: 'linear-gradient(135deg,#CA8A04,#EAB308)', light: '#FEFCE8', text: '#CA8A04' }
  return { bg: 'linear-gradient(135deg,#EA580C,#F97316)', light: '#FFF7ED', text: '#EA580C' }
}

export default function DetalleApunte() {
  const params = useParams()
  const id = params?.id as string

  const [apunte, setApunte]           = useState<any>(null)
  const [user, setUser]               = useState<any>(null)
  const [loading, setLoading]         = useState(true)
  const [yaCompro, setYaCompro]       = useState(false)
  const [valoracion, setValoracion]   = useState(0)
  const [comentario, setComentario]   = useState('')
  const [yaValoro, setYaValoro]       = useState(false)
  const [valoraciones, setValoraciones] = useState<any[]>([])
  const [enviando, setEnviando]       = useState(false)

  useEffect(() => {
    if (!id) return
    const cargar = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) { window.location.href = '/'; return }
      setUser(userData.user)

      const { data: apunteData } = await supabase.from('apuntes').select('*').eq('id', id).single()
      setApunte(apunteData)

      if (apunteData?.precio > 0) {
        const { data: compra } = await supabase.from('compras').select('id').eq('apunte_id', id).eq('comprador_id', userData.user.id).single()
        setYaCompro(!!compra)
      }

      const { data: vals } = await supabase.from('valoraciones').select('*').eq('apunte_id', id)
      setValoraciones(vals || [])
      const yaVal = vals?.find((v: any) => v.usuario_id === userData.user.id)
      if (yaVal) { setYaValoro(true); setValoracion(yaVal.puntuacion) }

      setLoading(false)
    }
    cargar()
  }, [id])

  const handleDescargar = () => { if (apunte?.archivo_url) window.open(apunte.archivo_url, '_blank') }
  const handleComprar   = () => { alert('Pagos con Culqi próximamente!') }

  const handleValorar = async () => {
    if (valoracion === 0) return
    setEnviando(true)
    await supabase.from('valoraciones').insert({ apunte_id: id, usuario_id: user.id, puntuacion: valoracion, comentario })
    setYaValoro(true)
    setEnviando(false)
    const { data: vals } = await supabase.from('valoraciones').select('*').eq('apunte_id', id)
    setValoraciones(vals || [])
  }

  const promedio = valoraciones.length > 0
    ? (valoraciones.reduce((acc, v) => acc + v.puntuacion, 0) / valoraciones.length).toFixed(1)
    : null

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFFBF5' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
        <p className="text-gray-400 text-sm font-medium">Cargando apunte...</p>
      </div>
    </div>
  )

  if (!apunte) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFFBF5' }}>
      <div className="text-center">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-5 mx-auto" style={{ backgroundColor: '#FFF7ED' }}>😕</div>
        <p className="font-black text-gray-800 text-xl mb-2">Apunte no encontrado</p>
        <p className="text-gray-400 text-sm mb-6">El apunte que buscas no existe o fue eliminado</p>
        <button onClick={() => window.location.href = '/dashboard'}
          className="text-white px-6 py-3 rounded-2xl text-sm font-bold hover:opacity-90 transition"
          style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)' }}>
          Volver al marketplace
        </button>
      </div>
    </div>
  )

  const esGratis      = apunte.precio === 0 || apunte.precio === null
  const esDueno       = user?.id === apunte.usuario_id
  const puedeDescargar = esGratis || yaCompro || esDueno
  const cfg           = apunte.score_ia ? scoreColor(apunte.score_ia) : null

  return (
    <>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp .5s ease forwards }
      `}</style>

      <div className="min-h-screen" style={{ background: 'linear-gradient(160deg,#FFF7ED 0%,#FFFBF5 20%,#F9FAFB 50%)' }}>

        {/* ── NAVBAR ── */}
        <nav className="sticky top-0 z-50 border-b border-orange-100/60"
          style={{ backgroundColor: 'rgba(255,251,245,.88)', backdropFilter: 'blur(16px)' }}>
          <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.location.href = '/dashboard'}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black"
                style={{ background: 'linear-gradient(135deg,#C2410C,#EA580C,#F97316)' }}>A</div>
              <span className="font-black text-gray-800">ApuntesUA</span>
            </div>
            <button onClick={() => window.location.href = '/dashboard'}
              className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition flex items-center gap-1">
              ← Volver al marketplace
            </button>
          </div>
        </nav>

        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* ── COLUMNA IZQUIERDA ── */}
            <div className="md:col-span-2 space-y-5">

              {/* Detalle principal */}
              <div className="bg-white rounded-3xl border border-gray-100 p-8 fade-up"
                style={{ boxShadow: '0 4px 32px rgba(0,0,0,.06)' }}>

                <div className="flex flex-wrap gap-2 mb-5">
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full text-white"
                    style={{ background: 'linear-gradient(135deg,#C2410C,#EA580C)' }}>
                    {apunte.carrera || 'General'}
                  </span>
                  {apunte.ciclo && (
                    <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-gray-100 text-gray-600">
                      Ciclo {apunte.ciclo}
                    </span>
                  )}
                  {apunte.curso && (
                    <span className="text-xs font-bold px-3 py-1.5 rounded-full text-white"
                      style={{ backgroundColor: '#EA580C', opacity: 0.8 }}>
                      {apunte.curso}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl font-black text-gray-900 mb-3 leading-tight">{apunte.titulo}</h1>
                {apunte.descripcion && (
                  <p className="text-gray-500 text-sm leading-relaxed mb-6">{apunte.descripcion}</p>
                )}

                {/* Grid de detalles */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { label: 'Carrera', val: apunte.carrera || 'General', icon: '🎓' },
                    { label: 'Ciclo', val: apunte.ciclo || 'No especificado', icon: '📅' },
                    { label: 'Curso', val: apunte.curso || 'No especificado', icon: '📚' },
                    { label: 'Formato', val: 'PDF', icon: '📄' },
                  ].map(d => (
                    <div key={d.label} className="rounded-2xl p-4" style={{ backgroundColor: '#F9FAFB' }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">{d.icon}</span>
                        <p className="text-xs text-gray-400 font-medium">{d.label}</p>
                      </div>
                      <p className="font-bold text-gray-700 text-sm">{d.val}</p>
                    </div>
                  ))}
                </div>

                {/* Score IA si existe */}
                {apunte.score_ia && cfg && (
                  <div className="rounded-2xl overflow-hidden border border-gray-100">
                    <div className="p-5 flex items-center gap-4" style={{ background: cfg.bg }}>
                      <div className="w-14 h-14 rounded-2xl bg-white/20 flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-white font-black text-2xl leading-none">{apunte.score_ia}</span>
                        <span className="text-white/60 text-xs">/100</span>
                      </div>
                      <div>
                        <p className="text-white font-black text-base">Calificado por IA</p>
                        {apunte.apto_pack_examen && (
                          <span className="inline-block mt-1 bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                            ⭐ Apto para Pack Examen
                          </span>
                        )}
                      </div>
                    </div>
                    {apunte.resumen_ia && (
                      <div className="px-5 py-4 bg-white">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Resumen IA</p>
                        <p className="text-sm text-gray-600 leading-relaxed">{apunte.resumen_ia}</p>
                      </div>
                    )}
                    {apunte.temas_cubiertos?.length > 0 && (
                      <div className="px-5 pb-4 bg-white">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Temas cubiertos</p>
                        <div className="flex flex-wrap gap-1.5">
                          {apunte.temas_cubiertos.map((t: string, i: number) => (
                            <span key={i} className="text-xs font-semibold px-2.5 py-1 rounded-full"
                              style={{ backgroundColor: '#FFF7ED', color: '#EA580C' }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Valoraciones */}
              <div className="bg-white rounded-3xl border border-gray-100 p-8 fade-up"
                style={{ boxShadow: '0 4px 32px rgba(0,0,0,.06)' }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-black text-gray-800 text-lg">Valoraciones</h3>
                  {promedio && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-2xl" style={{ backgroundColor: '#FFF7ED' }}>
                      <span className="text-2xl font-black text-gray-800">{promedio}</span>
                      <span className="text-yellow-400 text-xl">⭐</span>
                      <span className="text-gray-400 text-sm">({valoraciones.length})</span>
                    </div>
                  )}
                </div>

                {!esDueno && !yaValoro && (
                  <div className="border border-gray-100 rounded-2xl p-5 mb-6" style={{ backgroundColor: '#FAFAFA' }}>
                    <p className="font-bold text-gray-700 text-sm mb-3">Deja tu valoración</p>
                    <div className="flex gap-2 mb-3">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} onClick={() => setValoracion(star)}
                          className="text-3xl transition-all hover:scale-125 active:scale-95">
                          {star <= valoracion ? '⭐' : '☆'}
                        </button>
                      ))}
                    </div>
                    <textarea placeholder="Comentario opcional..."
                      value={comentario} onChange={e => setComentario(e.target.value)} rows={2}
                      className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none resize-none mb-3"
                      onFocus={e => { e.target.style.borderColor = '#EA580C'; e.target.style.boxShadow = '0 0 0 3px rgba(234,88,12,.1)' }}
                      onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none' }}
                    />
                    <button onClick={handleValorar} disabled={valoracion === 0 || enviando}
                      className="text-white px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-40 transition hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)' }}>
                      {enviando ? 'Enviando...' : 'Enviar valoración'}
                    </button>
                  </div>
                )}

                {yaValoro && (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 text-center">
                    <p className="text-green-700 text-sm font-bold">✓ Ya valoraste este apunte</p>
                  </div>
                )}

                {valoraciones.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">💬</div>
                    <p className="text-gray-400 text-sm">Sé el primero en valorar este apunte</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {valoraciones.map((v, i) => (
                      <div key={i} className="border-b border-gray-50 pb-4 last:border-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(s => (
                              <span key={s} className="text-sm">{s <= v.puntuacion ? '⭐' : '☆'}</span>
                            ))}
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(v.created_at).toLocaleDateString('es-PE')}
                          </span>
                        </div>
                        {v.comentario && <p className="text-gray-600 text-sm">{v.comentario}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── SIDEBAR DERECHO ── */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-3xl border border-gray-100 p-6 sticky top-24 fade-up"
                style={{ boxShadow: '0 8px 40px rgba(0,0,0,.08)' }}>

                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
                    style={{ backgroundColor: '#FFF7ED' }}>📄</div>
                  {esGratis ? (
                    <div>
                      <p className="text-3xl font-black text-green-600">Gratis</p>
                      <p className="text-gray-400 text-xs mt-1">Descarga sin costo</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-3xl font-black text-gray-900">S/. {apunte.precio}</p>
                      <p className="text-gray-400 text-xs mt-1">Pago único</p>
                    </div>
                  )}
                </div>

                {esDueno ? (
                  <div>
                    <div className="rounded-2xl p-3 mb-4 text-center" style={{ backgroundColor: '#FFF7ED' }}>
                      <p className="text-orange-600 text-xs font-bold">Este es tu apunte</p>
                    </div>
                    <button onClick={handleDescargar}
                      className="w-full text-white py-3.5 rounded-2xl font-bold text-sm hover:opacity-90 transition"
                      style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)', boxShadow: '0 6px 20px rgba(234,88,12,.3)' }}>
                      Descargar mi apunte
                    </button>
                  </div>
                ) : puedeDescargar ? (
                  <button onClick={handleDescargar}
                    className="w-full text-white py-3.5 rounded-2xl font-bold text-sm hover:opacity-90 transition"
                    style={{ background: 'linear-gradient(135deg,#15803D,#16A34A)', boxShadow: '0 6px 20px rgba(21,128,61,.3)' }}>
                    Descargar PDF ↓
                  </button>
                ) : (
                  <div>
                    <button onClick={handleComprar}
                      className="w-full text-white py-3.5 rounded-2xl font-bold text-sm hover:opacity-90 transition mb-3"
                      style={{ background: 'linear-gradient(135deg,#C2410C,#EA580C,#F97316)', boxShadow: '0 6px 20px rgba(234,88,12,.35)' }}>
                      Comprar ahora →
                    </button>
                    <p className="text-center text-xs text-gray-400">Pago seguro con Culqi</p>
                  </div>
                )}

                <div className="mt-5 pt-5 border-t border-gray-100 space-y-2.5">
                  {[['✅', 'Acceso inmediato al PDF'], ['✅', 'Verificado por la comunidad'], ['✅', 'Hecho por estudiantes UA']].map(([icon, text]) => (
                    <div key={text} className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{icon}</span><span>{text}</span>
                    </div>
                  ))}
                </div>

                {promedio && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-2">
                    <span className="text-yellow-400 text-lg">⭐</span>
                    <span className="font-black text-gray-800">{promedio}</span>
                    <span className="text-gray-400 text-xs">({valoraciones.length} reseñas)</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
