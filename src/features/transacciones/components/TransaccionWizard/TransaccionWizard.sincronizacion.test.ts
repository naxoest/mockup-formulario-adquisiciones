import { describe, expect, it } from 'vitest'
import {
  facturadoSinGuardar,
  montosDeOrden,
  montosFacturables,
  motivosParaNoQuitar,
  ordenesConFacturas,
  planificarFacturas,
  planificarOrdenesDeCompra,
  planificarSolicitudes,
  reconciliarFacturas,
  reconciliarIdentificadores,
  reconciliarOrdenesDeCompra,
} from './TransaccionWizard.sincronizacion'
import type { Transaccion, UnidadSolicitanteForm } from '../../types/transaccion.types'

const base: UnidadSolicitanteForm = {
  id: null,
  unidadId: 12,
  claveFormulario: 'clave-1',
  tipo: 'carrera',
  tipoSolicitud: 'SABIENES',
  codigoSaserviSabienes: '',
  financiamiento: null,
  nombre: 'arq',
  campus: 'osorno',
  cr: 101,
  precompromisos: [],
}

function transaccionCon(solicitudes: Transaccion['solicitudes']): Transaccion {
  return {
    id: 1,
    nombre: 'Compra de prueba',
    linkCarpetaAntecedentes: null,
    fecha: '2026-03-10',
    modalidad: 'agil',
    estado: null,
    montoCotizado: 0,
    montoComprometido: 0,
    montoFacturado: 0,
    creadaEn: '2026-03-10T00:00:00.000Z',
    confirmadaEn: null,
    solicitudes,
    ordenesDeCompra: [],
    facturas: [],
    proceso: {
      pasoActual: null,
      siguientesPermitidos: [],
      pasosAplicables: [],
      registrados: [],
      motivoBloqueo: null,
    },
  }
}

const solicitudPersistida = {
  id: 40,
  estado: null,
  estadoEvaluacion: null,
  tipoSolicitud: 'SABIENES',
  codigoSaserviSabienes: null,
  financiamiento: null,
  montoCotizacion: null,
  precompromisos: [],
  unidad: {
    id: 12,
    cr: 101,
    nombre: 'Arquitectura',
    sedes: [{ value: 'osorno', label: 'Osorno' }],
    tipo: 'carrera',
  },
}

