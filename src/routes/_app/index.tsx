import { useQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { Coins, FileText, Inbox, Percent, PiggyBank, Receipt, ScanBarcode } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { BarChart } from '@/components/ui/BarChart'
import type { BarChartSeries } from '@/components/ui/BarChart'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { LineChart } from '@/components/ui/LineChart'
import type { LineChartSeries } from '@/components/ui/LineChart'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageLayout } from '@/components/ui/PageLayout'
import { Section } from '@/components/ui/Section'
import { Skeleton } from '@/components/ui/Skeleton'
import { firstAllowedPath, navigationItems } from '@/config/navigation'
import { AccesoDenegadoError } from '@/features/auth/errores'
import { tienePermiso } from '@/features/auth/permisos'
import { indicadoresQueryOptions } from '@/features/inicio/api/indicadores'
import { procesarIndicadores } from '@/features/inicio/utils/indicadores'
import type { ChartPalette, ChartTone } from '@/utils/chartColors'
import { cn } from '@/utils/cn'
import { formatCLP } from '@/utils/currency'

export const Route = createFileRoute('/_app/')({
  beforeLoad: ({ context }) => {
    const { roles } = context.sesion
    if (tienePermiso(roles, 'inicio:ver')) return
    const destino = firstAllowedPath(navigationItems, roles)
    if (destino === null) {
      throw new AccesoDenegadoError()
    }
    throw redirect({ to: destino })
  },
  component: HomePage,
})

const RADIO_ANILLO = 16
const CIRCUNFERENCIA_ANILLO = 2 * Math.PI * RADIO_ANILLO

const millonesFormatter = new Intl.NumberFormat('es-CL', {
  maximumFractionDigits: 0,
})

const enteroFormatter = new Intl.NumberFormat('es-CL')

const percentFormatter = new Intl.NumberFormat('es-CL', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

function formatMillones(value: number) {
  return `${millonesFormatter.format(value / 1000000)} M`
}

interface SeriesStyle {
  color: ChartPalette
  tone: ChartTone
}

const seriesStyles = {
  precompromiso: { color: 'mercury', tone: 500 },
  compromiso: { color: 'primary', tone: 700 },
  facturado: { color: 'abyss', tone: 600 },
} as const satisfies Record<string, SeriesStyle>

type KpiAccent = keyof typeof seriesStyles | 'ahorro' | 'transacciones'

const kpiChipClasses: Record<KpiAccent, string> = {
  precompromiso: 'bg-mercury-100 text-mercury-600',
  compromiso: 'bg-primary-100 text-primary-700',
  facturado: 'bg-abyss-100 text-abyss-800',
  ahorro: 'bg-jade-100 text-jade-700',
  transacciones: 'bg-saffron-100 text-saffron-700',
}

type KpiIndicador = 'ninguno' | 'barra' | 'anillo'

interface KpiCard {
  id: string
  icon: LucideIcon
  label: string
  value: string
  note: string
  accent: KpiAccent
  indicador: KpiIndicador
}

const accumulatedSeries: LineChartSeries[] = [
  {
    key: 'precompromiso',
    label: 'Precompromiso acumulado',
    color: seriesStyles.precompromiso.color,
    tone: seriesStyles.precompromiso.tone,
    strokeDasharray: '6 3',
  },
  {
    key: 'compromiso',
    label: 'Compromiso acumulado',
    color: seriesStyles.compromiso.color,
    tone: seriesStyles.compromiso.tone,
  },
  {
    key: 'facturado',
    label: 'Facturado acumulado',
    color: seriesStyles.facturado.color,
    tone: seriesStyles.facturado.tone,
    strokeDasharray: '2 4',
  },
]

const monthlyVariationSeries: BarChartSeries[] = [
  {
    key: 'compromiso',
    label: 'Compromiso presupuestario',
    color: seriesStyles.compromiso.color,
    tone: seriesStyles.compromiso.tone,
  },
  {
    key: 'precompromiso',
    label: 'Precompromiso presupuestario',
    color: seriesStyles.precompromiso.color,
    tone: seriesStyles.precompromiso.tone,
  },
  {
    key: 'facturado',
    label: 'Facturado',
    color: seriesStyles.facturado.color,
    tone: seriesStyles.facturado.tone,
  },
]

function AnilloFacturado({ porcentaje }: { porcentaje: number }) {
  const clamped = Math.max(0, Math.min(porcentaje, 1))
  const arco = CIRCUNFERENCIA_ANILLO * clamped

  return (
    <svg viewBox="0 0 40 40" className="size-10 shrink-0 -rotate-90" aria-hidden="true">
      <circle
        cx="20"
        cy="20"
        r={RADIO_ANILLO}
        fill="none"
        strokeWidth="5"
        className="stroke-mercury-200"
      />
      <circle
        cx="20"
        cy="20"
        r={RADIO_ANILLO}
        fill="none"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={`${arco} ${CIRCUNFERENCIA_ANILLO}`}
        className="stroke-abyss-600"
      />
    </svg>
  )
}

function BarraComprometido({ porcentaje }: { porcentaje: number }) {
  const clampedWidth = Math.max(0, Math.min(porcentaje * 100, 100))
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-mercury-200">
      <div
        className="h-full rounded-full bg-primary-700 transition-all duration-300"
        style={{ width: `${clampedWidth}%` }}
      />
    </div>
  )
}

