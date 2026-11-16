import { useCallback, useMemo, useState } from 'react'
import type { TransaccionListado } from '@/features/transacciones/types/transaccion.types'
import type { ExportFormat, RowAction, FetchDataParams } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { FilterBar } from '@/components/ui/FilterBar'
import { useConfirm, useModal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageLayout } from '@/components/ui/PageLayout'
import { Section } from '@/components/ui/Section'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useMutation, useQuery } from '@tanstack/react-query'
import { History, Pencil, ScanBarcode, Trash2, UserCog } from 'lucide-react'
import {
  getTransaccionesSinPaginar,
  transaccionesQueryOptions,
  type ConsultaTransacciones,
} from '@/features/transacciones/api/transacciones'
import { TransaccionUnidadesPanel } from '@/features/transacciones/components/TransaccionUnidadesPanel'
import {
  columnasTransaccion,
  construirFiltrosTransaccion,
  descargarTransacciones,
  nombreArchivoExportacion,
} from '@/features/transacciones/components/TransaccionesTable'
import { useFiltrosTransaccion } from '@/features/transacciones/hooks/useFiltrosTransaccion'
import { TransaccionCreateModal } from '@/features/transacciones/components/TransaccionCreateModal'
import { TransaccionHistorialModal } from '@/features/transacciones/components/TransaccionHistorial'
import { TransaccionEditModal } from '@/features/transacciones/components/TransaccionEditModal'
import { TransaccionAnalistasModal } from '@/features/transacciones/components/TransaccionAnalistas'
import { analistasQueryOptions } from '@/features/transacciones/api/analistas'
import { Card } from '@/components/ui/Card'
import { exigirPermiso } from '@/features/auth/permisos'
import { usePermisos } from '@/features/auth/usePermisos'

const CONSULTA_INICIAL: ConsultaTransacciones = { page: 1, perPage: 10, sort: '-fecha' }

const AVISO_EXPORTACION = 'exportacion-transacciones'

interface SolicitudExportacion {
  formato: ExportFormat
  consulta: ConsultaTransacciones
}

export const Route = createFileRoute('/_app/transacciones/')({
  beforeLoad: ({ context }) => {
    exigirPermiso(context.sesion.roles, 'transacciones:ver')
  },
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(transaccionesQueryOptions(CONSULTA_INICIAL))
  },
  component: RouteComponent,
})

