import { useCallback, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Pencil, Power, PowerOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DataTable, type FetchDataParams, type RowAction } from '@/components/ui/DataTable'
import { FilterBar } from '@/components/ui/FilterBar'
import { useModal } from '@/components/ui/Modal'
import { proyectosQueryOptions, type ConsultaProyectos } from '@/features/mantenedor/api/proyectos'
import {
  construirColumnasProyectos,
  construirFiltrosProyectos,
} from '@/features/mantenedor/components/ProyectosTable'
import { useCambioEstadoProyecto } from '@/features/mantenedor/hooks/useCambioEstadoProyecto'
import { useFiltrosProyecto } from '@/features/mantenedor/hooks/useFiltrosProyecto'
import type { Proyecto } from '@/features/mantenedor/types/proyecto.types'

type PaginadoProyectos = Pick<ConsultaProyectos, 'page' | 'perPage' | 'sort' | 'q'>

const ORDEN_INICIAL = 'nombre'
const TAMANO_PAGINA_INICIAL = 10

const PAGINADO_INICIAL: PaginadoProyectos = {
  page: 1,
  perPage: TAMANO_PAGINA_INICIAL,
  sort: ORDEN_INICIAL,
  q: '',
}

export function SeccionProyectos() {
  const [paginado, setPaginado] = useState<PaginadoProyectos>(PAGINADO_INICIAL)
  const { valores, cambiarFiltro, limpiarFiltros } = useFiltrosProyecto()
  const { open } = useModal()

  const consulta: ConsultaProyectos = {
    ...paginado,
    estado: valores.estado,
  }

  const { data, isPending, isError, error, refetch } = useQuery(proyectosQueryOptions(consulta))

  const { cambiarEstado } = useCambioEstadoProyecto()

  const filtros = useMemo(() => construirFiltrosProyectos(), [])
  const columnas = useMemo(() => construirColumnasProyectos(), [])

  const abrirFormulario = async (proyecto?: Proyecto) => {
    const { ModalProyecto } = await import('@/features/mantenedor/components/ModalProyecto')
    await open(ModalProyecto, { proyecto }).catch(() => undefined)
  }

  const acciones: RowAction<Proyecto>[] = [
    {
      key: 'editar',
      label: 'Editar',
      icon: <Pencil size={16} />,
      onClick: (proyecto) => {
        void abrirFormulario(proyecto)
      },
    },
    {
      key: 'desactivar',
      label: 'Desactivar',
      icon: <PowerOff size={16} />,
      className: 'text-scarlet-600',
      hoverClassName: 'hover:text-scarlet-700',
      onClick: (proyecto) => {
        void cambiarEstado(proyecto, false)
      },
    },
    {
      key: 'activar',
      label: 'Activar',
      icon: <Power size={16} />,
      onClick: (proyecto) => {
        void cambiarEstado(proyecto, true)
      },
    },
  ]

  const mostrarAccion = (accion: RowAction<Proyecto>, proyecto: Proyecto) => {
    if (accion.key === 'desactivar') return proyecto.activo
    if (accion.key === 'activar') return !proyecto.activo
    return true
  }

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

  if (isError) {
    return (
      <div className="flex flex-col items-start gap-3 py-8">
        <h2 className="text-base font-semibold text-mercury-900">
          No se pudieron cargar los proyectos
        </h2>
        <p className="text-sm text-mercury-600">
          {error instanceof Error ? error.message : 'Ocurrió un error inesperado'}
        </p>
        <Button variant="secondary" onClick={() => void refetch()}>
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
            ariaLabel="Proyectos"
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
            emptyMessage="No hay proyectos que coincidan con los filtros"
          />
        </Card.Body>
      </Card>
    </div>
  )
}
