'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const CARRERAS = [
  'Administracion',
  'Contabilidad', 
  'Derecho',
  'Ingenieria de Sistemas',
  'Ingenieria Civil',
  'Psicologia',
  'Enfermeria',
  'Marketing',
]

const CICLOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [apuntes, setApuntes] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [carreraFiltro, setCarreraFiltro] = useState('')
  const [cicloFiltro, setCicloFiltro] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>

      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📖</span>
            <div>
              <h1 className="font-bold text-gray-800 leading-none">ApuntesUA</h1>
              <p className="text-xs text-gray-400">Universidad Autonoma del Peru</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden md:block">{user?.email}</span>
            <button
              onClick={() => window.location.href = '/subir'}
              className="text-white text-sm px-4 py-2 rounded-xl font-semibold"
              style={{ backgroundColor: '#EA580C' }}
            >
              + Subir apunte
            </button>
            <button
  onClick={() => window.location.href = '/mis-apuntes'}
  className="text-sm text-gray-500 hover:text-gray-700 transition"
>
  Mis apuntes
</button>
<button
  onClick={() => window.location.href = '/admin'}
  className="text-sm font-semibold px-3 py-1 rounded-lg text-white"
  style={{ backgroundColor: '#EA580C' }}
>
  Admin
</button>
            <button onClick={cerrarSesion} className="text-sm text-gray-500 hover:text-red-500 transition">
              Salir
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Encuentra tus apuntes</h2>
          <p className="text-gray-400 text-sm mt-1">Filtra por carrera, ciclo o busca por nombre</p>
        </div>

        {/* Buscador y filtros */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <input
            type="text"
            placeholder="Buscar por titulo, curso o tema..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none mb-4"
          />

          <div className="flex flex-wrap gap-4">
            {/* Filtro carrera */}
            <div className="flex-1 min-w-48">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Carrera</label>
              <select
                value={carreraFiltro}
                onChange={(e) => setCarreraFiltro(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none"
              >
                <option value="">Todas las carreras</option>
                {CARRERAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Filtro ciclo */}
            <div className="flex-1 min-w-48">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Ciclo</label>
              <select
                value={cicloFiltro}
                onChange={(e) => setCicloFiltro(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none"
              >
                <option value="">Todos los ciclos</option>
                {CICLOS.map(c => <option key={c} value={c}>Ciclo {c}</option>)}
              </select>
            </div>

            {/* Limpiar filtros */}
            {(busqueda || carreraFiltro || cicloFiltro) && (
              <div className="flex items-end">
                <button
                  onClick={limpiarFiltros}
                  className="px-4 py-3 text-sm rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Resultados */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-400">
            {apuntesFiltrados.length} apunte{apuntesFiltrados.length !== 1 ? 's' : ''} encontrado{apuntesFiltrados.length !== 1 ? 's' : ''}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Cargando apuntes...</div>
        ) : apuntesFiltrados.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">📭</p>
            <p className="text-gray-500 font-semibold">No hay apuntes aun</p>
            <p className="text-gray-400 text-sm mt-1">Se el primero en subir uno</p>
            <button
              onClick={() => window.location.href = '/subir'}
              className="mt-4 text-white px-6 py-2 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: '#EA580C' }}
            >
              Subir apunte
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apuntesFiltrados.map((apunte) => (
              <div key={apunte.id} className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full text-white mr-2"
                      style={{ backgroundColor: '#EA580C' }}>
                      {apunte.carrera || 'General'}
                    </span>
                    {apunte.ciclo && (
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        Ciclo {apunte.ciclo}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full text-white"
                    style={{ backgroundColor: apunte.precio > 0 ? '#1D4ED8' : '#16A34A' }}>
                    {apunte.precio > 0 ? `S/. ${apunte.precio}` : 'Gratis'}
                  </span>
                </div>

                <p className="text-3xl mb-2">📄</p>
                <h3 className="font-bold text-gray-800 mb-1">{apunte.titulo}</h3>
                {apunte.curso && (
                  <p className="text-xs text-orange-500 font-semibold mb-1">Curso: {apunte.curso}</p>
                )}
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{apunte.descripcion}</p>

                <button
  onClick={() => window.location.href = `/apunte/${apunte.id}`}
  className="w-full py-2 rounded-xl text-sm font-semibold border transition hover:text-white"
  style={{ borderColor: '#EA580C', color: '#EA580C' }}
  onMouseEnter={e => {
    (e.target as HTMLButtonElement).style.backgroundColor = '#EA580C'
    ;(e.target as HTMLButtonElement).style.color = 'white'
  }}
  onMouseLeave={e => {
    (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
    ;(e.target as HTMLButtonElement).style.color = '#EA580C'
  }}
>
  Ver apunte
</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}