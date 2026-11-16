import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { ApiError } from '@/lib/apiClient'
import { historialQueryOptions } from '../../api/historial'
import { BarraAvance } from './BarraAvance'
import { EncabezadoTransaccion } from './EncabezadoTransaccion'
import { LineaDeTiempo } from './LineaDeTiempo'
import { PanelMontos } from './PanelMontos'
import { PanelSituacion } from './PanelSituacion'

export function ContenidoHistorial({ transaccionId }: { transaccionId: number }) {
  const {
    data: historial,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery(historialQueryOptions(transaccionId))

  if (isPending) {
    return <Loading ariaLabel="Cargando el historial" />
  }

  if (isError) {
    if (error instanceof ApiError && error.status === 404) {
      return (
        <div className="flex flex-col items-start gap-3 py-8">
          <h3 className="text-base font-semibold text-mercury-900">
            La transacción no está disponible
          </h3>
          <p className="text-sm text-mercury-600">No existe o ya no tiene acceso a ella.</p>
        </div>
      )
    }

    return (
      <div className="flex flex-col items-start gap-3 py-8">
        <h3 className="text-base font-semibold text-mercury-900">No se pudo cargar el historial</h3>
        <p className="text-sm text-mercury-600">
          {error instanceof Error ? error.message : 'Ocurrió un error inesperado'}
        </p>
        <Button variant="secondary" onClick={() => void refetch()}>
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <EncabezadoTransaccion cabecera={historial.cabecera} />
      <PanelSituacion situacion={historial.situacion} />
      <PanelMontos montos={historial.montos} />
      <BarraAvance avance={historial.avance} />
      <LineaDeTiempo eventos={historial.eventos} />
    </div>
  )
}
