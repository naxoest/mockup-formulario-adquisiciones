import { useCallback, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Pencil, Power, PowerOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DataTable, type FetchDataParams, type RowAction } from '@/components/ui/DataTable'
import { FilterBar } from '@/components/ui/FilterBar'
import { useModal } from '@/components/ui/Modal'
import {
  sedesQueryOptions,
  tiposSolicitanteQueryOptions,
  unidadesSolicitantesQueryOptions,
  type ConsultaUnidades,
} from '@/features/mantenedor/api/unidadesSolicitantes'
import {
  construirColumnasUnidades,
  construirFiltrosUnidades,
} from '@/features/mantenedor/components/UnidadesTable'
import { useCambioEstadoUnidad } from '@/features/mantenedor/hooks/useCambioEstadoUnidad'
import { useFiltrosUnidad } from '@/features/mantenedor/hooks/useFiltrosUnidad'
import type { UnidadSolicitante } from '@/features/mantenedor/types/unidadSolicitante.types'
import type { SelectOption } from '@/types/select'

type PaginadoUnidades = Pick<ConsultaUnidades, 'page' | 'perPage' | 'sort' | 'q'>

const ORDEN_INICIAL = 'nombre'
const TAMANO_PAGINA_INICIAL = 10
const SIN_OPCIONES: SelectOption[] = []

const PAGINADO_INICIAL: PaginadoUnidades = {
  page: 1,
  perPage: TAMANO_PAGINA_INICIAL,
  sort: ORDEN_INICIAL,
  q: '',
}

export function SeccionUnidades() {
  const [paginado, setPaginado] = useState<PaginadoUnidades>(PAGINADO_INICIAL)
  const { valores, cambiarFiltro, limpiarFiltros } = useFiltrosUnidad()
  const { open } = useModal()
  const { cambiarEstado } = useCambioEstadoUnidad()

  const consulta: ConsultaUnidades = {
    ...paginado,
    tipo: valores.tipo,
    sede: valores.sede,
    estado: valores.estado,
  }

  const { data, isPending, isError, error, refetch } = useQuery(
    unidadesSolicitantesQueryOptions(consulta),
  )
  const consultaTipos = useQuery(tiposSolicitanteQueryOptions)
  const consultaSedes = useQuery(sedesQueryOptions)
  const tipos = consultaTipos.data ?? SIN_OPCIONES
  const sedes = consultaSedes.data ?? SIN_OPCIONES
  const catalogosFallidos = consultaTipos.isLoadingError || consultaSedes.isLoadingError

  const filtros = useMemo(() => construirFiltrosUnidades(tipos, sedes), [tipos, sedes])
  const columnas = useMemo(() => construirColumnasUnidades(sedes), [sedes])

  const manejarConsulta = useCallback((params: FetchDataParams) => {
    const direccion = params.sortDirection === 'desc' ? '-' : ''

    setPaginado({
      page: params.page,
      perPage: params.pageSize,
      sort: params.sortField ? `${direccion}${params.sortField}` : ORDEN_INICIAL,
      q: params.searchTerm,
    })
  }, [])

  const manejarPagina = useCallback((page: number) => {
    setPaginado((previos) => ({ ...previos, page }))
  }, [])

  const manejarFiltro = (clave: string, siguientes: string[]) => {
    cambiarFiltro(clave, siguientes)
    manejarPagina(1)
  }

  const manejarLimpieza = () => {
    limpiarFiltros()
    manejarPagina(1)
  }

  const abrirFormulario = async (unidad?: UnidadSolicitante) => {
    const { ModalUnidadSolicitante } =
      await import('@/features/mantenedor/components/ModalUnidadSolicitante')
    await open(ModalUnidadSolicitante, { unidad }).catch(() => undefined)
  }

  const acciones: RowAction<UnidadSolicitante>[] = [
    {
      key: 'editar',
      label: 'Editar',
      icon: <Pencil size={16} />,
      onClick: (unidad) => {
        void abrirFormulario(unidad)
      },
    },
    {
      key: 'desactivar',
      label: 'Desactivar',
      icon: <PowerOff size={16} />,
      className: 'text-scarlet-600',
      hoverClassName: 'hover:text-scarlet-700',
      onClick: (unidad) => {
        void cambiarEstado(unidad, false)
      },
    },
    {
      key: 'activar',
      label: 'Activar',
      icon: <Power size={16} />,
      onClick: (unidad) => {
        void cambiarEstado(unidad, true)
      },
    },
  ]

  const mostrarAccion = (accion: RowAction<UnidadSolicitante>, unidad: UnidadSolicitante) => {
    if (accion.key === 'desactivar') return unidad.activo
    if (accion.key === 'activar') return !unidad.activo
    return true
  }

  const reintentar = () => {
    void refetch()
    void consultaTipos.refetch()
    void consultaSedes.refetch()
  }

  if (isError || catalogosFallidos) {
    const causa = error ?? consultaTipos.error ?? consultaSedes.error

    return (
      <div className="flex flex-col items-start gap-3 py-8">
        <h2 className="text-base font-semibold text-mercury-900">
          No se pudieron cargar las carreras y unidades
        </h2>
        <p className="text-sm text-mercury-600">
          {causa instanceof Error ? causa.message : 'Ocurrió un error inesperado'}
        </p>
        <Button variant="secondary" onClick={reintentar}>
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-mercury-600">
        Registros: {data?.resumen.registros ?? 0}. Inactivos: {data?.resumen.inactivos ?? 0}.
      </p>
      <FilterBar
        filters={filtros}
        values={valores}
        onChange={manejarFiltro}
        onClear={manejarLimpieza}
      />
      <Card>
        <Card.Body noPadding overflow="hidden">
          <DataTable
            ariaLabel="Carreras y unidades"
            columns={columnas}
            data={data?.data ?? []}
            loading={isPending}
            apiMode
            fetchData={manejarConsulta}
            totalRows={data?.meta.total ?? 0}
            page={paginado.page}
            onPageChange={manejarPagina}
            initialPageSize={TAMANO_PAGINA_INICIAL}
            onAdd={() => {
              void abrirFormulario()
            }}
            actions={acciones}
            shouldShowActions={mostrarAccion}
            maxVisibleActions={2}
            mobileView="table"
            emptyMessage="No hay carreras ni unidades que coincidan con los filtros"
          />
        </Card.Body>
      </Card>
    </div>
  )
}
