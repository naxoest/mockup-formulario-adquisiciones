import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  confirmarTransaccion,
  crearTransaccion,
  deshacerPaso,
  editarTransaccion,
  getTransaccion,
  registrarPaso,
} from '@/features/transacciones/api/transacciones'
import {
  crearSolicitud,
  editarSolicitud,
  eliminarSolicitud,
} from '@/features/transacciones/api/solicitudes'
import {
  crearOrdenDeCompra,
  editarOrdenDeCompra,
  eliminarOrdenDeCompra,
  reemplazarMontosOrdenDeCompra,
} from '@/features/transacciones/api/ordenesDeCompra'
import { crearFactura, editarFactura, eliminarFactura } from '@/features/transacciones/api/facturas'
import {
  codigoSaserviSabienesDeEnvio,
  financiamientoDeEnvio,
  planificarFacturas,
  planificarOrdenesDeCompra,
  planificarSolicitudes,
  precompromisosDeEnvio,
  reconciliarIdentificadores,
} from '@/features/transacciones/components/TransaccionWizard/TransaccionWizard.sincronizacion'
import type {
  DeshacerPasoRequest,
  RegistrarPasoRequest,
} from '@/features/transacciones/schemas/transaccionRequest.schema'
import type {
  Transaccion,
  TransaccionFormState,
} from '@/features/transacciones/types/transaccion.types'
import { ApiError } from '@/lib/apiClient'
import { toCivilDate } from '@/utils/date'

function aEnlaceOpcional(valor: string): string | null {
  const enlace = valor.trim()

  return enlace.length === 0 ? null : enlace
}

export function useGuardadoTransaccion(inicial: Transaccion | null) {
  const queryClient = useQueryClient()
  const [servidor, setServidor] = useState<Transaccion | null>(inicial)
  const [guardando, setGuardando] = useState(false)

  const invalidar = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['transacciones'] }),
      queryClient.invalidateQueries({ queryKey: ['monitoreo'] }),
    ])

  const guardar = async (valores: TransaccionFormState): Promise<Transaccion> => {
    setGuardando(true)

    try {
      if (servidor === null) {
        const creada = await crearTransaccion({
          nombre: valores.nombre.trim(),
          linkCarpetaAntecedentes: aEnlaceOpcional(valores.linkCarpetaAntecedentes),
          modalidad: valores.modalidad ?? '',
          fecha: toCivilDate(valores.fecha as Date),
          solicitudes: valores.solicitantes
            .filter((item) => item.unidadId !== null)
            .map((item) => ({
              unidadId: item.unidadId as number,
              tipoSolicitud: item.tipoSolicitud,
              codigoSaserviSabienes: codigoSaserviSabienesDeEnvio(item.codigoSaserviSabienes),
              financiamiento: financiamientoDeEnvio(item.financiamiento),
              precompromisos: precompromisosDeEnvio(item.precompromisos),
            })),
        })

        setServidor(creada)
        await invalidar()
        return creada
      }

      let actual = await editarTransaccion(servidor.id, {
        nombre: valores.nombre.trim(),
        linkCarpetaAntecedentes: aEnlaceOpcional(valores.linkCarpetaAntecedentes),
        modalidad: valores.modalidad ?? undefined,
        fecha: toCivilDate(valores.fecha as Date),
      })

      const plan = planificarSolicitudes(valores.solicitantes, actual)

      for (const id of plan.eliminar) {
        actual = await eliminarSolicitud(id).then(() => actual)
      }

      for (const edicion of plan.editar) {
        actual = await editarSolicitud(edicion.id, edicion.datos)
      }

      for (const creacion of plan.crear) {
        actual = await crearSolicitud(actual.id, creacion.datos)
      }

      const solicitantesSincronizados = reconciliarIdentificadores(valores.solicitantes, actual)
      const planOrdenes = planificarOrdenesDeCompra(
        valores.ordenesDeCompra,
        solicitantesSincronizados,
        actual,
      )

      for (const id of planOrdenes.eliminar) {
        await eliminarOrdenDeCompra(id)
      }

      for (const edicion of planOrdenes.editar) {
        actual = await editarOrdenDeCompra(edicion.id, edicion.datos)
      }

      for (const reemplazo of planOrdenes.reemplazarMontos) {
        actual = await reemplazarMontosOrdenDeCompra(reemplazo.id, { montos: reemplazo.montos })
      }

      for (const creacion of planOrdenes.crear) {
        actual = await crearOrdenDeCompra(actual.id, creacion)
      }

      if (planOrdenes.eliminar.length > 0 && planOrdenes.crear.length === 0) {
        actual = await getTransaccion(actual.id)
      }

      const planFacturas = planificarFacturas(valores.facturas, actual)

      for (const id of planFacturas.eliminar) {
        await eliminarFactura(id)
      }

      for (const edicion of planFacturas.editar) {
        actual = await editarFactura(edicion.id, edicion.datos)
      }

      for (const creacion of planFacturas.crear) {
        actual = await crearFactura(actual.id, creacion)
      }

      if (planFacturas.eliminar.length > 0 && planFacturas.crear.length === 0) {
        actual = await getTransaccion(actual.id)
      }

      setServidor(actual)
      await invalidar()
      return actual
    } finally {
      setGuardando(false)
    }
  }

  const confirmar = async (): Promise<Transaccion> => {
    if (servidor === null) {
      throw new Error('La transacción no ha sido guardada')
    }

    setGuardando(true)

    try {
      const confirmada = await confirmarTransaccion(servidor.id)
      setServidor(confirmada)
      await invalidar()
      return confirmada
    } finally {
      setGuardando(false)
    }
  }

  const ejecutarAccionDelProceso = async (
    id: number,
    accion: () => Promise<Transaccion>,
  ): Promise<Transaccion> => {
    setGuardando(true)

    try {
      const actualizada = await accion()
      setServidor(actualizada)
      await invalidar()
      return actualizada
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setServidor(await getTransaccion(id))
      }

      throw error
    } finally {
      setGuardando(false)
    }
  }

  const registrarPasoProceso = (id: number, datos: RegistrarPasoRequest) =>
    ejecutarAccionDelProceso(id, () => registrarPaso(id, datos))

  const deshacerPasoProceso = (id: number, datos: DeshacerPasoRequest) =>
    ejecutarAccionDelProceso(id, () => deshacerPaso(id, datos))

  return { servidor, guardando, guardar, confirmar, registrarPasoProceso, deshacerPasoProceso }
}
