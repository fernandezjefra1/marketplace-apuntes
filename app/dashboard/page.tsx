'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

const CARRERAS = [
  'Administracion', 'Contabilidad', 'Derecho',
  'Ingenieria de Sistemas', 'Ingenieria Civil',
  'Psicologia', 'Enfermeria', 'Marketing',
]
const CICLOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

const CM: Record<string, { a: string; b: string; icon: string }> = {
  'Administracion':          { a: '#7C3AED', b: '#A855F7', icon: '🏢' },
  'Contabilidad':            { a: '#0891B2', b: '#06B6D4', icon: '📊' },
  'Derecho':                 { a: '#DC2626', b: '#EF4444', icon: '⚖️' },
  'Ingenieria de Sistemas':  { a: '#059669', b: '#10B981', icon: '💻' },
  'Ingenieria Civil':        { a: '#D97706', b: '#F59E0B', icon: '🏗️' },
  'Psicologia':              { a: '#DB2777', b: '#EC4899', icon: '🧠' },
  'Enfermeria':              { a: '#0284C7', b: '#38BDF8', icon: '🏥' },
  'Marketing':               { a: '#EA580C', b: '#F97316', icon: '📣' },
}
const DEF = { a: '#EA580C', b: '#F97316', icon: '📄' }

function Counter({ to }: { to: number }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!to) { setN(0); return }
    const dur = 900, start = Date.now()
    const tick = () => {
      const p = Math.min((Date.now() - start) / dur, 1)
      const e = 1 - Math.pow(1 - p, 3)
      setN(Math.round(e * to))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [to])
  return <>{n}</>
}

