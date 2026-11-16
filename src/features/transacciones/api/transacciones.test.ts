import { describe, expect, it } from 'vitest'
import { getTransaccionesSinPaginar } from '@/features/transacciones/api/transacciones'
import { pedirPagina } from '@/mocks/pruebas'

describe('getTransaccionesSinPaginar', () => {
  it('reúne todas las páginas de la consulta en el orden del listado', async () => {
    const referencia = await pedirPagina('/api/transacciones?page=1&perPage=100&sort=nombre')

    const transacciones = await getTransaccionesSinPaginar({ sort: 'nombre' }, 4)

    expect(referencia.cuerpo.meta.total).toBeGreaterThan(4)
    expect(transacciones.map((transaccion) => transaccion.id)).toEqual(
      referencia.cuerpo.data.map((transaccion) => transaccion.id),
    )
  })

  it('devuelve una lista vacía cuando la consulta no tiene resultados', async () => {
    const transacciones = await getTransaccionesSinPaginar({ q: 'consulta sin coincidencias' }, 4)

    expect(transacciones).toEqual([])
  })
})
