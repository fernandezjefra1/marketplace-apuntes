'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

/* ── Counter animation hook ── */
function useCounter(target: number, duration = 1800, start = false) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!start) return
    let frame: number
    const startTime = performance.now()
    const step = (now: number) => {
      const p = Math.min((now - startTime) / duration, 1)
      setVal(Math.floor(p * target))
      if (p < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, duration, start])
  return val
}

/* ── Intersection observer hook ── */
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

/* ── Mini apunte card (for hero) ── */
function MiniCard({ titulo, curso, carrera, precio, color, delay = 0 }: any) {
  return (
    <div className="bg-white rounded-2xl p-4 w-56"
      style={{ boxShadow: '0 20px 60px rgba(0,0,0,.18)', animationDelay: `${delay}s` }}>
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs font-bold px-2 py-1 rounded-lg text-white" style={{ backgroundColor: color }}>{carrera}</span>
        <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ backgroundColor: precio === 'Gratis' ? '#DCFCE7', color: '#15803D' }}>{precio}</span>
      </div>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: '#FFF7ED' }}>
        <span>📄</span>
      </div>
      <p className="font-bold text-gray-800 text-xs leading-tight mb-1">{titulo}</p>
      <p className="text-xs font-semibold" style={{ color }}>{curso}</p>
      <div className="flex items-center gap-1 mt-2">
        {'⭐⭐⭐⭐⭐'.split('').map((s, i) => <span key={i} className="text-xs">{s}</span>)}
      </div>
    </div>
  )
}