function RouteComponent() {
  const confirm = useConfirm()
  const modal = useModal()
  const { puede } = usePermisos()
  const puedeAsignarAnalistas = puede('transacciones:asignarAnalistas')
  const analistasQuery = useQuery({ ...analistasQueryOptions, enabled: puedeAsignarAnalistas })

  const filtros = useMemo(
    () => construirFiltrosTransaccion(puedeAsignarAnalistas ? (analistasQuery.data ?? []) : null),
    [puedeAsignarAnalistas, analistasQuery.data],
  )

  const [paginado, setPaginado] = useState<ConsultaTransacciones>(CONSULTA_INICIAL)
  const { valores, cambiarFiltro, limpiarFiltros } = useFiltrosTransaccion()

  const consulta: ConsultaTransacciones = { ...paginado, ...valores }

  const { data, isPending, isError, error, refetch } = useQuery(transaccionesQueryOptions(consulta))

  const transacciones = data?.data ?? []
  const total = data?.meta.total ?? 0

  const manejarConsulta = useCallback((params: FetchDataParams) => {
    const direccion = params.sortDirection === 'desc' ? '-' : ''

    setPaginado({
      page: params.page,
      perPage: params.pageSize,
      sort: params.sortField ? `${direccion}${params.sortField}` : '-fecha',
      q: params.searchTerm,
    })
  }, [])

  const manejarPagina = useCallback((page: number) => {
    setPaginado((previos) => ({ ...previos, page }))
  }, [])

  const manejarFiltro = useCallback(
    (clave: string, siguientes: string[]) => {
      cambiarFiltro(clave, siguientes)
      manejarPagina(1)
    },
    [cambiarFiltro, manejarPagina],
  )

  const manejarLimpieza = useCallback(() => {
    limpiarFiltros()
    manejarPagina(1)
  }, [limpiarFiltros, manejarPagina])

  const exportacion = useMutation({
    mutationFn: async (solicitud: SolicitudExportacion) => {
      const registros = await getTransaccionesSinPaginar(solicitud.consulta)

      if (registros.length === 0) {
        return false
      }

      await descargarTransacciones(
        solicitud.formato,
        registros,
        nombreArchivoExportacion(solicitud.formato, new Date()),
      )

      return true
    },
    onMutate: () => {
      toast.loading('Exportando transacciones', { id: AVISO_EXPORTACION })
    },
    onSuccess: (exportado) => {
      if (exportado) {
        toast.dismiss(AVISO_EXPORTACION)
        return
      }

      toast.info('No hay transacciones que exportar.', { id: AVISO_EXPORTACION })
    },
    onError: (errorExportacion) => {
      toast.error(
        errorExportacion instanceof Error
          ? errorExportacion.message
          : 'No fue posible exportar las transacciones',
        { id: AVISO_EXPORTACION },
      )
    },
  })

  const manejarExportacion = (formato: ExportFormat) => {
    if (exportacion.isPending) {
      return
    }

    exportacion.mutate({ formato, consulta })
  }

  const accionEliminar: RowAction<TransaccionListado> = {
    key: 'delete',
    label: 'Eliminar',
    icon: <Trash2 size={16} />,
    onClick: async (row) => {
      const ok = await confirm({
        title: 'Eliminar transacción',
        message: (
          <>
            ¿Está seguro de eliminar la transacción con ID <strong>{row.id}</strong>? Esta acción no
            se puede deshacer.
          </>
        ),
        variant: 'error',
        confirmText: 'Eliminar',
        onConfirm: () => new Promise<void>((resolve) => setTimeout(resolve, 1000)),
      })
      if (ok) {
        toast.success(`Eliminado ID: ${row.id}`)
      } else {
        toast.error(`Eliminación cancelada para ID: ${row.id}`)
      }
    },
    className: 'text-scarlet-600',
    hoverClassName: 'hover:bg-scarlet-50',
  }

  const accionAnalistas: RowAction<TransaccionListado> = {
    key: 'analistas',
    label: 'Gestionar analistas',
    icon: <UserCog size={16} />,
    onClick: (row) => {
      void modal.open(TransaccionAnalistasModal, { transaccionId: row.id }).catch(() => undefined)
    },
    className: 'text-mercury-700',
    hoverClassName: 'hover:bg-mercury-100',
  }

  const actions: RowAction<TransaccionListado>[] = [
    {
      key: 'historial',
      label: 'Historial',
      icon: <History size={16} />,
      onClick: (row) => {
        void modal.open(TransaccionHistorialModal, { transaccionId: row.id }).catch(() => undefined)
      },
      className: 'text-mercury-700',
      hoverClassName: 'hover:bg-mercury-100',
    },
    {
      key: 'edit',
      label: 'Editar',
      icon: <Pencil size={16} />,
      onClick: (row) => {
        void modal.open(TransaccionEditModal, { transaccionId: row.id }).catch(() => undefined)
      },
      className: 'text-primary-600',
      hoverClassName: 'hover:bg-primary-50',
    },
    ...(puedeAsignarAnalistas ? [accionAnalistas] : []),
    ...(puede('transacciones:eliminar') ? [accionEliminar] : []),
  ]

  return (
    <PageLayout maxWidth="none">
      <Section>
        <PageHeader
          title="Transacciones"
          description={`${total} registros totales`}
          icon={<ScanBarcode size={20} />}
          breadcrumbs={[{ label: 'Transacciones' }]}
        />
        <div className="flex flex-col gap-4">
          {isError ? (
            <div className="flex flex-col items-start gap-3 py-8">
              <h2 className="text-base font-semibold text-mercury-900">
                No se pudieron cargar las transacciones
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
              <FilterBar
                filters={filtros}
                values={valores}
                onChange={manejarFiltro}
                onClear={manejarLimpieza}
              />
              <Card>
                <Card.Body noPadding overflow="hidden">
                  <DataTable
                    ariaLabel="Transacciones"
                    data={transacciones}
                    columns={columnasTransaccion}
                    loading={isPending}
                    emptyMessage="No hay transacciones que coincidan con los filtros seleccionados"
                    description={`${total} resultados`}
                    actions={actions}
                    apiMode
                    fetchData={manejarConsulta}
                    totalRows={total}
                    page={paginado.page}
                    onPageChange={manejarPagina}
                    initialPageSize={10}
                    onAdd={() => {
                      void modal.open(TransaccionCreateModal, {}).catch(() => undefined)
                    }}
                    exportable
                    onExport={manejarExportacion}
                    searchable
                    renderExpandedRow={(transaccion) => (
                      <div className="border-l-4 border-primary-500 px-4">
                        <TransaccionUnidadesPanel transaccionId={transaccion.id} />
                      </div>
                    )}
                    getRowCanExpand={(transaccion) => transaccion.solicitudes.total > 0}
                  />
                </Card.Body>
              </Card>
            </>
          )}
        </div>
      </Section>
    </PageLayout>
  )
}
