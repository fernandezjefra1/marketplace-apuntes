'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import type { ResultadoAnalisis } from '../api/analizar-apunte/route'

const CARRERAS = [
  'Administracion', 'Medicina Humana', 'Contabilidad', 'Derecho',
  'Ingenieria de Sistemas', 'Ingenieria Civil', 'Psicologia', 'Enfermeria', 'Marketing',
]
const CICLOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']
const PALABRAS_PROHIBIDAS = [
  'mierda', 'puta', 'puto', 'idiota', 'imbecil', 'estupido',
  'maldito', 'carajo', 'concha', 'huevon', 'cojudo', 'pendejo',
  'cabron', 'bastardo', 'culo', 'porno', 'sexo', 'drogas',
]

const contienePalabraProhibida = (texto: string) =>
  PALABRAS_PROHIBIDAS.some(p => texto.toLowerCase().includes(p))

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function scoreConfig(score: number) {
  if (score < 40) return { grad: 'linear-gradient(135deg,#DC2626,#EF4444)', color: '#DC2626', light: '#FEF2F2', label: 'Muy bajo', emoji: '📉' }
  if (score < 60) return { grad: 'linear-gradient(135deg,#EA580C,#F97316)', color: '#EA580C', light: '#FFF7ED', label: 'Por mejorar', emoji: '📈' }
  if (score < 75) return { grad: 'linear-gradient(135deg,#CA8A04,#EAB308)', color: '#CA8A04', light: '#FEFCE8', label: 'Regular', emoji: '⚡' }
  if (score < 90) return { grad: 'linear-gradient(135deg,#2563EB,#3B82F6)', color: '#2563EB', light: '#EFF6FF', label: 'Bueno', emoji: '🎯' }
  return { grad: 'linear-gradient(135deg,#15803D,#16A34A)', color: '#15803D', light: '#F0FDF4', label: 'Excelente', emoji: '🌟' }
}

function bandaInfo(banda: ResultadoAnalisis['banda_precio']) {
  const map = {
    rechazado: { text: 'No apto para publicar', color: '#DC2626', bg: '#FEF2F2' },
    gratis:    { text: 'Gratis',                color: '#15803D', bg: '#F0FDF4' },
    '2-5':     { text: 'S/. 2 – 5',            color: '#2563EB', bg: '#EFF6FF' },
    '5-10':    { text: 'S/. 5 – 10',           color: '#7C3AED', bg: '#F5F3FF' },
    '10-15':   { text: 'S/. 10 – 15',          color: '#EA580C', bg: '#FFF7ED' },
  }
  return map[banda]
}

