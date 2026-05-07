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
  const [user, setUser] = useState<any>(null)
  const [apuntes, setApuntes] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [carreraFiltro, setCarreraFiltro] = useState('')
  const [cicloFiltro, setCicloFiltro] = useState('')
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) { window.location.href = '/'; return }
      setUser(data.user)
      cargarApuntes()
    }
    getUser()
  }, [])

  const cargarApuntes = async () => {
    const { data } = await supabase
      .from('apuntes')
      .select('*')
      .order('created_at', { ascending: false })
    setApuntes(data || [])
    setLoading(false)
  }

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const apuntesFiltrados = apuntes.filter(a => {
    const coincideBusqueda =
      a.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.curso?.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCarrera = carreraFiltro ? a.carrera === carreraFiltro : true
    const coincideCiclo = cicloFiltro ? a.ciclo === cicloFiltro : true
    return coincideBusqueda && coincideCarrera && coincideCiclo
  })

  const limpiarFiltros = () => {
    setBusqueda('')
    setCarreraFiltro('')
    setCicloFiltro('')
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F9FA' }}>

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-10"
        style={{ backdropFilter: 'blur(10px)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer"
            onClick={() => window.location.href = '/dashboard'}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: '#EA580C' }}>A</div>
            <div>
              <h1 className="font-bold text-gray-800 leading-none text-sm">ApuntesUA</h1>
              <p className="text-xs text-gray-400">Universidad Autonoma del Peru</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden md:block bg-gray-100 px-3 py-1 rounded-full">
              {user?.email}
            </span>
            <button onClick={() => window.location.href = '/mis-apuntes'}
              className="text-sm text-gray-500 hover:text-gray-700 transition font-medium">
              Mis apuntes
            </button>
            {user?.email === 'fernandezjefra1@autonoma.edu.pe' && (
              <button onClick={() => window.location.href = '/admin'}
                className="text-xs font-bold px-3 py-1 rounded-lg text-white"
                style={{ backgroundColor: '#EA580C' }}>
                Admin
              </button>
            )}
            <button onClick={() => window.location.href = '/subir'}
              className="text-white text-sm px-4 py-2 rounded-xl font-semibold flex items-center gap-2 hover:opacity-90 transition"
              style={{ backgroundColor: '#EA580C' }}>
              <span>+</span> Subir
            </button>
            <button onClick={cerrarSesion}
              className="text-sm text-gray-400 hover:text-red-400 transition">
              Salir
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Hero bienvenida */}
        <div
          className="rounded-2xl p-8 mb-8 text-white relative overflow-hidden"
          style={{
            backgroundColor: '#EA580C',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.5s ease'
          }}
        >
          <div className="relative z-10">
            <p className="text-orange-200 text-sm font-medium mb-1">Bienvenido de vuelta 👋</p>
            <h2 className="text-2xl font-bold mb-1">{user?.email?.split('@')[0]}</h2>
            <p className="text-orange-100 text-sm">Encuentra los mejores apuntes de la UA</p>
          </div>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 text-8xl opacity-20">📚</div>
          <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full opacity-10"
            style={{ backgroundColor: 'white' }}></div>
        </div>

        {/* Stats rápidas */}
        <div
          className="grid grid-cols-3 gap-4 mb-8"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s ease 0.1s'
          }}
        >
          {[
            { icon: '📄', label: 'Apuntes disponibles', value: apuntes.length },
            { icon: '🎁', label: 'Apuntes gratis', value: apuntes.filter(a => !a.precio || a.precio === 0).length },
            { icon: '💰', label: 'Apuntes de pago', value: apuntes.filter(a => a.precio > 0).length },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 text-center shadow-sm hover:shadow-md transition-shadow">
              <p className="text-2xl mb-2">{stat.icon}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Buscador y filtros */}
        <div
          className="bg-white rounded-2xl shadow-sm p-6 mb-6"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s ease 0.2s'
          }}
        >
          <div className="relative mb-4">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Buscar por titulo, curso o tema..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full border border-gray-100 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-gray-50 transition"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-48">
              <select
                value={carreraFiltro}
                onChange={(e) => setCarreraFiltro(e.target.value)}
                className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none bg-gray-50 text-gray-600"
              >
                <option value="">Todas las carreras</option>
                {CARRERAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-48">
              <select
                value={cicloFiltro}
                onChange={(e) => setCicloFiltro(e.target.value)}
                className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none bg-gray-50 text-gray-600"
              >
                <option value="">Todos los ciclos</option>
                {CICLOS.map(c => <option key={c} value={c}>Ciclo {c}</option>)}
              </select>
            </div>
            {(busqueda || carreraFiltro || cicloFiltro) && (
              <button onClick={limpiarFiltros}
                className="px-4 py-3 text-sm rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition font-medium">
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Resultados */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-400 font-medium">
            {apuntesFiltrados.length} apunte{apuntesFiltrados.length !== 1 ? 's' : ''} encontrado{apuntesFiltrados.length !== 1 ? 's' : ''}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-gray-100 rounded mb-3 w-2/3"></div>
                <div className="h-6 bg-gray-100 rounded mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : apuntesFiltrados.length === 0 ? (
          <div className="text-center py-20"
            style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.5s ease' }}>
            <p className="text-6xl mb-4">📭</p>
            <p className="text-gray-600 font-semibold text-lg">No hay apuntes aun</p>
            <p className="text-gray-400 text-sm mt-1 mb-6">Se el primero en compartir uno</p>
            <button onClick={() => window.location.href = '/subir'}
              className="text-white px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition"
              style={{ backgroundColor: '#EA580C' }}>
              Subir mi primer apunte
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apuntesFiltrados.map((apunte, index) => (
              <div
                key={apunte.id}
                className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg cursor-pointer group"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                  transition: `all 0.5s ease ${index * 0.05}s`,
                }}
                onClick={() => window.location.href = `/apunte/${apunte.id}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs font-semibold px-2 py-1 rounded-lg text-white"
                      style={{ backgroundColor: '#EA580C' }}>
                      {apunte.carrera || 'General'}
                    </span>
                    {apunte.ciclo && (
                      <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-gray-100 text-gray-600">
                        Ciclo {apunte.ciclo}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-lg text-white"
                    style={{ backgroundColor: apunte.precio > 0 ? '#3B82F6' : '#16A34A' }}>
                    {apunte.precio > 0 ? `S/. ${apunte.precio}` : 'Gratis'}
                  </span>
                </div>

                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: '#FFF7ED' }}>
                  <span className="text-xl">📄</span>
                </div>

                <h3 className="font-bold text-gray-800 mb-1 group-hover:text-orange-600 transition-colors">
                  {apunte.titulo}
                </h3>
                {apunte.curso && (
                  <p className="text-xs font-semibold mb-2" style={{ color: '#EA580C' }}>
                    {apunte.curso}
                  </p>
                )}
                <p className="text-gray-400 text-sm line-clamp-2 mb-4">{apunte.descripcion}</p>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <span className="text-xs text-gray-400">
                    {new Date(apunte.created_at).toLocaleDateString('es-PE')}
                  </span>
                  <span className="text-xs font-semibold group-hover:underline"
                    style={{ color: '#EA580C' }}>
                    Ver apunte →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}