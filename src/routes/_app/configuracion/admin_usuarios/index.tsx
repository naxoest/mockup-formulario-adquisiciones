import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Pencil, UserCheck, Users, UserX } from 'lucide-react'
import { useModal } from '@/components/ui/Modal'
import { Card } from '@/components/ui/Card'
import { DataTable } from '@/components/ui/DataTable'
import { FilterBar } from '@/components/ui/FilterBar'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageLayout } from '@/components/ui/PageLayout'
import { rolesQueryOptions } from '@/features/usuarios/api/roles'
import { usuariosQueryOptions } from '@/features/usuarios/api/usuarios'
import {
  columnasUsuarios,
  construirFiltrosUsuarios,
} from '@/features/usuarios/components/UsuariosTable'
import { useCambioEstadoUsuario } from '@/features/usuarios/hooks/useCambioEstadoUsuario'
import { useFiltrosUsuario } from '@/features/usuarios/hooks/useFiltrosUsuario'
import type { RowAction } from '@/components/ui/DataTable'
import type { Usuario } from '@/features/usuarios/types/usuario.types'
import { exigirPermiso } from '@/features/auth/permisos'

export const Route = createFileRoute('/_app/configuracion/admin_usuarios/')({
  beforeLoad: ({ context }) => {
    exigirPermiso(context.sesion.roles, 'usuarios:gestionar')
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { data: usuarios = [], isLoading } = useQuery(usuariosQueryOptions)
  const { data: roles = [] } = useQuery(rolesQueryOptions)

  const { valores, cambiarFiltro, limpiarFiltros, usuariosFiltrados } = useFiltrosUsuario(usuarios)

  const filtros = useMemo(() => construirFiltrosUsuarios(roles), [roles])

  const inactivos = usuarios.filter((usuario) => !usuario.estaActivo).length

  const { open } = useModal()

  const { cambiarEstado } = useCambioEstadoUsuario()

  const abrirCreacion = async () => {
    const { ModalCrearUsuario } = await import('@/features/usuarios/components/ModalCrearUsuario')
    await open(ModalCrearUsuario, {}).catch(() => undefined)
  }

  const abrirEdicion = async (usuario: Usuario) => {
    const { ModalEditarUsuario } = await import('@/features/usuarios/components/ModalEditarUsuario')
    await open(ModalEditarUsuario, { usuario }).catch(() => undefined)
  }

  const acciones: RowAction<Usuario>[] = [
    {
      key: 'editar',
      label: 'Editar',
      icon: <Pencil size={16} />,
      onClick: (usuario) => {
        void abrirEdicion(usuario)
      },
    },
    {
      key: 'desactivar',
      label: 'Desactivar',
      icon: <UserX size={16} />,
      className: 'text-scarlet-600',
      hoverClassName: 'hover:text-scarlet-700',
      onClick: (usuario) => {
        void cambiarEstado(usuario, false)
      },
    },
    {
      key: 'activar',
      label: 'Activar',
      icon: <UserCheck size={16} />,
      onClick: (usuario) => {
        void cambiarEstado(usuario, true)
      },
    },
  ]

  const mostrarAccion = (accion: RowAction<Usuario>, usuario: Usuario) => {
    if (accion.key === 'desactivar') return usuario.estaActivo
    if (accion.key === 'activar') return !usuario.estaActivo
    return true
  }

  return (
    <PageLayout maxWidth="none">
      <PageHeader
        title="Usuarios"
        description={`${usuarios.length} usuarios, ${inactivos} inactivos`}
        icon={<Users className="size-5" />}
      />
      <FilterBar
        filters={filtros}
        values={valores}
        onChange={cambiarFiltro}
        onClear={limpiarFiltros}
      />
      <Card>
        <Card.Body noPadding overflow="hidden">
          <DataTable
            ariaLabel="Usuarios"
            columns={columnasUsuarios}
            data={usuariosFiltrados}
            loading={isLoading}
            onAdd={abrirCreacion}
            actions={acciones}
            shouldShowActions={mostrarAccion}
            maxVisibleActions={2}
            pagination={false}
            mobileView="table"
            emptyMessage="No hay usuarios que coincidan con los filtros"
          />
        </Card.Body>
      </Card>
    </PageLayout>
  )
}
