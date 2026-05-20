'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const CARRERAS = [
  'Administracion', 'Contabilidad', 'Derecho',
  'Ingenieria de Sistemas', 'Ingenieria Civil',
  'Psicologia', 'Enfermeria', 'Marketing',
]
const CICLOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

function RadioBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <label className="flex items-center gap-3 py-1.5 cursor-pointer group" onClick={onClick}>
      <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0"
        style={{ borderColor: active ? '#EA580C' : '#D1D5DB', backgroundColor: active ? '#EA580C' : 'white' }}>
        {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>
      <span className="text-sm text-gray-600 group-hover:text-gray-900 transition leading-tight">{label}</span>
    </label>
  )
}

export default function Dashboard() {
  const [apuntes, setApuntes]         = useState<any[]>([])
  const [busqueda, setBusqueda]       = useState('')
  const [carreraFiltro, setCarreraFiltro] = useState('')
  const [cicloFiltro, setCicloFiltro] = useState('')
  const [precioFiltro, setPrecioFiltro] = useState('')
  const [loading, setLoading]         = useState(true)
  const [mounted, setMounted]         = useState(false)
  const [showFiltros, setShowFiltros] = useState(false)

  useEffect(() => {
    setMounted(true)
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { window.location.href = '/'; return }
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
  const numFiltrosActivos = [carreraFiltro, cicloFiltro, precioFiltro].filter(Boolean).length

  const PanelFiltros = () => (
    <div className="bg-white rounded-3xl border border-gray-100 p-5"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,.05)' }}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-black text-gray-800">Filtros</h2>
        {hayFiltros && (
          <button onClick={limpiarFiltros}
            className="text-xs font-bold hover:underline" style={{ color: '#EA580C' }}>
            Limpiar todo
          </button>
        )}
      </div>

      {/* Precio */}
      <div className="mb-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Precio</p>
        {[{ value: '', label: 'Todos' }, { value: 'gratis', label: 'Gratis' }, { value: 'pago', label: 'De pago' }].map(op => (
          <RadioBtn key={op.value} active={precioFiltro === op.value} onClick={() => setPrecioFiltro(op.value)} label={op.label} />
        ))}
      </div>

      <div className="h-px bg-gray-100 my-4" />

      {/* Carrera */}
      <div className="mb-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Carrera</p>
        <RadioBtn active={carreraFiltro === ''} onClick={() => setCarreraFiltro('')} label="Todas" />
        {CARRERAS.map(c => (
          <RadioBtn key={c} active={carreraFiltro === c} onClick={() => setCarreraFiltro(c)} label={c} />
        ))}
      </div>

      <div className="h-px bg-gray-100 my-4" />

      {/* Ciclo */}
      <div className="mb-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ciclo</p>
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
      <div className="space-y-2">
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
  )

  return (
    <>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
        .card-hover { transition: all .25s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(0,0,0,.1) !important; }
      `}</style>

      <div className="min-h-screen" style={{ background: 'linear-gradient(160deg,#FFF7ED 0%,#FFFBF5 20%,#F9FAFB 50%)' }}>

        {/* ── NAVBAR ── */}
        <nav className="sticky top-0 z-50 border-b border-orange-100/60"
          style={{ backgroundColor: 'rgba(255,251,245,.92)', backdropFilter: 'blur(16px)' }}>
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">

            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer flex-shrink-0"
              onClick={() => window.location.href = '/dashboard'}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black"
                style={{ background: 'linear-gradient(135deg,#C2410C,#EA580C,#F97316)' }}>A</div>
              <span className="font-black text-gray-800 hidden sm:block text-sm">ApuntesUA</span>
            </div>

            {/* Buscador — crece todo lo que puede */}
            <div className="flex-1 min-w-0">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">🔍</span>
                <input type="text" placeholder="Buscar..."
                  value={busqueda} onChange={e => setBusqueda(e.target.value)}
                  className="w-full rounded-2xl pl-9 pr-4 py-2.5 text-sm border border-gray-200 bg-white focus:outline-none transition"
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}
                  onFocus={e => { e.target.style.borderColor = '#EA580C'; e.target.style.boxShadow = '0 0 0 3px rgba(234,88,12,.1)' }}
                  onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,.04)' }}
                />
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button onClick={() => window.location.href = '/mis-apuntes'}
                className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition px-2.5 py-2 rounded-xl hover:bg-gray-100 hidden sm:block">
                Mis apuntes
              </button>
              <button onClick={() => window.location.href = '/subir'}
                className="text-white text-xs px-3 py-2.5 rounded-xl font-bold hover:opacity-90 transition-all hover:shadow-lg whitespace-nowrap"
                style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)', boxShadow: '0 4px 12px rgba(234,88,12,.3)' }}>
                + Subir
              </button>
              <button onClick={cerrarSesion}
                className="text-xs text-gray-400 hover:text-red-500 transition p-2 rounded-xl hover:bg-red-50">
                Salir
              </button>
            </div>
          </div>

          {/* Barra secundaria móvil: Mis apuntes + filtros activos */}
          <div className="sm:hidden px-4 pb-2.5 flex items-center gap-2 overflow-x-auto">
            <button onClick={() => window.location.href = '/mis-apuntes'}
              className="text-xs font-semibold text-gray-500 whitespace-nowrap px-3 py-1.5 rounded-xl bg-gray-100 flex-shrink-0">
              Mis apuntes
            </button>
            {carreraFiltro && (
              <span className="text-xs font-bold px-3 py-1.5 rounded-xl text-white flex-shrink-0 flex items-center gap-1"
                style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)' }}>
                {carreraFiltro}
                <button onClick={() => setCarreraFiltro('')} className="ml-1 opacity-75">×</button>
              </span>
            )}
            {cicloFiltro && (
              <span className="text-xs font-bold px-3 py-1.5 rounded-xl text-white flex-shrink-0 flex items-center gap-1"
                style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)' }}>
                Ciclo {cicloFiltro}
                <button onClick={() => setCicloFiltro('')} className="ml-1 opacity-75">×</button>
              </span>
            )}
            {precioFiltro && (
              <span className="text-xs font-bold px-3 py-1.5 rounded-xl text-white flex-shrink-0 flex items-center gap-1"
                style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)' }}>
                {precioFiltro === 'gratis' ? 'Gratis' : 'De pago'}
                <button onClick={() => setPrecioFiltro('')} className="ml-1 opacity-75">×</button>
              </span>
            )}
          </div>
        </nav>

        <div className="max-w-7xl mx-auto flex">

          {/* ── SIDEBAR (solo desktop) ── */}
          <aside className="hidden md:block w-64 min-h-screen p-5 sticky top-14 self-start flex-shrink-0">
            <PanelFiltros />
          </aside>

          {/* ── MAIN ── */}
          <main className="flex-1 p-4 md:p-6 min-w-0">

            {/* Header principal */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-black text-gray-800 text-lg md:text-xl">
                  {carreraFiltro || 'Todos los apuntes'}
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  {apuntesFiltrados.length} resultado{apuntesFiltrados.length !== 1 ? 's' : ''}
                  {hayFiltros && ' · filtrado'}
                </p>
              </div>

              {/* Botón filtros solo en móvil */}
              <button
                onClick={() => setShowFiltros(true)}
                className="md:hidden flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold border-2 transition-all relative"
                style={numFiltrosActivos > 0
                  ? { background: 'linear-gradient(135deg,#EA580C,#F97316)', color: 'white', borderColor: 'transparent' }
                  : { borderColor: '#E5E7EB', color: '#6B7280', backgroundColor: 'white' }}>
                <span>⚙</span>
                Filtros
                {numFiltrosActivos > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white text-orange-600 text-xs font-black flex items-center justify-center border-2 border-orange-500">
                    {numFiltrosActivos}
                  </span>
                )}
              </button>
            </div>

            {/* Cards */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse"
                    style={{ boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}>
                    <div className="flex justify-between mb-3">
                      <div className="h-5 w-16 rounded-lg bg-gray-100" />
                      <div className="h-5 w-12 rounded-lg bg-gray-100" />
                    </div>
                    <div className="h-8 w-8 rounded-xl bg-gray-100 mb-3" />
                    <div className="h-4 bg-gray-100 rounded mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : apuntesFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl mb-4"
                  style={{ backgroundColor: '#FFF7ED' }}>📭</div>
                <p className="font-black text-gray-800 text-lg mb-1">No hay apuntes</p>
                <p className="text-gray-400 text-sm mb-5">
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
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {apuntesFiltrados.map((apunte, index) => (
                  <div key={apunte.id} className="card-hover bg-white rounded-2xl p-3.5 md:p-5 cursor-pointer border border-gray-100 group"
                    style={{
                      boxShadow: '0 2px 12px rgba(0,0,0,.05)',
                      opacity: mounted ? 1 : 0,
                      animation: mounted ? `fadeUp .4s ease ${index * 0.04}s both` : 'none',
                    }}
                    onClick={() => window.location.href = `/apunte/${apunte.id}`}>

                    <div className="flex items-start justify-between mb-3 gap-1">
                      <span className="text-xs font-bold px-2 py-1 rounded-xl text-white leading-tight"
                        style={{ background: 'linear-gradient(135deg,#C2410C,#EA580C)', fontSize: '10px' }}>
                        {apunte.carrera || 'General'}
                      </span>
                      <span className="text-xs font-bold px-2 py-1 rounded-xl text-white flex-shrink-0"
                        style={{ backgroundColor: apunte.precio > 0 ? '#2563EB' : '#15803D', fontSize: '10px' }}>
                        {apunte.precio > 0 ? `S/. ${apunte.precio}` : 'Gratis'}
                      </span>
                    </div>

                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2.5"
                      style={{ backgroundColor: '#FFF7ED' }}>
                      <span className="text-base">📄</span>
                    </div>

                    <h3 className="font-bold text-gray-800 text-xs md:text-sm mb-1 group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug">
                      {apunte.titulo}
                    </h3>
                    {apunte.curso && (
                      <p className="text-xs font-semibold mb-1.5 line-clamp-1" style={{ color: '#EA580C', fontSize: '11px' }}>{apunte.curso}</p>
                    )}
                    {apunte.ciclo && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-lg font-medium inline-block" style={{ fontSize: '10px' }}>
                        Ciclo {apunte.ciclo}
                      </span>
                    )}

                    {apunte.score_ia && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded-lg text-white"
                          style={{ backgroundColor: apunte.score_ia >= 90 ? '#15803D' : apunte.score_ia >= 75 ? '#2563EB' : '#EA580C', fontSize: '10px' }}>
                          IA {apunte.score_ia}
                        </span>
                        {apunte.apto_pack_examen && <span style={{ fontSize: '11px' }}>⭐</span>}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-50">
                      <span className="text-gray-400" style={{ fontSize: '10px' }}>
                        {new Date(apunte.created_at).toLocaleDateString('es-PE')}
                      </span>
                      <span className="font-bold group-hover:underline transition" style={{ color: '#EA580C', fontSize: '11px' }}>
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

      {/* ── MODAL DE FILTROS MÓVIL (bottom sheet) ── */}
      {showFiltros && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Overlay oscuro */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowFiltros(false)} />

          {/* Sheet desde abajo */}
          <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl overflow-hidden"
            style={{ animation: 'slideUp .3s ease', maxHeight: '88vh' }}>
            {/* Handle + header */}
            <div className="bg-white px-5 pt-4 pb-3 sticky top-0 z-10 border-b border-gray-100">
              <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-4" />
              <div className="flex items-center justify-between">
                <h3 className="font-black text-gray-800 text-lg">Filtros</h3>
                <div className="flex items-center gap-3">
                  {hayFiltros && (
                    <button onClick={() => { limpiarFiltros(); }}
                      className="text-sm font-bold" style={{ color: '#EA580C' }}>
                      Limpiar
                    </button>
                  )}
                  <button onClick={() => setShowFiltros(false)}
                    className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-lg">
                    ×
                  </button>
                </div>
              </div>
            </div>

            {/* Contenido scrollable */}
            <div className="bg-white overflow-y-auto px-5 pb-8" style={{ maxHeight: 'calc(88vh - 80px)' }}>
              {/* Precio */}
              <div className="py-5 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Precio</p>
                {[{ value: '', label: 'Todos' }, { value: 'gratis', label: 'Gratis' }, { value: 'pago', label: 'De pago' }].map(op => (
                  <RadioBtn key={op.value} active={precioFiltro === op.value} onClick={() => setPrecioFiltro(op.value)} label={op.label} />
                ))}
              </div>

              {/* Carrera */}
              <div className="py-5 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Carrera</p>
                <RadioBtn active={carreraFiltro === ''} onClick={() => setCarreraFiltro('')} label="Todas" />
                {CARRERAS.map(c => (
                  <RadioBtn key={c} active={carreraFiltro === c} onClick={() => setCarreraFiltro(c)} label={c} />
                ))}
              </div>

              {/* Ciclo */}
              <div className="py-5 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Ciclo</p>
                <div className="grid grid-cols-4 gap-2">
                  <button onClick={() => setCicloFiltro('')}
                    className="py-2 rounded-xl text-xs font-bold transition-all"
                    style={cicloFiltro === '' ? { background: 'linear-gradient(135deg,#EA580C,#F97316)', color: 'white' } : { backgroundColor: '#F3F4F6', color: '#6B7280' }}>
                    Todos
                  </button>
                  {CICLOS.map(c => (
                    <button key={c} onClick={() => setCicloFiltro(c)}
                      className="py-2 rounded-xl text-xs font-bold transition-all"
                      style={cicloFiltro === c ? { background: 'linear-gradient(135deg,#EA580C,#F97316)', color: 'white' } : { backgroundColor: '#F3F4F6', color: '#6B7280' }}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="py-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">En la plataforma</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Total', val: apuntes.length, color: '#EA580C', bg: '#FFF7ED' },
                    { label: 'Gratis', val: apuntes.filter(a => !a.precio || a.precio === 0).length, color: '#15803D', bg: '#F0FDF4' },
                    { label: 'Pago', val: apuntes.filter(a => a.precio > 0).length, color: '#2563EB', bg: '#EFF6FF' },
                  ].map(s => (
                    <div key={s.label} className="rounded-2xl p-3 text-center" style={{ backgroundColor: s.bg }}>
                      <p className="text-xl font-black" style={{ color: s.color }}>{s.val}</p>
                      <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botón aplicar */}
              <button
                onClick={() => setShowFiltros(false)}
                className="w-full py-3.5 rounded-2xl text-white font-bold text-sm hover:opacity-90 transition"
                style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)', boxShadow: '0 6px 20px rgba(234,88,12,.3)' }}>
                Ver {apuntesFiltrados.length} resultado{apuntesFiltrados.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
