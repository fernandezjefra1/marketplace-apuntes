import { GoogleGenerativeAI, GoogleGenerativeAIFetchError } from '@google/generative-ai'

export const maxDuration = 60

export interface ResultadoAnalisis {
  score_total: number
  criterios: {
    organizacion: number
    profundidad: number
    ejemplos: number
    cobertura: number
    legibilidad: number
  }
  banda_precio: 'rechazado' | 'gratis' | '2-5' | '5-10' | '10-15'
  precio_min: number
  precio_max: number
  resumen_ia: string
  feedback_vendedor: string
  temas_cubiertos: string[]
  apto_pack_examen: boolean
}

function calcularBanda(score: number): Pick<ResultadoAnalisis, 'banda_precio' | 'precio_min' | 'precio_max'> {
  if (score < 40) return { banda_precio: 'rechazado', precio_min: 0, precio_max: 0 }
  if (score < 60) return { banda_precio: 'gratis',    precio_min: 0, precio_max: 0 }
  if (score < 75) return { banda_precio: '2-5',       precio_min: 2, precio_max: 5 }
  if (score < 90) return { banda_precio: '5-10',      precio_min: 5, precio_max: 10 }
  return           { banda_precio: '10-15',    precio_min: 10, precio_max: 15 }
}

// Espera N milisegundos (compatible con edge/serverless)
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const PROMPT_EVALUACION = `Eres un evaluador académico de apuntes universitarios peruanos. Analiza el PDF adjunto y devuelve ÚNICAMENTE un objeto JSON válido, sin texto adicional, sin markdown, sin bloques de código.

Evalúa con estos 5 criterios:
- organizacion (0-25): estructura lógica, índice, secciones claras, secuencia coherente
- profundidad   (0-25): conceptos desarrollados, análisis, teoría — no solo definiciones
- ejemplos      (0-20): casos prácticos, ejercicios resueltos, aplicaciones reales
- cobertura     (0-20): amplitud de temas del curso, completitud del contenido
- legibilidad   (0-10): claridad del texto, diagramas, formato, ortografía

Reglas de banda de precio según score_total:
  0–39  → banda_precio: "rechazado", precio_min: 0,  precio_max: 0
  40–59 → banda_precio: "gratis",    precio_min: 0,  precio_max: 0
  60–74 → banda_precio: "2-5",       precio_min: 2,  precio_max: 5
  75–89 → banda_precio: "5-10",      precio_min: 5,  precio_max: 10
  90–100→ banda_precio: "10-15",     precio_min: 10, precio_max: 15

Si el PDF está en blanco, es ilegible o no contiene contenido académico, asigna score_total: 0 con banda "rechazado" y explica el problema en feedback_vendedor.

Devuelve EXACTAMENTE este JSON (sin texto extra antes o después):
{
  "score_total": <número entero 0-100>,
  "criterios": {
    "organizacion": <número entero 0-25>,
    "profundidad":  <número entero 0-25>,
    "ejemplos":     <número entero 0-20>,
    "cobertura":    <número entero 0-20>,
    "legibilidad":  <número entero 0-10>
  },
  "banda_precio":       "<rechazado|gratis|2-5|5-10|10-15>",
  "precio_min":         <número>,
  "precio_max":         <número>,
  "resumen_ia":         "<máximo 3 oraciones describiendo el apunte>",
  "feedback_vendedor":  "<qué debe mejorar para subir su puntaje>",
  "temas_cubiertos":    ["<tema1>", "<tema2>", ...],
  "apto_pack_examen":   <true si score >= 90, false en caso contrario>
}`

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY ?? ''
  if (!apiKey || apiKey.includes('XXXXXXXXX') || apiKey === 'TU_CLAVE_AQUI') {
    return Response.json(
      { error: 'GEMINI_API_KEY no está configurada en las variables de entorno de Vercel.' },
      { status: 503 }
    )
  }

  try {
    let body: { pdfBase64?: unknown }
    try {
      body = await request.json()
    } catch {
      return Response.json(
        { error: 'Cuerpo de solicitud inválido. Se esperaba JSON con pdfBase64.' },
        { status: 400 }
      )
    }

    const { pdfBase64 } = body
    if (!pdfBase64 || typeof pdfBase64 !== 'string' || pdfBase64.trim() === '') {
      return Response.json(
        { error: 'Se requiere el campo pdfBase64 con el PDF en formato base64.' },
        { status: 400 }
      )
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    // Reintentos con backoff para errores 429 transitorios (límite por minuto)
    let lastError: GoogleGenerativeAIFetchError | null = null
    const delays = [4000, 10000] // 4s y 10s entre reintentos

    for (let intento = 0; intento <= delays.length; intento++) {
      try {
        const result = await model.generateContent([
          { inlineData: { mimeType: 'application/pdf', data: pdfBase64 } },
          { text: PROMPT_EVALUACION },
        ])

        const text = result.response.text()

        let resultado: ResultadoAnalisis
        try {
          resultado = JSON.parse(text.trim())
        } catch {
          const match = text.match(/\{[\s\S]*\}/)
          if (!match) throw new Error('La respuesta de la IA no contiene JSON válido.')
          resultado = JSON.parse(match[0])
        }

        const bandaCorrecta = calcularBanda(resultado.score_total)
        resultado.banda_precio     = bandaCorrecta.banda_precio
        resultado.precio_min       = bandaCorrecta.precio_min
        resultado.precio_max       = bandaCorrecta.precio_max
        resultado.apto_pack_examen = resultado.score_total >= 90

        return Response.json(resultado)

      } catch (err) {
        if (err instanceof GoogleGenerativeAIFetchError && err.status === 429 && intento < delays.length) {
          lastError = err
          console.warn(`[analizar-apunte] 429 en intento ${intento + 1}, esperando ${delays[intento]}ms...`)
          await sleep(delays[intento])
          continue
        }
        throw err
      }
    }

    // Si llegamos aquí, los 3 intentos fallaron por 429
    console.error('[analizar-apunte] 429 persistente tras reintentos')
    return Response.json(
      {
        error: 'La API de Gemini tiene el límite de solicitudes alcanzado. ' +
          'Si este error lleva más de 1 hora, la cuota diaria gratuita (1500 req/día) está agotada — ' +
          'se restablece automáticamente a medianoche (hora del Pacífico). Intenta mañana o genera una nueva API key en Google AI Studio.',
      },
      { status: 429 }
    )

  } catch (error) {
    if (error instanceof GoogleGenerativeAIFetchError) {
      console.error(`[analizar-apunte] GoogleGenerativeAIFetchError status=${error.status} message=${error.message}`)

      if (error.status === 429) {
        return Response.json(
          {
            error: 'Límite de solicitudes de Gemini alcanzado. Si persiste más de 1 hora, la cuota diaria gratuita se agotó — ' +
              'se restablece a medianoche. Genera una nueva API key en aistudio.google.com como alternativa.',
          },
          { status: 429 }
        )
      }
      if (error.status === 403) {
        return Response.json({ error: 'La API key de Gemini es inválida o fue revocada. Genera una nueva en Google AI Studio y actualízala en Vercel.' }, { status: 502 })
      }
      if (error.status === 400) {
        return Response.json({ error: `Gemini rechazó la solicitud: ${error.message}` }, { status: 502 })
      }
      if (error.status === 413 || error.message?.includes('too large')) {
        return Response.json({ error: 'El PDF es demasiado grande. El límite es 20 MB.' }, { status: 413 })
      }
      return Response.json(
        { error: `Error de Gemini (${error.status ?? 'sin código'}): ${error.message ?? 'sin detalle'}` },
        { status: 502 }
      )
    }

    console.error('[analizar-apunte] Error interno:', error)
    return Response.json(
      { error: `Error interno: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    )
  }
}
