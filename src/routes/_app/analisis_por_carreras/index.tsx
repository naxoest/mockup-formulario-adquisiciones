import { useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Calendar, ChartSpline, Eye } from 'lucide-react'
import { BarChart, type ChartDataRow } from '@/components/ui/BarChart'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DataTable, type RowAction } from '@/components/ui/DataTable'
import { FilterBar } from '@/components/ui/FilterBar'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageLayout } from '@/components/ui/PageLayout'
import { Section } from '@/components/ui/Section'
import { Skeleton } from '@/components/ui/Skeleton'
import { exigirPermiso } from '@/features/auth/permisos'
import { rankingUnidadesQueryOptions } from '@/features/analisis/api/rankingUnidades'
import {
  columnasRankingUnidades,
  construirFiltrosRankingUnidades,
} from '@/features/analisis/components/RankingUnidades'
import { busquedaRankingUnidadesSchema } from '@/features/analisis/schemas/busquedaRankingUnidades.schema'
import type {
  FilaRankingUnidad,
  ResumenRankingUnidad,
} from '@/features/analisis/types/rankingUnidades.types'
import {
  acotarFiltrosAlAnio,
  aplicarCambioFiltro,
  busquedaAFiltros,
  construirFilasRanking,
  filtrosABusqueda,
  filtrosAValores,
} from '@/features/analisis/utils/filtrosRankingUnidades'
import { periodosPresupuestariosQueryOptions } from '@/features/transacciones/api/listas'
import { formatCLP } from '@/utils/currency'

const NO_SUMMARIES: ResumenRankingUnidad[] = []

