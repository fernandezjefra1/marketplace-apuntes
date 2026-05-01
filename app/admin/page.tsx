'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const ADMIN_EMAIL = 'fernandezjefra1@autonoma.edu.pe'

export default function Admin() {
  const [user, setUser] = useState<any>(null)
  const [apuntes, setApuntes] = useState<any[]>([])
  const [compras, setCompras] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [accesoDenegado, setAccesoDenegado] = useState(false)

  useEffect(() => {
    const cargar = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) { window.location.href = '/'; return }
      
      if (userData.user.email !== ADMIN_EMAIL) {
        setAccesoDenegado(true)
        setLoading(false)
        return
      }

      setUser(userData.user)

      const { data: apuntesData } = await supabase
        .from('apuntes')
        .select('*')
        .order('created_at', { ascending: false })
      setApuntes(apuntesData || [])

      const { data: comprasData } = await supabase
        .from('compras')
        .select('*, apuntes(*)')
        .order('created_at', { ascending: false })
      setCompras(comprasData || [])

      setLoading(false)
    }
    cargar()
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Cargando panel admin...</p>
    </div>
  )

  if (accesoDenegado) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-5xl mb-4">🚫</p>
        <p className="text-gray-700 font-bold text-xl mb-2">Acceso denegado</p>
        <p className="text-gray-400 text-sm mb-4">No tienes permisos para ver esta pagina</p>
        <button onClick={() => window.location.href = '/dashboard'}
          className="text-white px-6 py-2 rounded-xl text-sm font-semibold"
          style={{ backgroundColor: '#EA580C' }}>
          Volver al inicio
        </button>
      </div>
    </div>
  )

  const totalVentas = compras.reduce((acc, c) => acc + (c.monto || 0), 0)
  const comisionPlataforma = totalVentas * 0.30
  const gananciaCreadores = totalVentas * 0.70
  const apuntesPago = apuntes.filter(a => a.precio > 0)
  const apuntesGratis = apuntes.filter(a => !a.precio || a.precio === 0)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>

      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📖</span>
            <div>
              <h1 className="font-bold text-gray-800 leading-none">ApuntesUA</h1>
              <p className="text-xs font-bold" style={{ color: '#EA580C' }}>Panel Administrador</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.email}</span>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="text-sm text-gray-500 hover:text-gray-700 transition"
            >
              Ver marketplace
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Panel de Administracion</h2>
          <p className="text-gray-400 text-sm mt-1">Resumen general del marketplace</p>
        </div>

        {/* Stats principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
            <p className="text-3xl font-bold mb-1" style={{ color: '#EA580C' }}>
              {apuntes.length}
            </p>
            <p className="text-gray-500 text-xs">Apuntes totales</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
            <p className="text-3xl font-bold mb-1 text-blue-600">
              {compras.length}
            </p>
            <p className="text-gray-500 text-xs">Ventas realizadas</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
            <p className="text-3xl font-bold mb-1 text-green-600">
              S/. {totalVentas.toFixed(2)}
            </p>
            <p className="text-gray-500 text-xs">Total facturado</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center border-2" style={{ borderColor: '#EA580C' }}>
            <p className="text-3xl font-bold mb-1" style={{ color: '#EA580C' }}>
              S/. {comisionPlataforma.toFixed(2)}
            </p>
            <p className="text-gray-500 text-xs">Comision 30% (nuestra)</p>
          </div>
        </div>

        {/* Desglose de comisiones */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h3 className="font-bold text-gray-800 mb-4">Modelo de comisiones</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl p-4 text-center" style={{ backgroundColor: '#FFF7ED' }}>
              <p className="text-2xl font-bold mb-1" style={{ color: '#EA580C' }}>30%</p>
              <p className="text-sm font-semibold text-gray-700">ApuntesUA</p>
              <p className="text-xs text-gray-400 mt-1">S/. {comisionPlataforma.toFixed(2)}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold mb-1 text-blue-600">70%</p>
              <p className="text-sm font-semibold text-gray-700">Creadores</p>
              <p className="text-xs text-gray-400 mt-1">S/. {gananciaCreadores.toFixed(2)}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold mb-1 text-green-600">100%</p>
              <p className="text-sm font-semibold text-gray-700">Total facturado</p>
              <p className="text-xs text-gray-400 mt-1">S/. {totalVentas.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Apuntes por tipo */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">💰</span>
              <div>
                <p className="font-bold text-gray-800">{apuntesPago.length} apuntes de pago</p>
                <p className="text-xs text-gray-400">Generan comision del 30%</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🎁</span>
              <div>
                <p className="font-bold text-gray-800">{apuntesGratis.length} apuntes gratis</p>
                <p className="text-xs text-gray-400">Aumentan la comunidad</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de apuntes */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">Todos los apuntes</h3>
          {apuntes.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No hay apuntes aun</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Titulo</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Carrera</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Ciclo</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Precio</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Comision 30%</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {apuntes.map(apunte => (
                    <tr key={apunte.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="py-3 px-4 font-medium text-gray-800">{apunte.titulo}</td>
                      <td className="py-3 px-4 text-gray-500">{apunte.carrera || 'General'}</td>
                      <td className="py-3 px-4 text-gray-500">{apunte.ciclo || '-'}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold"
                          style={{ color: apunte.precio > 0 ? '#1D4ED8' : '#16A34A' }}>
                          {apunte.precio > 0 ? `S/. ${apunte.precio}` : 'Gratis'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold" style={{ color: '#EA580C' }}>
                        {apunte.precio > 0 ? `S/. ${(apunte.precio * 0.30).toFixed(2)}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-400">
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
  )
}