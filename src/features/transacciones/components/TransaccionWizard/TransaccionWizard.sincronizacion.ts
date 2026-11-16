import type {
  FacturaCreacionRequest,
  FacturaEdicionRequest,
  MontoFacturaCreacionRequest,
  MontoOrdenDeCompraCreacionRequest,
  OrdenDeCompraCreacionRequest,
  OrdenDeCompraEdicionRequest,
  PrecompromisoRequest,
  SolicitudCreacionDirectaRequest,
  SolicitudEdicionRequest,
} from '@/features/transacciones/schemas/transaccionRequest.schema'
import type {
  Factura,
  FacturaForm,
  OrdenDeCompra,
  OrdenDeCompraForm,
  Precompromiso,
  PrecompromisoForm,
  Transaccion,
  UnidadSolicitanteForm,
} from '@/features/transacciones/types/transaccion.types'
import { precompromisosCompletos } from '@/features/transacciones/utils/montos'
import { toCivilDate } from '@/utils/date'

export interface CreacionSolicitud {
  claveFormulario: string
  datos: SolicitudCreacionDirectaRequest
}

export interface EdicionSolicitud {
  id: number
  datos: SolicitudEdicionRequest
}

export interface PlanSolicitudes {
  crear: CreacionSolicitud[]
  editar: EdicionSolicitud[]
  eliminar: number[]
}

export function precompromisosDeEnvio(
  precompromisos: PrecompromisoForm[] | null | undefined,
): PrecompromisoRequest[] {
  return precompromisosCompletos(precompromisos).map((precompromiso) => ({
    anio: Number(precompromiso.anio),
    monto: precompromiso.monto,
  }))
}

export function financiamientoDeEnvio(financiamiento: string | null): string | null {
  return financiamiento === null || financiamiento.length === 0 ? null : financiamiento
}

export function codigoSaserviSabienesDeEnvio(codigo: string): string | null {
  return codigo.length === 0 ? null : codigo
}

function ordenarPrecompromisos(precompromisos: Precompromiso[]): Precompromiso[] {
  return [...precompromisos].sort((a, b) => a.anio - b.anio || a.monto - b.monto)
}

function mismosPrecompromisos(
  persistidos: Precompromiso[],
  entrantes: PrecompromisoRequest[],
): boolean {
  if (persistidos.length !== entrantes.length) {
    return false
  }

  const persistidosOrdenados = ordenarPrecompromisos(persistidos)
  const entrantesOrdenados = ordenarPrecompromisos(entrantes)

  return persistidosOrdenados.every(
    (persistido, indice) =>
      persistido.anio === entrantesOrdenados[indice].anio &&
      persistido.monto === entrantesOrdenados[indice].monto,
  )
}

export function planificarSolicitudes(
  formulario: UnidadSolicitanteForm[],
  servidor: Transaccion | null,
): PlanSolicitudes {
  const persistidas = servidor?.solicitudes ?? []
  const vigentes = new Set(
    formulario.map((item) => item.id).filter((id): id is number => id !== null),
  )

  const crear: CreacionSolicitud[] = []
  const editar: EdicionSolicitud[] = []

  for (const item of formulario) {
    if (item.unidadId === null) {
      continue
    }

    if (item.id === null) {
      crear.push({
        claveFormulario: item.claveFormulario,
        datos: {
          unidadId: item.unidadId,
          tipoSolicitud: item.tipoSolicitud,
          codigoSaserviSabienes: codigoSaserviSabienesDeEnvio(item.codigoSaserviSabienes),
          financiamiento: financiamientoDeEnvio(item.financiamiento),
          precompromisos: precompromisosDeEnvio(item.precompromisos),
        },
      })
      continue
    }

    const original = persistidas.find((solicitud) => solicitud.id === item.id)

    if (!original) {
      continue
    }

    const precompromisosFormulario = precompromisosDeEnvio(item.precompromisos)
    const financiamientoFormulario = financiamientoDeEnvio(item.financiamiento)
    const codigoFormulario = codigoSaserviSabienesDeEnvio(item.codigoSaserviSabienes)
    const datos: SolicitudEdicionRequest = {}

    if (original.unidad.id !== item.unidadId) {
      datos.unidadId = item.unidadId
    }

    if (original.tipoSolicitud !== item.tipoSolicitud) {
      datos.tipoSolicitud = item.tipoSolicitud
    }

    if (original.codigoSaserviSabienes !== codigoFormulario) {
      datos.codigoSaserviSabienes = codigoFormulario
    }

    if (original.financiamiento !== financiamientoFormulario) {
      datos.financiamiento = financiamientoFormulario
    }

    if (!mismosPrecompromisos(original.precompromisos, precompromisosFormulario)) {
      datos.precompromisos = precompromisosFormulario
    }

    if (Object.keys(datos).length > 0) {
      editar.push({ id: item.id, datos })
    }
  }

  const eliminar = persistidas.map((solicitud) => solicitud.id).filter((id) => !vigentes.has(id))

  return { crear, editar, eliminar }
}

