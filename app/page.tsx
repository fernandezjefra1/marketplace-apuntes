'use client'
import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Landing() {
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) window.location.href = '/dashboard'
    }
    checkUser()
  }, [])

  return (
    <main className="min-h-screen bg-white">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📖</span>
            <span className="font-bold text-gray-800 text-lg">ApuntesUA</span>
          </div>
          <button
            onClick={() => window.location.href = '/login'}
            className="text-white px-5 py-2 rounded-xl font-semibold text-sm"
            style={{ backgroundColor: '#EA580C' }}
          >
            Ingresar
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 text-center md:text-left">
          <span className="text-sm font-bold px-3 py-1 rounded-full text-white mb-4 inline-block"
            style={{ backgroundColor: '#EA580C' }}>
            Solo para estudiantes de la UA
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 leading-tight">
            El marketplace de apuntes de la
            <span style={{ color: '#EA580C' }}> Universidad Autonoma del Peru</span>
          </h1>
          <p className="text-gray-500 text-lg mb-8">
            Comparte tus mejores resumenes, ayuda a tus companeros y gana dinero con tu esfuerzo academico.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
            <button
              onClick={() => window.location.href = '/login'}
              className="text-white px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition"
              style={{ backgroundColor: '#EA580C' }}
            >
              Empezar ahora — es gratis
            </button>
            <button
              onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-3 rounded-xl font-bold text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
            >
              Como funciona
            </button>
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="relative">
            <div className="w-72 h-72 rounded-3xl flex items-center justify-center"
              style={{ backgroundColor: '#FFF7ED' }}>
              <span className="text-8xl">📚</span>
            </div>
            <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg p-4">
              <p className="text-xs text-gray-400">Apuntes disponibles</p>
              <p className="text-2xl font-bold" style={{ color: '#EA580C' }}>100+</p>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg p-4">
              <p className="text-xs text-gray-400">Estudiantes activos</p>
              <p className="text-2xl font-bold text-green-600">50+</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12" style={{ backgroundColor: '#EA580C' }}>
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
          {[
            { num: '100+', label: 'Apuntes subidos' },
            { num: '50+', label: 'Estudiantes activos' },
            { num: '8', label: 'Carreras disponibles' },
            { num: '70%', label: 'Ganancias para ti' },
          ].map((s, i) => (
            <div key={i}>
              <p className="text-3xl font-bold">{s.num}</p>
              <p className="text-sm opacity-80 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Como funciona</h2>
          <p className="text-gray-400">Simple, rapido y seguro</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: '📧', step: '1', title: 'Registrate', desc: 'Crea tu cuenta con tu correo institucional @autonoma.edu.pe' },
            { icon: '📤', step: '2', title: 'Sube tus apuntes', desc: 'Publica tus resumenes en PDF, elige el precio o compartelos gratis' },
            { icon: '💰', step: '3', title: 'Gana dinero', desc: 'Recibe el 70% de cada venta directamente. Nosotros nos quedamos el 30%' },
          ].map((item, i) => (
            <div key={i} className="text-center p-8 rounded-2xl border border-gray-100 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4"
                style={{ backgroundColor: '#EA580C' }}>
                {item.step}
              </div>
              <p className="text-4xl mb-4">{item.icon}</p>
              <h3 className="font-bold text-gray-800 text-lg mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Carreras */}
      <section className="py-16" style={{ backgroundColor: '#F9FAFB' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Carreras disponibles</h2>
            <p className="text-gray-400">Apuntes para todas las facultades</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '⚖️', name: 'Derecho' },
              { icon: '💻', name: 'Ing. de Sistemas' },
              { icon: '🏗️', name: 'Ing. Civil' },
              { icon: '📊', name: 'Administracion' },
              { icon: '🧾', name: 'Contabilidad' },
              { icon: '🧠', name: 'Psicologia' },
              { icon: '💊', name: 'Enfermeria' },
              { icon: '📣', name: 'Marketing' },
            ].map((c, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 text-center hover:shadow-md transition cursor-pointer"
                onClick={() => window.location.href = '/login'}>
                <p className="text-3xl mb-2">{c.icon}</p>
                <p className="font-semibold text-gray-700 text-sm">{c.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="rounded-3xl p-12" style={{ backgroundColor: '#FFF7ED' }}>
          <p className="text-5xl mb-4">🚀</p>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            Listo para empezar?
          </h2>
          <p className="text-gray-500 mb-8">
            Unete a la comunidad de estudiantes de la UA que ya comparten y ganan con sus apuntes
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="text-white px-10 py-4 rounded-xl font-bold text-sm hover:opacity-90 transition"
            style={{ backgroundColor: '#EA580C' }}
          >
            Crear mi cuenta gratis
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">📖</span>
            <span className="font-bold text-gray-700">ApuntesUA</span>
          </div>
          <p className="text-gray-400 text-sm">Universidad Autonoma del Peru — 2026</p>
          <button
            onClick={() => window.location.href = '/terminos'}
            className="text-sm text-gray-400 hover:text-gray-600 transition"
          >
            Terminos y condiciones
          </button>
        </div>
      </footer>

    </main>
  )
}