export default function Landing() {
  const statsRef = useInView()
  const c1 = useCounter(127, 1600, statsRef.inView)
  const c2 = useCounter(58,  1400, statsRef.inView)
  const c3 = useCounter(9,   1000, statsRef.inView)
  const c4 = useCounter(70,  1200, statsRef.inView)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) window.location.href = '/dashboard'
    })
  }, [])

  return (
    <>
      <style>{`
        @keyframes blob1  { 0%,100%{transform:translate(0,0)scale(1)}   33%{transform:translate(40px,-60px)scale(1.15)} 66%{transform:translate(-30px,30px)scale(.9)} }
        @keyframes blob2  { 0%,100%{transform:translate(0,0)scale(1)}   33%{transform:translate(-50px,40px)scale(1.1)} 66%{transform:translate(30px,-20px)scale(.95)} }
        @keyframes blob3  { 0%,100%{transform:translate(0,0)scale(1)}   33%{transform:translate(20px,50px)scale(1.05)} 66%{transform:translate(-40px,-30px)scale(1.1)} }
        @keyframes float1 { 0%,100%{transform:translateY(0)rotate(-3deg)}  50%{transform:translateY(-22px)rotate(2deg)} }
        @keyframes float2 { 0%,100%{transform:translateY(0)rotate(5deg)}   50%{transform:translateY(-16px)rotate(-2deg)} }
        @keyframes float3 { 0%,100%{transform:translateY(0)rotate(-1deg)}  50%{transform:translateY(-28px)rotate(4deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes gradShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes pulse-dot { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.6);opacity:.4} }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }

        .blob1 { animation: blob1 8s ease-in-out infinite }
        .blob2 { animation: blob2 10s ease-in-out infinite 2s }
        .blob3 { animation: blob3 7s ease-in-out infinite 4s }
        .card1 { animation: float1 6s ease-in-out infinite }
        .card2 { animation: float2 7s ease-in-out infinite 1s }
        .card3 { animation: float3 5s ease-in-out infinite 2s }
        .fade-up { animation: fadeUp .7s ease forwards }
        .grad-text {
          background: linear-gradient(270deg,#EA580C,#F97316,#FBBF24,#EA580C);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradShift 4s ease infinite;
        }
        .pulse-dot { animation: pulse-dot 1.5s ease infinite }
        .marquee-track { animation: marquee 18s linear infinite }
        .card-3d {
          transition: transform .3s ease, box-shadow .3s ease;
          transform-style: preserve-3d;
        }
        .card-3d:hover {
          transform: translateY(-8px) rotateX(4deg) rotateY(-4deg);
          box-shadow: 0 24px 64px rgba(234,88,12,.2) !important;
        }
      `}</style>

      <main className="min-h-screen overflow-hidden" style={{ backgroundColor: '#FFFBF5' }}>

        {/* ── NAVBAR ── */}
        <nav className="sticky top-0 z-50 border-b border-orange-100/60"
          style={{ backgroundColor: 'rgba(255,251,245,.85)', backdropFilter: 'blur(16px)' }}>
          <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-base"
                style={{ background: 'linear-gradient(135deg,#C2410C,#EA580C,#F97316)' }}>A</div>
              <span className="font-black text-gray-800 text-lg tracking-tight">ApuntesUA</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition hidden sm:block">
                Cómo funciona
              </button>
              <button onClick={() => window.location.href = '/login'}
                className="text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)', boxShadow: '0 4px 16px rgba(234,88,12,.3)' }}>
                Ingresar →
              </button>
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="relative min-h-screen flex items-center overflow-hidden">

          {/* Animated blobs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="blob1 absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-30"
              style={{ background: 'radial-gradient(circle,#FED7AA,transparent 70%)', filter: 'blur(60px)' }} />
            <div className="blob2 absolute -bottom-40 -right-20 w-[600px] h-[600px] rounded-full opacity-20"
              style={{ background: 'radial-gradient(circle,#FDBA74,transparent 70%)', filter: 'blur(80px)' }} />
            <div className="blob3 absolute top-1/2 left-1/3 w-[400px] h-[400px] rounded-full opacity-15"
              style={{ background: 'radial-gradient(circle,#FCA5A5,transparent 70%)', filter: 'blur(60px)' }} />

            {/* Floating dots grid */}
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="absolute rounded-full"
                style={{
                  width: 4 + (i % 3) * 2,
                  height: 4 + (i % 3) * 2,
                  backgroundColor: '#EA580C',
                  opacity: 0.08 + (i % 5) * 0.04,
                  left: `${(i * 17 + 5) % 100}%`,
                  top: `${(i * 23 + 10) % 100}%`,
                  animation: `blob${(i % 3) + 1} ${6 + i % 4}s ease-in-out infinite`,
                  animationDelay: `${i * 0.3}s`,
                }} />
            ))}
          </div>

          <div className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10">

            {/* Left: copy */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
                style={{ backgroundColor: '#FFF7ED', border: '1.5px solid #FED7AA' }}>
                <div className="w-2 h-2 rounded-full pulse-dot" style={{ backgroundColor: '#EA580C' }} />
                <span className="text-xs font-bold text-orange-700">Solo para estudiantes de la UA</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-black text-gray-900 leading-[1.05] mb-5">
                Comparte y<br />
                <span className="grad-text">gana dinero</span><br />
                con tus apuntes
              </h1>

              <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-lg">
                El marketplace de apuntes de la <strong className="text-gray-700">Universidad Autónoma del Perú</strong>.
                Sube tus resúmenes, ayuda a tus compañeros y monetiza tu esfuerzo académico.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <button onClick={() => window.location.href = '/login'}
                  className="text-white px-8 py-4 rounded-2xl font-black text-sm transition-all hover:shadow-2xl hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg,#C2410C,#EA580C,#F97316)', boxShadow: '0 8px 32px rgba(234,88,12,.4)' }}>
                  Empezar ahora — es gratis 🚀
                </button>
                <button onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 rounded-2xl font-bold text-sm border-2 border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600 transition-all">
                  Cómo funciona ↓
                </button>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {['🧑‍💻','👩‍⚕️','👨‍⚖️','👩‍💼'].map((e, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-sm"
                      style={{ backgroundColor: ['#FEF3C7','#DBEAFE','#FCE7F3','#D1FAE5'][i] }}>
                      {e}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500"><span className="font-bold text-gray-800">58+</span> estudiantes ya ganando dinero</p>
              </div>
            </div>

            {/* Right: floating 3D cards */}
            <div className="hidden md:flex justify-center items-center">
              <div className="relative" style={{ width: 340, height: 380, perspective: 1000 }}>
                {/* Card back */}
                <div className="card3 absolute" style={{ right: 0, top: 60, zIndex: 1 }}>
                  <MiniCard titulo="Derecho Constitucional – Resumen Final" curso="Derecho Constitucional"
                    carrera="Derecho" precio="S/. 8" color="#7C3AED" />
                </div>
                {/* Card mid */}
                <div className="card2 absolute" style={{ right: 40, top: 30, zIndex: 2 }}>
                  <MiniCard titulo="Cálculo Diferencial – Semana 5 al 10" curso="Cálculo Diferencial"
                    carrera="Ing. Sistemas" precio="S/. 5" color="#2563EB" />
                </div>
                {/* Card front */}
                <div className="card1 absolute" style={{ right: 80, top: 0, zIndex: 3 }}>
                  <MiniCard titulo="Macroeconomía – Unidades 1 a 4 Completo" curso="Macroeconomía"
                    carrera="Administracion" precio="Gratis" color="#EA580C" />
                </div>

                {/* Glow under cards */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-8 rounded-full"
                  style={{ background: 'radial-gradient(ellipse,rgba(234,88,12,.25),transparent)', filter: 'blur(12px)' }} />
              </div>
            </div>
          </div>

          {/* Scroll hint */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
            <div className="w-5 h-8 rounded-full border-2 border-gray-400 flex items-start justify-center pt-1.5">
              <div className="w-1 h-2 rounded-full bg-gray-400"
                style={{ animation: 'blob1 1.5s ease-in-out infinite' }} />
            </div>
          </div>
        </section>

        {/* ── MARQUEE (logos/carreras) ── */}
        <div className="py-4 overflow-hidden border-y border-orange-100"
          style={{ backgroundColor: '#FFF7ED' }}>
          <div className="flex gap-8 marquee-track whitespace-nowrap">
            {[...['Derecho ⚖️', 'Ing. de Sistemas 💻', 'Ing. Civil 🏗️', 'Administración 📊', 'Contabilidad 🧾', 'Psicología 🧠', 'Enfermería 💊', 'Marketing 📣', 'Medicina Humana 🏥'],
              ...['Derecho ⚖️', 'Ing. de Sistemas 💻', 'Ing. Civil 🏗️', 'Administración 📊', 'Contabilidad 🧾', 'Psicología 🧠', 'Enfermería 💊', 'Marketing 📣', 'Medicina Humana 🏥']
            ].map((c, i) => (
              <span key={i} className="text-sm font-bold text-orange-700 opacity-60">{c}</span>
            ))}
          </div>
        </div>

        {/* ── STATS ── */}
        <section ref={statsRef.ref} className="py-20 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#9A3412,#C2410C,#EA580C,#F97316)' }}>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20 bg-white"
              style={{ filter: 'blur(40px)' }} />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full opacity-10 bg-white"
              style={{ filter: 'blur(30px)' }} />
          </div>
          <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white relative z-10">
            {[
              { val: c1, suffix: '+', label: 'Apuntes subidos', icon: '📄' },
              { val: c2, suffix: '+', label: 'Estudiantes activos', icon: '👩‍🎓' },
              { val: c3, suffix: '',  label: 'Carreras disponibles', icon: '🎓' },
              { val: c4, suffix: '%', label: 'Ganancias para ti', icon: '💰' },
            ].map((s, i) => (
              <div key={i} className="group">
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="text-5xl font-black mb-1">
                  {s.val}{s.suffix}
                </div>
                <p className="text-sm text-orange-100 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CÓMO FUNCIONA ── */}
        <section id="como-funciona" className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-xs font-bold px-3 py-1.5 rounded-full text-orange-700 border border-orange-200 bg-orange-50">
                Proceso simple
              </span>
              <h2 className="text-4xl font-black text-gray-900 mt-4 mb-3">Cómo funciona</h2>
              <p className="text-gray-400 text-lg">En 3 pasos empiezas a ganar</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {/* Connecting line */}
              <div className="hidden md:block absolute top-16 left-1/3 right-1/3 h-0.5"
                style={{ background: 'linear-gradient(90deg,transparent,#FED7AA,transparent)' }} />

              {[
                { icon: '📧', step: '01', title: 'Regístrate', desc: 'Crea tu cuenta con tu correo institucional @autonoma.edu.pe en menos de 1 minuto.', color: '#EA580C', bg: '#FFF7ED' },
                { icon: '🤖', step: '02', title: 'Sube con IA', desc: 'La IA de Claude analiza tu PDF, califica la calidad y determina automáticamente el precio.', color: '#7C3AED', bg: '#F5F3FF' },
                { icon: '💳', step: '03', title: 'Cobra directo', desc: 'Recibe el 70% de cada venta. Tu conocimiento vale dinero real.', color: '#15803D', bg: '#F0FDF4' },
              ].map((item, i) => (
                <div key={i} className="card-3d rounded-3xl p-8 border border-gray-100 relative"
                  style={{ backgroundColor: 'white', boxShadow: '0 4px 24px rgba(0,0,0,.06)' }}>
                  <div className="absolute -top-4 -right-3 text-xs font-black text-gray-200 text-5xl select-none"
                    style={{ fontFamily: 'monospace' }}>{item.step}</div>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-5"
                    style={{ backgroundColor: item.bg }}>
                    {item.icon}
                  </div>
                  <h3 className="font-black text-gray-800 text-xl mb-3">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                  <div className="mt-5 h-1 rounded-full" style={{ backgroundColor: item.bg }}>
                    <div className="h-full w-3/4 rounded-full" style={{ backgroundColor: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CARRERAS ── */}
        <section className="py-20 px-6" style={{ backgroundColor: '#F9FAFB' }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-gray-900 mb-3">Todas las carreras</h2>
              <p className="text-gray-400">Apuntes para cada facultad de la UA</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[
                { icon: '⚖️', name: 'Derecho', color: '#7C3AED' },
                { icon: '💻', name: 'Ing. de Sistemas', color: '#2563EB' },
                { icon: '🏗️', name: 'Ing. Civil', color: '#EA580C' },
                { icon: '📊', name: 'Administración', color: '#15803D' },
                { icon: '🧾', name: 'Contabilidad', color: '#CA8A04' },
                { icon: '🧠', name: 'Psicología', color: '#DB2777' },
                { icon: '💊', name: 'Enfermería', color: '#0891B2' },
                { icon: '📣', name: 'Marketing', color: '#DC2626' },
              ].map((c, i) => (
                <div key={i} onClick={() => window.location.href = '/login'}
                  className="card-3d bg-white rounded-2xl p-5 text-center cursor-pointer border border-gray-100 group"
                  style={{ boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}>
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform inline-block">{c.icon}</div>
                  <p className="font-bold text-gray-700 text-sm">{c.name}</p>
                  <div className="mt-2 h-1 rounded-full mx-auto w-12"
                    style={{ backgroundColor: c.color, opacity: 0.4 }} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIOS (fake but credible) ── */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-gray-900 mb-3">Lo que dicen los estudiantes</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { text: 'Subí mis resúmenes de Derecho Civil y en una semana ya tenía ventas. La IA me dijo exactamente qué mejorar.', name: 'Valentina R.', carrera: 'Derecho – V ciclo', emoji: '👩‍⚖️' },
                { text: 'Encontré apuntes increíbles de Cálculo que me salvaron el parcial. Todo organizado por ciclo y curso.', name: 'Miguel A.', carrera: 'Ing. de Sistemas – III ciclo', emoji: '👨‍💻' },
                { text: 'Ya generé S/. 120 en el mes. No creía que mis apuntes de Administración valieran tanto.', name: 'Fernanda C.', carrera: 'Administración – VII ciclo', emoji: '👩‍💼' },
              ].map((t, i) => (
                <div key={i} className="card-3d bg-white rounded-3xl p-6 border border-gray-100"
                  style={{ boxShadow: '0 4px 24px rgba(0,0,0,.06)' }}>
                  <div className="flex gap-1 mb-4">
                    {Array(5).fill('⭐').map((s, i) => <span key={i} className="text-sm">{s}</span>)}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-5">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                      style={{ backgroundColor: '#FFF7ED' }}>{t.emoji}</div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.carrera}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section className="px-6 pb-24">
          <div className="max-w-4xl mx-auto rounded-3xl overflow-hidden relative"
            style={{ background: 'linear-gradient(135deg,#9A3412,#C2410C,#EA580C,#F97316)', boxShadow: '0 24px 80px rgba(234,88,12,.4)' }}>
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white opacity-10" />
              <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white opacity-10" />
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="absolute rounded-full bg-white"
                  style={{ width: 3 + (i % 3), height: 3 + (i % 3), opacity: 0.06, left: `${(i * 19) % 100}%`, top: `${(i * 31 + 15) % 100}%` }} />
              ))}
            </div>
            <div className="relative z-10 py-16 px-10 text-center">
              <div className="text-5xl mb-5">🚀</div>
              <h2 className="text-4xl font-black text-white mb-3">¿Listo para empezar?</h2>
              <p className="text-orange-100 text-lg mb-8 max-w-lg mx-auto">
                Únete a la comunidad de estudiantes de la UA que ya comparten, aprenden y ganan dinero con sus apuntes.
              </p>
              <button onClick={() => window.location.href = '/login'}
                className="bg-white font-black text-orange-600 px-10 py-4 rounded-2xl text-sm hover:shadow-2xl hover:-translate-y-1 transition-all">
                Crear mi cuenta gratis →
              </button>
              <p className="text-orange-200 text-xs mt-4">Sin costo. Solo necesitas tu correo @autonoma.edu.pe</p>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="border-t border-gray-100 py-8 px-6" style={{ backgroundColor: '#FFFBF5' }}>
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black"
                style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)' }}>A</div>
              <span className="font-black text-gray-700">ApuntesUA</span>
            </div>
            <p className="text-gray-400 text-sm">Universidad Autónoma del Perú · 2026</p>
            <button onClick={() => window.location.href = '/terminos'}
              className="text-sm text-gray-400 hover:text-orange-600 transition">
              Términos y condiciones
            </button>
          </div>
        </footer>
      </main>
    </>
  )
}
