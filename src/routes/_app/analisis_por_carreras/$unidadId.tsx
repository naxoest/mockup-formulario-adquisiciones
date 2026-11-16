import { useCallback, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Download } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { FilterBar } from '@/components/ui/FilterBar'
import { PageLayout } from '@/components/ui/PageLayout'
import { Section } from '@/components/ui/Section'
import { exigirPermiso } from '@/features/auth/permisos'
import { perfilUnidadQueryOptions } from '@/features/analisis/api/perfilUnidad'
import { GraficoEvolucion } from '@/features/analisis/components/GraficoEvolucion'
import { GraficoModalidad } from '@/features/analisis/components/GraficosReporte'
import {
  columnasDetalleUnidad,
  construirFiltrosDetalleUnidad,
  EncabezadoUnidad,
  IndicadoresUnidad,
} from '@/features/analisis/components/PerfilUnidad'
import { generarReportePerfilUnidadPdf } from '@/features/analisis/components/ReportePdf'
import { busquedaRankingUnidadesSchema } from '@/features/analisis/schemas/busquedaRankingUnidades.schema'
import type { RegistroDetalleUnidad } from '@/features/analisis/types/perfilUnidad.types'
import type { PuntoEvolucion, ResumenModalidad } from '@/features/analisis/types/reporte.types'
import {
  construirFilasDetalleUnidad,
  filtrarDetalleUnidad,
  nombreArchivoPerfilUnidad,
} from '@/features/analisis/utils/perfilUnidad'
import { downloadBlob } from '@/utils/download'

const NO_RECORDS: RegistroDetalleUnidad[] = []
const NO_MODALITIES: ResumenModalidad[] = []
const NO_EVOLUTION: PuntoEvolucion[] = []

export const Route = createFileRoute('/_app/analisis_por_carreras/$unidadId')({
  validateSearch: busquedaRankingUnidadesSchema,
  beforeLoad: ({ context }) => {
    exigirPermiso(context.sesion.roles, 'analisis:ver')
  },
  loader: ({ context, params }) => {
    void context.queryClient.prefetchQuery(perfilUnidadQueryOptions(params.unidadId))
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { unidadId } = Route.useParams()
  const search = Route.useSearch()
  const queryClient = useQueryClient()

  const { data, isPending, isError, error, refetch } = useQuery(perfilUnidadQueryOptions(unidadId))

  const download = useMutation({
    mutationFn: async () => {
      const profile = await queryClient.ensureQueryData(perfilUnidadQueryOptions(unidadId))
      const blob = await generarReportePerfilUnidadPdf(profile)
      return { blob, unitId: profile.unidad.id }
    },
    onSuccess: ({ blob, unitId }) => {
      downloadBlob(blob, nombreArchivoPerfilUnidad(unitId, new Date()))
    },
    onError: (failure: unknown) => {
      toast.error(
        failure instanceof Error ? failure.message : 'No se pudo generar el reporte de la unidad',
      )
    },
  })

  const [filterValues, setFilterValues] = useState<Record<string, string[]>>({})

  const rows = useMemo(() => construirFilasDetalleUnidad(data?.detalle ?? NO_RECORDS), [data])
  const filters = useMemo(() => construirFiltrosDetalleUnidad(rows), [rows])
  const filteredRows = useMemo(() => filtrarDetalleUnidad(rows, filterValues), [rows, filterValues])

  const handleFilterChange = useCallback((key: string, next: string[]) => {
    setFilterValues((previous) => ({ ...previous, [key]: next }))
  }, [])

  const handleClear = useCallback(() => {
    setFilterValues({})
  }, [])

  return (
    <PageLayout maxWidth="none">
      <div>
        <Link
          to="/analisis_por_carreras"
          search={search}
          className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-primary-600 underline-offset-4 hover:text-primary-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Volver al análisis por carrera
        </Link>
      </div>

      {isError ? (
        <Section ariaLabel="Error al cargar el perfil">
          <div className="flex flex-col items-start gap-3 py-8">
            <h2 className="text-base font-semibold text-mercury-900">
              No se pudo cargar el perfil de la unidad
            </h2>
            <p className="text-sm text-mercury-600">
              {error instanceof Error ? error.message : 'Ocurrió un error inesperado'}
            </p>
            <Button variant="secondary" onClick={() => void refetch()}>
              Reintentar
            </Button>
          </div>
        </Section>
      ) : (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <EncabezadoUnidad unidad={data?.unidad} cargando={isPending} />
            </div>
            <Button
              variant="primary"
              className="shrink-0"
              onClick={() => download.mutate()}
              loading={download.isPending}
              disabled={isPending}
            >
              <Download size={16} aria-hidden="true" />
              Descargar reporte PDF
            </Button>
          </div>

          <Section ariaLabel="Indicadores de la unidad" aria-busy={isPending}>
            <IndicadoresUnidad totales={data?.totales} cargando={isPending} />
          </Section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <GraficoModalidad
              porModalidad={data?.porModalidad ?? NO_MODALITIES}
              cargando={isPending}
            />
            <GraficoEvolucion evolucion={data?.evolucion ?? NO_EVOLUTION} cargando={isPending} />
          </div>

          <Section>
            <FilterBar
              filters={filters}
              values={filterValues}
              onChange={handleFilterChange}
              onClear={handleClear}
            />
          </Section>

          <Section>
            <DataTable
              columns={columnasDetalleUnidad}
              data={filteredRows}
              loading={isPending}
              title="Detalle de transacciones"
              description={`${filteredRows.length} ${filteredRows.length === 1 ? 'registro' : 'registros'}`}
              searchable
              pagination
              emptyMessage="No hay registros que coincidan con los filtros aplicados"
            />
          </Section>
        </>
      )}
    </PageLayout>
  )
}
