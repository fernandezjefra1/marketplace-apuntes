'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const ADMIN_EMAIL = 'fernandezjefra1@autonoma.edu.pe'

export default function Admin() {
  const [user, setUser]       = useState<any>(null)
  const [apuntes, setApuntes] = useState<any[]>([])
  const [compras, setCompras] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [denegado, setDenegado] = useState(false)

  useEffect(() => {
    const cargar = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) { window.location.href = '/'; return }
      if (userData.user.email !== ADMIN_EMAIL) { setDenegado(true); setLoading(false); return }
      setUser(userData.user)
      const [{ data: a }, { data: c }] = await Promise.all([
        supabase.from('apuntes').select('*').order('created_at', { ascending: false }),
        supabase.from('compras').select('*, apuntes(*)').order('created_at', { ascending: false }),
      ])
      setApuntes(a || [])
      setCompras(c || [])
      setLoading(false)
    }
    cargar()
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0F172A' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-orange-800 border-t-orange-400 rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Cargando panel...</p>
      </div>
    </div>
  )

  if (denegado) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(160deg,#FFF7ED,#F9FAFB)' }}>
      <div className="text-center bg-white rounded-3xl p-12 shadow-xl max-w-sm mx-4">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-5 mx-auto bg-red-50">🚫</div>
        <p className="font-black text-gray-800 text-2xl mb-2">Acceso denegado</p>
        <p className="text-gray-400 text-sm mb-6">No tienes permisos de administrador</p>
        <button onClick={() => window.location.href = '/dashboard'}
          className="text-white px-6 py-3 rounded-2xl text-sm font-bold hover:opacity-90 transition"
          style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)' }}>
          Volver al marketplace
        </button>
      </div>
    </div>
  )

  const totalVentas        = compras.reduce((acc, c) => acc + (c.monto || 0), 0)
  const comisionPlataforma = totalVentas * 0.30
  const gananciaCreadores  = totalVentas * 0.70
  const apuntesPago        = apuntes.filter(a => a.precio > 0)
  const apuntesGratis      = apuntes.filter(a => !a.precio || a.precio === 0)

  const STATS = [
    { label: 'Apuntes totales', val: apuntes.length, icon: '📄', color: '#EA580C', bg: '#FFF7ED' },
    { label: 'Ventas realizadas', val: compras.length, icon: '🛒', color: '#2563EB', bg: '#EFF6FF' },
    { label: 'Total facturado', val: `S/. ${totalVentas.toFixed(2)}`, icon: '💳', color: '#15803D', bg: '#F0FDF4' },
    { label: 'Comisión (30%)', val: `S/. ${comisionPlataforma.toFixed(2)}`, icon: '🏦', color: '#7C3AED', bg: '#F5F3FF' },
  ]

  return (
    <>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp .4s ease forwards }
        tr:hover td { background-color: #FFFBF5 !important; }
      `}</style>

      <div className="min-h-screen" style={{ background: 'linear-gradient(160deg,#1E0A00 0%,#0F172A 40%,#0F172A 100%)' }}>

        {/* ── NAVBAR dark ── */}
        <nav className="sticky top-0 z-50 border-b border-white/10"
          style={{ backgroundColor: 'rgba(15,23,42,.9)', backdropFilter: 'blur(16px)' }}>
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black"
                style={{ background: 'linear-gradient(135deg,#C2410C,#EA580C,#F97316)' }}>A</div>
              <div>
                <span className="font-black text-white text-sm">ApuntesUA</span>
                <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full text-orange-400 border border-orange-900/60 bg-orange-950/40">
                  Admin
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-500 text-xs hidden md:block">{user?.email}</span>
              <button onClick={() => window.location.href = '/dashboard'}
                className="text-sm font-semibold text-gray-400 hover:text-white transition px-3 py-2 rounded-xl hover:bg-white/10">
                Ver marketplace
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-6 py-8">

          {/* Header */}
          <div className="mb-8 fade-up">
            <p className="text-orange-500 text-xs font-bold uppercase tracking-widest mb-1">Panel de control</p>
            <h1 className="text-white font-black text-3xl">Administración</h1>
            <p className="text-gray-500 text-sm mt-1">Resumen general del marketplace ApuntesUA</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {STATS.map((s, i) => (
              <div key={s.label} className="rounded-2xl p-5 border border-white/10 fade-up"
                style={{ backgroundColor: 'rgba(255,255,255,.04)', animationDelay: `${i * 0.08}s` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4"
                  style={{ backgroundColor: s.bg }}>
                  {s.icon}
                </div>
                <p className="text-2xl font-black text-white mb-0.5">{s.val}</p>
                <p className="text-gray-500 text-xs font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Modelo de comisiones */}
          <div className="rounded-2xl border border-white/10 p-6 mb-8 fade-up"
            style={{ backgroundColor: 'rgba(255,255,255,.03)' }}>
            <h3 className="text-white font-bold mb-5">Reparto de ingresos</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { pct: '70%', label: 'Creadores', val: gananciaCreadores, color: '#15803D', bg: '#F0FDF4' },
                { pct: '30%', label: 'ApuntesUA', val: comisionPlataforma, color: '#EA580C', bg: '#FFF7ED' },
                { pct: '100%', label: 'Total facturado', val: totalVentas, color: '#7C3AED', bg: '#F5F3FF' },
              ].map(item => (
                <div key={item.label} className="rounded-2xl p-5 text-center border border-white/10"
                  style={{ backgroundColor: 'rgba(255,255,255,.05)' }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: item.bg }}>
                    <span className="font-black text-sm" style={{ color: item.color }}>{item.pct}</span>
                  </div>
                  <p className="text-white font-bold text-sm">{item.label}</p>
                  <p className="text-gray-400 text-xs mt-1">S/. {item.val.toFixed(2)}</p>
                </div>
              ))}
            </div>

            {/* Barra visual */}
            <div className="mt-5 h-3 rounded-full overflow-hidden flex" style={{ backgroundColor: 'rgba(255,255,255,.1)' }}>
              <div className="h-full transition-all" style={{ width: '70%', background: 'linear-gradient(90deg,#15803D,#22C55E)' }} />
              <div className="h-full transition-all" style={{ width: '30%', background: 'linear-gradient(90deg,#EA580C,#F97316)' }} />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-green-500 font-medium">Creadores 70%</span>
              <span className="text-xs text-orange-500 font-medium">Plataforma 30%</span>
            </div>
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { icon: '💰', label: `${apuntesPago.length} apuntes de pago`, desc: 'Generan comisión del 30%', color: '#2563EB', bg: 'rgba(37,99,235,.1)' },
              { icon: '🎁', label: `${apuntesGratis.length} apuntes gratis`, desc: 'Aumentan la comunidad', color: '#15803D', bg: 'rgba(21,128,61,.1)' },
            ].map(item => (
              <div key={item.label} className="rounded-2xl p-5 border border-white/10 flex items-center gap-4"
                style={{ backgroundColor: 'rgba(255,255,255,.03)' }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: item.bg }}>
                  {item.icon}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{item.label}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tabla de apuntes */}
          <div className="rounded-2xl border border-white/10 overflow-hidden fade-up"
            style={{ backgroundColor: 'rgba(255,255,255,.03)' }}>
            <div className="px-6 py-4 border-b border-white/10">
              <h3 className="text-white font-bold">Todos los apuntes</h3>
              <p className="text-gray-500 text-xs mt-0.5">{apuntes.length} registros</p>
            </div>
            {apuntes.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No hay apuntes aún</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      {['Título', 'Carrera', 'Ciclo', 'Precio', 'Comisión 30%', 'Score IA', 'Fecha'].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {apuntes.map(apunte => (
                      <tr key={apunte.id} className="border-b border-white/5 transition cursor-pointer"
                        onClick={() => window.location.href = `/apunte/${apunte.id}`}>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-gray-200 text-sm line-clamp-1 max-w-48">{apunte.titulo}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs font-bold px-2 py-1 rounded-lg text-white"
                            style={{ background: 'linear-gradient(135deg,#C2410C,#EA580C)' }}>
                            {apunte.carrera || 'General'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-400 text-sm">{apunte.ciclo || '–'}</td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-sm" style={{ color: apunte.precio > 0 ? '#60A5FA' : '#4ADE80' }}>
                            {apunte.precio > 0 ? `S/. ${apunte.precio}` : 'Gratis'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-sm" style={{ color: '#FB923C' }}>
                          {apunte.precio > 0 ? `S/. ${(apunte.precio * 0.30).toFixed(2)}` : '–'}
                        </td>
                        <td className="py-3 px-4">
                          {apunte.score_ia ? (
                            <span className="text-xs font-bold px-2 py-1 rounded-lg text-white"
                              style={{ backgroundColor: apunte.score_ia >= 90 ? '#15803D' : apunte.score_ia >= 75 ? '#2563EB' : '#EA580C' }}>
                              {apunte.score_ia}pts
                            </span>
                          ) : <span className="text-gray-600 text-xs">–</span>}
                        </td>
                        <td className="py-3 px-4 text-gray-500 text-xs">
                          {new Date(apunte.created_at).toLocaleDateString('es-PE')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