export interface EdicionOrdenDeCompra {
  id: number
  datos: OrdenDeCompraEdicionRequest
}

export interface MontosOrdenDeCompra {
  id: number
  montos: MontoOrdenDeCompraCreacionRequest[]
}

export interface PlanOrdenesDeCompra {
  crear: OrdenDeCompraCreacionRequest[]
  editar: EdicionOrdenDeCompra[]
  reemplazarMontos: MontosOrdenDeCompra[]
  eliminar: number[]
}

function resolverMontos(
  orden: OrdenDeCompraForm,
  solicitantes: UnidadSolicitanteForm[],
): MontoOrdenDeCompraCreacionRequest[] {
  return orden.solicitantes.flatMap((linea) => {
    const solicitante = solicitantes.find((item) => item.claveFormulario === linea.claveFormulario)

    if (!solicitante || solicitante.id === null) {
      return []
    }

    const solicitudId = solicitante.id

    return linea.montos.flatMap((fila) =>
      fila.anio === null || fila.anio === '' || fila.monto === null
        ? []
        : [{ solicitudId, anio: Number(fila.anio), monto: fila.monto }],
    )
  })
}

function mismosMontos(
  entrantes: MontoOrdenDeCompraCreacionRequest[],
  persistidos: { solicitudId: number; anio: number; monto: number }[],
): boolean {
  if (entrantes.length !== persistidos.length) {
    return false
  }

  return entrantes.every((entrante) =>
    persistidos.some(
      (persistido) =>
        persistido.solicitudId === entrante.solicitudId &&
        persistido.anio === entrante.anio &&
        persistido.monto === entrante.monto,
    ),
  )
}

export function planificarOrdenesDeCompra(
  formulario: OrdenDeCompraForm[],
  solicitantes: UnidadSolicitanteForm[],
  servidor: Transaccion | null,
): PlanOrdenesDeCompra {
  const persistidas = servidor?.ordenesDeCompra ?? []
  const bloqueadas = ordenesConFacturas(servidor)
  const canceladas = ordenesCanceladas(servidor)

  const crear: OrdenDeCompraCreacionRequest[] = []
  const editar: EdicionOrdenDeCompra[] = []
  const reemplazarMontos: MontosOrdenDeCompra[] = []

  for (const orden of formulario) {
    const montos = resolverMontos(orden, solicitantes)

    if (montos.length === 0) {
      continue
    }

    if (orden.id === null) {
      if (orden.fechaEmision !== null) {
        crear.push({
          codigo: orden.codigo,
          fechaEmision: toCivilDate(orden.fechaEmision),
          montos,
        })
      }
      continue
    }

    if (canceladas.has(orden.id)) {
      continue
    }

    const original = persistidas.find((item) => item.id === orden.id)

    if (!original) {
      continue
    }

    const fechaFormulario = orden.fechaEmision === null ? null : toCivilDate(orden.fechaEmision)
    const datos: OrdenDeCompraEdicionRequest = { codigo: orden.codigo }

    if (fechaFormulario !== null && fechaFormulario !== original.fechaEmision) {
      datos.fechaEmision = fechaFormulario
    }

    if (original.codigo !== orden.codigo || datos.fechaEmision !== undefined) {
      editar.push({ id: orden.id, datos })
    }

    if (!bloqueadas.has(orden.id) && !mismosMontos(montos, original.montos)) {
      reemplazarMontos.push({ id: orden.id, montos })
    }
  }

  const vigentes = new Set(
    formulario.map((orden) => orden.id).filter((id): id is number => id !== null),
  )

  const eliminar =
    servidor !== null && servidor.confirmadaEn === null
      ? persistidas
          .map((orden) => orden.id)
          .filter((id) => !vigentes.has(id) && !bloqueadas.has(id))
      : []

  return { crear, editar, reemplazarMontos, eliminar }
}

export function reconciliarIdentificadores(
  formulario: UnidadSolicitanteForm[],
  servidor: Transaccion,
): UnidadSolicitanteForm[] {
  const disponibles = servidor.solicitudes.filter(
    (solicitud) => !formulario.some((item) => item.id === solicitud.id),
  )

  return formulario.map((item) => {
    if (item.id !== null || item.unidadId === null) {
      return item
    }

    const indice = disponibles.findIndex(
      (solicitud) =>
        solicitud.unidad.id === item.unidadId && solicitud.tipoSolicitud === item.tipoSolicitud,
    )

    if (indice === -1) {
      return item
    }

    const [asignada] = disponibles.splice(indice, 1)

    return { ...item, id: asignada.id }
  })
}

