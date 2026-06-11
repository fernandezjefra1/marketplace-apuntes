import Groq from 'groq-sdk'

export const maxDuration = 60

export interface ResultadoAnalisis {
  score_total: number
  estrellas: 0 | 1 | 2 | 3 | 4 | 5
  tipo_documento: 'apuntes_clase' | 'resumen_capitulo' | 'practicas_resueltas' | 'guia_estudio' | 'monografia' | 'otro'
  contenido_prohibido: boolean
  razon_prohibicion: string
  criterios: {
    organizacion: number
    profundidad: number
    ejemplos: number
    cobertura: number
    legibilidad: number
  }
  banda_precio: 'rechazado' | '1-estrella' | '2-estrellas' | '3-estrellas' | '4-estrellas' | 'precio-libre'
  precio_min: number
  precio_max: number   // 0 = sin tope máximo (precio libre)
  precio_sugerido: number
  resumen_ia: string
  feedback_vendedor: string
  temas_cubiertos: string[]
  apto_pack_examen: boolean
}

function calcularBanda(score: number, prohibido: boolean): Pick<ResultadoAnalisis, 'banda_precio' | 'estrellas' | 'precio_min' | 'precio_max' | 'precio_sugerido'> {
  if (prohibido || score < 45) return { banda_precio: 'rechazado',    estrellas: 0, precio_min: 0,  precio_max: 0,  precio_sugerido: 0  }
  if (score < 58)              return { banda_precio: '1-estrella',   estrellas: 1, precio_min: 0,  precio_max: 5,  precio_sugerido: 2  }
  if (score < 70)              return { banda_precio: '2-estrellas',  estrellas: 2, precio_min: 2,  precio_max: 12, precio_sugerido: 6  }
  if (score < 80)              return { banda_precio: '3-estrellas',  estrellas: 3, precio_min: 5,  precio_max: 20, precio_sugerido: 10 }
  if (score < 90)              return { banda_precio: '4-estrellas',  estrellas: 4, precio_min: 10, precio_max: 35, precio_sugerido: 18 }
  return                              { banda_precio: 'precio-libre', estrellas: 5, precio_min: 15, precio_max: 0,  precio_sugerido: 28 }
}

