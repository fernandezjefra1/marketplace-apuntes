'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

function Navbar({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  return (
    <nav className="sticky top-0 z-50 border-b border-orange-100/60"
      style={{ backgroundColor: 'rgba(255,251,245,.88)', backdropFilter: 'blur(16px)' }}>
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.location.href = '/dashboard'}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black"
            style={{ background: 'linear-gradient(135deg,#C2410C,#EA580C,#F97316)' }}>A</div>
          <span className="font-black text-gray-800">ApuntesUA</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 hidden md:block">{email}</span>
          <button onClick={() => window.location.href = '/dashboard'}
            className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition px-3 py-2 rounded-xl hover:bg-gray-100">
            Marketplace
          </button>
          <button onClick={() => window.location.href = '/subir'}
            className="text-white text-sm px-4 py-2.5 rounded-xl font-bold hover:opacity-90 transition"
            style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)', boxShadow: '0 4px 14px rgba(234,88,12,.3)' }}>
            + Subir
          </button>
          <button onClick={onSignOut}
            className="text-sm text-gray-400 hover:text-red-500 transition px-2 py-2 rounded-xl hover:bg-red-50">
            Salir
          </button>
        </div>
      </div>
    </nav>
  )
}

export default function MisApuntes() {
  const [user, setUser]           = useState<any>(null)
  const [misApuntes, setMisApuntes] = useState<any[]>([])
  const [misCompras, setMisCompras] = useState<any[]>([])
  const [tab, setTab]             = useState<'subidos' | 'comprados'>('subidos')
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    const cargar = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) { window.location.href = '/'; return }
      setUser(userData.user)
      const [{ data: apuntes }, { data: compras }] = await Promise.all([
        supabase.from('apuntes').select('*').eq('usuario_id', userData.user.id).order('created_at', { ascending: false }),
        supabase.from('compras').select('*, apuntes(*)').eq('comprador_id', userData.user.id).order('created_at', { ascending: false }),
      ])
      setMisApuntes(apuntes || [])
      setMisCompras(compras || [])
      setLoading(false)
    }
    cargar()
  }, [])

  const cerrarSesion = async () => { await supabase.auth.signOut(); window.location.href = '/' }

  const CardApunte = ({ apunte, esComprado = false }: { apunte: any; esComprado?: boolean }) => (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden group transition-all hover:-translate-y-1"
      style={{ boxShadow: '0 2px 16px rgba(0,0,0,.06)' }}>

      {/* Score banner if exists */}
      {apunte.score_ia && (
        <div className="h-1.5 w-full"
          style={{ background: apunte.score_ia >= 90 ? 'linear-gradient(90deg,#15803D,#22C55E)' : apunte.score_ia >= 75 ? 'linear-gradient(90deg,#2563EB,#60A5FA)' : 'linear-gradient(90deg,#EA580C,#F97316)' }} />
      )}

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs font-bold px-2.5 py-1 rounded-xl text-white"
              style={{ background: 'linear-gradient(135deg,#C2410C,#EA580C)' }}>
              {apunte.carrera || 'General'}
            </span>
            {apunte.ciclo && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-gray-100 text-gray-600">
                Ciclo {apunte.ciclo}
              </span>
            )}
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-xl text-white flex-shrink-0"
            style={{ backgroundColor: apunte.precio > 0 ? '#2563EB' : '#15803D' }}>
            {apunte.precio > 0 ? `S/. ${apunte.precio}` : 'Gratis'}
          </span>
        </div>

        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: '#FFF7ED' }}>
          <span className="text-xl">📄</span>
        </div>

        <h3 className="font-bold text-gray-800 mb-1 text-sm leading-snug group-hover:text-orange-600 transition-colors line-clamp-2">
          {apunte.titulo}
        </h3>
        {apunte.curso && (
          <p className="text-xs font-semibold mb-1" style={{ color: '#EA580C' }}>{apunte.curso}</p>
        )}
        {apunte.descripcion && (
          <p className="text-gray-400 text-xs mb-3 line-clamp-2">{apunte.descripcion}</p>
        )}

        {apunte.score_ia && (
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-xs font-bold px-2 py-0.5 rounded-lg text-white"
              style={{ backgroundColor: apunte.score_ia >= 90 ? '#15803D' : apunte.score_ia >= 75 ? '#2563EB' : '#EA580C' }}>
              IA {apunte.score_ia}pts
            </span>
            {apunte.apto_pack_examen && <span className="text-xs font-bold text-purple-600">⭐ Pack Examen</span>}
          </div>
        )}

        <div className="flex gap-2 mt-3">
          <button onClick={() => window.location.href = `/apunte/${apunte.id}`}
            className="flex-1 py-2 rounded-xl text-xs font-bold border-2 transition hover:bg-orange-50"
            style={{ borderColor: '#EA580C', color: '#EA580C' }}>
            Ver detalle
          </button>
          {apunte.archivo_url && (
            <button onClick={() => window.open(apunte.archivo_url, '_blank')}
              className="flex-1 py-2 rounded-xl text-xs font-bold text-white transition hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)' }}>
              Descargar
            </button>
          )}
        </div>

        {!esComprado && (
          <button onClick={async () => {
            if (!confirm('¿Seguro que quieres eliminar este apunte?')) return
            await supabase.from('apuntes').delete().eq('id', apunte.id)
            window.location.reload()
          }}
            className="w-full mt-2 py-2 rounded-xl text-xs font-bold border border-red-200 text-red-500 hover:bg-red-50 transition">
            Eliminar
          </button>
        )}
      </div>
    </div>
  )

  const listaActual = tab === 'subidos' ? misApuntes : misCompras.map(c => c.apuntes).filter(Boolean)

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg,#FFF7ED 0%,#FFFBF5 20%,#F9FAFB 50%)' }}>
      <Navbar email={user?.email || ''} onSignOut={cerrarSesion} />

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Header con gradiente */}
        <div className="rounded-3xl p-7 mb-8 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#9A3412,#C2410C,#EA580C,#F97316)' }}>
          <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/10" />
          <div className="absolute right-16 -bottom-8 w-24 h-24 rounded-full bg-white/10" />
          <div className="relative z-10">
            <p className="text-orange-200 text-xs font-bold uppercase tracking-widest mb-1">Mi perfil</p>
            <h1 className="text-white font-black text-2xl mb-1">Mis apuntes</h1>
            <p className="text-orange-200 text-sm">{user?.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Subidos', val: misApuntes.length, icon: '📤', color: '#EA580C', bg: '#FFF7ED' },
            { label: 'Comprados', val: misCompras.length, icon: '🛒', color: '#2563EB', bg: '#EFF6FF' },
            { label: 'Gratis', val: misApuntes.filter(a => !a.precio || a.precio === 0).length, icon: '🆓', color: '#15803D', bg: '#F0FDF4' },
            { label: 'De pago', val: misApuntes.filter(a => a.precio > 0).length, icon: '💰', color: '#7C3AED', bg: '#F5F3FF' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3"
                style={{ backgroundColor: s.bg }}>
                {s.icon}
              </div>
              <p className="text-3xl font-black mb-0.5" style={{ color: s.color }}>{s.val}</p>
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 rounded-2xl mb-6 w-fit"
          style={{ backgroundColor: '#F3F4F6' }}>
          {[{ val: 'subidos', label: '📤 Subidos por mí' }, { val: 'comprados', label: '🛒 Comprados' }].map(t => (
            <button key={t.val} onClick={() => setTab(t.val as any)}
              className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={tab === t.val
                ? { background: 'linear-gradient(135deg,#EA580C,#F97316)', color: 'white', boxShadow: '0 4px 14px rgba(234,88,12,.3)' }
                : { color: '#6B7280' }}>
              {t.label} <span className="ml-1 font-black">{t.val === 'subidos' ? misApuntes.length : misCompras.length}</span>
            </button>
          ))}
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
                <div className="flex justify-between mb-3">
                  <div className="h-5 w-24 rounded-xl bg-gray-100" />
                  <div className="h-5 w-16 rounded-xl bg-gray-100" />
                </div>
                <div className="h-10 w-10 rounded-xl bg-gray-100 mb-3" />
                <div className="h-4 bg-gray-100 rounded mb-2" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : listaActual.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-5"
              style={{ backgroundColor: '#FFF7ED' }}>
              {tab === 'subidos' ? '📝' : '🛒'}
            </div>
            <p className="font-black text-gray-800 text-xl mb-2">
              {tab === 'subidos' ? 'No has subido apuntes aún' : 'No has comprado apuntes aún'}
            </p>
            <p className="text-gray-400 text-sm mb-6">
              {tab === 'subidos' ? 'Sube tu primer apunte y empieza a ganar' : 'Encuentra apuntes en el marketplace'}
            </p>
            <button onClick={() => window.location.href = tab === 'subidos' ? '/subir' : '/dashboard'}
              className="text-white px-6 py-3 rounded-2xl text-sm font-bold hover:opacity-90 transition"
              style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)', boxShadow: '0 6px 20px rgba(234,88,12,.35)' }}>
              {tab === 'subidos' ? 'Subir mi primer apunte →' : 'Explorar apuntes →'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listaActual.map(apunte => (
              <CardApunte key={apunte.id} apunte={apunte} esComprado={tab === 'comprados'} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
