import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { History, Upload } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageLayout } from '@/components/ui/PageLayout'
import { Section } from '@/components/ui/Section'
import { importacionesRequerimientosQueryOptions } from '@/features/requerimientos/api/importaciones'
import { columnasImportacion } from '@/features/requerimientos/components/TablaImportaciones'
import { useImportacionPlanilla } from '@/features/requerimientos/hooks/useImportacionPlanilla'
import type { Importacion } from '@/features/requerimientos/types/importacion.types'
import { exigirPermiso } from '@/features/auth/permisos'
import { usePermisos } from '@/features/auth/usePermisos'

const SIN_IMPORTACIONES: Importacion[] = []

export const Route = createFileRoute('/_app/requerimientos/importaciones')({
  beforeLoad: ({ context }) => {
    exigirPermiso(context.sesion.roles, 'requerimientos:ver')
  },
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(importacionesRequerimientosQueryOptions)
  },
  component: RouteComponent,
})

function RouteComponent() {
  const abrirImportacion = useImportacionPlanilla()
  const { puede } = usePermisos()
  const {
    data: importaciones = SIN_IMPORTACIONES,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery(importacionesRequerimientosQueryOptions)

  return (
    <PageLayout maxWidth="none">
      <Section>
        <PageHeader
          title="Historial de importaciones"
          description="Cada carga de una planilla queda registrada, se haya confirmado o descartado. Se registran el nombre del archivo y sus datos; el archivo no se almacena."
          icon={<History size={20} />}
          breadcrumbs={[
            { label: 'Requerimientos', href: '/requerimientos' },
            { label: 'Historial de importaciones' },
          ]}
        />

        <div className="flex flex-col gap-4">
          {isError ? (
            <div className="flex flex-col items-start gap-3 py-8">
              <h2 className="text-base font-semibold text-mercury-900">
                No se pudo cargar el historial de importaciones
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
              {puede('requerimientos:importar') && (
                <div className="flex flex-wrap justify-end gap-3">
                  <Button onClick={() => void abrirImportacion()}>
                    <Upload aria-hidden="true" className="size-4" />
                    Importar planilla
                  </Button>
                </div>
              )}
              <DataTable
                data={importaciones}
                columns={columnasImportacion}
                loading={isPending}
                emptyMessage="No hay importaciones registradas"
                title="Importaciones registradas"
                description="De la más reciente a la más antigua"
                searchable
              />
            </>
          )}
        </div>
      </Section>
    </PageLayout>
  )
}
