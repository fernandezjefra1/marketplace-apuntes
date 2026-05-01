'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useParams } from 'next/navigation'

export default function DetalleApunte() {
  const params = useParams()
  const id = params?.id as string

  const [apunte, setApunte] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [yaCompro, setYaCompro] = useState(false)

  useEffect(() => {
    if (!id) return
    const cargar = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) { window.location.href = '/'; return }
      setUser(userData.user)

      const { data: apunteData, error } = await supabase
        .from('apuntes')
        .select('*')
        .eq('id', id)
        .single()

      if (error) console.error('Error:', error)
      setApunte(apunteData)

      if (apunteData?.precio > 0) {
        const { data: compra } = await supabase
          .from('compras')
          .select('id')
          .eq('apunte_id', id)
          .eq('comprador_id', userData.user.id)
          .single()
        setYaCompro(!!compra)
      }

      setLoading(false)
    }
    cargar()
  }, [id])

  const handleDescargar = () => {
    if (apunte?.archivo_url) window.open(apunte.archivo_url, '_blank')
  }

  const handleComprar = () => {
    alert('Pagos con Culqi proximamente!')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Cargando apunte...</p>
    </div>
  )

  if (!apunte) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-5xl mb-4">😕</p>
        <p className="text-gray-500 font-semibold">Apunte no encontrado</p>
        <button onClick={() => window.location.href = '/dashboard'}
          className="mt-4 text-white px-6 py-2 rounded-xl text-sm font-semibold"
          style={{ backgroundColor: '#EA580C' }}>
          Volver al inicio
        </button>
      </div>
    </div>
  )

  const esGratis = apunte.precio === 0 || apunte.precio === null
  const esDueno = user?.id === apunte.usuario_id
  const puedeDescargar = esGratis || yaCompro || esDueno

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📖</span>
            <div>
              <h1 className="font-bold text-gray-800 leading-none">ApuntesUA</h1>
              <p className="text-xs text-gray-400">Universidad Autonoma del Peru</p>
            </div>
          </div>
          <button onClick={() => window.location.href = '/dashboard'}
            className="text-sm text-gray-500 hover:text-gray-700 transition">
            Volver al inicio
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs font-bold px-3 py-1 rounded-full text-white"
                  style={{ backgroundColor: '#EA580C' }}>
                  {apunte.carrera || 'General'}
                </span>
                {apunte.ciclo && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                    Ciclo {apunte.ciclo}
                  </span>
                )}
                {apunte.curso && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-orange-50 text-orange-600">
                    {apunte.curso}
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-bold text-gray-800 mb-3">{apunte.titulo}</h1>
              {apunte.descripcion && (
                <p className="text-gray-500 text-sm leading-relaxed mb-6">{apunte.descripcion}</p>
              )}

              <div className="border-t border-gray-100 pt-6">
                <h3 className="font-semibold text-gray-700 mb-3 text-sm">Detalles del apunte</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Carrera</p>
                    <p className="font-semibold text-gray-700 text-sm">{apunte.carrera || 'General'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Ciclo</p>
                    <p className="font-semibold text-gray-700 text-sm">{apunte.ciclo || 'No especificado'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Curso</p>
                    <p className="font-semibold text-gray-700 text-sm">{apunte.curso || 'No especificado'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Formato</p>
                    <p className="font-semibold text-gray-700 text-sm">PDF</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <div className="text-center mb-6">
                <p className="text-4xl mb-3">📄</p>
                {esGratis ? (
                  <div>
                    <p className="text-3xl font-bold text-green-600">Gratis</p>
                    <p className="text-gray-400 text-xs mt-1">Descarga sin costo</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-3xl font-bold text-gray-800">S/. {apunte.precio}</p>
                    <p className="text-gray-400 text-xs mt-1">Pago unico</p>
                  </div>
                )}
              </div>

              {esDueno ? (
                <div>
                  <div className="bg-orange-50 rounded-xl p-3 mb-4 text-center">
                    <p className="text-orange-600 text-xs font-semibold">Este es tu apunte</p>
                  </div>
                  <button onClick={handleDescargar}
                    className="w-full text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition"
                    style={{ backgroundColor: '#EA580C' }}>
                    Descargar mi apunte
                  </button>
                </div>
              ) : puedeDescargar ? (
                <button onClick={handleDescargar}
                  className="w-full text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition"
                  style={{ backgroundColor: '#16A34A' }}>
                  Descargar PDF
                </button>
              ) : (
                <div>
                  <button onClick={handleComprar}
                    className="w-full text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition mb-3"
                    style={{ backgroundColor: '#EA580C' }}>
                    Comprar ahora
                  </button>
                  <p className="text-center text-xs text-gray-400">Pago seguro</p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                  <span>✅</span><span>Acceso inmediato al PDF</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                  <span>✅</span><span>Apunte verificado por la comunidad</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>✅</span><span>Hecho por estudiantes de la UA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}