describe('planificarSolicitudes', () => {
  it('crea las solicitudes que no tienen identificador', () => {
    const plan = planificarSolicitudes([base], null)

    expect(plan.crear).toHaveLength(1)
    expect(plan.crear[0].datos.unidadId).toBe(12)
    expect(plan.editar).toEqual([])
    expect(plan.eliminar).toEqual([])
  })

  it('omite las solicitudes sin unidad seleccionada', () => {
    const plan = planificarSolicitudes([{ ...base, unidadId: null }], null)

    expect(plan.crear).toEqual([])
  })

  it('no edita una solicitud cuya cotizacion no cambio', () => {
    const servidor = transaccionCon([solicitudPersistida])
    const plan = planificarSolicitudes([{ ...base, id: 40 }], servidor)

    expect(plan.editar).toEqual([])
  })

  it('edita la solicitud cuyo anio de precompromiso cambio', () => {
    const servidor = transaccionCon([
      {
        ...solicitudPersistida,
        montoCotizacion: 5000,
        precompromisos: [{ anio: 2026, monto: 5000 }],
      },
    ])
    const plan = planificarSolicitudes(
      [{ ...base, id: 40, precompromisos: [{ anio: '2027', monto: 5000 }] }],
      servidor,
    )

    expect(plan.editar).toEqual([
      { id: 40, datos: { precompromisos: [{ anio: 2027, monto: 5000 }] } },
    ])
  })

  it('no edita una solicitud cuyos precompromisos solo cambiaron de orden', () => {
    const servidor = transaccionCon([
      {
        ...solicitudPersistida,
        montoCotizacion: 3000,
        precompromisos: [
          { anio: 2026, monto: 1000 },
          { anio: 2027, monto: 2000 },
        ],
      },
    ])
    const plan = planificarSolicitudes(
      [
        {
          ...base,
          id: 40,
          precompromisos: [
            { anio: '2027', monto: 2000 },
            { anio: '2026', monto: 1000 },
          ],
        },
      ],
      servidor,
    )

    expect(plan.editar).toEqual([])
  })

  it('envia una lista vacia al quitar todos los precompromisos', () => {
    const servidor = transaccionCon([
      {
        ...solicitudPersistida,
        montoCotizacion: 1000,
        precompromisos: [{ anio: 2026, monto: 1000 }],
      },
    ])
    const plan = planificarSolicitudes([{ ...base, id: 40 }], servidor)

    expect(plan.editar).toEqual([{ id: 40, datos: { precompromisos: [] } }])
  })

  it('crea la solicitud solo con sus precompromisos completos', () => {
    const plan = planificarSolicitudes(
      [
        {
          ...base,
          precompromisos: [
            { anio: '2026', monto: 1000 },
            { anio: null, monto: 500 },
          ],
        },
      ],
      null,
    )

    expect(plan.crear[0].datos.precompromisos).toEqual([{ anio: 2026, monto: 1000 }])
  })

  it('crea la solicitud con su financiamiento', () => {
    const plan = planificarSolicitudes([{ ...base, financiamiento: 'proyectos' }], null)

    expect(plan.crear[0].datos.financiamiento).toBe('proyectos')
  })

  it('quita el financiamiento con un nulo cuando el campo queda vacio', () => {
    const servidor = transaccionCon([{ ...solicitudPersistida, financiamiento: 'institucional' }])
    const plan = planificarSolicitudes([{ ...base, id: 40, financiamiento: '' }], servidor)

    expect(plan.editar).toEqual([{ id: 40, datos: { financiamiento: null } }])
  })

  it('elimina las solicitudes persistidas que el formulario ya no contiene', () => {
    const servidor = transaccionCon([solicitudPersistida])
    const plan = planificarSolicitudes([], servidor)

    expect(plan.eliminar).toEqual([40])
  })

  it('distingue creacion, edicion y eliminacion en una misma pasada', () => {
    const servidor = transaccionCon([solicitudPersistida, { ...solicitudPersistida, id: 41 }])
    const plan = planificarSolicitudes(
      [
        { ...base, id: 40, precompromisos: [{ anio: '2026', monto: 3000 }] },
        { ...base, claveFormulario: 'clave-2' },
      ],
      servidor,
    )

    expect(plan.crear).toHaveLength(1)
    expect(plan.editar).toEqual([
      { id: 40, datos: { precompromisos: [{ anio: 2026, monto: 3000 }] } },
    ])
    expect(plan.eliminar).toEqual([41])
  })
})

