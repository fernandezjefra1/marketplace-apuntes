'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isRegister, setIsRegister] = useState(false)

  const handleAuth = async () => {
    if (!email.endsWith('@autonoma.edu.pe')) {
      setError('Solo se permiten correos @autonoma.edu.pe')
      return
    }
    setLoading(true)
    setError('')
    if (isRegister) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else alert('Revisa tu correo para confirmar tu cuenta!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError('Correo o contrasena incorrectos')
      else window.location.href = '/dashboard'
    }
    setLoading(false)
  }

  const features = [
    { icon: '📚', title: 'Comparte apuntes', desc: 'Sube tus mejores resumenes' },
    { icon: '💰', title: 'Gana dinero', desc: 'Monetiza tu esfuerzo' },
    { icon: '🔍', title: 'Encuentra todo', desc: 'Busca por curso o carrera' },
    { icon: '⭐', title: 'Calidad garantizada', desc: 'Sistema de valoraciones' },
  ]

  return (
    <main className="min-h-screen flex">

      {/* Panel izquierdo naranja */}
      <div
        className="hidden md:flex w-1/2 flex-col items-center justify-center p-12"
        style={{ backgroundColor: '#EA580C' }}
      >
        <div className="text-white text-center w-full">
          <p className="text-6xl mb-4">📖</p>
          <h1 className="text-4xl font-bold mb-3">ApuntesUA</h1>
          <p className="text-lg mb-10 opacity-90">
            El marketplace de apuntes de la<br />Universidad Autonoma del Peru
          </p>
          <div className="grid grid-cols-2 gap-4">
            {features.map((f, i) => (
              <div
                key={i}
                className="rounded-2xl p-4 text-left"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
              >
                <p className="text-3xl mb-2">{f.icon}</p>
                <p className="font-bold text-white">{f.title}</p>
                <p className="text-sm text-white opacity-80">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho blanco - Login */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">

          <div className="text-center mb-8">
            <p className="text-5xl mb-3">📖</p>
            <h2 className="text-2xl font-bold text-gray-800">Bienvenido a ApuntesUA</h2>
            <p className="text-gray-400 text-sm mt-1">Universidad Autonoma del Peru</p>
          </div>

          {/* Toggle Iniciar / Registrarse */}
          <div
            className="flex rounded-xl overflow-hidden mb-6 border"
            style={{ borderColor: '#EA580C' }}
          >
            <button
              onClick={() => setIsRegister(false)}
              className="flex-1 py-2 text-sm font-semibold transition-all"
              style={
                !isRegister
                  ? { backgroundColor: '#EA580C', color: 'white' }
                  : { backgroundColor: 'white', color: '#EA580C' }
              }
            >
              Iniciar sesion
            </button>
            <button
              onClick={() => setIsRegister(true)}
              className="flex-1 py-2 text-sm font-semibold transition-all"
              style={
                isRegister
                  ? { backgroundColor: '#EA580C', color: 'white' }
                  : { backgroundColor: 'white', color: '#EA580C' }
              }
            >
              Registrarse
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3 mb-4">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Correo institucional
            </label>
            <input
              type="email"
              placeholder="correo@autonoma.edu.pe"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none"
              style={{ borderColor: '#D1D5DB' }}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Contrasena
            </label>
            <input
              type="password"
              placeholder="Ingresa tu contrasena"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none"
            />
          </div>

          <button
            onClick={handleAuth}
            disabled={loading}
            className="w-full text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition"
            style={{ backgroundColor: '#EA580C' }}
          >
            {loading ? 'Cargando...' : isRegister ? 'Crear cuenta' : 'Ingresar'}
          </button>

          <p className="text-center text-xs text-gray-400 mt-6">
            Solo para estudiantes con correo @autonoma.edu.pe
          </p>
        </div>
      </div>
    </main>
  )
}