function Card3D({ apunte, index }: { apunte: any; index: number }) {
  const ref  = useRef<HTMLDivElement>(null)
  const [rot,  setRot]  = useState({ x: 0, y: 0 })
  const [glow, setGlow] = useState({ x: 50, y: 50 })
  const [over, setOver] = useState(false)

  const c  = CM[apunte.carrera] ?? DEF
  const sc = apunte.score_ia != null
    ? apunte.score_ia >= 90 ? '#15803D' : apunte.score_ia >= 75 ? '#2563EB' : '#EA580C'
    : null

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    setRot({ x: (y - .5) * -16, y: (x - .5) * 16 })
    setGlow({ x: x * 100, y: y * 100 })
  }, [])

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setOver(true)}
      onMouseLeave={() => { setRot({ x: 0, y: 0 }); setOver(false) }}
      onClick={() => window.location.href = `/apunte/${apunte.id}`}
      className="cursor-pointer"
      style={{
        animation: `fu .55s ease ${index * .07}s both`,
        transform: `perspective(900px) rotateX(${rot.x}deg) rotateY(${rot.y}deg) translateZ(${over ? 10 : 0}px)`,
        transition: over ? 'transform .1s ease' : 'transform .55s ease',
        willChange: 'transform',
      }}
    >
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,.95)',
          border: `1.5px solid ${over ? c.a + '40' : 'rgba(229,231,235,.6)'}`,
          boxShadow: over
            ? `0 22px 52px rgba(0,0,0,.13), 0 0 0 1px ${c.a}22`
            : '0 3px 18px rgba(0,0,0,.06)',
          transition: 'box-shadow .3s, border-color .3s',
        }}
      >
        {/* Mouse glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          opacity: over ? 1 : 0,
          transition: 'opacity .3s',
          background: `radial-gradient(200px circle at ${glow.x}% ${glow.y}%, ${c.a}14, transparent 65%)`,
        }} />

        {/* Shimmer top bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{
          background: `linear-gradient(90deg, ${c.a}, ${c.b}, ${c.a})`,
          backgroundSize: '200% 100%',
          animation: 'bar-shimmer 2.5s linear infinite',
        }} />

        <div className="p-4 md:p-5 pt-5">
          {/* Row 1 */}
          <div className="flex items-start justify-between mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{
                background: `linear-gradient(135deg,${c.a}22,${c.b}35)`,
                border: `1.5px solid ${c.a}25`,
                transition: 'transform .3s',
                transform: over ? 'scale(1.1) rotate(-4deg)' : 'scale(1)',
              }}
            >
              {c.icon}
            </div>
            <span
              className="font-black px-2.5 py-1 rounded-xl text-white"
              style={{
                fontSize: '11px',
                background: apunte.precio > 0
                  ? 'linear-gradient(135deg,#1E40AF,#2563EB)'
                  : 'linear-gradient(135deg,#166534,#16A34A)',
                boxShadow: apunte.precio > 0
                  ? '0 2px 8px rgba(37,99,235,.28)'
                  : '0 2px 8px rgba(22,101,52,.28)',
              }}
            >
              {apunte.precio > 0 ? `S/. ${apunte.precio}` : 'GRATIS'}
            </span>
          </div>

          {/* Title */}
          <h3
            className="font-black text-sm leading-snug mb-1.5 line-clamp-2"
            style={{ color: over ? c.a : '#111827', transition: 'color .2s' }}
          >
            {apunte.titulo}
          </h3>

          {/* Curso */}
          {apunte.curso && (
            <p className="text-xs font-semibold mb-2 line-clamp-1" style={{ color: c.a + 'cc', fontSize: '11px' }}>
              {apunte.curso}
            </p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {apunte.ciclo && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-gray-100 text-gray-500" style={{ fontSize: '10px' }}>
                Ciclo {apunte.ciclo}
              </span>
            )}
            {apunte.carrera && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-lg" style={{ fontSize: '10px', backgroundColor: c.a + '18', color: c.a }}>
                {apunte.carrera.split(' ').slice(0, 2).join(' ')}
              </span>
            )}
            {apunte.apto_pack_examen && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ fontSize: '10px', backgroundColor: '#FEF9C3', color: '#92400E' }}>
                ⭐ Pack examen
              </span>
            )}
          </div>

          {/* Score bar */}
          {sc && apunte.score_ia != null && (
            <div className="mb-3">
              <div className="flex justify-between mb-1">
                <span className="text-gray-400 font-medium" style={{ fontSize: '10px' }}>Score IA</span>
                <span className="font-black" style={{ fontSize: '11px', color: sc }}>{apunte.score_ia}/100</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${apunte.score_ia}%`,
                    background: `linear-gradient(90deg,${sc},${sc}99)`,
                    animation: `bar-in .8s ease ${index * .07 + .2}s both`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2.5 border-t border-gray-100">
            <span style={{ fontSize: '10px', color: '#9CA3AF' }}>
              {new Date(apunte.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
            </span>
            <span
              className="font-black"
              style={{
                fontSize: '12px',
                color: c.a,
                transform: over ? 'translateX(4px)' : 'none',
                transition: 'transform .2s',
              }}
            >
              Ver →
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [apuntes, setApuntes]             = useState<any[]>([])
  const [busqueda, setBusqueda]           = useState('')
  const [carreraFiltro, setCarreraFiltro] = useState('')
  const [cicloFiltro, setCicloFiltro]     = useState('')
  const [precioFiltro, setPrecioFiltro]   = useState('')
  const [loading, setLoading]             = useState(true)
  const [showFiltros, setShowFiltros]     = useState(false)

  useEffect(() => {
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
    return (
      (!q || a.titulo?.toLowerCase().includes(q) || a.descripcion?.toLowerCase().includes(q) || a.curso?.toLowerCase().includes(q)) &&
      (!carreraFiltro || a.carrera === carreraFiltro) &&
      (!cicloFiltro   || a.ciclo === cicloFiltro) &&
      (precioFiltro === 'gratis' ? (!a.precio || a.precio === 0) : precioFiltro === 'pago' ? a.precio > 0 : true)
    )
  })

  const limpiarFiltros = () => { setBusqueda(''); setCarreraFiltro(''); setCicloFiltro(''); setPrecioFiltro('') }
  const hayFiltros     = busqueda || carreraFiltro || cicloFiltro || precioFiltro
  const nFiltros       = [carreraFiltro, cicloFiltro, precioFiltro].filter(Boolean).length
  const nGratis        = apuntes.filter(a => !a.precio || a.precio === 0).length
  const nPago          = apuntes.filter(a => a.precio > 0).length

  const FiltroChip = ({ active, onClick, label, color }: { active: boolean; onClick: () => void; label: string; color?: string }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 py-2 px-3 rounded-xl text-sm font-medium transition-all duration-200 text-left"
      style={active ? {
        background: color ? `linear-gradient(135deg,${color},${color}cc)` : 'linear-gradient(135deg,#EA580C,#F97316)',
        color: 'white',
        boxShadow: `0 4px 12px ${color || '#EA580C'}40`,
      } : { color: '#6B7280' }}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all ${active ? 'bg-white' : 'bg-gray-300'}`} />
      <span className="truncate text-xs">{label}</span>
    </button>
  )

  return (
    <>
      <style>{`
        @keyframes fu        { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp   { from{transform:translateY(100%)} to{transform:translateY(0)} }
        @keyframes float1    { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(50px,-70px) scale(1.06)} 66%{transform:translate(-35px,35px) scale(.96)} }
        @keyframes float2    { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(-55px,45px) scale(1.04)} 70%{transform:translate(65px,-45px) scale(.97)} }
        @keyframes float3    { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(35px,-55px) scale(1.05)} }
        @keyframes bar-shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes bar-in    { from{width:0 !important} }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.4)} }
        @keyframes spin-slow { to{transform:rotate(360deg)} }
        .sk { background:linear-gradient(90deg,#f3f4f6 25%,#e9eaec 50%,#f3f4f6 75%);background-size:200% 100%;animation:bar-shimmer 1.5s infinite }
        input:focus { outline:none }
        ::-webkit-scrollbar { width:4px } ::-webkit-scrollbar-track { background:transparent } ::-webkit-scrollbar-thumb { background:#e5e7eb;border-radius:4px }
      `}</style>

      {/* ── ANIMATED BACKGROUND ── */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle,#FED7AA,#FDBA74,transparent)', top: '-250px', right: '-150px', opacity: .35, filter: 'blur(70px)', animation: 'float1 20s ease-in-out infinite' }} />
        <div className="absolute w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle,#DDD6FE,#C4B5FD,transparent)', bottom: '-150px', left: '-200px', opacity: .3, filter: 'blur(80px)', animation: 'float2 25s ease-in-out infinite' }} />
        <div className="absolute w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle,#BAE6FD,#93C5FD,transparent)', top: '35%', left: '38%', opacity: .22, filter: 'blur(90px)', animation: 'float3 18s ease-in-out infinite' }} />
        <div className="absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(circle,#D1D5DB 1px,transparent 1px)', backgroundSize: '30px 30px', opacity: .3 }} />
      </div>

      <div className="min-h-screen">

        {/* ── NAVBAR ── */}
        <nav className="sticky top-0 z-50"
          style={{ background: 'rgba(255,251,245,.88)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,.6)', boxShadow: '0 1px 0 rgba(0,0,0,.05)' }}>
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer flex-shrink-0" onClick={() => window.location.href = '/dashboard'}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black relative"
                style={{ background: 'linear-gradient(135deg,#C2410C,#EA580C,#F97316)', boxShadow: '0 4px 10px rgba(234,88,12,.4)' }}>
                A
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white"
                  style={{ animation: 'pulse-dot 2.5s ease infinite' }} />
              </div>
              <span className="font-black text-gray-800 hidden sm:block text-sm">ApuntesUA</span>
            </div>

            {/* Search */}
            <div className="flex-1 min-w-0">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" style={{ fontSize: '14px' }}>🔍</span>
                <input
                  type="text"
                  placeholder="Buscar apuntes, cursos, carreras..."
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  className="w-full rounded-2xl pl-10 pr-4 py-2.5 text-sm border transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,.7)', backdropFilter: 'blur(10px)', border: '1.5px solid rgba(229,231,235,.7)', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}
                  onFocus={e => { e.target.style.borderColor = '#EA580C'; e.target.style.boxShadow = '0 0 0 3px rgba(234,88,12,.1)'; e.target.style.background = 'white' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(229,231,235,.7)'; e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,.04)'; e.target.style.background = 'rgba(255,255,255,.7)' }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button onClick={() => window.location.href = '/mis-apuntes'}
                className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition px-3 py-2 rounded-xl hover:bg-white/80 hidden sm:block">
                Mis apuntes
              </button>
              <button onClick={() => window.location.href = '/subir'}
                className="text-white text-xs px-3.5 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap"
                style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)', boxShadow: '0 4px 14px rgba(234,88,12,.4)' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 6px 20px rgba(234,88,12,.5)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 14px rgba(234,88,12,.4)')}>
                + Subir
              </button>
              <button onClick={cerrarSesion}
                className="text-xs text-gray-400 hover:text-red-500 transition p-2 rounded-xl hover:bg-red-50/80">
                Salir
              </button>
            </div>
          </div>

          {/* Mobile filter chips row */}
          <div className="sm:hidden px-4 pb-2.5 flex items-center gap-2 overflow-x-auto">
            <button onClick={() => window.location.href = '/mis-apuntes'}
              className="text-xs font-semibold text-gray-500 whitespace-nowrap px-3 py-1.5 rounded-xl flex-shrink-0"
              style={{ backgroundColor: 'rgba(243,244,246,.8)' }}>
              Mis apuntes
            </button>
            {carreraFiltro && (
              <span className="text-xs font-bold px-3 py-1.5 rounded-xl text-white flex-shrink-0 flex items-center gap-1"
                style={{ background: `linear-gradient(135deg,${CM[carreraFiltro]?.a || '#EA580C'},${CM[carreraFiltro]?.b || '#F97316'})` }}>
                {carreraFiltro.split(' ').slice(0, 2).join(' ')}
                <button onClick={() => setCarreraFiltro('')}>×</button>
              </span>
            )}
            {cicloFiltro && (
              <span className="text-xs font-bold px-3 py-1.5 rounded-xl text-white flex-shrink-0 flex items-center gap-1"
                style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)' }}>
                Ciclo {cicloFiltro}
                <button onClick={() => setCicloFiltro('')}>×</button>
              </span>
            )}
            {precioFiltro && (
              <span className="text-xs font-bold px-3 py-1.5 rounded-xl text-white flex-shrink-0 flex items-center gap-1"
                style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)' }}>
                {precioFiltro === 'gratis' ? '🆓 Gratis' : '💎 Pago'}
                <button onClick={() => setPrecioFiltro('')}>×</button>
              </span>
            )}
          </div>
        </nav>

        {/* ── HERO ── */}
        <div className="relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#7C2D12 0%,#9A3412 20%,#C2410C 45%,#EA580C 70%,#F97316 90%,#FB923C 100%)' }}>
          <div className="absolute -right-24 -top-24 w-72 h-72 rounded-full" style={{ background: 'rgba(255,255,255,.07)', animation: 'float1 14s ease-in-out infinite' }} />
          <div className="absolute -left-12 -bottom-12 w-56 h-56 rounded-full" style={{ background: 'rgba(255,255,255,.05)', animation: 'float2 17s ease-in-out infinite' }} />
          <div className="absolute right-1/4 top-0 w-40 h-40 rounded-full" style={{ background: 'rgba(255,255,255,.04)', animation: 'float3 11s ease-in-out infinite' }} />
          <div className="absolute inset-0"
            style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,.06) 1px,transparent 1px)', backgroundSize: '24px 24px' }} />

          <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div style={{ animation: 'fu .6s ease .1s both' }}>
                <p className="text-orange-200 text-xs font-semibold uppercase tracking-widest mb-1.5">
                  Marketplace universitario · ApuntesUA
                </p>
                <h1 className="text-white font-black text-2xl md:text-3xl lg:text-4xl leading-tight">
                  {carreraFiltro ? carreraFiltro : 'Todos los Apuntes'}
                </h1>
                <p className="text-orange-100/75 text-sm mt-1.5">
                  {apuntesFiltrados.length} resultado{apuntesFiltrados.length !== 1 ? 's' : ''}
                  {hayFiltros ? ' · filtrado' : ' disponibles'}
                </p>
              </div>

              {!loading && (
                <div className="flex gap-3 flex-wrap" style={{ animation: 'fu .6s ease .25s both' }}>
                  {[
                    { label: 'Apuntes', val: apuntes.length,  icon: '📚', glow: 'rgba(255,255,255,.12)' },
                    { label: 'Gratis',  val: nGratis,          icon: '🆓', glow: 'rgba(255,255,255,.1)' },
                    { label: 'Premium', val: nPago,            icon: '💎', glow: 'rgba(255,255,255,.1)' },
                  ].map(s => (
                    <div key={s.label}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                      style={{ background: s.glow, backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,.2)', boxShadow: '0 4px 16px rgba(0,0,0,.1)' }}>
                      <span className="text-2xl">{s.icon}</span>
                      <div>
                        <p className="text-white font-black text-xl leading-none"><Counter to={s.val} /></p>
                        <p className="text-orange-100/70 text-xs font-medium mt-0.5">{s.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── LAYOUT ── */}
        <div className="max-w-7xl mx-auto flex">

          {/* ── SIDEBAR DESKTOP ── */}
          <aside className="hidden md:block w-68 flex-shrink-0 p-5 sticky top-14 self-start" style={{ width: 272, maxHeight: 'calc(100vh - 56px)', overflowY: 'auto' }}>
            <div className="rounded-2xl p-5"
              style={{ background: 'rgba(255,255,255,.82)', backdropFilter: 'blur(20px)', border: '1.5px solid rgba(255,255,255,.9)', boxShadow: '0 8px 32px rgba(0,0,0,.08)' }}>

              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs"
                    style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)' }}>
                    ⚙
                  </div>
                  <h2 className="font-black text-gray-800 text-sm">Filtros</h2>
                </div>
                {hayFiltros && (
                  <button onClick={limpiarFiltros}
                    className="text-xs font-bold px-2.5 py-1 rounded-xl transition hover:opacity-80"
                    style={{ backgroundColor: '#FFF7ED', color: '#EA580C' }}>
                    Limpiar
                  </button>
                )}
              </div>

              {/* Precio */}
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Precio</p>
              {[{ v: '', l: 'Todos los precios' }, { v: 'gratis', l: '🆓 Gratis' }, { v: 'pago', l: '💎 De pago' }].map(op => (
                <FiltroChip key={op.v} active={precioFiltro === op.v} onClick={() => setPrecioFiltro(op.v)} label={op.l} />
              ))}

              <div className="h-px my-3.5" style={{ background: 'linear-gradient(90deg,transparent,#E5E7EB,transparent)' }} />

              {/* Carrera */}
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Carrera</p>
              <FiltroChip active={carreraFiltro === ''} onClick={() => setCarreraFiltro('')} label="Todas las carreras" />
              {CARRERAS.map(c => {
                const m = CM[c] || DEF
                return (
                  <button key={c} onClick={() => setCarreraFiltro(c)}
                    className="w-full flex items-center gap-2 py-2 px-3 rounded-xl text-xs font-medium transition-all duration-200 text-left"
                    style={carreraFiltro === c ? {
                      background: `linear-gradient(135deg,${m.a},${m.b})`,
                      color: 'white',
                      boxShadow: `0 4px 12px ${m.a}40`,
                    } : { color: '#6B7280' }}>
                    <span>{m.icon}</span>
                    <span className="truncate">{c}</span>
                  </button>
                )
              })}

              <div className="h-px my-3.5" style={{ background: 'linear-gradient(90deg,transparent,#E5E7EB,transparent)' }} />

              {/* Ciclo */}
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ciclo</p>
              <div className="grid grid-cols-4 gap-1.5 mb-4">
                {['', ...CICLOS].map(c => (
                  <button key={c} onClick={() => setCicloFiltro(c)}
                    className="py-1.5 rounded-xl text-xs font-bold transition-all duration-200"
                    style={cicloFiltro === c
                      ? { background: 'linear-gradient(135deg,#EA580C,#F97316)', color: 'white', boxShadow: '0 3px 8px rgba(234,88,12,.35)' }
                      : { backgroundColor: '#F3F4F6', color: '#6B7280' }}>
                    {c || 'All'}
                  </button>
                ))}
              </div>

              <div className="h-px my-3.5" style={{ background: 'linear-gradient(90deg,transparent,#E5E7EB,transparent)' }} />

              {/* Mini stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Total',  val: apuntes.length, color: '#EA580C', bg: '#FFF7ED' },
                  { label: 'Gratis', val: nGratis,         color: '#15803D', bg: '#F0FDF4' },
                  { label: 'Pago',   val: nPago,           color: '#2563EB', bg: '#EFF6FF' },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-2.5 text-center" style={{ backgroundColor: s.bg }}>
                    <p className="font-black text-base leading-none" style={{ color: s.color }}>{s.val}</p>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* ── MAIN ── */}
          <main className="flex-1 px-4 md:pl-2 md:pr-6 py-6 min-w-0">

            {/* Mobile filter button */}
            <div className="flex items-center justify-between md:hidden mb-5">
              <p className="text-sm font-bold text-gray-600">
                {loading ? 'Cargando...' : `${apuntesFiltrados.length} apunte${apuntesFiltrados.length !== 1 ? 's' : ''}`}
              </p>
              <button onClick={() => setShowFiltros(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold border-2 transition-all relative"
                style={nFiltros > 0
                  ? { background: 'linear-gradient(135deg,#EA580C,#F97316)', color: 'white', borderColor: 'transparent' }
                  : { borderColor: '#E5E7EB', color: '#6B7280', background: 'white' }}>
                ⚙ Filtros
                {nFiltros > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white text-orange-600 text-xs font-black flex items-center justify-center border-2 border-orange-500">
                    {nFiltros}
                  </span>
                )}
              </button>
            </div>

            {/* Cards */}
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden" style={{ boxShadow: '0 3px 14px rgba(0,0,0,.06)' }}>
                    <div className="h-0.5 sk" />
                    <div className="bg-white p-4">
                      <div className="flex justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl sk" />
                        <div className="w-14 h-6 rounded-xl sk" />
                      </div>
                      <div className="h-4 sk rounded mb-2" />
                      <div className="h-3 sk rounded w-3/4 mb-3" />
                      <div className="flex gap-1.5 mb-3">
                        <div className="h-5 w-16 sk rounded-lg" />
                        <div className="h-5 w-20 sk rounded-lg" />
                      </div>
                      <div className="h-1.5 sk rounded-full mb-3" />
                      <div className="flex justify-between pt-2.5 border-t border-gray-100">
                        <div className="h-3 w-16 sk rounded" />
                        <div className="h-3 w-8 sk rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : apuntesFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center" style={{ animation: 'fu .5s ease' }}>
                <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mb-6 relative"
                  style={{ background: 'linear-gradient(135deg,#FFF7ED,#FEF3C7)', boxShadow: '0 12px 40px rgba(234,88,12,.12)', border: '2px solid rgba(234,88,12,.1)' }}>
                  📭
                </div>
                <p className="font-black text-gray-800 text-2xl mb-2">No hay apuntes</p>
                <p className="text-gray-400 text-sm mb-8 max-w-xs">
                  {hayFiltros ? 'Ningún apunte coincide con los filtros seleccionados' : 'Sé el primero en subir tus apuntes al marketplace'}
                </p>
                <button
                  onClick={hayFiltros ? limpiarFiltros : () => window.location.href = '/subir'}
                  className="text-white px-8 py-3.5 rounded-2xl text-sm font-black hover:opacity-90 transition-all"
                  style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)', boxShadow: '0 8px 24px rgba(234,88,12,.35)' }}>
                  {hayFiltros ? 'Limpiar filtros' : '+ Subir apunte'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {apuntesFiltrados.map((apunte, i) => (
                  <Card3D key={apunte.id} apunte={apunte} index={i} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── MODAL FILTROS MÓVIL ── */}
      {showFiltros && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setShowFiltros(false)} />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl overflow-hidden"
            style={{ animation: 'slideUp .3s ease', maxHeight: '90vh', background: 'rgba(255,255,255,.96)', backdropFilter: 'blur(20px)' }}>

            <div className="px-5 pt-4 pb-3 sticky top-0 z-10"
              style={{ background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(229,231,235,.5)' }}>
              <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-4" />
              <div className="flex items-center justify-between">
                <h3 className="font-black text-gray-800 text-lg">Filtros</h3>
                <div className="flex items-center gap-3">
                  {hayFiltros && (
                    <button onClick={limpiarFiltros} className="text-sm font-bold" style={{ color: '#EA580C' }}>Limpiar</button>
                  )}
                  <button onClick={() => setShowFiltros(false)}
                    className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-lg">
                    ×
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-y-auto px-5 pb-8" style={{ maxHeight: 'calc(90vh - 80px)' }}>
              {/* Precio */}
              <div className="py-4 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Precio</p>
                {[{ v: '', l: 'Todos' }, { v: 'gratis', l: '🆓 Gratis' }, { v: 'pago', l: '💎 De pago' }].map(op => (
                  <button key={op.v} onClick={() => setPrecioFiltro(op.v)}
                    className="w-full flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-sm font-medium mb-1 transition-all"
                    style={precioFiltro === op.v ? { background: 'linear-gradient(135deg,#EA580C,#F97316)', color: 'white' } : { color: '#374151' }}>
                    <span className={`w-2 h-2 rounded-full ${precioFiltro === op.v ? 'bg-white' : 'bg-gray-300'}`} />
                    {op.l}
                  </button>
                ))}
              </div>

              {/* Carrera */}
              <div className="py-4 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Carrera</p>
                {[{ v: '', l: 'Todas', icon: '📚' }, ...CARRERAS.map(c => ({ v: c, l: c, icon: CM[c]?.icon || '📄' }))].map(op => {
                  const m = op.v ? (CM[op.v] || DEF) : { a: '#EA580C', b: '#F97316', icon: '📚' }
                  return (
                    <button key={op.v} onClick={() => setCarreraFiltro(op.v)}
                      className="w-full flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-sm font-medium mb-1 transition-all"
                      style={carreraFiltro === op.v ? { background: `linear-gradient(135deg,${m.a},${m.b})`, color: 'white' } : { color: '#374151' }}>
                      <span>{op.icon}</span>
                      {op.l}
                    </button>
                  )
                })}
              </div>

              {/* Ciclo */}
              <div className="py-4 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ciclo</p>
                <div className="grid grid-cols-4 gap-2">
                  {['', ...CICLOS].map(c => (
                    <button key={c} onClick={() => setCicloFiltro(c)}
                      className="py-2.5 rounded-xl text-xs font-bold transition-all"
                      style={cicloFiltro === c
                        ? { background: 'linear-gradient(135deg,#EA580C,#F97316)', color: 'white' }
                        : { backgroundColor: '#F3F4F6', color: '#6B7280' }}>
                      {c || 'Todos'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats + CTA */}
              <div className="py-5">
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { label: 'Total', val: apuntes.length, c: '#EA580C', bg: '#FFF7ED' },
                    { label: 'Gratis', val: nGratis, c: '#15803D', bg: '#F0FDF4' },
                    { label: 'Pago', val: nPago, c: '#2563EB', bg: '#EFF6FF' },
                  ].map(s => (
                    <div key={s.label} className="rounded-2xl p-3 text-center" style={{ backgroundColor: s.bg }}>
                      <p className="font-black text-xl" style={{ color: s.c }}>{s.val}</p>
                      <p className="text-xs text-gray-400 font-medium">{s.label}</p>
                    </div>
                  ))}
                </div>
                <button onClick={() => setShowFiltros(false)}
                  className="w-full py-4 rounded-2xl text-white font-black text-sm hover:opacity-90 transition"
                  style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)', boxShadow: '0 8px 24px rgba(234,88,12,.35)' }}>
                  Ver {apuntesFiltrados.length} resultado{apuntesFiltrados.length !== 1 ? 's' : ''} →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