describe('planificarOrdenesDeCompra', () => {
  const solicitantePersistido: UnidadSolicitanteForm = { ...base, id: 40 }

  const ordenBase = {
    id: null,
    claveFormulario: 'orden-1',
    codigo: 'OC-1',
    fechaEmision: new Date(2026, 2, 2),
    solicitantes: [{ claveFormulario: 'clave-1', montos: [{ anio: '2026', monto: 5000 }] }],
  }

  const ordenPersistida = {
    id: 200,
    codigo: 'OC-1',
    fechaEmision: '2026-03-02',
    estado: 'enviada_a_proveedor' as const,
    monto: 5000,
    montos: [{ id: 300, solicitudId: 40, anio: 2026, monto: 5000 }],
  }

  function conOrdenes(ordenes: Transaccion['ordenesDeCompra']): Transaccion {
    return { ...transaccionCon([]), ordenesDeCompra: ordenes }
  }

  it('crea las ordenes que no tienen identificador', () => {
    const plan = planificarOrdenesDeCompra([ordenBase], [solicitantePersistido], null)

    expect(plan.crear).toEqual([
      {
        codigo: 'OC-1',
        fechaEmision: '2026-03-02',
        montos: [{ solicitudId: 40, anio: 2026, monto: 5000 }],
      },
    ])
  })

  it('reparte en una linea por anio los montos de cada solicitud y omite las filas incompletas', () => {
    const plan = planificarOrdenesDeCompra(
      [
        {
          ...ordenBase,
          solicitantes: [
            {
              claveFormulario: 'clave-1',
              montos: [
                { anio: '2026', monto: 3000 },
                { anio: '2027', monto: 2000 },
                { anio: null, monto: 500 },
                { anio: '2028', monto: null },
              ],
            },
          ],
        },
      ],
      [solicitantePersistido],
      null,
    )

    expect(plan.crear[0].montos).toEqual([
      { solicitudId: 40, anio: 2026, monto: 3000 },
      { solicitudId: 40, anio: 2027, monto: 2000 },
    ])
  })

  it('omite las lineas cuyo solicitante no esta persistido', () => {
    const plan = planificarOrdenesDeCompra([ordenBase], [base], null)

    expect(plan.crear).toEqual([])
  })

  it('no edita ni reemplaza cuando nada cambio', () => {
    const servidor = conOrdenes([ordenPersistida])
    const plan = planificarOrdenesDeCompra(
      [{ ...ordenBase, id: 200 }],
      [solicitantePersistido],
      servidor,
    )

    expect(plan.editar).toEqual([])
    expect(plan.reemplazarMontos).toEqual([])
  })

  it('edita la orden cuyo codigo cambio', () => {
    const servidor = conOrdenes([ordenPersistida])
    const plan = planificarOrdenesDeCompra(
      [{ ...ordenBase, id: 200, codigo: 'OC-2' }],
      [solicitantePersistido],
      servidor,
    )

    expect(plan.editar).toEqual([{ id: 200, datos: { codigo: 'OC-2' } }])
    expect(plan.reemplazarMontos).toEqual([])
  })

  it('edita la orden cuya fecha de emision cambio', () => {
    const servidor = conOrdenes([ordenPersistida])
    const plan = planificarOrdenesDeCompra(
      [{ ...ordenBase, id: 200, fechaEmision: new Date(2026, 2, 5) }],
      [solicitantePersistido],
      servidor,
    )

    expect(plan.editar).toEqual([
      { id: 200, datos: { codigo: 'OC-1', fechaEmision: '2026-03-05' } },
    ])
  })

  it('omite crear una orden sin fecha de emision', () => {
    const plan = planificarOrdenesDeCompra(
      [{ ...ordenBase, fechaEmision: null }],
      [solicitantePersistido],
      null,
    )

    expect(plan.crear).toEqual([])
  })

  it('reemplaza los montos cuando cambia un valor', () => {
    const servidor = conOrdenes([ordenPersistida])
    const plan = planificarOrdenesDeCompra(
      [
        {
          ...ordenBase,
          id: 200,
          solicitantes: [{ claveFormulario: 'clave-1', montos: [{ anio: '2026', monto: 7000 }] }],
        },
      ],
      [solicitantePersistido],
      servidor,
    )

    expect(plan.reemplazarMontos).toEqual([
      { id: 200, montos: [{ solicitudId: 40, anio: 2026, monto: 7000 }] },
    ])
  })

  it('reemplaza los montos cuando cambia el anio de una linea', () => {
    const servidor = conOrdenes([ordenPersistida])
    const plan = planificarOrdenesDeCompra(
      [
        {
          ...ordenBase,
          id: 200,
          solicitantes: [{ claveFormulario: 'clave-1', montos: [{ anio: '2027', monto: 5000 }] }],
        },
      ],
      [solicitantePersistido],
      servidor,
    )

    expect(plan.reemplazarMontos).toEqual([
      { id: 200, montos: [{ solicitudId: 40, anio: 2027, monto: 5000 }] },
    ])
  })

  it('no reemplaza los montos por un cambio de orden en el arreglo', () => {
    const servidor = conOrdenes([
      {
        ...ordenPersistida,
        montos: [
          { id: 300, solicitudId: 40, anio: 2026, monto: 5000 },
          { id: 301, solicitudId: 41, anio: 2026, monto: 2000 },
        ],
      },
    ])
    const plan = planificarOrdenesDeCompra(
      [
        {
          ...ordenBase,
          id: 200,
          solicitantes: [
            { claveFormulario: 'clave-2', montos: [{ anio: '2026', monto: 2000 }] },
            { claveFormulario: 'clave-1', montos: [{ anio: '2026', monto: 5000 }] },
          ],
        },
      ],
      [solicitantePersistido, { ...base, id: 41, claveFormulario: 'clave-2' }],
      servidor,
    )

    expect(plan.reemplazarMontos).toEqual([])
  })

  it('no reemplaza los montos de una orden que ya tiene facturas', () => {
    const servidor = conOrdenes([ordenPersistida])
    servidor.facturas = [
      {
        id: 400,
        folio: 8801,
        estado: 'pendiente',
        fechaEmision: '2026-04-02',
        monto: 5000,
        montos: [{ id: 500, montoOrdenCompraId: 300, monto: 5000 }],
      },
    ]

    const plan = planificarOrdenesDeCompra(
      [
        {
          ...ordenBase,
          id: 200,
          solicitantes: [{ claveFormulario: 'clave-1', montos: [{ anio: '2026', monto: 9000 }] }],
        },
      ],
      [solicitantePersistido],
      servidor,
    )

    expect(plan.reemplazarMontos).toEqual([])
  })

  it('no edita ni reemplaza los montos de una orden cancelada', () => {
    const servidor = conOrdenes([{ ...ordenPersistida, estado: 'cancelada' }])
    const plan = planificarOrdenesDeCompra(
      [
        {
          ...ordenBase,
          id: 200,
          codigo: 'OC-2',
          solicitantes: [{ claveFormulario: 'clave-1', montos: [{ anio: '2026', monto: 9000 }] }],
        },
      ],
      [solicitantePersistido],
      servidor,
    )

    expect(plan.editar).toEqual([])
    expect(plan.reemplazarMontos).toEqual([])
  })

  it('elimina la orden persistida que el formulario ya no contiene', () => {
    const servidor = conOrdenes([ordenPersistida])
    const plan = planificarOrdenesDeCompra([], [solicitantePersistido], servidor)

    expect(plan.eliminar).toEqual([200])
  })

  it('no elimina ordenes cuando la transaccion ya fue confirmada', () => {
    const servidor = conOrdenes([ordenPersistida])
    servidor.confirmadaEn = '2026-03-11T00:00:00.000Z'
    const plan = planificarOrdenesDeCompra([], [solicitantePersistido], servidor)

    expect(plan.eliminar).toEqual([])
  })

  it('no elimina una orden que tiene facturas registradas', () => {
    const servidor = conOrdenes([ordenPersistida])
    servidor.facturas = [
      {
        id: 400,
        folio: 8801,
        estado: 'pendiente',
        fechaEmision: '2026-04-02',
        monto: 5000,
        montos: [{ id: 500, montoOrdenCompraId: 300, monto: 5000 }],
      },
    ]
    const plan = planificarOrdenesDeCompra([], [solicitantePersistido], servidor)

    expect(plan.eliminar).toEqual([])
  })
})

