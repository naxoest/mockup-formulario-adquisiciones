// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { nuevaImportacionRequestSchema } from '@/features/requerimientos/schemas/importacionRequest.schema'
import type { Requerimiento } from '@/features/requerimientos/types/requerimiento.types'
import { generarPlanilla } from '@/features/requerimientos/utils/planilla'
import { prepararImportacion } from '@/features/requerimientos/utils/prepararImportacion'

const requerimiento: Requerimiento = {
  id: 7,
  identificador: '15',
  solicitante: {
    id: 2,
    cr: 101,
    nombre: 'Arquitectura',
    sedes: [{ value: 'osorno', label: 'Osorno' }],
    tipo: 'carrera',
  },
  materiales: 'Guantes de nitrilo',
  descripcion: null,
  cantidad: 30,
  estado: { value: 'comprado', label: 'Comprado' },
  modalidad: null,
  ordenDeCompra: null,
  fechaMaximaLlegada: '2026-10-05',
  fechaLlegada: null,
  observaciones: null,
  carpeta: null,
  actualizadoEn: '2026-09-29T21:05:47',
  eliminado: false,
}

describe('prepararImportacion', () => {
  it('construye una solicitud de importación válida a partir del archivo', async () => {
    const contenido = generarPlanilla([requerimiento])
    const archivo = new File([contenido], 'planilla.xlsx')

    const resultado = await prepararImportacion(archivo, 2)

    expect(resultado).toMatchObject({
      valida: true,
      avisos: [],
      solicitud: {
        solicitanteId: 2,
        archivo: { nombre: 'planilla.xlsx', tamano: contenido.byteLength },
        filas: [
          {
            fila: 2,
            identificador: '15',
            materiales: 'Guantes de nitrilo',
            fechaMaximaLlegada: '2026-10-05',
          },
        ],
      },
    })
    expect(
      resultado.valida && nuevaImportacionRequestSchema.safeParse(resultado.solicitud).success,
    ).toBe(true)
  })

  it('devuelve el error de lectura sin calcular la solicitud', async () => {
    const archivo = new File(['materiales;cantidad'], 'planilla.xlsx')

    await expect(prepararImportacion(archivo, 2)).resolves.toEqual({
      valida: false,
      error: 'El archivo no es un libro de Excel (.xlsx) válido o está protegido con contraseña.',
    })
  })
})
