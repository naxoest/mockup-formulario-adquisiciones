import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { CircleDotIcon } from 'lucide-react'
import { Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { DataTable, type RowAction } from '@/components/ui/DataTable'
import { FilterBar } from '@/components/ui/FilterBar'
import { useModal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageLayout } from '@/components/ui/PageLayout'
import { Section } from '@/components/ui/Section'
import { monitoreoQueryOptions } from '@/features/transacciones/api/monitoreo'
import {
  columnasMonitoreo,
  construirFiltrosMonitoreo,
  DesgloseFactores,
  PanelEstadisticas,
} from '@/features/transacciones/components/MonitoreoCriticidad'
import type { FilaMonitoreo } from '@/features/transacciones/types/monitoreo.types'
import { useFiltrosMonitoreo } from '@/features/transacciones/hooks/useFiltrosMonitoreo'
import {
  construirFilaMonitoreo,
  ordenarPorCriticidad,
} from '@/features/transacciones/utils/criticidad'
import { calcularEstadisticasMonitoreo } from '@/features/transacciones/utils/estadisticasMonitoreo'
import { exigirPermiso } from '@/features/auth/permisos'

export const Route = createFileRoute('/_app/transacciones/monitoreo')({
  beforeLoad: ({ context }) => {
    exigirPermiso(context.sesion.roles, 'monitoreo:ver')
  },
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(monitoreoQueryOptions)
  },
  component: RouteComponent,
})

function RouteComponent() {
  const {
    data: registros = [],
    isPending,
    isError,
    error,
    refetch,
  } = useQuery(monitoreoQueryOptions)

  const filas = useMemo(() => {
    const referencia = new Date()
    return ordenarPorCriticidad(
      registros.map((registro) => construirFilaMonitoreo(registro, referencia)),
    )
  }, [registros])

  const modal = useModal()

  const { valores, cambiarFiltro, limpiarFiltros, filasFiltradas } = useFiltrosMonitoreo(filas)

  const acciones: RowAction<FilaMonitoreo>[] = [
    {
      key: 'gestionar',
      label: 'Gestionar',
      icon: <Pencil size={16} />,
      onClick: async (fila) => {
        const modulo =
          await import('@/features/transacciones/components/MonitoreoCriticidad/GestionMonitoreoModal').catch(
            () => null,
          )
        if (!modulo) {
          toast.error('No se pudo abrir el formulario de gestión')
          return
        }
        await modal.open(modulo.GestionMonitoreoModal, { fila }).catch(() => undefined)
      },
      className: 'text-primary-600',
      hoverClassName: 'hover:bg-primary-50',
    },
  ]

  const filtros = useMemo(() => construirFiltrosMonitoreo(filas), [filas])

  const estadisticas = useMemo(
    () => calcularEstadisticasMonitoreo(filasFiltradas),
    [filasFiltradas],
  )

  return (
    <PageLayout maxWidth="none">
      <Section>
        <PageHeader
          title="Monitoreo de criticidad"
          description={`Gestione la criticidad de las transacciones ingresadas en el sistema.`}
          icon={<CircleDotIcon size={20} />}
          breadcrumbs={[
            { label: 'Transacciones', href: '/transacciones' },
            { label: 'Monitoreo de criticidad' },
          ]}
        />

        <div className="flex flex-col gap-4">
          {isError ? (
            <div className="flex flex-col items-start gap-3 py-8">
              <h2 className="text-base font-semibold text-mercury-900">
                No se pudo cargar el monitoreo
              </h2>
              <p className="text-sm text-mercury-600">
                {error instanceof Error ? error.message : 'Ocurrió un error inesperado'}
              </p>
              <Button variant="secondary" onClick={() => void refetch()}>
                Reintentar
              </Button>
            </div>
          ) : (
            <>
              <PanelEstadisticas estadisticas={estadisticas} />
              <FilterBar
                filters={filtros}
                values={valores}
                onChange={cambiarFiltro}
                onClear={limpiarFiltros}
              />
              <DataTable
                data={filasFiltradas}
                columns={columnasMonitoreo}
                loading={isPending}
                actions={acciones}
                density="compact"
                emptyMessage="No hay procesos que coincidan con los filtros seleccionados"
                title="Lista de Transacciones ingresadas en el sistema y su criticidad"
                description={`Gestione la criticidad de las Transacciones ingresadas en el sistema.`}
                searchable
                renderExpandedRow={(fila) => (
                  <div className="px-2 py-1">
                    <DesgloseFactores fila={fila} />
                  </div>
                )}
              />
            </>
          )}
        </div>
      </Section>
    </PageLayout>
  )
}
