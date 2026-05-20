'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const FEATURES = [
  { icon: '🤖', title: 'IA que evalúa tu apunte', desc: 'Claude analiza calidad y fija el precio automáticamente' },
  { icon: '💰', title: '70% de cada venta', desc: 'Monetiza el esfuerzo que ya hiciste estudiando' },
  { icon: '🔍', title: 'Marketplace por carrera', desc: 'Encuentra apuntes organizados por ciclo y curso' },
  { icon: '⭐', title: 'Sistema de valoraciones', desc: 'Reputación construida por la comunidad UA' },
]

export default function Login() {
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [showPass, setShowPass]   = useState(false)
  const [mounted, setMounted]     = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleAuth = async () => {
    if (!email.endsWith('@autonoma.edu.pe')) {
      setError('Solo se permiten correos @autonoma.edu.pe')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    setLoading(true); setError('')
    if (isRegister) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else alert('¡Cuenta creada! Revisa tu correo para confirmar.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError('Correo o contraseña incorrectos')
      else window.location.href = '/dashboard'
    }
    setLoading(false)
  }

  const handleKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleAuth() }

  return (
    <>
      <style>{`
        @keyframes blob1 { 0%,100%{transform:translate(0,0)scale(1)} 33%{transform:translate(50px,-70px)scale(1.2)} 66%{transform:translate(-30px,40px)scale(.85)} }
        @keyframes blob2 { 0%,100%{transform:translate(0,0)scale(1)} 33%{transform:translate(-60px,50px)scale(1.1)} 66%{transform:translate(40px,-30px)scale(.9)} }
        @keyframes blob3 { 0%,100%{transform:translate(0,0)scale(1)} 33%{transform:translate(30px,60px)scale(1.05)} 66%{transform:translate(-50px,-40px)scale(1.15)} }
        @keyframes floatCard1 { 0%,100%{transform:translateY(0)rotate(-4deg)} 50%{transform:translateY(-20px)rotate(-2deg)} }
        @keyframes floatCard2 { 0%,100%{transform:translateY(0)rotate(3deg)}  50%{transform:translateY(-16px)rotate(6deg)} }
        @keyframes floatCard3 { 0%,100%{transform:translateY(0)rotate(-1deg)} 50%{transform:translateY(-24px)rotate(2deg)} }
        @keyframes slideIn    { from{opacity:0;transform:translateX(-24px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slideInR   { from{opacity:0;transform:translateX(24px)}  to{opacity:1;transform:translateX(0)} }
        @keyframes fadeUp     { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes gradShift  { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes spin       { to{transform:rotate(360deg)} }

        .blob1 { animation: blob1 9s ease-in-out infinite }
        .blob2 { animation: blob2 11s ease-in-out infinite 2s }
        .blob3 { animation: blob3 7s ease-in-out infinite 4s }
        .fcard1 { animation: floatCard1 5s ease-in-out infinite }
        .fcard2 { animation: floatCard2 7s ease-in-out infinite 1s }
        .fcard3 { animation: floatCard3 6s ease-in-out infinite 2s }
        .slide-in   { animation: slideIn  .6s ease forwards }
        .slide-in-r { animation: slideInR .6s ease forwards }
        .fade-up    { animation: fadeUp   .5s ease forwards }
        .grad-text {
          background: linear-gradient(270deg,#fff,#FED7AA,#fff);
          background-size: 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradShift 3s ease infinite;
        }
        .spin { animation: spin .7s linear infinite }
        .glass {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,.2);
        }
        .input-login {
          width:100%; padding:14px 16px; font-size:14px;
          border:1.5px solid #E5E7EB; border-radius:14px;
          background:#FAFAFA; color:#1F2937; transition:all .2s;
        }
        .input-login:focus { outline:none; border-color:#EA580C; box-shadow:0 0 0 3px rgba(234,88,12,.12); background:white }
        .input-login::placeholder { color:#9CA3AF }
        .tab-active { background:linear-gradient(135deg,#EA580C,#F97316); color:white; box-shadow:0 4px 16px rgba(234,88,12,.3) }
        .tab-inactive { color:#6B7280 }
        .tab-inactive:hover { color:#EA580C; background:#FFF7ED }
      `}</style>

      <main className="min-h-screen flex overflow-hidden">

        {/* ── LEFT PANEL ── */}
        <div className="hidden md:flex w-[52%] relative overflow-hidden flex-col"
          style={{ background: 'linear-gradient(145deg,#7C2D12,#9A3412,#C2410C,#EA580C)' }}>

          {/* Animated background blobs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="blob1 absolute -top-32 -left-32 w-96 h-96 rounded-full"
              style={{ background: 'radial-gradient(circle,rgba(255,255,255,.15),transparent 70%)', filter: 'blur(40px)' }} />
            <div className="blob2 absolute -bottom-40 right-0 w-80 h-80 rounded-full"
              style={{ background: 'radial-gradient(circle,rgba(255,255,255,.1),transparent 70%)', filter: 'blur(50px)' }} />
            <div className="blob3 absolute top-1/2 left-1/4 w-64 h-64 rounded-full"
              style={{ background: 'radial-gradient(circle,rgba(251,191,36,.15),transparent 70%)', filter: 'blur(30px)' }} />

            {/* Dot grid */}
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="absolute rounded-full bg-white"
                style={{
                  width: 2 + (i % 3),
                  height: 2 + (i % 3),
                  opacity: 0.06 + (i % 4) * 0.03,
                  left: `${(i * 13 + 5) % 95}%`,
                  top: `${(i * 19 + 8) % 95}%`,
                }} />
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col h-full p-10 justify-between">

            {/* Logo */}
            <div className="flex items-center gap-3 slide-in">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center font-black text-white text-lg">A</div>
              <div>
                <p className="font-black text-white text-lg leading-none">ApuntesUA</p>
                <p className="text-orange-200 text-xs">Universidad Autónoma del Perú</p>
              </div>
            </div>

            {/* Headline + floating cards */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="mb-8" style={{ animationDelay: '.1s' }}>
                <h2 className="text-4xl font-black text-white leading-tight mb-3">
                  Tu conocimiento<br />
                  <span className="grad-text">vale dinero</span>
                </h2>
                <p className="text-orange-200 text-base max-w-xs leading-relaxed">
                  Comparte apuntes, gana el 70% de cada venta y ayuda a otros estudiantes de la UA.
                </p>
              </div>

              {/* 3D floating mini cards */}
              <div className="relative h-56 mb-8">

                {/* Card 3 — back */}
                <div className="fcard3 absolute glass rounded-2xl px-4 py-3 w-52"
                  style={{ right: 20, top: 40, zIndex: 1 }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-lg text-white" style={{ backgroundColor: 'rgba(124,58,237,.8)' }}>Derecho</span>
                    <span className="text-xs font-bold text-green-300">S/. 8</span>
                  </div>
                  <p className="text-white text-xs font-bold leading-snug">Derecho Constitucional – Resumen</p>
                  <div className="flex gap-0.5 mt-2">{'⭐⭐⭐⭐⭐'.split('').map((s, i) => <span key={i} className="text-xs">{s}</span>)}</div>
                </div>

                {/* Card 2 — mid */}
                <div className="fcard2 absolute glass rounded-2xl px-4 py-3 w-52"
                  style={{ left: 20, top: 20, zIndex: 2 }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-lg text-white" style={{ backgroundColor: 'rgba(37,99,235,.8)' }}>Ing. Sistemas</span>
                    <span className="text-xs font-bold text-green-300">S/. 5</span>
                  </div>
                  <p className="text-white text-xs font-bold leading-snug">Cálculo Diferencial – Semanas 5-10</p>
                  <div className="flex gap-0.5 mt-2">{'⭐⭐⭐⭐⭐'.split('').map((s, i) => <span key={i} className="text-xs">{s}</span>)}</div>
                </div>

                {/* Card 1 — front */}
                <div className="fcard1 absolute glass rounded-2xl px-4 py-3 w-56"
                  style={{ left: '50%', transform: 'translateX(-50%)', top: 80, zIndex: 3 }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-lg text-white" style={{ backgroundColor: 'rgba(234,88,12,.9)' }}>Administración</span>
                    <span className="text-xs font-bold text-green-300">Gratis</span>
                  </div>
                  <p className="text-white text-xs font-bold leading-snug">Macroeconomía – Unidades 1 a 4</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex gap-0.5">{'⭐⭐⭐⭐⭐'.split('').map((s, i) => <span key={i} className="text-xs">{s}</span>)}</div>
                    <span className="text-xs text-orange-200">5.0</span>
                  </div>
                </div>

                {/* Glow */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-6"
                  style={{ background: 'radial-gradient(ellipse,rgba(255,255,255,.2),transparent)', filter: 'blur(8px)' }} />
              </div>
            </div>

            {/* Feature bullets */}
            <div className="space-y-3">
              {FEATURES.map((f, i) => (
                <div key={i} className="flex items-center gap-3 glass rounded-xl px-4 py-3"
                  style={{ animationDelay: `${.1 + i * .08}s` }}>
                  <span className="text-xl flex-shrink-0">{f.icon}</span>
                  <div>
                    <p className="text-white font-bold text-sm leading-none">{f.title}</p>
                    <p className="text-orange-200 text-xs mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL: FORM ── */}
        <div className="flex-1 flex items-center justify-center p-8"
          style={{ backgroundColor: '#FFFBF5' }}>

          <div className="w-full max-w-md slide-in-r">

            {/* Mobile logo */}
            <div className="flex items-center gap-2.5 mb-8 md:hidden">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black"
                style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)' }}>A</div>
              <span className="font-black text-gray-800 text-lg">ApuntesUA</span>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-black text-gray-900 mb-2">
                {isRegister ? 'Crea tu cuenta' : 'Bienvenido de vuelta'}
              </h1>
              <p className="text-gray-400 text-sm">
                {isRegister
                  ? 'Únete a la comunidad de estudiantes UA'
                  : 'Ingresa con tu correo institucional'}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex rounded-2xl overflow-hidden p-1 mb-7 gap-1"
              style={{ backgroundColor: '#F3F4F6' }}>
              {[{ label: 'Iniciar sesión', val: false }, { label: 'Registrarse', val: true }].map(tab => (
                <button key={String(tab.val)}
                  onClick={() => { setIsRegister(tab.val); setError('') }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${isRegister === tab.val ? 'tab-active' : 'tab-inactive'}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="fade-up flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 mb-5">
                <span>⚠️</span>
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Correo institucional
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📧</span>
                <input
                  className="input-login"
                  style={{ paddingLeft: 44 }}
                  type="email"
                  placeholder="correo@autonoma.edu.pe"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={handleKey}
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-7">
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                <input
                  className="input-login"
                  style={{ paddingLeft: 44, paddingRight: 52 }}
                  type={showPass ? 'text' : 'password'}
                  placeholder={isRegister ? 'Mínimo 6 caracteres' : 'Tu contraseña'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={handleKey}
                />
                <button type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                  onClick={() => setShowPass(!showPass)}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button onClick={handleAuth} disabled={loading}
              className="w-full py-4 rounded-2xl font-black text-sm text-white transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed mb-4"
              style={{ background: 'linear-gradient(135deg,#C2410C,#EA580C,#F97316)', boxShadow: '0 8px 32px rgba(234,88,12,.35)' }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  {isRegister ? 'Creando cuenta...' : 'Ingresando...'}
                </span>
              ) : isRegister ? 'Crear cuenta gratis →' : 'Ingresar →'}
            </button>

            {/* Divider note */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">solo correos @autonoma.edu.pe</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[['🔒', 'Seguro'], ['⚡', 'Gratis'], ['🎓', 'UA oficial']].map(([icon, label]) => (
                <div key={label} className="flex flex-col items-center gap-1 p-3 rounded-xl"
                  style={{ backgroundColor: '#F9FAFB', border: '1.5px solid #F3F4F6' }}>
                  <span className="text-xl">{icon}</span>
                  <span className="text-xs font-semibold text-gray-600">{label}</span>
                </div>
              ))}
            </div>

            <button onClick={() => window.location.href = '/'}
              className="w-full text-center text-sm text-gray-400 hover:text-orange-600 transition font-medium">
              ← Volver al inicio
            </button>
          </div>
        </div>
      </main>
    </>
  )
}
