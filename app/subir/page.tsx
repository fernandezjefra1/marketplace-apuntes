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

export default function SubirApunte() {
  const [user, setUser] = useState<any>(null)
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [curso, setCurso] = useState('')
  const [carrera, setCarrera] = useState('')
  const [ciclo, setCiclo] = useState('')
  const [precio, setPrecio] = useState('0')
  const [archivo, setArchivo] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) { window.location.href = '/'; return }
      setUser(data.user)
    }
    getUser()
  }, [])

  const handleSubir = async () => {
    if (!titulo || !carrera || !ciclo || !curso) {
      setError('Por favor completa todos los campos obligatorios')
      return
    }
    if (!archivo) {
      setError('Debes seleccionar un archivo PDF')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Subir archivo a Supabase Storage
      const nombreArchivo = `${user.id}-${Date.now()}.pdf`
      const { error: errorStorage } = await supabase.storage
        .from('apuntes')
        .upload(nombreArchivo, archivo)

      if (errorStorage) throw errorStorage

      const { data: urlData } = supabase.storage
        .from('apuntes')
        .getPublicUrl(nombreArchivo)

      // Guardar en base de datos
      const { error: errorDB } = await supabase
        .from('apuntes')
        .insert({
          titulo,
          descripcion,
          curso,
          carrera,
          ciclo,
          precio: parseFloat(precio),
          archivo_url: urlData.publicUrl,
          usuario_id: user.id,
        })

      if (errorDB) throw errorDB

      setExito(true)
    } catch (e: any) {
      setError('Error al subir el apunte. Intenta de nuevo.')
    }

    setLoading(false)
  }

  if (exito) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9FAFB' }}>
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center max-w-md">
          <p className="text-6xl mb-4">🎉</p>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Apunte subido con exito</h2>
          <p className="text-gray-400 text-sm mb-6">Tu apunte ya esta disponible en el marketplace</p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full text-white py-3 rounded-xl font-semibold"
            style={{ backgroundColor: '#EA580C' }}
          >
            Ver marketplace
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>

      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📖</span>
            <div>
              <h1 className="font-bold text-gray-800 leading-none">ApuntesUA</h1>
              <p className="text-xs text-gray-400">Universidad Autonoma del Peru</p>
            </div>
          </div>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="text-sm text-gray-500 hover:text-gray-700 transition"
          >
            Volver al inicio
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Subir apunte</h2>
          <p className="text-gray-400 text-sm mt-1">Comparte tu conocimiento con otros estudiantes</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3 mb-6">
              {error}
            </div>
          )}

          {/* Titulo */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Titulo del apunte <span style={{ color: '#EA580C' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="Ej: Resumen completo de Macroeconomia - Unidad 2"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none"
            />
          </div>

          {/* Descripcion */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Descripcion
            </label>
            <textarea
              placeholder="Describe que incluye este apunte, temas cubiertos, etc."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none resize-none"
            />
          </div>

          {/* Carrera y Ciclo */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Carrera <span style={{ color: '#EA580C' }}>*</span>
              </label>
              <select
                value={carrera}
                onChange={(e) => setCarrera(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none"
              >
                <option value="">Selecciona carrera</option>
                {CARRERAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Ciclo <span style={{ color: '#EA580C' }}>*</span>
              </label>
              <select
                value={ciclo}
                onChange={(e) => setCiclo(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none"
              >
                <option value="">Selecciona ciclo</option>
                {CICLOS.map(c => <option key={c} value={c}>Ciclo {c}</option>)}
              </select>
            </div>
          </div>

          {/* Curso */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Nombre del curso <span style={{ color: '#EA580C' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="Ej: Macroeconomia, Calculo Diferencial, Derecho Civil..."
              value={curso}
              onChange={(e) => setCurso(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none"
            />
          </div>

          {/* Precio */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Precio (S/.)
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setPrecio('0')}
                className="flex-1 py-2 rounded-xl text-sm font-semibold border transition"
                style={precio === '0'
                  ? { backgroundColor: '#EA580C', color: 'white', borderColor: '#EA580C' }
                  : { borderColor: '#E5E7EB', color: '#6B7280' }}
              >
                Gratis
              </button>
              <button
                onClick={() => setPrecio('5')}
                className="flex-1 py-2 rounded-xl text-sm font-semibold border transition"
                style={precio !== '0'
                  ? { backgroundColor: '#EA580C', color: 'white', borderColor: '#EA580C' }
                  : { borderColor: '#E5E7EB', color: '#6B7280' }}
              >
                De pago
              </button>
            </div>
            {precio !== '0' && (
              <input
                type="number"
                placeholder="Ingresa el precio en soles"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                min="1"
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none mt-3"
              />
            )}
          </div>

          {/* Archivo */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Archivo PDF <span style={{ color: '#EA580C' }}>*</span>
            </label>
            <div
              className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-orange-300 transition"
              onClick={() => document.getElementById('fileInput')?.click()}
            >
              {archivo ? (
                <div>
                  <p className="text-3xl mb-2">📄</p>
                  <p className="font-semibold text-gray-700 text-sm">{archivo.name}</p>
                  <p className="text-gray-400 text-xs mt-1">{(archivo.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div>
                  <p className="text-3xl mb-2">📁</p>
                  <p className="text-gray-500 text-sm font-semibold">Haz clic para seleccionar tu PDF</p>
                  <p className="text-gray-400 text-xs mt-1">Solo archivos PDF, maximo 10MB</p>
                </div>
              )}
            </div>
            <input
              id="fileInput"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => setArchivo(e.target.files?.[0] || null)}
            />
          </div>

          <button
            onClick={handleSubir}
            disabled={loading}
            className="w-full text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition"
            style={{ backgroundColor: '#EA580C' }}
          >
            {loading ? 'Subiendo apunte...' : 'Publicar apunte'}
          </button>
        </div>
      </div>
    </div>
  )
}