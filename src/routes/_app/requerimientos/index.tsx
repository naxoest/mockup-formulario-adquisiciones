import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { ClipboardList, Download, Eye, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { DataTable, type RowAction } from '@/components/ui/DataTable'
import { FilterBar } from '@/components/ui/FilterBar'
import { useModal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageLayout } from '@/components/ui/PageLayout'
import { Section } from '@/components/ui/Section'
import {
  estadosRequerimientoQueryOptions,
  requerimientosQueryOptions,
} from '@/features/requerimientos/api/requerimientos'
import { DetalleRequerimientoModal } from '@/features/requerimientos/components/DetalleRequerimiento'
import { PanelEstados } from '@/features/requerimientos/components/PanelEstados'
import {
  columnasRequerimiento,
  construirFiltrosRequerimiento,
} from '@/features/requerimientos/components/TablaRequerimientos'
import { useFiltrosRequerimiento } from '@/features/requerimientos/hooks/useFiltrosRequerimiento'
import { useImportacionPlanilla } from '@/features/requerimientos/hooks/useImportacionPlanilla'
import type {
  OpcionEstadoRequerimiento,
  Requerimiento,
} from '@/features/requerimientos/types/requerimiento.types'
import {
  descargarPlanilla,
  nombreArchivoPlanilla,
} from '@/features/requerimientos/utils/descargaPlanilla'
import { contarPorEstado } from '@/features/requerimientos/utils/filtrosRequerimiento'
import { exigirPermiso } from '@/features/auth/permisos'
import { usePermisos } from '@/features/auth/usePermisos'

const SIN_REQUERIMIENTOS: Requerimiento[] = []
const SIN_ESTADOS: OpcionEstadoRequerimiento[] = []

export const Route = createFileRoute('/_app/requerimientos/')({
  beforeLoad: ({ context }) => {
    exigirPermiso(context.sesion.roles, 'requerimientos:ver')
  },
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(requerimientosQueryOptions)
    void context.queryClient.prefetchQuery(estadosRequerimientoQueryOptions)
  },
  component: RouteComponent,
})

function RouteComponent() {
  const modal = useModal()
  const { puede } = usePermisos()
  const abrirImportacion = useImportacionPlanilla()
  const consultaRequerimientos = useQuery(requerimientosQueryOptions)
  const consultaEstados = useQuery(estadosRequerimientoQueryOptions)

  const requerimientos = consultaRequerimientos.data ?? SIN_REQUERIMIENTOS
  const estados = consultaEstados.data ?? SIN_ESTADOS

  const { valores, cambiarFiltro, limpiarFiltros, filasFiltradas } =
    useFiltrosRequerimiento(requerimientos)

  const filtros = useMemo(
    () => construirFiltrosRequerimiento(requerimientos, estados),
    [requerimientos, estados],
  )

  const conteo = useMemo(() => contarPorEstado(requerimientos, valores), [requerimientos, valores])

  const cargando = consultaRequerimientos.isPending || consultaEstados.isPending
  const hayError = consultaRequerimientos.isError || consultaEstados.isError
  const error = consultaRequerimientos.error ?? consultaEstados.error

  const descarga = useMutation({
    mutationFn: (registros: Requerimiento[]) => {
      const { cr } = registros[0].solicitante
      return descargarPlanilla(registros, nombreArchivoPlanilla(cr, new Date()))
    },
    onError: (errorDescarga) => {
      toast.error(
        errorDescarga instanceof Error
          ? errorDescarga.message
          : 'No fue posible generar la planilla',
      )
    },
  })

  const descargarPlanillaSeleccionada = () => {
    const seleccion = valores.solicitante ?? []

    if (seleccion.length !== 1) {
      toast.info('Seleccione un único solicitante en el filtro para exportar sus requerimientos.')
      return
    }

    const registros = requerimientos.filter(
      (requerimiento) =>
        !requerimiento.eliminado && String(requerimiento.solicitante.id) === seleccion[0],
    )

    if (registros.length === 0) {
      toast.info('El solicitante seleccionado no tiene requerimientos vigentes.')
      return
    }

    descarga.mutate(registros)
  }

  const reintentar = () => {
    void consultaRequerimientos.refetch()
    void consultaEstados.refetch()
  }

  const acciones: RowAction<Requerimiento>[] = [
    {
      key: 'detalle',
      label: 'Ver detalle',
      icon: <Eye size={16} />,
      onClick: async (requerimiento) => {
        await modal.open(DetalleRequerimientoModal, { requerimiento }).catch(() => undefined)
      },
      className: 'text-primary-600',
      hoverClassName: 'hover:bg-primary-50',
    },
  ]

  return (
    <PageLayout maxWidth="none">
      <Section>
        <PageHeader
          title="Requerimientos"
          description="Seguimiento de los requerimientos de carreras y unidades registrados mediante planillas."
          icon={<ClipboardList size={20} />}
          breadcrumbs={[{ label: 'Requerimientos' }]}
        />

        <div className="flex flex-col gap-4">
          {hayError ? (
            <div className="flex flex-col items-start gap-3 py-8">
              <h2 className="text-base font-semibold text-mercury-900">
                No se pudieron cargar los requerimientos
              </h2>
              <p className="text-sm text-mercury-600">
                {error instanceof Error ? error.message : 'Ocurrió un error inesperado'}
              </p>
              <Button variant="secondary" onClick={reintentar}>
                Reintentar
              </Button>
            </div>
          ) : (
            <>
              {!cargando && <PanelEstados estados={estados} conteo={conteo} />}
              <FilterBar
                filters={filtros}
                values={valores}
                onChange={cambiarFiltro}
                onClear={limpiarFiltros}
              />
              <div className="flex flex-wrap justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={descargarPlanillaSeleccionada}
                  loading={descarga.isPending}
                  disabled={cargando}
                >
                  <Download aria-hidden="true" className="size-4" />
                  Exportar
                </Button>
                {puede('requerimientos:importar') && (
                  <Button onClick={() => void abrirImportacion()}>
                    <Upload aria-hidden="true" className="size-4" />
                    Importar planilla
                  </Button>
                )}
              </div>
              <DataTable
                data={filasFiltradas}
                columns={columnasRequerimiento}
                loading={cargando}
                actions={acciones}
                emptyMessage="No hay requerimientos que coincidan con los filtros seleccionados"
                title="Requerimientos registrados"
                description={`${filasFiltradas.length} de ${requerimientos.length} requerimientos`}
                searchable
              />
            </>
          )}
        </div>
      </Section>
    </PageLayout>
  )
}