describe('reconciliarIdentificadores', () => {
  it('asigna el identificador del servidor a un solicitante nuevo', () => {
    const servidor = transaccionCon([solicitudPersistida])
    const resultado = reconciliarIdentificadores([base], servidor)

    expect(resultado[0].id).toBe(40)
  })

  it('conserva el identificador de un solicitante ya persistido', () => {
    const servidor = transaccionCon([solicitudPersistida])
    const resultado = reconciliarIdentificadores([{ ...base, id: 40 }], servidor)

    expect(resultado[0].id).toBe(40)
  })

  it('no reutiliza una solicitud ya tomada por otro solicitante', () => {
    const servidor = transaccionCon([solicitudPersistida, { ...solicitudPersistida, id: 41 }])
    const resultado = reconciliarIdentificadores(
      [base, { ...base, claveFormulario: 'clave-2' }],
      servidor,
    )

    expect(resultado[0].id).toBe(40)
    expect(resultado[1].id).toBe(41)
  })

  it('deja en nulo al solicitante sin coincidencia en el servidor', () => {
    const servidor = transaccionCon([])
    const resultado = reconciliarIdentificadores([base], servidor)

    expect(resultado[0].id).toBeNull()
  })

  it('no empareja por unidad cuando el tipo de solicitud difiere', () => {
    const servidor = transaccionCon([solicitudPersistida])
    const resultado = reconciliarIdentificadores([{ ...base, tipoSolicitud: 'SASERVI' }], servidor)

    expect(resultado[0].id).toBeNull()
  })
})

