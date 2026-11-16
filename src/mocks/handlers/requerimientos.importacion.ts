import { z } from 'zod'
import type {
  FilaPlanillaRequest,
  ValorCelda,
} from '@/features/requerimientos/schemas/importacionRequest.schema'
import type { ResultadoFila } from '@/features/requerimientos/types/importacion.types'
import type { EstadoRequerimiento } from '@/features/requerimientos/types/requerimiento.types'
import { modalidadOptions } from '@/mocks/data/listas.mock'
import {
  estadosRequerimientoMock,
  type CambioAlmacenado,
  type FilaRevisionAlmacenada,
  type RequerimientoAlmacenado,
  type ValoresRequerimiento,
} from '@/mocks/data/requerimientos.mock'

interface OpcionCatalogo<T extends string> {
  value: T
  label: string
}

interface ContextoInterpretacion {
  existentes: ReadonlyMap<string, RequerimientoAlmacenado>
  interpretaciones: Map<string, string>
  itemsConOtrosMateriales: string[]
}

export interface ResultadoInterpretacion {
  filas: FilaRevisionAlmacenada[]
  eliminaciones: RequerimientoAlmacenado[]
  avisos: string[]
}

const ALIAS_ESTADO = new Map<string, EstadoRequerimiento>([['entregado a carrera', 'entregado']])

const ALIAS_MODALIDAD = new Map<string, string>([
  ['ag', 'agil'],
  ['td', 'directo'],
  ['cm', 'conveniomarco'],
])

const PATRON_FECHA_CIVIL = /^(\d{4})-(\d{2})-(\d{2})$/
const MAXIMO_ITEMS_LISTADOS = 10
const enlaceCarpetaSchema = z.httpUrl()

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function aTexto(valor: ValorCelda): string | null {
  if (valor === null) {
    return null
  }

  const texto = String(valor).trim()
  return texto === '' ? null : texto
}

function esFechaCivil(texto: string): boolean {
  const partes = PATRON_FECHA_CIVIL.exec(texto)

  if (partes === null) {
    return false
  }

  const anio = Number(partes[1])
  const mes = Number(partes[2])
  const dia = Number(partes[3])
  const fecha = new Date(anio, mes - 1, dia)

  return fecha.getFullYear() === anio && fecha.getMonth() === mes - 1 && fecha.getDate() === dia
}

function resolverOpcion<T extends string>(
  texto: string,
  opciones: readonly OpcionCatalogo<T>[],
  alias: ReadonlyMap<string, T>,
): { opcion: OpcionCatalogo<T>; porAlias: boolean } | null {
  const clave = normalizar(texto)
  const directa = opciones.find(
    (opcion) => normalizar(opcion.label) === clave || normalizar(opcion.value) === clave,
  )

  if (directa !== undefined) {
    return { opcion: directa, porAlias: false }
  }

  const valor = alias.get(clave)
  const opcion = valor === undefined ? undefined : opciones.find((item) => item.value === valor)

  return opcion === undefined ? null : { opcion, porAlias: true }
}

function leerOpcion<T extends string>(
  valor: ValorCelda,
  etiqueta: string,
  opciones: readonly OpcionCatalogo<T>[],
  alias: ReadonlyMap<string, T>,
  obligatorio: boolean,
  errores: string[],
  contexto: ContextoInterpretacion,
): T | null {
  const texto = aTexto(valor)

  if (texto === null) {
    if (obligatorio) {
      errores.push(`«${etiqueta}» es obligatorio.`)
    }
    return null
  }

  const resultado = resolverOpcion(texto, opciones, alias)

  if (resultado === null) {
    errores.push(`«${etiqueta}»: el valor «${texto}» no es válido.`)
    return null
  }

  if (resultado.porAlias) {
    contexto.interpretaciones.set(
      `${etiqueta}|${texto}`,
      `El valor «${texto}» de «${etiqueta}» se interpretó como «${resultado.opcion.label}».`,
    )
  }

  return resultado.opcion.value
}

function leerCantidad(valor: ValorCelda, errores: string[]): number | null {
  if (aTexto(valor) === null) {
    errores.push('«Cantidad» es obligatoria.')
    return null
  }

  if (typeof valor !== 'number') {
    errores.push(`«Cantidad»: el valor «${aTexto(valor)}» no es un número.`)
    return null
  }

  if (valor <= 0) {
    errores.push('«Cantidad» debe ser mayor que cero.')
    return null
  }

  return valor
}

