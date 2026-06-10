import Groq from 'groq-sdk'

export const maxDuration = 60

export interface ResultadoAnalisis {
  score_total: number
  tipo_documento: 'tesis_investigacion' | 'apuntes_clase' | 'resumen_capitulo' | 'practicas_resueltas' | 'monografia' | 'guia_estudio' | 'otro'
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

const PROMPT_EVALUACION = `Eres un evaluador académico especializado en trabajos universitarios peruanos de la Universidad Autónoma del Perú. Devuelve ÚNICAMENTE un objeto JSON válido, sin texto adicional, sin markdown, sin bloques de código.

═══ PASO 1: IDENTIFICA EL TIPO DE DOCUMENTO ═══
Clasifica el documento en uno de estos tipos:
- "tesis_investigacion": investigación completa con hipótesis, marco teórico, metodología, resultados y conclusiones. Trabajo de mayor valor académico.
- "monografia": trabajo académico estructurado sobre un tema específico, con introducción, desarrollo y conclusiones.
- "practicas_resueltas": ejercicios, problemas o prácticas con desarrollo y solución paso a paso.
- "guia_estudio": esquemas, mapas conceptuales, guías de repaso o material didáctico estructurado.
- "resumen_capitulo": resumen fiel de uno o varios capítulos de un libro o material del curso.
- "apuntes_clase": notas tomadas en clase, apuntes de sesiones, transcripciones de pizarra.
- "otro": cualquier otro tipo de documento académico.

═══ PASO 2: EVALÚA LA CALIDAD (ajustada al tipo) ═══
Usa los siguientes criterios. El estándar varía según el tipo: una tesis se evalúa distinto a apuntes de primer ciclo.

- organizacion (0-25):
  · Tesis/monografía: portada, índice, capítulos bien definidos, bibliografía → hasta 25 pts
  · Apuntes/resumen: estructura ordenada, uso de títulos y subtítulos → hasta 18 pts
  · Sin ninguna organización → 0-5 pts

- profundidad (0-25):
  · Tesis/investigación: marco teórico sólido, análisis crítico, discusión → hasta 25 pts
  · Monografía/guía: conceptos bien desarrollados, no solo definiciones → hasta 20 pts
  · Apuntes de ciclos superiores (VI-X): contenido técnico bien explicado → hasta 18 pts
  · Apuntes de primeros ciclos (I-V): conceptos introductorios bien explicados → hasta 15 pts

- ejemplos (0-20):
  · Prácticas resueltas: desarrollo completo de ejercicios con procedimiento → hasta 20 pts
  · Tesis: casos de estudio, datos reales, estadísticas → hasta 18 pts
  · Apuntes con ejercicios: ejemplos aplicados, casos prácticos → hasta 15 pts
  · Solo teoría sin ejemplos → 0-5 pts

- cobertura (0-20):
  · Tesis: todos los capítulos completos → hasta 20 pts
  · Apuntes: cubre varias semanas/unidades del sílabo → hasta 16 pts
  · Resumen de un solo capítulo o tema → hasta 10 pts

- legibilidad (0-10):
  · Texto claro, ortografía correcta, formato limpio, fácil de leer → hasta 10 pts
  · Texto confuso, muchas faltas, desorganizado → 0-3 pts

═══ PASO 3: DETERMINA LA BANDA DE PRECIO ═══
Basándote en el score_total Y el tipo de documento:

score 0–39   → "rechazado" (contenido insuficiente, no publicable)
score 40–59  → "gratis"    (contenido básico o introductorio, valor limitado)
score 60–74  → "2-5"       (apuntes de calidad media, útiles para el curso)
score 75–89  → "5-10"      (buen contenido, bien estructurado, ahorra tiempo al comprador)
score 90–100 → "10-15"     (excelente: tesis, investigación completa o material muy elaborado)

REFERENCIAS DE SCORE POR TIPO (orientativas):
· Tesis/investigación completa de alta calidad: 85–97
· Tesis/investigación con deficiencias: 65–84
· Monografía bien estructurada: 72–88
· Prácticas resueltas completas: 70–90
· Apuntes de ciclos superiores (VI-X) bien elaborados: 65–82
· Apuntes de primeros ciclos (I-V) ordenados: 52–72
· Resúmenes de capítulo: 48–68
· Apuntes desorganizados de cualquier ciclo: 30–55

Si el texto es ilegible, está en blanco o no es contenido académico → score_total: 0, banda: "rechazado".

Devuelve EXACTAMENTE este JSON (sin texto extra):
{
  "score_total": <número entero 0-100>,
  "tipo_documento": "<tesis_investigacion|monografia|practicas_resueltas|guia_estudio|resumen_capitulo|apuntes_clase|otro>",
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
  "resumen_ia":         "<máximo 3 oraciones describiendo el documento y su utilidad para otros estudiantes>",
  "feedback_vendedor":  "<qué debe mejorar para subir su puntaje, siendo específico según el tipo de documento>",
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

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[analizar-apunte] Error:', message)

    if (error instanceof Groq.RateLimitError) {
      return Response.json(
        { error: 'Límite de solicitudes de Groq alcanzado. Espera unos segundos e intenta de nuevo.' },
        { status: 429 }
      )
    }
    if (error instanceof Groq.AuthenticationError) {
      return Response.json(
        { error: 'API key de Groq inválida. Verifica la variable GROQ_API_KEY en Vercel.' },
        { status: 502 }
      )
    }

    return Response.json(
      { error: `Error al analizar: ${message}` },
      { status: 500 }
    )
  }
}
