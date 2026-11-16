import { describe, expect, it } from 'vitest'
import {
  pedirError,
  pedirEstadosRequerimiento,
  pedirEventosRequerimiento,
  pedirImportacionesRequerimientos,
  pedirRequerimientos,
} from '@/mocks/pruebas'

const RUTA = '/api/requerimientos'

describe('GET /requerimientos/estados', () => {
  it('entrega el catálogo de estados en el orden definido', async () => {
    const { respuesta, cuerpo } = await pedirEstadosRequerimiento(`${RUTA}/estados`)

    expect(respuesta.status).toBe(200)
    expect(cuerpo.map((opcion) => opcion.value)).toEqual([
      'comprado',
      'en_bodega',
      'no_comprado',
      'entregado',
      'desestimado',
    ])
  })
})

describe('GET /requerimientos', () => {
  it('satisface el esquema de respuesta del cliente', async () => {
    const { respuesta, cuerpo } = await pedirRequerimientos(RUTA)

    expect(respuesta.status).toBe(200)
    expect(cuerpo).toHaveLength(12)
  })

  it('resuelve el solicitante, el estado y el mecanismo de compra con sus catálogos', async () => {
    const { cuerpo } = await pedirRequerimientos(RUTA)
    const requerimiento = cuerpo.find((fila) => fila.id === 10)

    expect(requerimiento?.solicitante).toEqual({
      id: 1,
      cr: 105,
      nombre: 'Campos Clinicos',
      sedes: [
        { value: 'osorno', label: 'Osorno' },
        { value: 'pto', label: 'Puerto Montt' },
      ],
      tipo: 'carrera',
    })
    expect(requerimiento?.estado).toEqual({ value: 'comprado', label: 'Comprado' })
    expect(requerimiento?.modalidad).toEqual({ value: 'agil', label: 'Compra Ágil' })
  })
})

describe('GET /requerimientos/:id/eventos', () => {
  it('entrega los eventos del más reciente al más antiguo', async () => {
    const { respuesta, cuerpo } = await pedirEventosRequerimiento(`${RUTA}/10/eventos`)

    expect(respuesta.status).toBe(200)
    expect(cuerpo.map((evento) => evento.tipo)).toEqual(['actualizacion', 'creacion'])
  })

  it('indica la importación, la fila y el archivo de origen de cada evento', async () => {
    const { cuerpo } = await pedirEventosRequerimiento(`${RUTA}/10/eventos`)

    expect(cuerpo.map((evento) => evento.origen)).toEqual([
      { importacionId: 3, fila: 11, nombreArchivo: 'planilla-con-identificadores.xlsx' },
      { importacionId: 1, fila: 11, nombreArchivo: 'Excel-Carrera_sin_nombre.xlsx' },
    ])
  })

  it('resuelve los estados de cada cambio con su etiqueta', async () => {
    const { cuerpo } = await pedirEventosRequerimiento(`${RUTA}/10/eventos`)
    const actualizacion = cuerpo.find((evento) => evento.tipo === 'actualizacion')

    expect(actualizacion?.cambios).toEqual([
      {
        campo: 'estado',
        anterior: { value: 'no_comprado', label: 'No comprado' },
        nuevo: { value: 'comprado', label: 'Comprado' },
      },
      { campo: 'ordenDeCompra', anterior: null, nuevo: 'G32' },
      { campo: 'fechaMaximaLlegada', anterior: null, nuevo: '2026-10-05' },
      {
        campo: 'carpeta',
        anterior: null,
        nuevo: 'https://drive.google.com/drive/folders/carpeta-g32',
      },
    ])
  })

  it('registra los valores iniciales sin valor anterior', async () => {
    const { cuerpo } = await pedirEventosRequerimiento(`${RUTA}/1/eventos`)
    const creacion = cuerpo.find((evento) => evento.tipo === 'creacion')

    expect(creacion?.cambios.map((cambio) => cambio.campo)).toEqual([
      'materiales',
      'cantidad',
      'estado',
      'modalidad',
      'ordenDeCompra',
    ])
    expect(creacion?.cambios.every((cambio) => cambio.anterior === null)).toBe(true)
  })

  it('responde 404 cuando el requerimiento no existe', async () => {
    const { respuesta, cuerpo } = await pedirError(`${RUTA}/999/eventos`)

    expect(respuesta.status).toBe(404)
    expect(cuerpo.error).toBe('El requerimiento no existe')
  })
})

describe('GET /requerimientos/importaciones', () => {
  it('entrega las importaciones de la más reciente a la más antigua', async () => {
    const { respuesta, cuerpo } = await pedirImportacionesRequerimientos(`${RUTA}/importaciones`)

    expect(respuesta.status).toBe(200)
    expect(cuerpo.map((importacion) => importacion.id)).toEqual([3, 2, 1])
  })

  it('incluye las cargas descartadas', async () => {
    const { cuerpo } = await pedirImportacionesRequerimientos(`${RUTA}/importaciones`)
    const descartada = cuerpo.find((importacion) => importacion.id === 2)

    expect(descartada?.estado).toEqual({ value: 'descartada', label: 'Descartada' })
    expect(descartada?.filasConErrores).toBe(1)
  })
})
