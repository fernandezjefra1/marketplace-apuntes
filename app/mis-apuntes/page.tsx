'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function MisApuntes() {
  const [user, setUser] = useState<any>(null)
  const [misApuntes, setMisApuntes] = useState<any[]>([])
  const [misCompras, setMisCompras] = useState<any[]>([])
  const [tab, setTab] = useState<'subidos' | 'comprados'>('subidos')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) { window.location.href = '/'; return }
      setUser(userData.user)

      const { data: apuntes } = await supabase
        .from('apuntes')
        .select('*')
        .eq('usuario_id', userData.user.id)
        .order('created_at', { ascending: false })
      setMisApuntes(apuntes || [])

      const { data: compras } = await supabase
        .from('compras')
        .select('*, apuntes(*)')
        .eq('comprador_id', userData.user.id)
        .order('created_at', { ascending: false })
      setMisCompras(compras || [])

      setLoading(false)
    }
    cargar()
  }, [])

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const CardApunte = ({ apunte, esComprado = false }: { apunte: any, esComprado?: boolean }) => (
    <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-3">
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full text-white"
            style={{ backgroundColor: '#EA580C' }}>
            {apunte.carrera || 'General'}
          </span>
          {apunte.ciclo && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-600">
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
        <p className="text-xs font-semibold mb-1" style={{ color: '#EA580C' }}>
          Curso: {apunte.curso}
        </p>
      )}
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{apunte.descripcion}</p>

      <div className="flex gap-2 flex-wrap">
  <button
    onClick={() => window.location.href = `/apunte/${apunte.id}`}
    className="flex-1 py-2 rounded-xl text-sm font-semibold border transition"
    style={{ borderColor: '#EA580C', color: '#EA580C' }}
  >
    Ver detalle
  </button>
  {apunte.archivo_url && (
    <button
      onClick={() => window.open(apunte.archivo_url, '_blank')}
      className="flex-1 py-2 rounded-xl text-sm font-semibold text-white transition"
      style={{ backgroundColor: '#EA580C' }}
    >
      Descargar
    </button>
  )}
  {!esComprado && (
    <button
      onClick={async () => {
        if (!confirm('Seguro que quieres eliminar este apunte?')) return
        await supabase.from('apuntes').delete().eq('id', apunte.id)
        window.location.reload()
      }}
      className="w-full py-2 rounded-xl text-sm font-semibold border border-red-200 text-red-500 hover:bg-red-50 transition mt-1"
    >
      Eliminar apunte
    </button>
  )}
</div>
    </div>
  )

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
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="text-sm text-gray-500 hover:text-gray-700 transition"
            >
              Inicio
            </button>
            <button
              onClick={() => window.location.href = '/subir'}
              className="text-white text-sm px-4 py-2 rounded-xl font-semibold"
              style={{ backgroundColor: '#EA580C' }}
            >
              + Subir apunte
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
          <h2 className="text-2xl font-bold text-gray-800">Mis apuntes</h2>
          <p className="text-gray-400 text-sm mt-1">{user?.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
            <p className="text-4xl font-bold mb-1" style={{ color: '#EA580C' }}>
              {misApuntes.length}
            </p>
            <p className="text-gray-500 text-sm">Apuntes subidos</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
            <p className="text-4xl font-bold mb-1 text-blue-600">
              {misCompras.length}
            </p>
            <p className="text-gray-500 text-sm">Apuntes comprados</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl overflow-hidden border mb-6 w-fit"
          style={{ borderColor: '#EA580C' }}>
          <button
            onClick={() => setTab('subidos')}
            className="px-6 py-2 text-sm font-semibold transition"
            style={tab === 'subidos'
              ? { backgroundColor: '#EA580C', color: 'white' }
              : { color: '#EA580C' }}
          >
            Subidos por mi
          </button>
          <button
            onClick={() => setTab('comprados')}
            className="px-6 py-2 text-sm font-semibold transition"
            style={tab === 'comprados'
              ? { backgroundColor: '#EA580C', color: 'white' }
              : { color: '#EA580C' }}
          >
            Comprados
          </button>
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Cargando...</div>
        ) : tab === 'subidos' ? (
          misApuntes.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-6xl mb-4">📝</p>
              <p className="text-gray-500 font-semibold">No has subido apuntes aun</p>
              <button
                onClick={() => window.location.href = '/subir'}
                className="mt-4 text-white px-6 py-2 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: '#EA580C' }}
              >
                Subir mi primer apunte
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {misApuntes.map(apunte => (
                <CardApunte key={apunte.id} apunte={apunte} />
              ))}
            </div>
          )
        ) : (
          misCompras.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-6xl mb-4">🛒</p>
              <p className="text-gray-500 font-semibold">No has comprado apuntes aun</p>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="mt-4 text-white px-6 py-2 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: '#EA580C' }}
              >
                Explorar apuntes
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {misCompras.map(compra => (
                <CardApunte key={compra.id} apunte={compra.apuntes} esComprado={true} />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}