function HomePage() {
  const { data, isPending, isError, error, refetch } = useQuery(indicadoresQueryOptions())

  const {
    precompromisoAcumulado,
    compromisoAcumulado,
    facturadoAcumulado,
    ahorroProcesosConcursales,
    porcentajeComprometido,
    porcentajeFacturado,
    cantidadTransacciones,
    fechaCorte,
    accumulatedData,
    monthlyVariationData,
  } = procesarIndicadores(data)

  if (isPending) {
    return (
      <PageLayout maxWidth="none" spacing="tight">
        <PageHeader title="Inicio" description="Cargando resumen presupuestario..." />

        <section aria-labelledby="indicadores-cargando">
          <h2 id="indicadores-cargando" className="sr-only">
            Indicadores acumulados
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index}>
                <Card.Body className="flex h-full flex-col gap-2">
                  <Skeleton width={40} height={40} rounded="full" />

                  <div className="flex min-h-8 items-center">
                    <Skeleton width="75%" height="0.875rem" />
                  </div>

                  <div className="flex min-h-10 items-center justify-between gap-2">
                    <Skeleton width="60%" height="2rem" />
                    {index === 3 && <Skeleton width={40} height={40} rounded="full" />}
                  </div>

                  {index === 1 && <Skeleton width="100%" height={6} rounded="full" />}

                  <div className="pt-1">
                    <Skeleton width="85%" height="0.75rem" />
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        </section>

        <section aria-labelledby="evolucion-cargando">
          <h2 id="evolucion-cargando" className="sr-only">
            Evolución presupuestaria
          </h2>

          <div className="grid gap-4 2xl:grid-cols-2">
            <Card>
              <Card.Header>
                <Card.Title>
                  Evolución acumulada del precompromiso, compromiso y facturado (CLP)
                </Card.Title>
              </Card.Header>
              <Card.Body>
                <Skeleton height={320} className="w-full" />
              </Card.Body>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title>
                  Variación mensual del precompromiso, compromiso y facturado (CLP)
                </Card.Title>
              </Card.Header>
              <Card.Body>
                <Skeleton height={320} className="w-full" />
              </Card.Body>
            </Card>
          </div>
        </section>
      </PageLayout>
    )
  }

  if (isError) {
    return (
      <PageLayout maxWidth="none" spacing="tight">
        <PageHeader title="Inicio" description="Resumen presupuestario." />

        <Section ariaLabel="Error al cargar el resumen presupuestario">
          <div className="flex flex-col items-start gap-3 py-8">
            <h2 className="text-base font-semibold text-mercury-900">
              No se pudo cargar el resumen presupuestario
            </h2>
            <p className="text-sm text-mercury-600">
              {error instanceof Error ? error.message : 'Ocurrió un error inesperado'}
            </p>
            <Button variant="secondary" onClick={() => void refetch()}>
              Reintentar
            </Button>
          </div>
        </Section>
      </PageLayout>
    )
  }

  const sinDatos = !data || data.serie.length === 0

  const transaccionesCard: KpiCard = {
    id: 'transacciones',
    icon: ScanBarcode,
    label: 'Cantidad de transacciones',
    value: enteroFormatter.format(cantidadTransacciones),
    note: `Total de transacciones acumuladas al ${fechaCorte}.`,
    accent: 'transacciones',
    indicador: 'ninguno',
  }

  const kpiCards: KpiCard[] = sinDatos
    ? [transaccionesCard]
    : [
        {
          id: 'precompromiso',
          icon: PiggyBank,
          label: 'Precompromiso presupuestario acumulado',
          value: formatCLP(precompromisoAcumulado),
          note: `Monto total precomprometido acumulado al ${fechaCorte}.`,
          accent: 'precompromiso',
          indicador: 'ninguno',
        },
        {
          id: 'compromiso',
          icon: FileText,
          label: 'Compromiso presupuestario acumulado',
          value: formatCLP(compromisoAcumulado),
          note: `Equivale al ${percentFormatter.format(porcentajeComprometido)} de lo precomprometido al ${fechaCorte}.`,
          accent: 'compromiso',
          indicador: 'barra',
        },
        {
          id: 'facturado',
          icon: Receipt,
          label: 'Facturado acumulado',
          value: formatCLP(facturadoAcumulado),
          note: `Monto total facturado acumulado al ${fechaCorte}.`,
          accent: 'facturado',
          indicador: 'ninguno',
        },
        {
          id: 'porcentaje-facturado',
          icon: Percent,
          label: 'Porcentaje facturado respecto al comprometido',
          value: percentFormatter.format(porcentajeFacturado),
          note: 'Relación entre lo facturado acumulado y lo comprometido acumulado.',
          accent: 'facturado',
          indicador: 'anillo',
        },
        {
          id: 'ahorro',
          icon: Coins,
          label: 'Ahorro en procesos concursales',
          value: formatCLP(ahorroProcesosConcursales),
          note: `Ahorro acumulado generado en procesos concursales al ${fechaCorte}.`,
          accent: 'ahorro',
          indicador: 'ninguno',
        },
        transaccionesCard,
      ]

  return (
    <PageLayout maxWidth="none" spacing="tight">
      <PageHeader
        title="Inicio"
        description={`Resumen presupuestario acumulado al ${fechaCorte}.`}
      />

      <section aria-labelledby="indicadores-acumulados">
        <h2 id="indicadores-acumulados" className="sr-only">
          Indicadores acumulados
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {kpiCards.map(({ id, icon: Icon, label, value, note, accent, indicador }) => (
            <Card key={id}>
              <Card.Body className="flex h-full flex-col gap-2">
                <span
                  className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-full',
                    kpiChipClasses[accent],
                  )}
                >
                  <Icon size={20} aria-hidden="true" />
                </span>

                <p className="min-h-8 text-xs font-semibold uppercase leading-4 tracking-wide text-mercury-600">
                  {label}
                </p>

                <div className="flex min-h-10 items-center justify-between gap-2">
                  <p className="text-2xl font-bold tabular-nums text-primary-700">{value}</p>
                  {indicador === 'anillo' && <AnilloFacturado porcentaje={porcentajeFacturado} />}
                </div>

                {indicador === 'barra' && <BarraComprometido porcentaje={porcentajeComprometido} />}

                <p className="text-xs leading-relaxed text-mercury-500">{note}</p>
              </Card.Body>
            </Card>
          ))}
        </div>
      </section>

      {sinDatos ? (
        <Card>
          <Card.Body className="flex min-h-[360px] flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-mercury-100 text-mercury-500">
              <Inbox size={24} aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-semibold text-mercury-900">
                Sin movimientos presupuestarios
              </h2>
              <p className="max-w-md text-sm text-mercury-600">
                No se registran movimientos presupuestarios para el año en curso al {fechaCorte}.
              </p>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <section aria-labelledby="evolucion-presupuestaria">
          <h2 id="evolucion-presupuestaria" className="sr-only">
            Evolución presupuestaria
          </h2>

          <div className="grid gap-4 2xl:grid-cols-2">
            <Card>
              <Card.Header>
                <Card.Title>
                  Evolución acumulada del precompromiso, compromiso y facturado (CLP)
                </Card.Title>
              </Card.Header>

              <Card.Body>
                <LineChart
                  data={accumulatedData}
                  categoryKey="period"
                  series={accumulatedSeries}
                  formatValue={formatCLP}
                  formatCompactValue={formatMillones}
                  height={320}
                  ariaLabel={`Evolución acumulada del precompromiso, compromiso y facturado, en pesos chilenos, hasta el ${fechaCorte}`}
                />
              </Card.Body>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title>
                  Variación mensual del precompromiso, compromiso y facturado (CLP)
                </Card.Title>
              </Card.Header>

              <Card.Body>
                <BarChart
                  data={monthlyVariationData}
                  categoryKey="period"
                  series={monthlyVariationSeries}
                  formatValue={formatCLP}
                  formatCompactValue={formatMillones}
                  showValueLabels
                  height={320}
                  ariaLabel={`Variación mensual del precompromiso, compromiso y facturado, en pesos chilenos, hasta el ${fechaCorte}`}
                />
              </Card.Body>
            </Card>
          </div>
        </section>
      )}
    </PageLayout>
  )
}