describe('reconciliarOrdenesDeCompra', () => {
  const ordenFormulario = {
    id: null,
    claveFormulario: 'orden-1',
    codigo: 'OC-2',
    fechaEmision: new Date(2026, 2, 2),
    solicitantes: [{ claveFormulario: 'clave-1', montos: [{ anio: '2026', monto: 5000 }] }],
  }

  function persistida(id: number, codigo: string) {
    return {
      id,
      codigo,
      fechaEmision: '2026-03-02',
      estado: 'enviada_a_proveedor' as const,
      monto: 5000,
      montos: [{ id: id + 100, solicitudId: 40, anio: 2026, monto: 5000 }],
    }
  }

  function servidorCon(ordenes: Transaccion['ordenesDeCompra']): Transaccion {
    return { ...transaccionCon([solicitudPersistida]), ordenesDeCompra: ordenes }
  }

  it('asigna a la orden nueva el identificador de la persistida con su mismo codigo', () => {
    const resultado = reconciliarOrdenesDeCompra(
      [{ ...ordenFormulario, id: 200, codigo: 'OC-1' }, ordenFormulario],
      servidorCon([persistida(201, 'OC-2'), persistida(200, 'OC-1')]),
    )

    expect(resultado.map((orden) => orden.id)).toEqual([200, 201])
  })

  it('deja sin identificador la orden que el servidor no registro', () => {
    const resultado = reconciliarOrdenesDeCompra(
      [ordenFormulario],
      servidorCon([persistida(200, 'OC-1')]),
    )

    expect(resultado[0].id).toBeNull()
  })
})

describe('reconciliarFacturas', () => {
  const facturaPersistida = {
    id: 400,
    folio: 8801,
    estado: 'pendiente' as const,
    fechaEmision: '2026-04-02',
    monto: 5000,
    montos: [{ id: 500, montoOrdenCompraId: 300, monto: 5000 }],
  }

  const facturaNueva = {
    id: null,
    folio: 8801,
    fechaEmision: new Date(2026, 3, 2),
    montos: [
      { montoOrdenCompraId: '300', monto: 5000 },
      { montoOrdenCompraId: '', monto: null },
    ],
  }

  function servidorCon(facturas: Transaccion['facturas']): Transaccion {
    return {
      ...transaccionCon([solicitudPersistida]),
      ordenesDeCompra: [
        {
          id: 200,
          codigo: 'OC-1',
          fechaEmision: '2026-03-02',
          estado: 'enviada_a_proveedor',
          monto: 5000,
          montos: [{ id: 300, solicitudId: 40, anio: 2026, monto: 5000 }],
        },
      ],
      facturas,
    }
  }

  it('asigna el identificador del servidor y adopta sus lineas', () => {
    const resultado = reconciliarFacturas([facturaNueva], servidorCon([facturaPersistida]))

    expect(resultado[0].id).toBe(400)
    expect(resultado[0].montos).toEqual([{ montoOrdenCompraId: '300', monto: 5000 }])
  })

  it('deja sin identificador la factura que el servidor no registro', () => {
    const resultado = reconciliarFacturas([facturaNueva], servidorCon([]))

    expect(resultado[0]).toEqual(facturaNueva)
  })

  it('no elimina ni vuelve a crear la factura en el guardado siguiente', () => {
    const servidor = servidorCon([facturaPersistida])
    const plan = planificarFacturas(reconciliarFacturas([facturaNueva], servidor), servidor)

    expect(plan.eliminar).toEqual([])
    expect(plan.crear).toEqual([])
  })
})

