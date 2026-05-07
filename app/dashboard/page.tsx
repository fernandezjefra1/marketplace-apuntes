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
  const [precioFiltro, setPrecioFiltro] = useState('')
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
    const coincidePrecio = precioFiltro === 'gratis' ? (!a.precio || a.precio === 0) :
      precioFiltro === 'pago' ? a.precio > 0 : true
    return coincideBusqueda && coincideCarrera && coincideCiclo && coincidePrecio
  })

  const limpiarFiltros = () => {
    setBusqueda('')
    setCarreraFiltro('')
    setCicloFiltro('')
    setPrecioFiltro('')
  }

  const hayFiltros = busqueda || carreraFiltro || cicloFiltro || precioFiltro

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F9FA' }}>

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer"
            onClick={() => window.location.href = '/dashboard'}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: '#EA580C' }}>A</div>
            <span className="font-bold text-gray-800">ApuntesUA</span>
          </div>

          {/* Buscador central */}
          <div className="flex-1 max-w-md mx-6">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Buscar apuntes..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full border border-gray-200 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-orange-300 bg-gray-50"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden md:block">{user?.email}</span>
            <button onClick={() => window.location.href = '/mis-apuntes'}
              className="text-sm text-gray-500 hover:text-gray-700 transition font-medium">
              Mis apuntes
            </button>
            {user?.email === 'fernandezjefra1@autonomoma.edu.pe' && (
              <button onClick={() => window.location.href = '/admin'}
                className="text-xs font-bold px-3 py-1 rounded-lg text-white"
                style={{ backgroundColor: '#EA580C' }}>
                Admin
              </button>
            )}
            <button onClick={() => window.location.href = '/subir'}
              className="text-white text-sm px-4 py-2 rounded-xl font-semibold hover:opacity-90 transition"
              style={{ backgroundColor: '#EA580C' }}>
              + Subir
            </button>
            <button onClick={cerrarSesion}
              className="text-sm text-gray-400 hover:text-red-400 transition">
              Salir
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto flex">

        {/* Sidebar izquierdo — Filtros */}
        <aside className="w-72 min-h-screen border-r border-gray-100 bg-white p-6 sticky top-14 self-start">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-gray-800 text-lg">Filtros</h2>
            {hayFiltros && (
              <button onClick={limpiarFiltros}
                className="text-xs font-semibold hover:underline"
                style={{ color: '#EA580C' }}>
                Limpiar todo
              </button>
            )}
          </div>

          {/* Precio */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 text-sm mb-3">Precio</h3>
            <div className="space-y-2">
              {[
                { value: '', label: 'Todos' },
                { value: 'gratis', label: 'Gratis' },
                { value: 'pago', label: 'De pago' },
              ].map(op => (
                <label key={op.value} className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className="w-4 h-4 rounded-full border-2 flex items-center justify-center transition"
                    style={{
                      borderColor: precioFiltro === op.value ? '#EA580C' : '#D1D5DB',
                      backgroundColor: precioFiltro === op.value ? '#EA580C' : 'white'
                    }}
                    onClick={() => setPrecioFiltro(op.value)}
                  >
                    {precioFiltro === op.value && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="text-sm text-gray-600 group-hover:text-gray-800"
                    onClick={() => setPrecioFiltro(op.value)}>
                    {op.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 my-4"></div>

          {/* Carrera */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 text-sm mb-3">Carrera</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center transition"
                  style={{
                    borderColor: carreraFiltro === '' ? '#EA580C' : '#D1D5DB',
                    backgroundColor: carreraFiltro === '' ? '#EA580C' : 'white'
                  }}
                  onClick={() => setCarreraFiltro('')}>
                  {carreraFiltro === '' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                </div>
                <span className="text-sm text-gray-600" onClick={() => setCarreraFiltro('')}>Todas</span>
              </label>
              {CARRERAS.map(c => (
                <label key={c} className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center transition"
                    style={{
                      borderColor: carreraFiltro === c ? '#EA580C' : '#D1D5DB',
                      backgroundColor: carreraFiltro === c ? '#EA580C' : 'white'
                    }}
                    onClick={() => setCarreraFiltro(c)}>
                    {carreraFiltro === c && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                  </div>
                  <span className="text-sm text-gray-600 group-hover:text-gray-800"
                    onClick={() => setCarreraFiltro(c)}>
                    {c}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 my-4"></div>

          {/* Ciclo */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 text-sm mb-3">Ciclo</h3>
            <div className="grid grid-cols-5 gap-2">
              <button
                onClick={() => setCicloFiltro('')}
                className="py-1 rounded-lg text-xs font-semibold transition"
                style={cicloFiltro === ''
                  ? { backgroundColor: '#EA580C', color: 'white' }
                  : { backgroundColor: '#F3F4F6', color: '#6B7280' }}>
                Todos
              </button>
              {CICLOS.map(c => (
                <button key={c}
                  onClick={() => setCicloFiltro(c)}
                  className="py-1 rounded-lg text-xs font-semibold transition"
                  style={cicloFiltro === c
                    ? { backgroundColor: '#EA580C', color: 'white' }
                    : { backgroundColor: '#F3F4F6', color: '#6B7280' }}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 my-4"></div>

          {/* Stats */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Total apuntes</span>
              <span className="font-bold text-gray-800">{apuntes.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Gratis</span>
              <span className="font-bold text-green-600">{apuntes.filter(a => !a.precio || a.precio === 0).length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">De pago</span>
              <span className="font-bold text-blue-600">{apuntes.filter(a => a.precio > 0).length}</span>
            </div>
          </div>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 p-6">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-gray-800 text-lg">
                {carreraFiltro || 'Todos los apuntes'}
              </h2>
              <p className="text-sm text-gray-400">
                {apuntesFiltrados.length} resultado{apuntesFiltrados.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-2xl p-5 animate-pulse">
                  <div className="h-3 bg-gray-100 rounded mb-3 w-1/2"></div>
                  <div className="h-5 bg-gray-100 rounded mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : apuntesFiltrados.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-6xl mb-4">📭</p>
              <p className="text-gray-600 font-semibold text-lg">No hay apuntes</p>
              <p className="text-gray-400 text-sm mt-1 mb-6">
                {hayFiltros ? 'Prueba con otros filtros' : 'Se el primero en subir uno'}
              </p>
              {hayFiltros ? (
                <button onClick={limpiarFiltros}
                  className="text-white px-6 py-2 rounded-xl text-sm font-semibold"
                  style={{ backgroundColor: '#EA580C' }}>
                  Limpiar filtros
                </button>
              ) : (
                <button onClick={() => window.location.href = '/subir'}
                  className="text-white px-6 py-2 rounded-xl text-sm font-semibold"
                  style={{ backgroundColor: '#EA580C' }}>
                  Subir apunte
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {apuntesFiltrados.map((apunte, index) => (
                <div
                  key={apunte.id}
                  className="bg-white rounded-2xl p-5 hover:shadow-md cursor-pointer group transition-all"
                  style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                    transition: `all 0.4s ease ${index * 0.05}s`,
                  }}
                  onClick={() => window.location.href = `/apunte/${apunte.id}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-bold px-2 py-1 rounded-lg text-white"
                      style={{ backgroundColor: '#EA580C' }}>
                      {apunte.carrera || 'General'}
                    </span>
                    <span className="text-xs font-bold px-2 py-1 rounded-lg text-white"
                      style={{ backgroundColor: apunte.precio > 0 ? '#3B82F6' : '#16A34A' }}>
                      {apunte.precio > 0 ? `S/. ${apunte.precio}` : 'Gratis'}
                    </span>
                  </div>

                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: '#FFF7ED' }}>
                    <span className="text-lg">📄</span>
                  </div>

                  <h3 className="font-bold text-gray-800 mb-1 text-sm group-hover:text-orange-600 transition-colors line-clamp-2">
                    {apunte.titulo}
                  </h3>
                  {apunte.curso && (
                    <p className="text-xs font-semibold mb-2" style={{ color: '#EA580C' }}>
                      {apunte.curso}
                    </p>
                  )}
                  {apunte.ciclo && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-lg">
                      Ciclo {apunte.ciclo}
                    </span>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                    <span className="text-xs text-gray-400">
                      {new Date(apunte.created_at).toLocaleDateString('es-PE')}
                    </span>
                    <span className="text-xs font-semibold group-hover:underline"
                      style={{ color: '#EA580C' }}>
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
  )
}