export function reconciliarOrdenesDeCompra(
  formulario: OrdenDeCompraForm[],
  servidor: Transaccion,
): OrdenDeCompraForm[] {
  const tomadas = new Set(
    formulario.map((orden) => orden.id).filter((id): id is number => id !== null),
  )

  return formulario.map((orden) => {
    if (orden.id !== null) {
      return orden
    }

    const persistida = servidor.ordenesDeCompra.find(
      (item) => item.codigo === orden.codigo && !tomadas.has(item.id),
    )

    if (!persistida) {
      return orden
    }

    tomadas.add(persistida.id)

    return { ...orden, id: persistida.id }
  })
}

export function reconciliarFacturas(
  formulario: FacturaForm[],
  servidor: Transaccion,
): FacturaForm[] {
  const tomadas = new Set(
    formulario.map((factura) => factura.id).filter((id): id is number => id !== null),
  )

  return formulario.map((factura) => {
    if (factura.id !== null || factura.folio === null) {
      return factura
    }

    const persistida = servidor.facturas.find(
      (item) => item.folio === factura.folio && !tomadas.has(item.id),
    )

    if (!persistida) {
      return factura
    }

    tomadas.add(persistida.id)

    return {
      ...factura,
      id: persistida.id,
      montos: persistida.montos.map((monto) => ({
        montoOrdenCompraId: String(monto.montoOrdenCompraId),
        monto: monto.monto,
      })),
    }
  })
}

export interface EdicionFactura {
  id: number
  datos: FacturaEdicionRequest
}

export interface PlanFacturas {
  crear: FacturaCreacionRequest[]
  editar: EdicionFactura[]
  eliminar: number[]
}

export interface MontoDeOrden {
  id: number
  codigoOrden: string
  solicitudId: number
  anio: number
  monto: number
  facturado: number
}

function construirMontosDeOrden(ordenes: OrdenDeCompra[], facturas: Factura[]): MontoDeOrden[] {
  const facturado = new Map<number, number>()

  for (const factura of facturas) {
    if (factura.estado === 'rechazada') {
      continue
    }

    for (const linea of factura.montos) {
      facturado.set(
        linea.montoOrdenCompraId,
        (facturado.get(linea.montoOrdenCompraId) ?? 0) + linea.monto,
      )
    }
  }

  return ordenes.flatMap((orden) =>
    orden.montos.map((monto) => ({
      id: monto.id,
      codigoOrden: orden.codigo,
      solicitudId: monto.solicitudId,
      anio: monto.anio,
      monto: monto.monto,
      facturado: facturado.get(monto.id) ?? 0,
    })),
  )
}

export function montosDeOrden(servidor: Transaccion | null): MontoDeOrden[] {
  if (servidor === null) {
    return []
  }

  return construirMontosDeOrden(servidor.ordenesDeCompra, servidor.facturas)
}

export function montosFacturables(servidor: Transaccion | null): MontoDeOrden[] {
  if (servidor === null) {
    return []
  }

  return construirMontosDeOrden(
    servidor.ordenesDeCompra.filter((orden) => orden.estado !== 'cancelada'),
    servidor.facturas,
  )
}

export function facturadoSinGuardar(
  facturas: FacturaForm[] | null | undefined,
  montoOrdenCompraId: number,
): number {
  return (facturas ?? [])
    .filter((factura) => factura?.id === null)
    .flatMap((factura) => factura.montos ?? [])
    .filter((linea) => Number(linea?.montoOrdenCompraId) === montoOrdenCompraId)
    .reduce(
      (total, linea) =>
        total + (typeof linea.monto === 'number' && Number.isFinite(linea.monto) ? linea.monto : 0),
      0,
    )
}

