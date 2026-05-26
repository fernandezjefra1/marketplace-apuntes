import Groq from 'groq-sdk'

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

const PROMPT_EVALUACION = `Eres un evaluador académico de apuntes universitarios peruanos. Analiza el siguiente texto extraído de un apunte y devuelve ÚNICAMENTE un objeto JSON válido, sin texto adicional, sin markdown, sin bloques de código.

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

Si el texto está en blanco, es ilegible o no contiene contenido académico, asigna score_total: 0 con banda "rechazado" y explica en feedback_vendedor.

Devuelve EXACTAMENTE este JSON (sin texto extra):
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
  const apiKey = process.env.GROQ_API_KEY ?? ''
  if (!apiKey || apiKey.trim() === '') {
    return Response.json(
      { error: 'GROQ_API_KEY no está configurada en las variables de entorno de Vercel.' },
      { status: 503 }
    )
  }

  try {
    let body: { pdfText?: unknown; titulo?: unknown; curso?: unknown; carrera?: unknown; ciclo?: unknown }
    try {
      body = await request.json()
    } catch {
      return Response.json({ error: 'Cuerpo de solicitud inválido.' }, { status: 400 })
    }

    const { pdfText, titulo, curso, carrera, ciclo } = body
    const textoExtraido = typeof pdfText === 'string' ? pdfText.trim() : ''

    if (textoExtraido.length < 100) {
      return Response.json(
        {
          error: `No se pudo extraer suficiente texto del PDF (solo ${textoExtraido.length} caracteres). El PDF parece ser una imagen escaneada. Usa un PDF con texto seleccionable para obtener análisis preciso.`,
          caracteresExtraidos: textoExtraido.length,
        },
        { status: 400 }
      )
    }

    const groq = new Groq({ apiKey })

    // Limitar a 14,000 caracteres para no exceder el contexto del modelo
    const textoLimitado = textoExtraido.slice(0, 14000)

    const metadatos = [
      titulo  ? `Título: ${titulo}`   : null,
      curso   ? `Curso: ${curso}`     : null,
      carrera ? `Carrera: ${carrera}` : null,
      ciclo   ? `Ciclo: ${ciclo}`     : null,
    ].filter(Boolean).join('\n')

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `${PROMPT_EVALUACION}\n\n--- METADATOS DEL APUNTE ---\n${metadatos}\n\n--- CONTENIDO DEL APUNTE (${textoLimitado.length} caracteres extraídos) ---\n${textoLimitado}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 1024,
    })

    const text = completion.choices[0]?.message?.content ?? ''
    if (!text) throw new Error('Groq no devolvió contenido.')

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

  } catch (error: any) {
    console.error('[analizar-apunte] Error:', error?.message ?? error)

    // Errores de rate limit de Groq
    if (error?.status === 429) {
      return Response.json(
        { error: 'Límite de solicitudes de Groq alcanzado. Espera unos segundos e intenta de nuevo.' },
        { status: 429 }
      )
    }
    if (error?.status === 401) {
      return Response.json(
        { error: 'API key de Groq inválida. Verifica la variable GROQ_API_KEY en Vercel.' },
        { status: 502 }
      )
    }

    return Response.json(
      { error: `Error al analizar: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    )
  }
}
