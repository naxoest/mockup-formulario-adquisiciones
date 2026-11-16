import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { transaccionQueryOptions } from '@/features/transacciones/api/transacciones'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Loading } from '@/components/ui/Loading'
import { TransaccionWizard } from '@/features/transacciones/components/TransaccionWizard'
import { claveSolicitantePersistido } from '@/features/transacciones/utils/solicitantes'
import type {
  MontoOrdenDeCompra,
  SolicitanteOrdenDeCompraForm,
} from '@/features/transacciones/types/transaccion.types'
import { ApiError } from '@/lib/apiClient'
import type { TransaccionEditModalProps } from './TransaccionEditModal.types'

function aFechaLocal(fecha: string): Date {
  const [anio, mes, dia] = fecha.split('-').map(Number)
  return new Date(anio, mes - 1, dia)
}

function solicitantesDeOrden(montos: MontoOrdenDeCompra[]): SolicitanteOrdenDeCompraForm[] {
  const porSolicitud = new Map<number, SolicitanteOrdenDeCompraForm>()

  for (const monto of montos) {
    const solicitante: SolicitanteOrdenDeCompraForm = porSolicitud.get(monto.solicitudId) ?? {
      claveFormulario: claveSolicitantePersistido(monto.solicitudId),
      montos: [],
    }

    solicitante.montos.push({ anio: String(monto.anio), monto: monto.monto })
    porSolicitud.set(monto.solicitudId, solicitante)
  }

  return [...porSolicitud.values()].map((solicitante) => ({
    ...solicitante,
    montos: [...solicitante.montos].sort((a, b) => Number(a.anio) - Number(b.anio)),
  }))
}

interface ContenidoEdicionProps {
  transaccionId: number
  onCerrar: () => void
}

function ContenidoEdicion({ transaccionId, onCerrar }: ContenidoEdicionProps) {
  const { data, isPending, isError, error, refetch } = useQuery(
    transaccionQueryOptions(transaccionId),
  )

  if (isPending) {
    return (
      <Modal.Body>
        <Loading variant="container" />
      </Modal.Body>
    )
  }

  if (isError) {
    const noDisponible = error instanceof ApiError && error.status === 404

    return (
      <>
        <Modal.Body>
          <div className="flex flex-col items-start gap-3 py-8">
            <h3 className="text-base font-semibold text-mercury-900">
              {noDisponible
                ? 'La transacción no está disponible'
                : 'No se pudo cargar la transacción'}
            </h3>
            <p className="text-sm text-mercury-600">
              {noDisponible ? 'No existe o ya no tiene acceso a ella.' : error.message}
            </p>
            {!noDisponible && (
              <Button variant="secondary" onClick={() => void refetch()}>
                Reintentar
              </Button>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onCerrar}>
            Cerrar
          </Button>
        </Modal.Footer>
      </>
    )
  }

  return (
    <TransaccionWizard
      modo="editar"
      transaccionInicial={data}
      defaultValues={{
        id: data.id,
        nombre: data.nombre,
        linkCarpetaAntecedentes: data.linkCarpetaAntecedentes ?? '',
        solicitantes: data.solicitudes.map((solicitud) => ({
          id: solicitud.id,
          unidadId: solicitud.unidad.id,
          claveFormulario: claveSolicitantePersistido(solicitud.id),
          tipo: solicitud.unidad.tipo,
          tipoSolicitud: solicitud.tipoSolicitud,
          codigoSaserviSabienes: solicitud.codigoSaserviSabienes ?? '',
          financiamiento: solicitud.financiamiento,
          nombre: String(solicitud.unidad.id),
          campus: '',
          cr: solicitud.unidad.cr,
          precompromisos: solicitud.precompromisos.map((precompromiso) => ({
            anio: String(precompromiso.anio),
            monto: precompromiso.monto,
          })),
        })),
        modalidad: data.modalidad,
        fecha: aFechaLocal(data.fecha),
        ordenesDeCompra: data.ordenesDeCompra.map((oc) => ({
          id: oc.id,
          claveFormulario: claveSolicitantePersistido(oc.id),
          codigo: oc.codigo,
          fechaEmision: aFechaLocal(oc.fechaEmision),
          solicitantes: solicitantesDeOrden(oc.montos),
        })),
        facturas: data.facturas.map((factura) => ({
          id: factura.id,
          folio: factura.folio,
          fechaEmision: aFechaLocal(factura.fechaEmision),
          montos: factura.montos.map((monto) => ({
            montoOrdenCompraId: String(monto.montoOrdenCompraId),
            monto: monto.monto,
          })),
        })),
      }}
      onComplete={() => {
        toast.success('Transacción guardada')
        onCerrar()
      }}
    />
  )
}

export function TransaccionEditModal({
  transaccionId,
  open,
  resolve,
  onExited,
}: TransaccionEditModalProps) {
  const cerrar = () => {
    resolve()
  }

  return (
    <Modal open={open} onClose={cerrar} onExited={onExited} size="xl">
      <Modal.Header tone="default">Editar transacción</Modal.Header>
      <ContenidoEdicion transaccionId={transaccionId} onCerrar={cerrar} />
    </Modal>
  )
}