export function planificarFacturas(
  formulario: FacturaForm[],
  servidor: Transaccion | null,
): PlanFacturas {
  const facturables = new Set(montosFacturables(servidor).map((item) => item.id))
  const persistidas = servidor?.facturas ?? []
  const puedeModificar = servidor !== null && servidor.confirmadaEn === null

  const crear: FacturaCreacionRequest[] = []
  const editar: EdicionFactura[] = []

  const vigentes = new Set(
    formulario.map((factura) => factura.id).filter((id): id is number => id !== null),
  )

  const eliminar = puedeModificar
    ? persistidas.map((factura) => factura.id).filter((id) => !vigentes.has(id))
    : []

  for (const factura of formulario) {
    if (factura.folio === null || factura.fechaEmision === null) {
      continue
    }

    if (factura.id !== null) {
      if (!puedeModificar) {
        continue
      }

      const original = persistidas.find((item) => item.id === factura.id)

      if (!original) {
        continue
      }

      const fechaFormulario = toCivilDate(factura.fechaEmision)

      if (original.folio !== factura.folio || original.fechaEmision !== fechaFormulario) {
        editar.push({
          id: factura.id,
          datos: { folio: factura.folio, fechaEmision: fechaFormulario },
        })
      }

      continue
    }

    const montos: MontoFacturaCreacionRequest[] = []

    for (const linea of factura.montos) {
      if (linea.monto === null) {
        continue
      }

      const id = Number(linea.montoOrdenCompraId)

      if (!Number.isInteger(id) || !facturables.has(id)) {
        continue
      }

      montos.push({ montoOrdenCompraId: id, monto: linea.monto })
    }

    if (montos.length === 0) {
      continue
    }

    crear.push({
      folio: factura.folio,
      fechaEmision: toCivilDate(factura.fechaEmision),
      montos,
    })
  }

  return { crear, editar, eliminar }
}

export function ordenesConFacturas(servidor: Transaccion | null): Set<number> {
  if (servidor === null) {
    return new Set()
  }

  const facturados = new Set(
    servidor.facturas.flatMap((factura) => factura.montos.map((monto) => monto.montoOrdenCompraId)),
  )

  return new Set(
    servidor.ordenesDeCompra
      .filter((orden) => orden.montos.some((monto) => facturados.has(monto.id)))
      .map((orden) => orden.id),
  )
}

export function ordenesCanceladas(servidor: Transaccion | null): Set<number> {
  if (servidor === null) {
    return new Set()
  }

  return new Set(
    servidor.ordenesDeCompra
      .filter((orden) => orden.estado === 'cancelada')
      .map((orden) => orden.id),
  )
}

function etiquetaOrden(codigo: string, posicion: number): string {
  return codigo.trim() !== '' ? `la orden ${codigo}` : `la orden de compra ${posicion + 1}`
}

function causaRepartoBloqueado(orden: OrdenDeCompra, facturas: Factura[]): string | null {
  if (orden.estado === 'cancelada') {
    return 'está cancelada'
  }

  const identificadores = new Set(orden.montos.map((monto) => monto.id))
  const facturada = facturas.some((factura) =>
    factura.montos.some((monto) => identificadores.has(monto.montoOrdenCompraId)),
  )

  return facturada ? 'tiene facturas registradas' : null
}

export function motivosParaNoQuitar(
  solicitantes: UnidadSolicitanteForm[],
  ordenes: OrdenDeCompraForm[],
  servidor: Transaccion | null,
): (string | null)[] {
  const persistidas = servidor?.ordenesDeCompra ?? []
  const facturas = servidor?.facturas ?? []
  const confirmada = servidor !== null && servidor.confirmadaEn !== null

  const activas = solicitantes
    .filter(
      (item) =>
        servidor?.solicitudes.some(
          (solicitud) => solicitud.id === item.id && solicitud.estado !== 'rechazada',
        ) ?? false,
    )
    .map((item) => item.claveFormulario)

  return solicitantes.map((solicitante) => {
    const ordenesPersistidas =
      solicitante.id === null
        ? []
        : persistidas.filter((orden) =>
            orden.montos.some((monto) => monto.solicitudId === solicitante.id),
          )

    for (const orden of ordenesPersistidas) {
      const causa = causaRepartoBloqueado(orden, facturas)

      if (causa !== null) {
        return `No se puede quitar: participa en la orden ${orden.codigo}, que ${causa}.`
      }
    }

    const posicion = ordenes.findIndex((orden) =>
      orden.solicitantes.some((linea) => linea.claveFormulario === solicitante.claveFormulario),
    )

    if (posicion !== -1) {
      return `No se puede quitar: participa en ${etiquetaOrden(ordenes[posicion].codigo, posicion)}. Primero retírela de esa orden.`
    }

    if (ordenesPersistidas.length > 0) {
      return `No se puede quitar: sigue registrada en la orden ${ordenesPersistidas[0].codigo}. Guarde primero el retiro de esa orden.`
    }

    const quedanOtrasActivas = activas.some((clave) => clave !== solicitante.claveFormulario)

    if (confirmada && solicitante.id !== null && !quedanOtrasActivas) {
      return 'No se puede quitar: la transacción confirmada debe conservar al menos una solicitud activa.'
    }

    return null
  })
}