const PROMPT_EVALUACION = `Eres un moderador y evaluador académico de la plataforma ApuntesUA (Universidad Autónoma del Perú). Tu trabajo es revisar documentos académicos antes de publicarlos. Devuelve ÚNICAMENTE un objeto JSON válido, sin texto adicional, sin markdown, sin bloques de código.

════════════════════════════════════════
PASO 1 — DETECCIÓN DE CONTENIDO PROHIBIDO
════════════════════════════════════════
Los siguientes tipos de documentos están PROHIBIDOS en esta plataforma y deben ser rechazados de inmediato:

🚫 EXÁMENES: Exámenes parciales, exámenes finales, quizzes oficiales o cualquier evaluación calificada de un curso. Señales: preguntas numeradas de examen, instrucciones de "no voltear la hoja", nombre del docente + fecha de examen, preguntas del tipo "Resuelva los siguientes problemas (4 pts c/u)".

🚫 TESIS DE GRADO: Tesis de bachillerato, maestría o doctorado. Señales: carátula con "Tesis para optar el grado de...", asesor de tesis, comité evaluador, declaración jurada del tesista, acta de sustentación.

🚫 METODOLOGÍA DE INVESTIGACIÓN PURA: Documentos cuyo contenido PRINCIPAL es solo el diseño metodológico de una investigación (tipo de investigación, población, muestra, instrumentos) sin ser parte de apuntes de un curso de metodología.

Si el documento ES de alguno de estos tipos prohibidos:
→ contenido_prohibido: true
→ razon_prohibicion: explicar en 1-2 oraciones qué tipo de documento prohibido es y por qué no puede publicarse
→ score_total: 0, estrellas: 0, banda_precio: "rechazado"
→ Sé muy explícito en razon_prohibicion sobre qué tipo de contenido prohibido es
→ No evalúes el resto de criterios, llena los demás campos con valores neutros.

════════════════════════════════════════
PASO 2 — CLASIFICACIÓN DEL TIPO (si no está prohibido)
════════════════════════════════════════
Clasifica en uno de estos tipos permitidos:
- "apuntes_clase": notas de sesiones, apuntes de pizarra, resúmenes de clase
- "resumen_capitulo": resumen de uno o varios capítulos de libro o material del curso
- "practicas_resueltas": ejercicios o prácticas con desarrollo y solución paso a paso
- "guia_estudio": esquemas, mapas conceptuales, guías de repaso
- "monografia": trabajo académico estructurado sobre un tema con introducción, desarrollo y conclusiones
- "otro": material didáctico que no encaje en los anteriores

════════════════════════════════════════
PASO 3 — EVALUACIÓN Y CALIFICACIÓN CON ESTRELLAS (SE ESTRICTO)
════════════════════════════════════════
Evalúa la CALIDAD con estos 5 criterios. SÉ CRÍTICO Y EXIGENTE — la mayoría de apuntes son mediocres:

- organizacion (0-25): estructura lógica, uso de títulos/subtítulos, orden de ideas, índice si aplica
  · Solo bullet points sueltos sin jerarquía = máx 8 pts
  · Títulos pero sin desarrollo = máx 12 pts
  · Bien estructurado con secciones claras = hasta 20 pts
  · Sobresaliente con índice, subtítulos y flujo lógico = hasta 25 pts

- profundidad (0-25): desarrollo real de conceptos; penaliza fuerte copiar definiciones sin elaborar
  · Ciclos I-V: conceptos explicados con palabras propias + ejemplos → máx 16 pts
  · Ciclos VI-X: análisis técnico y relaciones entre conceptos → hasta 22 pts
  · Solo definiciones copiadas sin explicación propia = máx 8 pts
  · Texto escaso o superficial = máx 10 pts

- ejemplos (0-20): casos prácticos, ejercicios resueltos, aplicaciones reales
  · Sin ningún ejemplo = 0 pts
  · Menciona ejemplos pero no los desarrolla = máx 6 pts
  · Ejemplos desarrollados paso a paso = hasta 18 pts

- cobertura (0-20): amplitud temática real; cuántas semanas/unidades cubre CON CONTENIDO REAL
  · Solo cubre 1 tema superficialmente = máx 6 pts
  · Cubre 2-3 temas con algo de desarrollo = hasta 12 pts
  · Cubre ampliamente múltiples temas = hasta 20 pts

- legibilidad (0-10): claridad, ortografía, formato limpio, fácil de seguir
  · Texto confuso o con muchos errores = máx 4 pts

⚠️ PENALIZACIONES OBLIGATORIAS (aplica antes de asignar score):
  · Menos de 200 palabras reales: MÁXIMO 28 puntos total → rechazado
  · Entre 200-400 palabras sin desarrollo: MÁXIMO 42 puntos → máximo 1-estrella
  · Solo lista de títulos/bullets sin explicación: MÁXIMO 38 puntos → rechazado
  · Texto copiado literalmente sin elaboración del estudiante: MÁXIMO 38 puntos
  · Sin estructura visible (todo en párrafo sin orden): -10 puntos de penalización
  · Documento que no aporta valor real a otro estudiante: MÁXIMO 35 puntos

ANCLAS DE CALIBRACIÓN — a qué equivale cada puntaje:
  10-25 → Borrador casi vacío, notas sueltas inútiles para otros estudiantes. RECHAZADO.
  26-44 → Muy pobre: algunos títulos con poca información. No vale dinero.
  45-57 → Básico: tiene algo de contenido pero muy limitado. 1 estrella, máx S/. 5.
  58-69 → Aceptable: organizado y cubre lo mínimo. Un estudiante lo aprovecha medianamente.
  70-79 → Bueno: bien estructurado, con ejemplos, claramente útil para estudiar.
  80-89 → Muy bueno: completo, ordenado, podría complementar un libro de texto.
  90-100 → Excepcional: podría reemplazar ir a clase. Calidad de tutor o docente.

CONVERSIÓN DE SCORE A ESTRELLAS:
  score  0-44  → 0 estrellas → "rechazado"    (no publicable)
  score 45-57  → 1 estrella  → "1-estrella"   (muy básico, precio máx S/. 5)
  score 58-69  → 2 estrellas → "2-estrellas"  (básico con valor, precio S/. 2-12)
  score 70-79  → 3 estrellas → "3-estrellas"  (buen apunte, precio S/. 5-20)
  score 80-89  → 4 estrellas → "4-estrellas"  (alta calidad, precio S/. 10-35)
  score 90-100 → 5 estrellas → "precio-libre" (excelente, EL CREADOR PONE EL PRECIO QUE QUIERA, sugerido S/. 25+)

REFERENCIAS DE SCORE (calibradas con RIGOR):
· Apunte casi vacío / solo títulos: 10–30 → RECHAZADO
· Apuntes desorganizados de cualquier ciclo: 25–44 → RECHAZADO
· Contenido copiado/pegado sin elaboración: 28–44 → RECHAZADO
· Resumen de capítulo básico y fiel: 45–57 → 1 estrella
· Apuntes ciclos I-V apenas organizados: 48–60 → 1-2 estrellas
· Guía de estudio esquemática pero útil: 55–66 → 1-2 estrellas
· Apuntes ciclos I-V ordenados y con ejemplos: 58–68 → 2 estrellas
· Resumen de capítulo bien elaborado: 60–70 → 2-3 estrellas
· Prácticas resueltas con pasos claros: 65–80 → 2-3 estrellas
· Apuntes ciclos VI-X bien elaborados: 70–82 → 3-4 estrellas
· Monografía bien estructurada con fuentes: 72–85 → 3-4 estrellas
· Prácticas resueltas completas y detalladas: 75–88 → 3-4 estrellas
· Apunte excepcional que reemplaza asistir a clase: 90–100 → 5 estrellas (MUY RARO)

════════════════════════════════════════
PASO 4 — PRECIO SUGERIDO
════════════════════════════════════════
Para 5 estrellas (precio libre), sugiere un precio inicial justo en precio_sugerido basándote en la profundidad y utilidad real del documento. No hay máximo.
Para 4 estrellas o menos, precio_sugerido debe estar dentro del rango.

Devuelve EXACTAMENTE este JSON (sin texto extra):
{
  "score_total":        <número entero 0-100>,
  "estrellas":          <número entero 0-5>,
  "tipo_documento":     "<apuntes_clase|resumen_capitulo|practicas_resueltas|guia_estudio|monografia|otro>",
  "contenido_prohibido": <true|false>,
  "razon_prohibicion":  "<vacío si no está prohibido, o explicación si sí lo está>",
  "criterios": {
    "organizacion": <número entero 0-25>,
    "profundidad":  <número entero 0-25>,
    "ejemplos":     <número entero 0-20>,
    "cobertura":    <número entero 0-20>,
    "legibilidad":  <número entero 0-10>
  },
  "banda_precio":       "<rechazado|1-estrella|2-estrellas|3-estrellas|4-estrellas|precio-libre>",
  "precio_min":         <número>,
  "precio_max":         <número, 0 si es precio libre>,
  "precio_sugerido":    <número entero, precio justo sugerido>,
  "resumen_ia":         "<máximo 3 oraciones describiendo el apunte y su utilidad para otros estudiantes>",
  "feedback_vendedor":  "<consejo específico de qué mejorar para subir la calificación>",
  "temas_cubiertos":    ["<tema1>", "<tema2>", ...],
  "apto_pack_examen":   <true si estrellas == 5, false en caso contrario>
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

    const bandaCorrecta = calcularBanda(resultado.score_total, !!resultado.contenido_prohibido)
    resultado.banda_precio     = bandaCorrecta.banda_precio
    resultado.estrellas        = bandaCorrecta.estrellas
    resultado.precio_min       = bandaCorrecta.precio_min
    resultado.precio_max       = bandaCorrecta.precio_max
    resultado.precio_sugerido  = bandaCorrecta.precio_sugerido
    resultado.apto_pack_examen = resultado.estrellas === 5

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
