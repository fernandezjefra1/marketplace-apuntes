'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const CARRERAS = [
  'Administracion', 'Contabilidad', 'Derecho',
  'Ingenieria de Sistemas', 'Ingenieria Civil',
  'Psicologia', 'Enfermeria', 'Marketing',
]
const CICLOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

export default function Dashboard() {
  const [user, setUser]               = useState<any>(null)
  const [apuntes, setApuntes]         = useState<any[]>([])
  const [busqueda, setBusqueda]       = useState('')
  const [carreraFiltro, setCarreraFiltro] = useState('')
  const [cicloFiltro, setCicloFiltro] = useState('')
  const [precioFiltro, setPrecioFiltro] = useState('')
  const [loading, setLoading]         = useState(true)
  const [mounted, setMounted]         = useState(false)

  useEffect(() => {
    setMounted(true)
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { window.location.href = '/'; return }
      setUser(data.user)
      cargarApuntes()
    })
  }, [])

  const cargarApuntes = async () => {
    const { data } = await supabase.from('apuntes').select('*').order('created_at', { ascending: false })
    setApuntes(data || [])
    setLoading(false)
  }

  const cerrarSesion = async () => { await supabase.auth.signOut(); window.location.href = '/' }

  const apuntesFiltrados = apuntes.filter(a => {
    const q = busqueda.toLowerCase()
    const coincideBusqueda = !q || a.titulo?.toLowerCase().includes(q) || a.descripcion?.toLowerCase().includes(q) || a.curso?.toLowerCase().includes(q)
    const coincideCarrera  = carreraFiltro ? a.carrera === carreraFiltro : true
    const coincideCiclo    = cicloFiltro   ? a.ciclo === cicloFiltro     : true
    const coincidePrecio   = precioFiltro === 'gratis' ? (!a.precio || a.precio === 0) : precioFiltro === 'pago' ? a.precio > 0 : true
    return coincideBusqueda && coincideCarrera && coincideCiclo && coincidePrecio
  })

  const limpiarFiltros = () => { setBusqueda(''); setCarreraFiltro(''); setCicloFiltro(''); setPrecioFiltro('') }
  const hayFiltros = busqueda || carreraFiltro || cicloFiltro || precioFiltro

  return (
    <>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .card-hover { transition: all .25s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(0,0,0,.1) !important; }
        .radio-dot:hover { border-color: #EA580C !important; }
      `}</style>

      <div className="min-h-screen" style={{ background: 'linear-gradient(160deg,#FFF7ED 0%,#FFFBF5 20%,#F9FAFB 50%)' }}>

        {/* ── NAVBAR ── */}
        <nav className="sticky top-0 z-50 border-b border-orange-100/60"
          style={{ backgroundColor: 'rgba(255,251,245,.88)', backdropFilter: 'blur(16px)' }}>
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">

            <div className="flex items-center gap-2.5 cursor-pointer flex-shrink-0"
              onClick={() => window.location.href = '/dashboard'}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black"
                style={{ background: 'linear-gradient(135deg,#C2410C,#EA580C,#F97316)' }}>A</div>
              <span className="font-black text-gray-800 hidden sm:block">ApuntesUA</span>
            </div>

            {/* Buscador */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                <input type="text" placeholder="Buscar apuntes, cursos, carreras..."
                  value={busqueda} onChange={e => setBusqueda(e.target.value)}
                  className="w-full rounded-2xl pl-10 pr-4 py-2.5 text-sm border border-gray-200 bg-white focus:outline-none transition"
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}
                  onFocus={e => { e.target.style.borderColor = '#EA580C'; e.target.style.boxShadow = '0 0 0 3px rgba(234,88,12,.1)' }}
                  onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,.04)' }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-gray-400 hidden lg:block">{user?.email}</span>
              <button onClick={() => window.location.href = '/mis-apuntes'}
                className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition px-3 py-2 rounded-xl hover:bg-gray-100">
                Mis apuntes
              </button>
              {user?.email === 'fernandezjefra1@autonomoma.edu.pe' && (
                <button onClick={() => window.location.href = '/admin'}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl text-white"
                  style={{ background: 'linear-gradient(135deg,#7C3AED,#8B5CF6)' }}>
                  Admin
                </button>
              )}
              <button onClick={() => window.location.href = '/subir'}
                className="text-white text-sm px-4 py-2.5 rounded-xl font-bold hover:opacity-90 transition-all hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)', boxShadow: '0 4px 14px rgba(234,88,12,.3)' }}>
                + Subir
              </button>
              <button onClick={cerrarSesion}
                className="text-sm text-gray-400 hover:text-red-500 transition px-2 py-2 rounded-xl hover:bg-red-50">
                Salir
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto flex">

          {/* ── SIDEBAR ── */}
          <aside className="w-64 min-h-screen p-5 sticky top-14 self-start flex-shrink-0">
            <div className="bg-white rounded-3xl border border-gray-100 p-5"
              style={{ boxShadow: '0 4px 24px rgba(0,0,0,.05)' }}>

              <div className="flex items-center justify-between mb-5">
                <h2 className="font-black text-gray-800">Filtros</h2>
                {hayFiltros && (
                  <button onClick={limpiarFiltros}
                    className="text-xs font-bold hover:underline" style={{ color: '#EA580C' }}>
                    Limpiar
                  </button>
                )}
              </div>

              {/* Precio */}
              <div className="mb-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Precio</p>
                {[{ value: '', label: 'Todos', icon: '🔘' }, { value: 'gratis', label: 'Gratis', icon: '🆓' }, { value: 'pago', label: 'De pago', icon: '💰' }].map(op => (
                  <label key={op.value} className="flex items-center gap-3 py-1.5 cursor-pointer group" onClick={() => setPrecioFiltro(op.value)}>
                    <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0"
                      style={{ borderColor: precioFiltro === op.value ? '#EA580C' : '#D1D5DB', backgroundColor: precioFiltro === op.value ? '#EA580C' : 'white' }}>
                      {precioFiltro === op.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition">{op.label}</span>
                  </label>
                ))}
              </div>

              <div className="h-px bg-gray-100 my-4" />

              {/* Carrera */}
              <div className="mb-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Carrera</p>
                <label className="flex items-center gap-3 py-1 cursor-pointer" onClick={() => setCarreraFiltro('')}>
                  <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0"
                    style={{ borderColor: carreraFiltro === '' ? '#EA580C' : '#D1D5DB', backgroundColor: carreraFiltro === '' ? '#EA580C' : 'white' }}>
                    {carreraFiltro === '' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm text-gray-600">Todas</span>
                </label>
                {CARRERAS.map(c => (
                  <label key={c} className="flex items-center gap-3 py-1 cursor-pointer group" onClick={() => setCarreraFiltro(c)}>
                    <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0"
                      style={{ borderColor: carreraFiltro === c ? '#EA580C' : '#D1D5DB', backgroundColor: carreraFiltro === c ? '#EA580C' : 'white' }}>
                      {carreraFiltro === c && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition leading-tight">{c}</span>
                  </label>
                ))}
              </div>

              <div className="h-px bg-gray-100 my-4" />

              {/* Ciclo */}
              <div className="mb-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Ciclo</p>
                <div className="grid grid-cols-4 gap-1.5">
                  <button onClick={() => setCicloFiltro('')}
                    className="py-1.5 rounded-xl text-xs font-bold transition-all"
                    style={cicloFiltro === '' ? { background: 'linear-gradient(135deg,#EA580C,#F97316)', color: 'white' } : { backgroundColor: '#F3F4F6', color: '#6B7280' }}>
                    Todos
                  </button>
                  {CICLOS.map(c => (
                    <button key={c} onClick={() => setCicloFiltro(c)}
                      className="py-1.5 rounded-xl text-xs font-bold transition-all"
                      style={cicloFiltro === c ? { background: 'linear-gradient(135deg,#EA580C,#F97316)', color: 'white' } : { backgroundColor: '#F3F4F6', color: '#6B7280' }}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-gray-100 my-4" />

              {/* Mini stats */}
              <div className="space-y-2.5">
                {[
                  { label: 'Total apuntes', val: apuntes.length, color: '#1F2937' },
                  { label: 'Gratis', val: apuntes.filter(a => !a.precio || a.precio === 0).length, color: '#15803D' },
                  { label: 'De pago', val: apuntes.filter(a => a.precio > 0).length, color: '#2563EB' },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{s.label}</span>
                    <span className="text-sm font-black" style={{ color: s.color }}>{s.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* ── MAIN ── */}
          <main className="flex-1 p-6 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-black text-gray-800 text-xl">
                  {carreraFiltro || 'Todos los apuntes'}
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  {apuntesFiltrados.length} resultado{apuntesFiltrados.length !== 1 ? 's' : ''}
                  {hayFiltros && ' · filtrado'}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100" style={{ boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}>
                    <div className="flex justify-between mb-3">
                      <div className="h-5 w-20 rounded-lg bg-gray-100 animate-pulse" />
                      <div className="h-5 w-14 rounded-lg bg-gray-100 animate-pulse" />
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-gray-100 animate-pulse mb-3" />
                    <div className="h-4 bg-gray-100 rounded animate-pulse mb-2" />
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
                  </div>
                ))}
              </div>
            ) : apuntesFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-5"
                  style={{ backgroundColor: '#FFF7ED' }}>📭</div>
                <p className="font-black text-gray-800 text-xl mb-2">No hay apuntes</p>
                <p className="text-gray-400 text-sm mb-6">
                  {hayFiltros ? 'Prueba con otros filtros' : 'Sé el primero en subir uno'}
                </p>
                {hayFiltros ? (
                  <button onClick={limpiarFiltros}
                    className="text-white px-6 py-2.5 rounded-2xl text-sm font-bold hover:opacity-90 transition"
                    style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)' }}>
                    Limpiar filtros
                  </button>
                ) : (
                  <button onClick={() => window.location.href = '/subir'}
                    className="text-white px-6 py-2.5 rounded-2xl text-sm font-bold hover:opacity-90 transition"
                    style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)' }}>
                    Subir apunte
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {apuntesFiltrados.map((apunte, index) => (
                  <div key={apunte.id} className="card-hover bg-white rounded-2xl p-5 cursor-pointer border border-gray-100 group"
                    style={{
                      boxShadow: '0 2px 12px rgba(0,0,0,.05)',
                      opacity: mounted ? 1 : 0,
                      animation: mounted ? `fadeUp .4s ease ${index * 0.04}s both` : 'none',
                    }}
                    onClick={() => window.location.href = `/apunte/${apunte.id}`}>

                    <div className="flex items-start justify-between mb-3">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-xl text-white"
                        style={{ background: 'linear-gradient(135deg,#C2410C,#EA580C)' }}>
                        {apunte.carrera || 'General'}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-xl text-white"
                        style={{ backgroundColor: apunte.precio > 0 ? '#2563EB' : '#15803D' }}>
                        {apunte.precio > 0 ? `S/. ${apunte.precio}` : 'Gratis'}
                      </span>
                    </div>

                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                      style={{ backgroundColor: '#FFF7ED' }}>
                      <span className="text-lg">📄</span>
                    </div>

                    <h3 className="font-bold text-gray-800 text-sm mb-1 group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug">
                      {apunte.titulo}
                    </h3>
                    {apunte.curso && (
                      <p className="text-xs font-semibold mb-2" style={{ color: '#EA580C' }}>{apunte.curso}</p>
                    )}
                    {apunte.ciclo && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-lg font-medium">
                        Ciclo {apunte.ciclo}
                      </span>
                    )}

                    {/* Score IA si existe */}
                    {apunte.score_ia && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-lg text-white"
                          style={{ backgroundColor: apunte.score_ia >= 90 ? '#15803D' : apunte.score_ia >= 75 ? '#2563EB' : '#EA580C' }}>
                          IA {apunte.score_ia}pts
                        </span>
                        {apunte.apto_pack_examen && <span className="text-xs">⭐</span>}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                      <span className="text-xs text-gray-400">
                        {new Date(apunte.created_at).toLocaleDateString('es-PE')}
                      </span>
                      <span className="text-xs font-bold group-hover:underline transition" style={{ color: '#EA580C' }}>
                        Ver →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  )
}
