import { describe, expect, it } from 'vitest'
import type {
  CabeceraHistorial,
  EventoEntidad,
  EventoHistorial,
  HitoTransaccion,
} from '../../types/historial.types'
import {
  codigosSeleccionados,
  contarEventos,
  descripcionContenido,
  filtrarEventos,
  formatearFecha,
  formatearFechaEvento,
  gruposDeFiltro,
  idHitoActual,
  indiceEtapaActual,
  proporcionDeMonto,
  resumenDeFiltro,
} from './TransaccionHistorial.utils'

function evento(
  parcial: Partial<EventoEntidad> & Pick<EventoEntidad, 'id' | 'entidad'>,
): EventoEntidad {
  const base: EventoEntidad = {
    clase: 'evento',
    id: parcial.id,
    fecha: '2026-03-12T09:00:00-03:00',
    entidad: parcial.entidad,
    contexto: {},
    titulo: 'Título',
    monto: null,
    transicion: { anterior: null, posterior: 'Enviada', tono: 'registrado' },
    observacion: 'Observación',
    autor: 'Autor',
  }
  return { ...base, ...parcial }
}

function hito(id: string, estado: string): HitoTransaccion {
  return {
    clase: 'hito',
    id,
    fecha: '2026-03-12T09:00:00-03:00',
    estado,
    explicacion: 'Explicación',
  }
}

const SOL_A = { tipo: 'solicitud', id: 101, codigo: 'SOL-A' } as const
const SOL_B = { tipo: 'solicitud', id: 102, codigo: 'SOL-B' } as const
const OC_A = { tipo: 'ordenDeCompra', id: 201, codigo: 'OC-A' } as const
const FAC_A = { tipo: 'factura', id: 401, codigo: 'FAC-A' } as const

const LLAVE_SOL_A = 'solicitud-101'
const LLAVE_SOL_B = 'solicitud-102'
const LLAVE_OC_A = 'ordenDeCompra-201'

describe('gruposDeFiltro', () => {
  it('devuelve los grupos en el orden solicitud, orden y factura', () => {
    const grupos = gruposDeFiltro([
      evento({ id: '1', entidad: FAC_A }),
      evento({ id: '2', entidad: OC_A }),
      evento({ id: '3', entidad: SOL_A }),
    ])

    expect(grupos.map((grupo) => grupo.tipo)).toEqual(['solicitud', 'ordenDeCompra', 'factura'])
  })

  it('omite los grupos sin entidades', () => {
    const grupos = gruposDeFiltro([evento({ id: '1', entidad: SOL_A })])

    expect(grupos).toHaveLength(1)
    expect(grupos[0].etiqueta).toBe('Solicitudes')
  })

  it('no repite una entidad que aparece en varios eventos', () => {
    const grupos = gruposDeFiltro([
      evento({ id: '1', entidad: SOL_A }),
      evento({ id: '2', entidad: SOL_A }),
      evento({ id: '3', entidad: SOL_B }),
    ])

    expect(grupos[0].entidades.map((entidad) => entidad.llave)).toEqual([LLAVE_SOL_A, LLAVE_SOL_B])
  })

  it('distingue entidades de distinto tipo con el mismo identificador', () => {
    const grupos = gruposDeFiltro([
      evento({ id: '1', entidad: { tipo: 'solicitud', id: 7, codigo: 'SOL-7' } }),
      evento({ id: '2', entidad: { tipo: 'ordenDeCompra', id: 7, codigo: 'OC-7' } }),
    ])

    expect(grupos).toHaveLength(2)
    expect(grupos[0].entidades[0].llave).not.toBe(grupos[1].entidades[0].llave)
  })

  it('toma el descriptor de la primera aparición de la entidad', () => {
    const grupos = gruposDeFiltro([
      evento({
        id: '1',
        entidad: SOL_A,
        contexto: { unidad: { nombre: 'Dirección de Arquitectura' } },
      }),
      evento({
        id: '2',
        entidad: SOL_A,
        contexto: { unidad: { nombre: 'Departamento de Adquisiciones' } },
      }),
    ])

    expect(grupos[0].entidades[0].descriptor).toBe('Dirección de Arquitectura')
  })

  it('usa el proveedor como descriptor de una orden de compra', () => {
    const grupos = gruposDeFiltro([
      evento({ id: '1', entidad: OC_A, contexto: { proveedor: 'Comercial Andes SpA' } }),
    ])

    expect(grupos[0].entidades[0].descriptor).toBe('Comercial Andes SpA')
  })

  it('deja sin descriptor a las facturas y a las solicitudes sin unidad', () => {
    const grupos = gruposDeFiltro([
      evento({ id: '1', entidad: SOL_A }),
      evento({ id: '2', entidad: FAC_A, contexto: { proveedor: 'Comercial Andes SpA' } }),
    ])

    expect(grupos[0].entidades[0].descriptor).toBeNull()
    expect(grupos[1].entidades[0].descriptor).toBeNull()
  })

  it('ignora los hitos', () => {
    expect(gruposDeFiltro([hito('h1', 'Ingresada')])).toEqual([])
  })

  it('devuelve vacío sin eventos', () => {
    expect(gruposDeFiltro([])).toEqual([])
  })
})