function BarraCriterio({ label, valor, max, delay = 0 }: { label: string; valor: number; max: number; delay?: number }) {
  const [w, setW] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setW(Math.round((valor / max) * 100)), delay + 120)
    return () => clearTimeout(t)
  }, [valor, max, delay])
  return (
    <div className="mb-3.5">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-bold" style={{ color: '#EA580C' }}>{valor}<span className="text-gray-400 font-normal text-xs">/{max}</span></span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#F3F4F6' }}>
        <div className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${w}%`, background: 'linear-gradient(90deg,#EA580C,#F97316,#FB923C)' }} />
      </div>
    </div>
  )
}

const STEPS = ['Información', 'Archivo PDF', 'Análisis IA', 'Precio y publicar']

export default function SubirApunte() {
  const [user, setUser] = useState<any>(null)
  const [titulo, setTitulo]       = useState('')
  const [descripcion, setDesc]    = useState('')
  const [curso, setCurso]         = useState('')
  const [carrera, setCarrera]     = useState('')
  const [ciclo, setCiclo]         = useState('')
  const [precio, setPrecio]       = useState('0')
  const [archivo, setArchivo]     = useState<File | null>(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [exito, setExito]         = useState(false)
  const [drag, setDrag]           = useState(false)

  const [analizando, setAnalizando]   = useState(false)
  const [analisis, setAnalisis]       = useState<ResultadoAnalisis | null>(null)
  const [errorAnalisis, setErrorAnalisis] = useState('')
  const [modoManual, setModoManual]   = useState(false)
  const [bandaManual, setBandaManual] = useState<'gratis' | '2-5' | '5-10' | '10-15' | ''>('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { window.location.href = '/'; return }
      setUser(data.user)
    })
  }, [])

  // Current step (visual only)
  const paso = !archivo ? 1 : analizando ? 2 : !analisis ? 2 : analisis.banda_precio === 'rechazado' ? 3 : 3

  const activarModoManual = () => {
    setModoManual(true)
    setErrorAnalisis('')
  }

  const handleArchivoChange = async (file: File | null) => {
    setArchivo(file)
    setAnalisis(null)
    setErrorAnalisis('')
    setModoManual(false)
    setBandaManual('')
    if (!file) return
    setAnalizando(true)
    try {
      const pdfBase64 = await fileToBase64(file)
      const res = await fetch('/api/analizar-apunte', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfBase64 }),
      })
      const data = await res.json()
      if (!res.ok) { setErrorAnalisis(data.error || 'Error al analizar.'); setAnalizando(false); return }
      const r = data as ResultadoAnalisis
      setAnalisis(r)
      setPrecio(r.banda_precio === 'rechazado' || r.banda_precio === 'gratis' ? '0' : String(r.precio_min))
    } catch {
      setErrorAnalisis('No se pudo conectar con el servicio de análisis. Intenta de nuevo.')
    }
    setAnalizando(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDrag(false)
    const file = e.dataTransfer.files[0]
    if (file?.type === 'application/pdf') handleArchivoChange(file)
  }

  const handleSubir = async () => {
    if (contienePalabraProhibida(titulo) || contienePalabraProhibida(descripcion || '')) {
      setError('El contenido contiene palabras inapropiadas. Revisa el título y descripción.')
      return
    }
    if (!titulo || !carrera || !ciclo || !curso) { setError('Completa todos los campos obligatorios.'); return }
    if (!archivo)  { setError('Selecciona un archivo PDF.'); return }

    // Modo manual: validar que se eligió una banda
    if (modoManual) {
      if (!bandaManual) { setError('Selecciona un rango de precio para continuar.'); return }
      const precioManualNum = parseFloat(precio)
      const rangoMin = bandaManual === 'gratis' ? 0 : bandaManual === '2-5' ? 2 : bandaManual === '5-10' ? 5 : 10
      const rangoMax = bandaManual === 'gratis' ? 0 : bandaManual === '2-5' ? 5 : bandaManual === '5-10' ? 10 : 15
      if (bandaManual !== 'gratis' && (precioManualNum < rangoMin || precioManualNum > rangoMax)) {
        setError(`El precio debe estar entre S/. ${rangoMin} y S/. ${rangoMax}.`); return
      }
      setLoading(true); setError('')
      try {
        const nombreArchivo = `${user.id}-${Date.now()}.pdf`
        const { error: eStorage } = await supabase.storage.from('apuntes').upload(nombreArchivo, archivo)
        if (eStorage) throw eStorage
        const { data: urlData } = supabase.storage.from('apuntes').getPublicUrl(nombreArchivo)
        const { error: eDB } = await supabase.from('apuntes').insert({
          titulo, descripcion, curso, carrera, ciclo,
          precio: bandaManual === 'gratis' ? 0 : precioManualNum,
          archivo_url: urlData.publicUrl,
          usuario_id: user.id,
          banda_precio: bandaManual,
        })
        if (eDB) throw eDB
        setExito(true)
      } catch { setError('Error al subir el apunte. Intenta de nuevo.') }
      setLoading(false)
      return
    }

    if (!analisis) { setError('Espera a que termine el análisis.'); return }
    if (analisis.banda_precio === 'rechazado') { setError('El apunte no cumple los requisitos mínimos.'); return }
    const precioNum = parseFloat(precio)
    if (analisis.banda_precio !== 'gratis' && (precioNum < analisis.precio_min || precioNum > analisis.precio_max)) {
      setError(`El precio debe estar entre S/. ${analisis.precio_min} y S/. ${analisis.precio_max}.`)
      return
    }
    setLoading(true); setError('')
    try {
      const nombreArchivo = `${user.id}-${Date.now()}.pdf`
      const { error: eStorage } = await supabase.storage.from('apuntes').upload(nombreArchivo, archivo)
      if (eStorage) throw eStorage
      const { data: urlData } = supabase.storage.from('apuntes').getPublicUrl(nombreArchivo)
      const { error: eDB } = await supabase.from('apuntes').insert({
        titulo, descripcion, curso, carrera, ciclo,
        precio: analisis.banda_precio === 'gratis' ? 0 : precioNum,
        archivo_url: urlData.publicUrl,
        usuario_id: user.id,
        score_ia: analisis.score_total,
        banda_precio: analisis.banda_precio,
        resumen_ia: analisis.resumen_ia,
        temas_cubiertos: analisis.temas_cubiertos,
        feedback_vendedor: analisis.feedback_vendedor,
        apto_pack_examen: analisis.apto_pack_examen,
        criterios_detalle: analisis.criterios,
      })
      if (eDB) throw eDB
      setExito(true)
    } catch { setError('Error al subir el apunte. Intenta de nuevo.') }
    setLoading(false)
  }

  /* ─── ÉXITO ─── */
  if (exito) return (
    <>
      <style>{`@keyframes pop{0%{transform:scale(.7);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}.pop{animation:pop .5s ease forwards}`}</style>
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#FFF7ED,#FEF3C7)' }}>
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-sm mx-4">
          <div className="pop text-7xl mb-5">🎉</div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">¡Apunte publicado!</h2>
          <p className="text-gray-400 text-sm mb-8">Ya está disponible para todos los estudiantes de la UA</p>
          <button onClick={() => window.location.href = '/dashboard'}
            className="w-full text-white py-3.5 rounded-2xl font-bold text-sm hover:opacity-90 transition-all hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)' }}>
            Ver en el marketplace →
          </button>
          <button onClick={() => { setExito(false); setAnalisis(null); setArchivo(null); setTitulo(''); setDesc(''); setCurso(''); setCarrera(''); setCiclo(''); setPrecio('0') }}
            className="w-full text-gray-400 py-3 rounded-2xl text-sm mt-2 hover:text-gray-600 transition">
            Subir otro apunte
          </button>
        </div>
      </div>
    </>
  )

  const cfg = analisis ? scoreConfig(analisis.score_total) : null
  const puedePublicar = !analizando && !loading && (
    (!!analisis && analisis.banda_precio !== 'rechazado') ||
    (modoManual && !!bandaManual)
  )

  return (
    <>
      <style>{`
        @keyframes fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer  { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes spin     { to{transform:rotate(360deg)} }
        @keyframes pulse-o  { 0%,100%{opacity:1} 50%{opacity:.4} }
        .fade-up            { animation:fadeUp .45s ease forwards }
        .shimmer-bg {
          background: linear-gradient(90deg,#f3f4f6 25%,#e9eaec 50%,#f3f4f6 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        .spin-anim          { animation:spin .8s linear infinite }
        .pulse-o            { animation:pulse-o 1.6s ease infinite }
        input:focus,select:focus,textarea:focus {
          outline:none;
          border-color:#EA580C !important;
          box-shadow: 0 0 0 3px rgba(234,88,12,.12);
        }
        .input-base {
          width:100%; border:1.5px solid #E5E7EB; border-radius:14px;
          padding:13px 16px; font-size:14px; transition:all .2s; background:#FAFAFA;
          color:#1F2937;
        }
        .input-base::placeholder { color:#9CA3AF }
        .step-dot-active { box-shadow:0 0 0 4px rgba(234,88,12,.2) }
      `}</style>

      <div className="min-h-screen" style={{ background: 'linear-gradient(160deg,#FFF7ED 0%,#FFFBF5 25%,#F9FAFB 60%)' }}>

        {/* ── NAVBAR ── */}
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-20">
          <div className="max-w-3xl mx-auto px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.location.href = '/dashboard'}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black"
                style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)' }}>A</div>
              <span className="font-bold text-gray-800">ApuntesUA</span>
            </div>
            <button onClick={() => window.location.href = '/dashboard'}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition font-medium">
              <span>←</span> Volver al inicio
            </button>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 py-10">

          {/* ── HERO HEADER ── */}
          <div className="rounded-3xl p-7 mb-8 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#9A3412 0%,#C2410C 30%,#EA580C 65%,#F97316 100%)' }}>
            {/* Decorative blobs */}
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-20 bg-white" />
            <div className="absolute right-10 -bottom-12 w-28 h-28 rounded-full opacity-10 bg-white" />
            <div className="absolute -left-6 bottom-0 w-20 h-20 rounded-full opacity-10 bg-white" />

            <div className="relative z-10">
              <p className="text-orange-200 text-xs font-semibold uppercase tracking-widest mb-1">Marketplace de apuntes</p>
              <h1 className="text-white font-black text-3xl mb-1">Sube tu apunte</h1>
              <p className="text-orange-100 text-sm mb-5">Tu conocimiento puede generar ingresos y ayudar a cientos de compañeros</p>

              {/* Steps indicator */}
              <div className="flex items-center gap-0">
                {STEPS.map((step, i) => {
                  const active = i < paso
                  return (
                    <div key={i} className="flex items-center">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${active ? 'bg-white text-orange-600' : 'bg-white/20 text-white/60'}`}>
                          {i + 1}
                        </div>
                        <span className={`text-xs font-medium hidden sm:block transition-all ${active ? 'text-white' : 'text-white/50'}`}>{step}</span>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className="w-6 h-px mx-1.5" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ── FORM CARD ── */}
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden"
            style={{ boxShadow: '0 4px 40px rgba(0,0,0,.07)' }}>

            {/* ── SECCIÓN 1: INFORMACIÓN ── */}
            <div className="px-8 pt-8 pb-6">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)' }}>1</div>
                <div>
                  <h3 className="font-bold text-gray-800 text-base leading-none">Información básica</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Cuéntanos sobre tu apunte</p>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
                  <span className="text-lg flex-shrink-0">⚠️</span>
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Título */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Título del apunte <span style={{ color: '#EA580C' }}>*</span>
                </label>
                <input className="input-base" type="text"
                  placeholder="Ej: Resumen completo de Macroeconomía – Unidad 2"
                  value={titulo} onChange={e => setTitulo(e.target.value)} />
              </div>

              {/* Descripción */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Descripción</label>
                <textarea className="input-base resize-none" rows={3}
                  placeholder="Describe qué incluye este apunte, temas cubiertos, método de estudio..."
                  value={descripcion} onChange={e => setDesc(e.target.value)} />
              </div>

              {/* Carrera + Ciclo */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Carrera <span style={{ color: '#EA580C' }}>*</span></label>
                  <select className="input-base" value={carrera} onChange={e => setCarrera(e.target.value)}>
                    <option value="">Selecciona carrera</option>
                    {CARRERAS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ciclo <span style={{ color: '#EA580C' }}>*</span></label>
                  <select className="input-base" value={ciclo} onChange={e => setCiclo(e.target.value)}>
                    <option value="">Selecciona ciclo</option>
                    {CICLOS.map(c => <option key={c} value={c}>Ciclo {c}</option>)}
                  </select>
                </div>
              </div>

              {/* Curso */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre del curso <span style={{ color: '#EA580C' }}>*</span></label>
                <input className="input-base" type="text"
                  placeholder="Ej: Macroeconomía, Cálculo Diferencial, Derecho Civil..."
                  value={curso} onChange={e => setCurso(e.target.value)} />
              </div>
            </div>

            <div className="h-px mx-8" style={{ backgroundColor: '#F3F4F6' }} />

            {/* ── SECCIÓN 2: ARCHIVO PDF ── */}
            <div className="px-8 py-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black flex-shrink-0"
                  style={{ background: archivo ? 'linear-gradient(135deg,#15803D,#16A34A)' : 'linear-gradient(135deg,#EA580C,#F97316)' }}>
                  {archivo ? '✓' : '2'}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-base leading-none">Archivo PDF</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Sube tu apunte en formato PDF · Máximo 10 MB</p>
                </div>
              </div>

              {/* Drop zone */}
              <div
                className="rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 relative overflow-hidden"
                style={{
                  borderColor: drag ? '#EA580C' : archivo ? '#16A34A' : '#E5E7EB',
                  backgroundColor: drag ? '#FFF7ED' : archivo ? '#F0FDF4' : '#FAFAFA',
                  minHeight: 160,
                }}
                onClick={() => document.getElementById('fileInput')?.click()}
                onDragOver={e => { e.preventDefault(); setDrag(true) }}
                onDragLeave={() => setDrag(false)}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center justify-center p-10 text-center">
                  {archivo ? (
                    <>
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 text-2xl"
                        style={{ backgroundColor: '#DCFCE7' }}>📄</div>
                      <p className="font-bold text-gray-800 text-sm">{archivo.name}</p>
                      <p className="text-gray-400 text-xs mt-1">{(archivo.size / 1024 / 1024).toFixed(2)} MB · PDF</p>
                      <p className="text-xs mt-2 font-medium" style={{ color: '#16A34A' }}>✓ Archivo listo</p>
                    </>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 text-3xl"
                        style={{ backgroundColor: drag ? '#FED7AA' : '#F3F4F6' }}>
                        {drag ? '📥' : '☁️'}
                      </div>
                      <p className="font-bold text-gray-700 text-sm mb-1">
                        {drag ? 'Suelta tu PDF aquí' : 'Arrastra tu PDF aquí'}
                      </p>
                      <p className="text-gray-400 text-xs">o haz clic para seleccionar el archivo</p>
                    </>
                  )}
                </div>

                {/* Animated border pulse when dragging */}
                {drag && (
                  <div className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{ boxShadow: '0 0 0 3px rgba(234,88,12,.3)', animation: 'pulse-o 1s infinite' }} />
                )}
              </div>

              <input id="fileInput" type="file" accept=".pdf" className="hidden"
                onChange={e => handleArchivoChange(e.target.files?.[0] || null)} />

              {/* Cambiar archivo */}
              {archivo && !analizando && (
                <button className="mt-3 text-xs text-gray-400 hover:text-gray-600 transition font-medium"
                  onClick={() => { setArchivo(null); setAnalisis(null); setErrorAnalisis('') }}>
                  Cambiar archivo
                </button>
              )}
            </div>

            {/* ── SECCIÓN 3: ANÁLISIS IA ── */}
            {(analizando || analisis || errorAnalisis) && (
              <>
                <div className="h-px mx-8" style={{ backgroundColor: '#F3F4F6' }} />
                <div className="px-8 py-6">

                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
                      style={{ background: analizando ? 'linear-gradient(135deg,#EA580C,#F97316)' : analisis ? (cfg?.grad ?? '') : 'linear-gradient(135deg,#EF4444,#F87171)', color: 'white' }}>
                      {analizando ? <span className="spin-anim inline-block">⟳</span> : analisis ? '✦' : '!'}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-base leading-none">Análisis con IA</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {analizando ? 'Evaluando calidad, profundidad y estructura...' : analisis ? 'Evaluación completada' : 'Ocurrió un problema'}
                      </p>
                    </div>
                  </div>

                  {/* LOADER */}
                  {analizando && (
                    <div className="fade-up rounded-2xl border border-orange-100 overflow-hidden"
                      style={{ backgroundColor: '#FFF7ED' }}>
                      <div className="p-6">
                        <div className="flex items-center gap-4 mb-5">
                          <div className="relative w-16 h-16 flex-shrink-0">
                            <div className="absolute inset-0 rounded-full opacity-30"
                              style={{ border: '3px solid #EA580C', animation: 'pulse-o 1.2s infinite' }} />
                            <div className="absolute inset-1 rounded-full border-4 border-transparent border-t-orange-500 spin-anim" />
                            <div className="absolute inset-0 flex items-center justify-center text-xl">🤖</div>
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-base">Analizando tu apunte...</p>
                            <p className="text-sm text-gray-500 mt-0.5">Claude AI está evaluando la calidad del contenido</p>
                          </div>
                        </div>
                        {/* Shimmer bars */}
                        {['Organización y estructura', 'Profundidad del contenido', 'Ejemplos y ejercicios', 'Cobertura temática', 'Legibilidad'].map(label => (
                          <div key={label} className="mb-3">
                            <div className="flex justify-between mb-1">
                              <span className="text-xs text-gray-500">{label}</span>
                              <div className="w-8 h-3 rounded shimmer-bg" />
                            </div>
                            <div className="h-2 rounded-full shimmer-bg" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ERROR ANÁLISIS */}
                  {errorAnalisis && !analizando && (
                    <div className="fade-up">
                      <div className="bg-red-50 border border-red-100 rounded-2xl p-5 mb-3">
                        <p className="font-bold text-red-700 text-sm mb-1">No se pudo analizar el PDF</p>
                        <p className="text-red-500 text-sm">{errorAnalisis}</p>
                        <button className="mt-3 text-xs font-semibold text-red-600 underline"
                          onClick={() => archivo && handleArchivoChange(archivo)}>
                          Reintentar análisis
                        </button>
                      </div>
                      {/* Opción alternativa */}
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                        <div className="flex items-start gap-3">
                          <span className="text-xl flex-shrink-0">⚡</span>
                          <div>
                            <p className="font-bold text-amber-800 text-sm mb-1">Publicar sin análisis IA</p>
                            <p className="text-amber-700 text-xs leading-relaxed mb-3">
                              El servicio de IA no está disponible ahora. Puedes publicar tu apunte manualmente eligiendo el precio tú mismo.
                              El análisis IA se podrá hacer más tarde.
                            </p>
                            <button
                              onClick={activarModoManual}
                              className="text-xs font-bold px-4 py-2 rounded-xl text-white transition hover:opacity-90"
                              style={{ background: 'linear-gradient(135deg,#D97706,#F59E0B)' }}>
                              Continuar sin IA →
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* RESULTADO */}
                  {analisis && !analizando && cfg && (
                    <div className="fade-up rounded-2xl overflow-hidden border border-gray-100"
                      style={{ boxShadow: '0 8px 32px rgba(0,0,0,.08)' }}>

                      {/* Cabecera con gradiente */}
                      <div className="p-6 relative overflow-hidden" style={{ background: cfg.grad }}>
                        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white opacity-10" />
                        <div className="absolute right-12 -bottom-8 w-20 h-20 rounded-full bg-white opacity-10" />

                        <div className="relative flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex flex-col items-center justify-center">
                              <span className="text-white font-black text-3xl leading-none">{analisis.score_total}</span>
                              <span className="text-white/70 text-xs">/ 100</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-white font-black text-xl">{cfg.emoji}</span>
                                <span className="text-white font-bold text-lg">{cfg.label}</span>
                              </div>
                              {analisis.apto_pack_examen && (
                                <span className="inline-flex items-center gap-1 bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                                  ⭐ Apto para Pack Examen
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            {(() => { const b = bandaInfo(analisis.banda_precio); return (
                              <span className="inline-block text-sm font-bold px-3 py-1.5 rounded-xl"
                                style={{ backgroundColor: 'rgba(255,255,255,0.25)', color: 'white' }}>
                                {b.text}
                              </span>
                            )})()}
                          </div>
                        </div>
                      </div>

                      {/* Cuerpo */}
                      <div className="p-6 bg-white">

                        {/* Criterios */}
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Criterios de evaluación</p>
                        <BarraCriterio label="Organización y estructura" valor={analisis.criterios.organizacion} max={25} delay={0} />
                        <BarraCriterio label="Profundidad del contenido" valor={analisis.criterios.profundidad}  max={25} delay={80} />
                        <BarraCriterio label="Ejemplos y ejercicios"     valor={analisis.criterios.ejemplos}     max={20} delay={160} />
                        <BarraCriterio label="Cobertura temática"        valor={analisis.criterios.cobertura}    max={20} delay={240} />
                        <BarraCriterio label="Legibilidad y formato"     valor={analisis.criterios.legibilidad}  max={10} delay={320} />

                        {/* Resumen */}
                        {analisis.resumen_ia && (
                          <div className="mt-5 p-4 rounded-xl" style={{ backgroundColor: '#F9FAFB' }}>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Resumen IA</p>
                            <p className="text-sm text-gray-600 leading-relaxed">{analisis.resumen_ia}</p>
                          </div>
                        )}

                        {/* Temas */}
                        {analisis.temas_cubiertos.length > 0 && (
                          <div className="mt-4">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">Temas cubiertos</p>
                            <div className="flex flex-wrap gap-2">
                              {analisis.temas_cubiertos.map((t, i) => (
                                <span key={i} className="text-xs font-semibold px-3 py-1.5 rounded-full"
                                  style={{ backgroundColor: '#FFF7ED', color: '#EA580C' }}>
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Feedback */}
                        {analisis.feedback_vendedor && analisis.banda_precio !== 'rechazado' && (
                          <div className="mt-4 flex gap-3 p-4 rounded-xl border" style={{ borderColor: '#DBEAFE', backgroundColor: '#EFF6FF' }}>
                            <span className="text-lg flex-shrink-0">💡</span>
                            <div>
                              <p className="text-xs font-bold text-blue-700 mb-1">Cómo mejorar tu puntaje</p>
                              <p className="text-xs text-blue-600 leading-relaxed">{analisis.feedback_vendedor}</p>
                            </div>
                          </div>
                        )}

                        {/* Rechazado */}
                        {analisis.banda_precio === 'rechazado' && (
                          <div className="mt-4 p-5 rounded-xl text-center border-2 border-dashed border-red-200 bg-red-50">
                            <p className="text-2xl mb-2">🚫</p>
                            <p className="font-bold text-red-700 text-sm">Este apunte no puede publicarse</p>
                            <p className="text-red-400 text-xs mt-1">{analisis.feedback_vendedor}</p>
                            <button className="mt-3 text-xs font-semibold text-red-600 underline"
                              onClick={() => { setArchivo(null); setAnalisis(null); setErrorAnalisis('') }}>
                              Subir un PDF diferente
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── SECCIÓN 4 MANUAL: PRECIO SIN IA ── */}
            {modoManual && !analizando && (
              <>
                <div className="h-px mx-8" style={{ backgroundColor: '#F3F4F6' }} />
                <div className="px-8 py-6">
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#D97706,#F59E0B)' }}>3</div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-base leading-none">Precio manual</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Sin análisis IA — tú eliges el rango</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">Elige el rango de precio que mejor refleja la calidad de tu apunte:</p>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {[
                      { val: 'gratis' as const, label: 'Gratis', sub: 'Acceso libre', icon: '🆓', color: '#15803D', bg: '#F0FDF4', border: '#BBF7D0' },
                      { val: '2-5' as const,    label: 'S/. 2 – 5',   sub: 'Apunte básico', icon: '📄', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
                      { val: '5-10' as const,   label: 'S/. 5 – 10',  sub: 'Buen contenido', icon: '📚', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
                      { val: '10-15' as const,  label: 'S/. 10 – 15', sub: 'Excelente apunte', icon: '⭐', color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA' },
                    ].map(op => (
                      <button key={op.val} onClick={() => {
                        setBandaManual(op.val)
                        setPrecio(op.val === 'gratis' ? '0' : op.val === '2-5' ? '2' : op.val === '5-10' ? '5' : '10')
                      }}
                        className="p-4 rounded-2xl border-2 text-left transition-all"
                        style={{
                          borderColor: bandaManual === op.val ? op.color : op.border,
                          backgroundColor: bandaManual === op.val ? op.bg : 'white',
                          boxShadow: bandaManual === op.val ? `0 0 0 3px ${op.color}20` : 'none',
                        }}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{op.icon}</span>
                          <span className="font-black text-sm" style={{ color: op.color }}>{op.label}</span>
                        </div>
                        <p className="text-xs text-gray-400">{op.sub}</p>
                      </button>
                    ))}
                  </div>

                  {bandaManual && bandaManual !== 'gratis' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Precio exacto (S/.)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">S/.</span>
                        <input
                          className="input-base"
                          style={{ paddingLeft: 40 }}
                          type="number"
                          value={precio}
                          onChange={e => setPrecio(e.target.value)}
                          min={bandaManual === '2-5' ? 2 : bandaManual === '5-10' ? 5 : 10}
                          max={bandaManual === '2-5' ? 5 : bandaManual === '5-10' ? 10 : 15}
                          step="0.5"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── SECCIÓN 4: PRECIO CON IA ── */}
            {analisis && !analizando && analisis.banda_precio !== 'rechazado' && (
              <>
                <div className="h-px mx-8" style={{ backgroundColor: '#F3F4F6' }} />
                <div className="px-8 py-6">
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#7C3AED,#8B5CF6)' }}>4</div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-base leading-none">Precio de venta</h3>
                      <p className="text-xs text-gray-400 mt-0.5">La IA determinó el rango según la calidad</p>
                    </div>
                  </div>

                  {analisis.banda_precio === 'gratis' ? (
                    <div className="flex items-center gap-4 p-5 rounded-2xl border-2 border-green-200"
                      style={{ backgroundColor: '#F0FDF4' }}>
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ backgroundColor: '#DCFCE7' }}>🆓</div>
                      <div>
                        <p className="font-bold text-green-800 text-sm">Tu apunte se publicará gratis</p>
                        <p className="text-green-600 text-xs mt-0.5">Con un puntaje más alto podrás cobrar por él</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-3 mb-4 p-4 rounded-2xl"
                        style={{ backgroundColor: '#F5F3FF', border: '1.5px solid #DDD6FE' }}>
                        <span className="text-xl">💰</span>
                        <p className="text-sm text-purple-700 font-medium">
                          Con tu puntaje puedes cobrar entre{' '}
                          <span className="font-black">S/. {analisis.precio_min}</span> y{' '}
                          <span className="font-black">S/. {analisis.precio_max}</span>
                        </p>
                      </div>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">S/.</span>
                        <input
                          className="input-base"
                          style={{ paddingLeft: 40 }}
                          type="number"
                          value={precio}
                          onChange={e => setPrecio(e.target.value)}
                          min={analisis.precio_min}
                          max={analisis.precio_max}
                          step="0.5"
                          placeholder={`${analisis.precio_min} – ${analisis.precio_max}`}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── BOTÓN PUBLICAR ── */}
            <div className="px-8 pb-8 pt-2">
              <button
                onClick={handleSubir}
                disabled={!puedePublicar}
                className="w-full py-4 rounded-2xl font-black text-sm text-white transition-all duration-300 relative overflow-hidden"
                style={{
                  background: puedePublicar
                    ? 'linear-gradient(135deg,#C2410C,#EA580C,#F97316)'
                    : '#E5E7EB',
                  color: puedePublicar ? 'white' : '#9CA3AF',
                  boxShadow: puedePublicar ? '0 8px 24px rgba(234,88,12,.35)' : 'none',
                  cursor: puedePublicar ? 'pointer' : 'not-allowed',
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spin-anim inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Publicando...
                  </span>
                ) : analizando ? 'Analizando tu PDF...'
                  : modoManual && !bandaManual ? 'Elige un rango de precio'
                  : modoManual ? 'Publicar apunte →'
                  : !analisis ? 'Sube un PDF para continuar'
                  : analisis.banda_precio === 'rechazado' ? 'Apunte no apto para publicar'
                  : 'Publicar apunte →'}
              </button>

              {puedePublicar && (
                <div className="flex items-center justify-center gap-4 mt-4">
                  {['Acceso inmediato', 'Pago seguro', 'Comunidad UA'].map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-gray-400">
                      <span className="text-green-500">✓</span>{item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Nota al pie */}
          <p className="text-center text-xs text-gray-400 mt-6">
            Al publicar aceptas los{' '}
            <span className="underline cursor-pointer hover:text-gray-600" onClick={() => window.location.href = '/terminos'}>
              términos y condiciones
            </span>
            {' '}de ApuntesUA
          </p>
        </div>
      </div>
    </>
  )
}