describe('montosFacturables', () => {
  function servidorConOrden(facturas: Transaccion['facturas'] = []): Transaccion {
    return {
      ...transaccionCon([solicitudPersistida]),
      ordenesDeCompra: [
        {
          id: 200,
          codigo: 'OC-1',
          fechaEmision: '2026-03-02',
          estado: 'enviada_a_proveedor',
          monto: 5000,
          montos: [{ id: 300, solicitudId: 40, anio: 2026, monto: 5000 }],
        },
      ],
      facturas,
    }
  }

  it('expone el monto de orden sin facturado cuando no hay facturas', () => {
    expect(montosFacturables(servidorConOrden())).toEqual([
      { id: 300, codigoOrden: 'OC-1', solicitudId: 40, anio: 2026, monto: 5000, facturado: 0 },
    ])
  })

  it('acumula lo ya facturado', () => {
    const servidor = servidorConOrden([
      {
        id: 400,
        folio: 8801,
        estado: 'pendiente',
        fechaEmision: '2026-04-02',
        monto: 2000,
        montos: [{ id: 500, montoOrdenCompraId: 300, monto: 2000 }],
      },
    ])

    expect(montosFacturables(servidor)[0].facturado).toBe(2000)
  })

  it('ignora las facturas rechazadas al acumular lo facturado', () => {
    const servidor = servidorConOrden([
      {
        id: 400,
        folio: 8801,
        estado: 'rechazada',
        fechaEmision: '2026-04-02',
        monto: 2000,
        montos: [{ id: 500, montoOrdenCompraId: 300, monto: 2000 }],
      },
    ])

    expect(montosFacturables(servidor)[0].facturado).toBe(0)
  })

  it('conserva los montos ya facturados por completo', () => {
    const servidor = servidorConOrden([
      {
        id: 400,
        folio: 8801,
        estado: 'pendiente',
        fechaEmision: '2026-04-02',
        monto: 5000,
        montos: [{ id: 500, montoOrdenCompraId: 300, monto: 5000 }],
      },
    ])

    expect(montosFacturables(servidor)).toEqual([
      { id: 300, codigoOrden: 'OC-1', solicitudId: 40, anio: 2026, monto: 5000, facturado: 5000 },
    ])
  })

  it('excluye los montos de una orden cancelada', () => {
    const servidor = servidorConOrden()
    servidor.ordenesDeCompra[0].estado = 'cancelada'

    expect(montosFacturables(servidor)).toEqual([])
  })

  it('montosDeOrden conserva los montos de una orden cancelada', () => {
    const servidor = servidorConOrden()
    servidor.ordenesDeCompra[0].estado = 'cancelada'

    expect(montosDeOrden(servidor)).toEqual([
      { id: 300, codigoOrden: 'OC-1', solicitudId: 40, anio: 2026, monto: 5000, facturado: 0 },
    ])
  })

  it('devuelve vacio cuando la transaccion no esta persistida', () => {
    expect(montosFacturables(null)).toEqual([])
  })
})

describe('facturadoSinGuardar', () => {
  it('suma solo las lineas de facturas sin guardar para el monto de orden indicado', () => {
    const facturas = [
      {
        id: null,
        folio: 1,
        fechaEmision: null,
        montos: [
          { montoOrdenCompraId: '300', monto: 1000 },
          { montoOrdenCompraId: '301', monto: 500 },
        ],
      },
      {
        id: null,
        folio: 2,
        fechaEmision: null,
        montos: [{ montoOrdenCompraId: '300', monto: null }],
      },
      {
        id: 400,
        folio: 3,
        fechaEmision: null,
        montos: [{ montoOrdenCompraId: '300', monto: 7000 }],
      },
    ]

    expect(facturadoSinGuardar(facturas, 300)).toBe(1000)
  })
})