describe('filtrarEventos', () => {
  const eventos: EventoHistorial[] = [
    evento({ id: '1', entidad: SOL_A }),
    hito('h1', 'Ingresada'),
    evento({ id: '2', entidad: SOL_B }),
  ]

  it('devuelve todo cuando no hay selección', () => {
    expect(filtrarEventos(eventos, new Set())).toHaveLength(3)
  })

  it('conserva los hitos junto a los eventos seleccionados', () => {
    const visibles = filtrarEventos(eventos, new Set([LLAVE_SOL_A]))

    expect(visibles.map((elemento) => elemento.id)).toEqual(['1', 'h1'])
  })

  it('conserva solo los hitos si la llave seleccionada no tiene eventos', () => {
    const visibles = filtrarEventos(eventos, new Set(['solicitud-999']))

    expect(visibles.map((elemento) => elemento.id)).toEqual(['h1'])
  })

  it('acumula varias llaves seleccionadas', () => {
    const visibles = filtrarEventos(eventos, new Set([LLAVE_SOL_A, LLAVE_SOL_B]))

    expect(visibles).toHaveLength(3)
  })
})

describe('contarEventos', () => {
  it('cuenta solo los eventos de entidad', () => {
    expect(contarEventos([evento({ id: '1', entidad: SOL_A }), hito('h1', 'Ingresada')])).toBe(1)
  })

  it('devuelve cero sin elementos', () => {
    expect(contarEventos([])).toBe(0)
  })
})

describe('idHitoActual', () => {
  it('devuelve el último hito aunque después haya eventos', () => {
    const resultado = idHitoActual([
      hito('h1', 'Ingresada'),
      hito('h2', 'Cotizada'),
      evento({ id: '1', entidad: SOL_A }),
    ])

    expect(resultado).toBe('h2')
  })

  it('devuelve null si no hay hitos', () => {
    expect(idHitoActual([evento({ id: '1', entidad: SOL_A })])).toBeNull()
  })
})

describe('codigosSeleccionados', () => {
  const grupos = gruposDeFiltro([
    evento({ id: '1', entidad: SOL_A }),
    evento({ id: '2', entidad: OC_A }),
  ])

  it('devuelve los códigos en el orden de los grupos', () => {
    expect(codigosSeleccionados(grupos, new Set([LLAVE_OC_A, LLAVE_SOL_A]))).toEqual([
      'SOL-A',
      'OC-A',
    ])
  })

  it('ignora las llaves que no corresponden a ninguna entidad', () => {
    expect(codigosSeleccionados(grupos, new Set(['solicitud-999']))).toEqual([])
  })
})

describe('resumenDeFiltro', () => {
  it('anuncia el total cuando no hay selección', () => {
    expect(resumenDeFiltro(17, 17, [])).toBe('Mostrando los 17 eventos de la transacción.')
  })

  it('usa el singular cuando el total es uno', () => {
    expect(resumenDeFiltro(1, 1, [])).toBe('Mostrando el único evento de la transacción.')
  })

  it('nombra las entidades seleccionadas', () => {
    expect(resumenDeFiltro(17, 4, ['SOL-A', 'OC-A'])).toBe(
      'Mostrando 4 eventos de SOL-A, OC-A, más los avances de la transacción como referencia.',
    )
  })

  it('usa el singular cuando la selección deja un solo evento', () => {
    expect(resumenDeFiltro(17, 1, ['SOL-A'])).toBe(
      'Mostrando 1 evento de SOL-A, más los avances de la transacción como referencia.',
    )
  })
})

