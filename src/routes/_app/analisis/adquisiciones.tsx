import { useCallback, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ChartBar } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageLayout } from '@/components/ui/PageLayout'
import { Section } from '@/components/ui/Section'
import { exigirPermiso } from '@/features/auth/permisos'
import { reporteAdquisicionesQueryOptions } from '@/features/analisis/api/reportes'
import { ConfiguracionReporte } from '@/features/analisis/components/ConfiguracionReporte'
import { GraficoEvolucion } from '@/features/analisis/components/GraficoEvolucion'
import {
  GraficoCampus,
  GraficoModalidad,
  GraficoTipo,
  GraficoUnidades,
} from '@/features/analisis/components/GraficosReporte'
import { generarReportePdf } from '@/features/analisis/components/ReportePdf'
import { busquedaAdquisicionesSchema } from '@/features/analisis/schemas/busquedaAdquisiciones.schema'
import type {
  FiltrosReporte,
  PuntoEvolucion,
  ResumenCampus,
  ResumenModalidad,
  ResumenTipo,
  ResumenUnidad,
} from '@/features/analisis/types/reporte.types'
import { busquedaAFiltros, filtrosABusqueda } from '@/features/analisis/utils/filtrosReporte'
import { nombreArchivoReporte } from '@/features/analisis/utils/reporte'
import { downloadBlob } from '@/utils/download'
import { PanelIndicadores } from '@/features/analisis/components/PanelIndicadores'

const SIN_TIPOS: ResumenTipo[] = []
const SIN_MODALIDADES: ResumenModalidad[] = []
const SIN_UNIDADES: ResumenUnidad[] = []
const SIN_CAMPUS: ResumenCampus[] = []
const SIN_EVOLUCION: PuntoEvolucion[] = []

export const Route = createFileRoute('/_app/analisis/adquisiciones')({
  validateSearch: busquedaAdquisicionesSchema,
  loaderDeps: ({ search }) => busquedaAFiltros(search),
  beforeLoad: ({ context }) => {
    exigirPermiso(context.sesion.roles, 'analisis:ver')
  },
  loader: ({ context, deps }) => {
    void context.queryClient.prefetchQuery(reporteAdquisicionesQueryOptions(deps))
  },
  component: RouteComponent,
})

function RouteComponent() {
  const busqueda = Route.useSearch()
  const navigate = useNavigate()

  const filtros = useMemo(() => busquedaAFiltros(busqueda), [busqueda])

  const analizar = useCallback(
    (siguientes: FiltrosReporte) => {
      void navigate({
        to: '/analisis/adquisiciones',
        search: filtrosABusqueda(siguientes),
      })
    },
    [navigate],
  )

  const { data, isPending, isError, error, refetch } = useQuery(
    reporteAdquisicionesQueryOptions(filtros),
  )

  const queryClient = useQueryClient()

  const descarga = useMutation({
    mutationFn: async () => {
      const reporte = await queryClient.ensureQueryData(reporteAdquisicionesQueryOptions(filtros))
      return generarReportePdf(reporte, filtros)
    },
    onSuccess: (blob) => {
      downloadBlob(blob, nombreArchivoReporte(filtros))
    },
    onError: (fallo: unknown) => {
      toast.error(
        fallo instanceof Error ? fallo.message : 'No se pudo generar el reporte de adquisiciones',
      )
    },
  })

  return (
    <PageLayout maxWidth="none">
      <PageHeader
        title="Nuevo reporte ejecutivo"
        description="Configura el periodo, analiza los datos y descarga el PDF"
        icon={<ChartBar size={20} />}
        breadcrumbs={[{ label: 'Análisis' }, { label: 'Adquisiciones' }]}
      />

      <Section title="Configuración del reporte" headingLevel={3}>
        <ConfiguracionReporte
          key={`${filtros.desde ?? ''}|${filtros.hasta ?? ''}|${filtros.titulo ?? ''}|${filtros.etiquetaPeriodo ?? ''}`}
          filtros={filtros}
          cargando={isPending}
          descargando={descarga.isPending}
          onAnalizar={analizar}
          onDescargar={() => descarga.mutate()}
        />
      </Section>

      {isError ? (
        <Section ariaLabel="Error al cargar el reporte">
          <div className="flex flex-col items-start gap-3 py-8">
            <h2 className="text-base font-semibold text-mercury-900">
              No se pudo cargar el reporte de adquisiciones
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
          <Section ariaLabel="Indicadores del periodo" aria-busy={isPending}>
            <PanelIndicadores totales={data?.totales} cargando={isPending} />
          </Section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <GraficoTipo porTipo={data?.porTipo ?? SIN_TIPOS} cargando={isPending} />

            <GraficoModalidad
              porModalidad={data?.porModalidad ?? SIN_MODALIDADES}
              cargando={isPending}
            />

            <GraficoUnidades porUnidad={data?.porUnidad ?? SIN_UNIDADES} cargando={isPending} />

            <GraficoCampus porCampus={data?.porCampus ?? SIN_CAMPUS} cargando={isPending} />
          </div>

          <GraficoEvolucion evolucion={data?.evolucion ?? SIN_EVOLUCION} cargando={isPending} />
        </>
      )}
    </PageLayout>
  )
}