describe('planificarFacturas', () => {
  const facturaFormulario = {
    id: null,
    folio: 8801,
    fechaEmision: new Date(2026, 3, 2),
    montos: [{ montoOrdenCompraId: '300', monto: 5000 }],
  }

  function servidorConOrden(): Transaccion {
    return {
      ...transaccionCon([solicitudPersistida]),
      ordenesDeCompra: [
        {
          id: 200,
          codigo: 'OC-1',
          fechaEmision: '2026-03-02',
          estado: 'enviada_a_proveedor',
          monto: 5000,
          montos: [{ id: 300, solicitudId: 40, anio: 2026, monto: 5000 }],
        },
      ],
    }
  }

  it('crea la factura con el monto de orden seleccionado', () => {
    const plan = planificarFacturas([facturaFormulario], servidorConOrden())

    expect(plan.crear).toEqual([
      {
        folio: 8801,
        fechaEmision: '2026-04-02',
        montos: [{ montoOrdenCompraId: 300, monto: 5000 }],
      },
    ])
  })

  it('omite una factura sin folio', () => {
    const plan = planificarFacturas([{ ...facturaFormulario, folio: null }], servidorConOrden())

    expect(plan.crear).toEqual([])
  })

  it('omite una factura sin fecha de emision', () => {
    const plan = planificarFacturas(
      [{ ...facturaFormulario, fechaEmision: null }],
      servidorConOrden(),
    )

    expect(plan.crear).toEqual([])
  })

  it('omite la linea cuyo monto de orden no pertenece a la transaccion', () => {
    const plan = planificarFacturas(
      [{ ...facturaFormulario, montos: [{ montoOrdenCompraId: '999', monto: 1000 }] }],
      servidorConOrden(),
    )

    expect(plan.crear).toEqual([])
  })

  it('no planifica nada cuando la transaccion no esta persistida', () => {
    expect(planificarFacturas([facturaFormulario], null).crear).toEqual([])
  })

  it('conserva solo las lineas validas dentro de una factura', () => {
    const plan = planificarFacturas(
      [
        {
          ...facturaFormulario,
          montos: [
            { montoOrdenCompraId: '300', monto: 3000 },
            { montoOrdenCompraId: '999', monto: 2000 },
          ],
        },
      ],
      servidorConOrden(),
    )

    expect(plan.crear[0].montos).toEqual([{ montoOrdenCompraId: 300, monto: 3000 }])
  })

  const facturaPersistida = {
    id: 400,
    folio: 8801,
    estado: 'pendiente' as const,
    fechaEmision: '2026-04-02',
    monto: 5000,
    montos: [{ id: 500, montoOrdenCompraId: 300, monto: 5000 }],
  }

  it('no edita una factura cuyo folio y fecha no cambiaron', () => {
    const servidor = servidorConOrden()
    servidor.facturas = [facturaPersistida]
    const plan = planificarFacturas([{ ...facturaFormulario, id: 400 }], servidor)

    expect(plan.editar).toEqual([])
    expect(plan.crear).toEqual([])
  })

  it('edita la factura cuyo folio cambio', () => {
    const servidor = servidorConOrden()
    servidor.facturas = [facturaPersistida]
    const plan = planificarFacturas([{ ...facturaFormulario, id: 400, folio: 8802 }], servidor)

    expect(plan.editar).toEqual([{ id: 400, datos: { folio: 8802, fechaEmision: '2026-04-02' } }])
  })

  it('edita la factura cuya fecha de emision cambio', () => {
    const servidor = servidorConOrden()
    servidor.facturas = [facturaPersistida]
    const plan = planificarFacturas(
      [{ ...facturaFormulario, id: 400, fechaEmision: new Date(2026, 3, 9) }],
      servidor,
    )

    expect(plan.editar).toEqual([{ id: 400, datos: { folio: 8801, fechaEmision: '2026-04-09' } }])
  })

  it('elimina la factura persistida que el formulario ya no contiene', () => {
    const servidor = servidorConOrden()
    servidor.facturas = [facturaPersistida]
    const plan = planificarFacturas([], servidor)

    expect(plan.eliminar).toEqual([400])
  })

  it('no elimina ni edita facturas cuando la transaccion ya fue confirmada', () => {
    const servidor = servidorConOrden()
    servidor.facturas = [facturaPersistida]
    servidor.confirmadaEn = '2026-03-11T00:00:00.000Z'
    const plan = planificarFacturas([{ ...facturaFormulario, id: 400, folio: 8802 }], servidor)

    expect(plan.editar).toEqual([])
    expect(plan.eliminar).toEqual([])
  })
})