describe('descripcionContenido', () => {
  const cabecera: CabeceraHistorial = {
    codigo: '#1',
    nombre: 'Compra de prueba',
    linkCarpetaAntecedentes: null,
    modalidad: 'Compra ágil',
    totalSolicitudes: 4,
    totalOrdenes: 2,
    totalFacturas: 1,
    fechaApertura: '2026-03-12T09:00:00-03:00',
    analistas: { principal: { nombre: 'Camila Ferrada' }, apoyo: [] },
  }

  it('pluraliza cada conteo por separado', () => {
    expect(descripcionContenido(cabecera)).toBe('4 solicitudes, 2 órdenes, 1 factura')
  })

  it('usa el singular en los tres cuando corresponde', () => {
    expect(
      descripcionContenido({
        ...cabecera,
        totalSolicitudes: 1,
        totalOrdenes: 1,
        totalFacturas: 1,
      }),
    ).toBe('1 solicitud, 1 orden, 1 factura')
  })

  it('usa el plural para el cero', () => {
    expect(descripcionContenido({ ...cabecera, totalOrdenes: 0, totalFacturas: 0 })).toBe(
      '4 solicitudes, 0 órdenes, 0 facturas',
    )
  })
})

describe('proporcionDeMonto', () => {
  it('calcula el porcentaje respecto de la base', () => {
    expect(proporcionDeMonto(4150000, 4215000).ancho).toBeCloseTo(98.46, 2)
  })

  it('no marca exceso cuando el valor iguala la base', () => {
    expect(proporcionDeMonto(100, 100)).toEqual({ ancho: 100, excede: false })
  })

  it('recorta el ancho y marca exceso cuando el valor supera la base', () => {
    expect(proporcionDeMonto(150, 100)).toEqual({ ancho: 100, excede: true })
  })

  it('marca exceso cuando hay valor sin base', () => {
    expect(proporcionDeMonto(500, 0)).toEqual({ ancho: 100, excede: true })
  })

  it('devuelve cero cuando no hay valor ni base', () => {
    expect(proporcionDeMonto(0, 0)).toEqual({ ancho: 0, excede: false })
  })

  it('no produce anchos negativos', () => {
    expect(proporcionDeMonto(-50, 100).ancho).toBe(0)
  })
})

describe('indiceEtapaActual', () => {
  const etapas = ['Ingresada', 'Cotizada', 'Cerrada']

  it('devuelve la posición de la etapa actual', () => {
    expect(indiceEtapaActual({ etapas, actual: 'Cotizada' })).toBe(1)
  })

  it('devuelve -1 cuando el estado actual no es una etapa del avance', () => {
    expect(indiceEtapaActual({ etapas, actual: 'Rechazada' })).toBe(-1)
  })
})

describe('formateo de fechas', () => {
  it('incluye la hora en el formato largo', () => {
    const resultado = formatearFechaEvento('2026-03-12T09:14:00-03:00')

    expect(resultado).toContain('12')
    expect(resultado).toContain('marzo')
    expect(resultado).toContain('2026')
    expect(resultado).toContain('09:14')
  })

  it('omite la hora en el formato corto', () => {
    const resultado = formatearFecha('2026-03-12T09:14:00-03:00')

    expect(resultado).toContain('marzo')
    expect(resultado).not.toContain('09:14')
  })

  it('formatea el mismo instante igual venga con offset o en utc', () => {
    expect(formatearFechaEvento('2026-03-12T00:30:00-03:00')).toBe(
      formatearFechaEvento('2026-03-12T03:30:00Z'),
    )
  })

  it('usa la hora de Chile continental y no la del entorno', () => {
    const resultado = formatearFechaEvento('2026-03-13T02:00:00Z')

    expect(resultado).toContain('12')
    expect(resultado).toContain('23:00')
  })
})