function leerFecha(valor: ValorCelda, etiqueta: string, errores: string[]): string | null {
  const texto = aTexto(valor)

  if (texto === null) {
    return null
  }

  if (typeof valor !== 'string' || !esFechaCivil(texto)) {
    errores.push(`«${etiqueta}»: el valor «${texto}» no es una fecha válida.`)
    return null
  }

  return texto
}

function leerCarpeta(valor: ValorCelda, errores: string[]): string | null {
  const texto = aTexto(valor)

  if (texto === null) {
    return null
  }

  if (!enlaceCarpetaSchema.safeParse(texto).success) {
    errores.push('«Carpeta» debe ser un enlace que comience con http:// o https://.')
    return null
  }

  return texto
}

function calcularCambios(
  anterior: ValoresRequerimiento | null,
  nuevo: ValoresRequerimiento,
): CambioAlmacenado[] {
  const candidatos: CambioAlmacenado[] = [
    { campo: 'materiales', anterior: anterior?.materiales ?? null, nuevo: nuevo.materiales },
    { campo: 'descripcion', anterior: anterior?.descripcion ?? null, nuevo: nuevo.descripcion },
    { campo: 'cantidad', anterior: anterior?.cantidad ?? null, nuevo: nuevo.cantidad },
    { campo: 'estado', anterior: anterior?.estado ?? null, nuevo: nuevo.estado },
    { campo: 'modalidad', anterior: anterior?.modalidad ?? null, nuevo: nuevo.modalidad },
    {
      campo: 'ordenDeCompra',
      anterior: anterior?.ordenDeCompra ?? null,
      nuevo: nuevo.ordenDeCompra,
    },
    {
      campo: 'fechaMaximaLlegada',
      anterior: anterior?.fechaMaximaLlegada ?? null,
      nuevo: nuevo.fechaMaximaLlegada,
    },
    {
      campo: 'fechaLlegada',
      anterior: anterior?.fechaLlegada ?? null,
      nuevo: nuevo.fechaLlegada,
    },
    {
      campo: 'observaciones',
      anterior: anterior?.observaciones ?? null,
      nuevo: nuevo.observaciones,
    },
    { campo: 'carpeta', anterior: anterior?.carpeta ?? null, nuevo: nuevo.carpeta },
  ]

  return candidatos.filter((cambio) => cambio.anterior !== cambio.nuevo)
}

function interpretarFila(
  fila: FilaPlanillaRequest,
  contexto: ContextoInterpretacion,
): FilaRevisionAlmacenada {
  const errores: string[] = []
  const existente = contexto.existentes.get(fila.identificador) ?? null
  const materiales = aTexto(fila.materiales)

  if (materiales === null) {
    errores.push('«Materiales» es obligatorio.')
  }

  const cantidad = leerCantidad(fila.cantidad, errores)
  const estado = leerOpcion(
    fila.estado,
    'Estado',
    estadosRequerimientoMock,
    ALIAS_ESTADO,
    true,
    errores,
    contexto,
  )
  const modalidad = leerOpcion(
    fila.modalidad,
    'Mecanismo de compra',
    modalidadOptions,
    ALIAS_MODALIDAD,
    false,
    errores,
    contexto,
  )
  const fechaMaximaLlegada = leerFecha(fila.fechaMaximaLlegada, 'Fecha máxima de llegada', errores)
  const fechaLlegada = leerFecha(fila.fechaLlegada, 'Fecha de llegada', errores)
  const carpeta = leerCarpeta(fila.carpeta, errores)

  if (errores.length > 0 || materiales === null || cantidad === null || estado === null) {
    return {
      fila: fila.fila,
      identificador: fila.identificador,
      requerimientoId: existente?.id ?? null,
      materiales,
      resultado: 'error',
      errores,
      cambios: [],
      valores: null,
    }
  }

  const valores: ValoresRequerimiento = {
    identificador: fila.identificador,
    materiales,
    descripcion: aTexto(fila.descripcion),
    cantidad,
    estado,
    modalidad,
    ordenDeCompra: aTexto(fila.ordenDeCompra),
    fechaMaximaLlegada,
    fechaLlegada,
    observaciones: aTexto(fila.observaciones),
    carpeta,
  }

  const cambios = calcularCambios(existente, valores)

  if (existente === null) {
    return {
      fila: fila.fila,
      identificador: fila.identificador,
      requerimientoId: null,
      materiales,
      resultado: 'nueva',
      errores,
      cambios,
      valores,
    }
  }

  if (cambios.some((cambio) => cambio.campo === 'materiales')) {
    contexto.itemsConOtrosMateriales.push(fila.identificador)
  }

  return {
    fila: fila.fila,
    identificador: fila.identificador,
    requerimientoId: existente.id,
    materiales,
    resultado: resultadoExistente(existente, cambios),
    errores,
    cambios,
    valores,
  }
}