export const Route = createFileRoute('/_app/analisis_por_carreras/')({
  validateSearch: busquedaRankingUnidadesSchema,
  loaderDeps: ({ search }) => busquedaAFiltros(search),
  beforeLoad: ({ context }) => {
    exigirPermiso(context.sesion.roles, 'analisis:ver')
  },
  loader: async ({ context, deps }) => {
    const periodos = await context.queryClient.ensureQueryData(periodosPresupuestariosQueryOptions)
    const anio = periodos.find((p) => p.enCurso)?.anio
    if (anio !== undefined) {
      void context.queryClient.prefetchQuery(
        rankingUnidadesQueryOptions(acotarFiltrosAlAnio(deps, anio)),
      )
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const search = Route.useSearch()
  const navigate = useNavigate()

  const { data: periodos, isPending: isPendingPeriodos } = useQuery(
    periodosPresupuestariosQueryOptions,
  )

  const anioEnCurso = useMemo(() => periodos?.find((p) => p.enCurso)?.anio, [periodos])

  const filters = useMemo(() => busquedaAFiltros(search), [search])
  const filterValues = useMemo(() => filtrosAValores(filters), [filters])

  const filtrosConsulta = useMemo(
    () => (anioEnCurso !== undefined ? acotarFiltrosAlAnio(filters, anioEnCurso) : null),
    [filters, anioEnCurso],
  )

  const filtrosBarra = useMemo(() => construirFiltrosRankingUnidades(anioEnCurso), [anioEnCurso])

  const {
    data,
    isPending: isPendingRanking,
    isError,
    error,
    refetch,
  } = useQuery({
    ...rankingUnidadesQueryOptions(filtrosConsulta ?? filters),
    enabled: anioEnCurso !== undefined,
  })

  const isPending = isPendingPeriodos || isPendingRanking

  const rows = useMemo(() => construirFilasRanking(data?.data ?? NO_SUMMARIES), [data])

  const chartData = useMemo<ChartDataRow[]>(
    () =>
      rows.map((row) => ({
        unidad_solicitante: row.nombre,
        monto: row.comprometido,
      })),
    [rows],
  )

  const handleFilterChange = useCallback(
    (key: string, next: string[]) => {
      void navigate({
        to: '/analisis_por_carreras',
        search: filtrosABusqueda(aplicarCambioFiltro(filters, key, next)),
      })
    },
    [filters, navigate],
  )

  const handleClear = useCallback(() => {
    void navigate({ to: '/analisis_por_carreras', search: {} })
  }, [navigate])

  const actions = useMemo<RowAction<FilaRankingUnidad>[]>(
    () => [
      {
        key: 'verPerfil',
        label: 'Ver perfil',
        icon: <Eye size={16} />,
        onClick: (row) => {
          void navigate({
            to: '/analisis_por_carreras/$unidadId',
            params: { unidadId: String(row.id) },
            search,
          })
        },
        className: 'text-primary-600',
        hoverClassName: 'hover:bg-primary-50',
      },
    ],
    [navigate, search],
  )

  const lastPosition = rows.length

  const getRowClassName = useCallback(
    (row: FilaRankingUnidad): string | undefined => {
      if (row.posicion === 1) return 'bg-saffron-50'
      if (row.posicion === lastPosition) return 'bg-primary-50'
      return undefined
    },
    [lastPosition],
  )

  return (
    <PageLayout maxWidth="none">
      <PageHeader
        title="Análisis por Carrera"
        description="Visualiza el gasto de cada unidad y descarga soportes individuales"
        icon={<ChartSpline size={20} />}
        breadcrumbs={[{ label: 'Análisis por Carrera' }]}
        actions={
          anioEnCurso !== undefined ? (
            <Badge variant="neutral" size="md">
              Año en curso: {anioEnCurso}
            </Badge>
          ) : undefined
        }
      />

      {isPendingPeriodos ? (
        <Section ariaLabel="Cargando año en curso">
          <Skeleton height={320} />
        </Section>
      ) : anioEnCurso === undefined ? (
        <Section ariaLabel="Sin año en curso definido">
          <Card>
            <Card.Body className="flex min-h-[320px] flex-col items-center justify-center gap-3 p-8 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-mercury-100 text-mercury-500">
                <Calendar size={24} aria-hidden="true" />
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-base font-semibold text-mercury-900">
                  Sin año en curso definido
                </h2>
                <p className="max-w-md text-sm text-mercury-600">
                  No hay un periodo presupuestario definido como año en curso en el sistema.
                </p>
              </div>
            </Card.Body>
          </Card>
        </Section>
      ) : (
        <>
          <Section>
            <FilterBar
              filters={filtrosBarra}
              values={filterValues}
              onChange={handleFilterChange}
              onClear={handleClear}
            />
          </Section>

          {isError ? (
            <Section ariaLabel="Error al cargar el ranking">
              <div className="flex flex-col items-start gap-3 py-8">
                <h2 className="text-base font-semibold text-mercury-900">
                  No se pudo cargar el ranking de unidades
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
              <Section
                title="Top 4 Carreras por Monto de Gasto"
                description="Ranking de las 4 unidades y/o carreras que más gastos acumulan dado los filtros indicados."
              >
                <BarChart
                  data={chartData}
                  categoryKey="unidad_solicitante"
                  series={[{ key: 'monto', label: 'Monto facturado', color: 'primary' }]}
                  //(orientation="horizontal" TODO: Arreglar el bug de visualización en modo horizontal en el componente de BarChart
                  formatValue={formatCLP}
                  ariaLabel="Top 4 Carreras por Monto de Gasto"
                  height={320}
                />
              </Section>

              <Section>
                <DataTable
                  columns={columnasRankingUnidades}
                  data={rows}
                  loading={isPending}
                  actions={actions}
                  rowClassName={getRowClassName}
                  title="Top 4 Carreras por Monto de Gasto"
                  description="Lista de las 4 carreras que más montos de gasto presentan en el periodo indicado"
                  emptyMessage="No hay transacciones que coincidan con los filtros aplicados"
                />
              </Section>
            </>
          )}
        </>
      )}
    </PageLayout>
  )
}
