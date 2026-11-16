import { useId } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { eventosRequerimientoQueryOptions } from '@/features/requerimientos/api/requerimientos'
import { EventoTrazabilidad } from './EventoTrazabilidad'

function ContenidoTrazabilidad({ requerimientoId }: { requerimientoId: number }) {
  const {
    data: eventos,
    isError,
    error,
    refetch,
  } = useQuery(eventosRequerimientoQueryOptions(requerimientoId))

  if (isError) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm text-mercury-700">
          {error instanceof Error ? error.message : 'Ocurrió un error inesperado'}
        </p>
        <Button variant="secondary" onClick={() => void refetch()}>
          Reintentar
        </Button>
      </div>
    )
  }

  if (eventos === undefined) {
    return <Loading variant="container" message="Cargando trazabilidad..." />
  }

  if (eventos.length === 0) {
    return (
      <p className="text-sm text-mercury-600">
        No hay eventos registrados para este requerimiento.
      </p>
    )
  }

  return (
    <ol className="flex flex-col gap-6 border-l border-mercury-200">
      {eventos.map((evento) => (
        <EventoTrazabilidad key={evento.id} evento={evento} />
      ))}
    </ol>
  )
}

export function Trazabilidad({ requerimientoId }: { requerimientoId: number }) {
  const idTitulo = useId()

  return (
    <section aria-labelledby={idTitulo}>
      <h3 id={idTitulo} className="text-base font-semibold text-mercury-900">
        Trazabilidad
      </h3>
      <p className="mt-1 text-sm text-mercury-600">
        Eventos registrados para este requerimiento, del más reciente al más antiguo.
      </p>
      <div className="mt-4">
        <ContenidoTrazabilidad requerimientoId={requerimientoId} />
      </div>
    </section>
  )
}