function resultadoExistente(
  existente: RequerimientoAlmacenado,
  cambios: readonly CambioAlmacenado[],
): ResultadoFila {
  if (existente.eliminado) {
    return 'restaurada'
  }

  return cambios.length > 0 ? 'con_cambios' : 'sin_cambios'
}

function enumerarItems(items: readonly string[]): string {
  const citados = items.map((item) => `«${item}»`)

  if (citados.length > MAXIMO_ITEMS_LISTADOS) {
    const restantes = citados.length - MAXIMO_ITEMS_LISTADOS
    return `${citados.slice(0, MAXIMO_ITEMS_LISTADOS).join(', ')} y ${restantes} más`
  }

  if (citados.length === 1) {
    return citados[0]
  }

  return `${citados.slice(0, -1).join(', ')} y ${citados[citados.length - 1]}`
}

function avisosDeRenumeracion(items: readonly string[]): string[] {
  if (items.length === 0) {
    return []
  }

  const sujeto =
    items.length === 1
      ? `El ítem ${enumerarItems(items)} cambió`
      : `Los ítems ${enumerarItems(items)} cambiaron`

  return [
    `${sujeto} de «Materiales». Verifique que la columna «# Item» no se haya renumerado: si un ítem pasa a identificar otro material, se modificará un requerimiento que no corresponde.`,
  ]
}

function avisosDeCorrespondencia(
  filas: readonly FilaPlanillaRequest[],
  vigentes: readonly RequerimientoAlmacenado[],
  nombreSolicitante: string,
): string[] {
  if (vigentes.length === 0) {
    return []
  }

  const vigentesPorItem = new Map(
    vigentes.map((requerimiento) => [requerimiento.identificador, requerimiento]),
  )
  const algunaCoincide = filas.some((fila) => {
    const vigente = vigentesPorItem.get(fila.identificador)
    const materiales = aTexto(fila.materiales)

    return (
      vigente !== undefined &&
      materiales !== null &&
      normalizar(materiales) === normalizar(vigente.materiales)
    )
  })

  if (algunaCoincide) {
    return []
  }

  return [
    `Ninguna fila del archivo coincide en «# Item» y «Materiales» con los requerimientos vigentes de ${nombreSolicitante}. Verifique que eligió el solicitante correcto antes de confirmar.`,
  ]
}

export function interpretarFilas(
  filas: readonly FilaPlanillaRequest[],
  existentes: readonly RequerimientoAlmacenado[],
  nombreSolicitante: string,
): ResultadoInterpretacion {
  const contexto: ContextoInterpretacion = {
    existentes: new Map(
      existentes.map((requerimiento) => [requerimiento.identificador, requerimiento]),
    ),
    interpretaciones: new Map<string, string>(),
    itemsConOtrosMateriales: [],
  }

  const filasInterpretadas = filas.map((fila) => interpretarFila(fila, contexto))
  const itemsDelArchivo = new Set(filas.map((fila) => fila.identificador))
  const vigentes = existentes.filter((requerimiento) => !requerimiento.eliminado)

  return {
    filas: filasInterpretadas,
    eliminaciones: vigentes.filter(
      (requerimiento) => !itemsDelArchivo.has(requerimiento.identificador),
    ),
    avisos: [
      ...avisosDeCorrespondencia(filas, vigentes, nombreSolicitante),
      ...contexto.interpretaciones.values(),
      ...avisosDeRenumeracion(contexto.itemsConOtrosMateriales),
    ],
  }
}
