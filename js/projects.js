/* ============================================
   projects.js — Álvaro Orozco
   
   PARA AGREGAR UN PROYECTO NUEVO:
   1. Copia el objeto template de abajo
   2. Rellena los campos
   3. git commit + git push
   ============================================ */

const PROYECTOS = [

  // ── DEMO EN VIVO ──────────────────────────
  {
    id:      'calculadora-perjuicios',
    emoji:   '⚖️',
    titulo:  'Calculadora de perjuicios',
    resumen: 'Estimación de daños · Ley 1564/2012 · demo en vivo',
    desc:    'Herramienta de estimación orientativa de daños y perjuicios fundamentada en la Ley 1564 de 2012 (Código General del Proceso) y la metodología del Consejo de Estado, Exp. 26251 de 2014. Calcula daño emergente, lucro cesante consolidado y futuro con indexación, y daño moral en SMMLV según los topes jurisprudenciales vigentes.',
    tags:    ['legal', 'js'],
    tipo:    'demo',
    stack:   ['JavaScript', 'HTML/CSS'],
    features: [
      'Daño emergente: gastos médicos y otros acreditados',
      'Lucro cesante consolidado con indexación anual (8%)',
      'Lucro cesante futuro con valor presente (tasa 6%)',
      'Daño moral hasta 100 SMMLV · C.E. Exp. 26251',
      'SMMLV 2026: $1,750,905 hardcodeado',
    ],
    github:       'https://github.com/alvaroaoz',
    razonInterna: null,
  },

  {
    id:      'verificador-prescripcion',
    emoji:   '⏳',
    titulo:  'Verificador de prescripción SIMIT',
    resumen: 'Multas de tránsito · Ley 769/2002 · demo en vivo',
    desc:    'Herramienta orientativa que estima si la acción de cobro de una multa de tránsito pudo haber prescrito. Toma como base la regla general de tres (3) años desde la ejecutoria (art. 159 de la Ley 769 de 2002) y permite registrar una actuación de cobro posterior que interrumpe el término. No reemplaza el estudio jurídico del caso.',
    tags:    ['legal', 'js'],
    tipo:    'demo',
    stack:   ['JavaScript', 'HTML/CSS'],
    features: [
      'Término base de 3 años · art. 159 Ley 769/2002',
      'Considera actuación de cobro que interrumpe',
      'Muestra tiempo transcurrido y fecha estimada de prescripción',
      'Veredicto orientativo: posiblemente prescrita / vigente',
    ],
    github:       'https://github.com/alvaroaoz',
    razonInterna: null,
  },

  // ── PÚBLICOS ──────────────────────────────
  {
    id:      'generador-recibos',
    emoji:   '🧾',
    titulo:  'Generador de recibos PDF',
    resumen: 'App de escritorio Python · tkinter + ReportLab',
    desc:    'Aplicación de escritorio desarrollada en Python para la generación de recibos de pago en formato PDF. Permite registrar pagos de honorarios con folio auto-incremental, nombre del cliente, concepto, monto en números y en letras, fecha y firma. Genera un PDF compacto de una sola página listo para imprimir o enviar digitalmente.',
    tags:    ['python', 'legal'],
    tipo:    'publico',
    stack:   ['Python 3', 'tkinter', 'ReportLab', 'num2words'],
    features: [
      'Folio auto-incremental persistente entre sesiones',
      'Monto en letras automático en español',
      'Layout compacto — una página A5',
      'Ejecutable sin instalación adicional',
    ],
    github:       'https://github.com/alvaroaoz',
    razonInterna: null,
  },

  {
    id:      'estudio-horas-predictor',
    emoji:   '🤖',
    titulo:  'Estudio horas predictor',
    resumen: 'Clasificador Random Forest · scikit-learn · accuracy ~84%',
    desc:    'Modelo de clasificación que predice el rango de horas de estudio necesarias para aprobar exámenes de preparatorio en derecho, a partir de variables como semestre cursado, carga académica, hábitos de estudio y rendimiento previo. Desarrollado como proyecto final de curso de IA con dataset sintético de 5.000 registros.',
    tags:    ['ml', 'python'],
    tipo:    'publico',
    stack:   ['Python 3', 'scikit-learn', 'pandas', 'Jupyter', 'matplotlib'],
    features: [
      'Dataset sintético: 5.000 registros generados',
      'Accuracy: ~84% en test set',
      'Algoritmo: Random Forest (100 árboles)',
      'Constraint de diseño: 10% estudiantes con pensum completo',
    ],
    github:       'https://github.com/alvaroaoz',
    razonInterna: null,
  },

  {
    id:      'cleanup-descargas',
    emoji:   '🧹',
    titulo:  'Cleanup descargas',
    resumen: 'Script Python + bash · organización automática de archivos',
    desc:    'Script que organiza automáticamente la carpeta ~/Descargas clasificando archivos por tipo (documentos, imágenes, PDFs, hojas de cálculo, código) y subcarpeta por fecha de descarga. Puede ejecutarse manualmente o programarse como tarea cron para limpieza periódica automática.',
    tags:    ['python'],
    tipo:    'publico',
    stack:   ['Python 3', 'pathlib', 'bash', 'cron'],
    features: [
      'Clasificación por extensión y tipo MIME',
      'Subcarpetas por año/mes automáticas',
      'Log de archivos movidos',
      'Compatible Linux / macOS',
    ],
    github:       'https://github.com/alvaroaoz',
    razonInterna: null,
  },

  // ── INTERNOS ──────────────────────────────
  {
    id:      'workflow-cliente-intake',
    emoji:   '⚡',
    titulo:  'Workflow cliente intake',
    resumen: 'Automatización n8n de onboarding · uso interno',
    desc:    'Flujo de automatización construido en n8n que gestiona el proceso completo de ingreso de un nuevo cliente a la práctica jurídica. Elimina el trabajo manual repetitivo del onboarding y garantiza que ningún paso del proceso quede pendiente.',
    tags:    ['n8n'],
    tipo:    'interno',
    stack:   ['n8n', 'Webhooks', 'SMTP', 'Notion API'],
    features: [
      'Formulario de intake → validación de datos',
      'Registro automático en base de datos del cliente',
      'Correo de bienvenida con instrucciones personalizadas',
      'Recordatorio automático de firma de contrato de mandato',
      'Alerta interna si el contrato no es firmado en 48h',
    ],
    github:       null,
    razonInterna: 'El flujo expone la estructura operativa completa de la práctica. Se comparte en consultoría bajo NDA.',
  },

  {
    id:      'simit-prescription-checker',
    emoji:   '📋',
    titulo:  'SIMIT prescription checker',
    resumen: 'Verificador de prescripción de multas · uso interno',
    desc:    'Herramienta que consulta las fechas de comparendos registrados en SIMIT por placa vehicular y determina automáticamente si cada multa ha superado el término de prescripción establecido en el artículo 159 de la Ley 769 de 2002. Genera un reporte PDF por placa con el estado de cada infracción.',
    tags:    ['python', 'legal'],
    tipo:    'interno',
    stack:   ['Python 3', 'requests', 'BeautifulSoup', 'ReportLab'],
    features: [
      'Consulta comparendos por placa en SIMIT',
      'Calcula término de prescripción por infracción',
      'Clasifica: prescrita / en cobro coactivo / vigente',
      'Genera PDF con diagnóstico por multa',
      'Identifica base jurídica aplicable por caso',
    ],
    github:       null,
    razonInterna: 'Contiene lógica jurídica propietaria y criterios de análisis que forman parte de la ventaja competitiva del despacho.',
  },

];

/* ── TEMPLATE PARA PROYECTO NUEVO ────────────
{
  id:      'nombre-unico-con-guiones',
  emoji:   '🚀',
  titulo:  'Nombre del proyecto',
  resumen: 'Una línea descriptiva para el trigger cerrado',
  desc:    'Descripción completa que aparece al expandir la card.',
  tags:    ['python'],        // opciones: python | n8n | excel | ml | legal | js
  tipo:    'publico',         // opciones: demo | publico | interno
  stack:   ['Python 3', 'pandas'],
  features: [
    'Qué hace en concreto',
    'Otra característica',
  ],
  github:       'https://github.com/alvaroaoz/nombre-repo',  // null si interno
  razonInterna: null,   // string explicando por qué es interno, null si público
},
─────────────────────────────────────────── */