describe('ordenesConFacturas', () => {
  function servidorCon(facturas: Transaccion['facturas']): Transaccion {
    return {
      ...transaccionCon([solicitudPersistida]),
      ordenesDeCompra: [
        {
          id: 200,
          codigo: 'OC-1',
          fechaEmision: '2026-03-02',
          estado: 'enviada_a_proveedor',
          monto: 5000,
          montos: [{ id: 300, solicitudId: 40, anio: 2026, monto: 5000 }],
        },
      ],
      facturas,
    }
  }

  const facturaBase = {
    id: 400,
    folio: 8801,
    estado: 'pendiente' as const,
    fechaEmision: '2026-04-02',
    monto: 2000,
    montos: [{ id: 500, montoOrdenCompraId: 300, monto: 2000 }],
  }

  it('marca la orden que tiene una factura pendiente', () => {
    expect(ordenesConFacturas(servidorCon([facturaBase]))).toEqual(new Set([200]))
  })

  it('marca la orden que tiene una factura aceptada', () => {
    const servidor = servidorCon([{ ...facturaBase, estado: 'aceptada' }])

    expect(ordenesConFacturas(servidor)).toEqual(new Set([200]))
  })

  it('marca la orden aunque su unica factura haya sido rechazada', () => {
    const servidor = servidorCon([{ ...facturaBase, estado: 'rechazada' }])

    expect(ordenesConFacturas(servidor)).toEqual(new Set([200]))
  })

  it('no marca una orden sin facturas', () => {
    expect(ordenesConFacturas(servidorCon([]))).toEqual(new Set())
  })

  it('devuelve vacio cuando la transaccion no esta persistida', () => {
    expect(ordenesConFacturas(null)).toEqual(new Set())
  })
})

describe('motivosParaNoQuitar', () => {
  const ordenPersistida = {
    id: 200,
    codigo: 'OC-1',
    fechaEmision: '2026-03-02',
    estado: 'enviada_a_proveedor' as const,
    monto: 5000,
    montos: [{ id: 300, solicitudId: 40, anio: 2026, monto: 5000 }],
  }

  it('bloquea la solicitud registrada en una orden cancelada', () => {
    const servidor: Transaccion = {
      ...transaccionCon([solicitudPersistida]),
      ordenesDeCompra: [{ ...ordenPersistida, estado: 'cancelada' }],
    }

    expect(motivosParaNoQuitar([{ ...base, id: 40 }], [], servidor)).toEqual([
      'No se puede quitar: participa en la orden OC-1, que está cancelada.',
    ])
  })

  it('bloquea solo al solicitante que participa en una orden del formulario', () => {
    const ordenes = [
      {
        id: null,
        claveFormulario: 'oc-1',
        codigo: 'OC-9',
        fechaEmision: null,
        solicitantes: [{ claveFormulario: 'clave-1', montos: [{ anio: '2026', monto: 1000 }] }],
      },
    ]

    expect(
      motivosParaNoQuitar([base, { ...base, claveFormulario: 'clave-2' }], ordenes, null),
    ).toEqual([
      'No se puede quitar: participa en la orden OC-9. Primero retírela de esa orden.',
      null,
    ])
  })

  it('exige guardar el retiro antes de quitar la solicitud registrada en una orden', () => {
    const servidor: Transaccion = {
      ...transaccionCon([solicitudPersistida]),
      ordenesDeCompra: [ordenPersistida],
    }

    expect(motivosParaNoQuitar([{ ...base, id: 40 }], [], servidor)).toEqual([
      'No se puede quitar: sigue registrada en la orden OC-1. Guarde primero el retiro de esa orden.',
    ])
  })

  it('conserva la ultima solicitud activa de una transaccion confirmada', () => {
    const servidor: Transaccion = {
      ...transaccionCon([
        { ...solicitudPersistida, estado: 'enviada' },
        { ...solicitudPersistida, id: 41, estado: 'rechazada' },
      ]),
      confirmadaEn: '2026-03-11T00:00:00.000Z',
    }

    expect(
      motivosParaNoQuitar(
        [
          { ...base, id: 40 },
          { ...base, id: 41, claveFormulario: 'clave-2' },
        ],
        [],
        servidor,
      ),
    ).toEqual([
      'No se puede quitar: la transacción confirmada debe conservar al menos una solicitud activa.',
      null,
    ])
  })
})
