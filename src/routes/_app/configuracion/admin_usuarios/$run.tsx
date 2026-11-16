import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, CircleQuestionMark, CircleX } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/ErrorState'
import { useModal } from '@/components/ui/Modal'
import { PageLayout } from '@/components/ui/PageLayout'
import { ENABLE_PROFILE_IMAGES } from '@/config/env'
import { exigirPermiso } from '@/features/auth/permisos'
import { etiquetaRol } from '@/features/auth/roles'
import { usuarioQueryOptions } from '@/features/usuarios/api/usuarios'
import {
  CuentaUsuario,
  DatosPersonales,
  TarjetaPerfil,
  TarjetaPerfilCargando,
} from '@/features/usuarios/components/PerfilUsuario'
import { useCambioEstadoUsuario } from '@/features/usuarios/hooks/useCambioEstadoUsuario'
import { useQuitarFotoDeUsuario } from '@/features/usuarios/hooks/useQuitarFotoDeUsuario'
import { buscarPortada } from '@/features/usuarios/utils/imagenesPortada'
import { nombreDeUsuario } from '@/features/usuarios/utils/usuario'
import { ApiError } from '@/lib/apiClient'
import { formatFullName, getInitials } from '@/utils/personName'

const RUN_NUMERICO = /^\d+$/

function leerRun(valor: string): number | null {
  if (!RUN_NUMERICO.test(valor)) return null
  const run = Number(valor)
  return run > 0 ? run : null
}

export const Route = createFileRoute('/_app/configuracion/admin_usuarios/$run')({
  beforeLoad: ({ context }) => {
    exigirPermiso(context.sesion.roles, 'usuarios:gestionar')
  },
  loader: ({ context, params }) => {
    const run = leerRun(params.run)

    if (run !== null) {
      void context.queryClient.prefetchQuery(usuarioQueryOptions(run))
    }
  },
  component: PerfilDeUsuario,
})

function PerfilDeUsuario() {
  const { run: parametro } = Route.useParams()
  const run = leerRun(parametro)

  return (
    <PageLayout maxWidth="7xl">
      <div>
        <Link
          to="/configuracion/admin_usuarios"
          className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-primary-600 underline-offset-4 hover:text-primary-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Volver a usuarios
        </Link>
      </div>
      {run === null ? <UsuarioNoEncontrado /> : <ContenidoPerfil run={run} />}
    </PageLayout>
  )
}

function UsuarioNoEncontrado() {
  return (
    <ErrorState
      icon={<CircleQuestionMark size={28} />}
      code="404"
      title="Usuario no encontrado"
      description="No existe un usuario con el RUN indicado."
    />
  )
}

function ContenidoPerfil({ run }: { run: number }) {
  const { data: usuario, isPending, isError, error, refetch } = useQuery(usuarioQueryOptions(run))
  const { open } = useModal()
  const { cambiarEstado } = useCambioEstadoUsuario()
  const { quitarFoto } = useQuitarFotoDeUsuario()

  if (isPending) {
    return <TarjetaPerfilCargando />
  }

  if (isError) {
    if (error instanceof ApiError && error.status === 404) {
      return <UsuarioNoEncontrado />
    }

    return (
      <ErrorState
        icon={<CircleX size={28} />}
        title="No se pudo cargar el perfil"
        description={error.message}
        actions={
          <Button variant="secondary" onClick={() => void refetch()}>
            Reintentar
          </Button>
        }
      />
    )
  }

  const nombre = nombreDeUsuario(usuario)
  const puedeQuitarFoto = ENABLE_PROFILE_IMAGES && usuario.fotoUrl !== null

  const abrirEdicion = async () => {
    const { ModalEditarUsuario } = await import('@/features/usuarios/components/ModalEditarUsuario')
    await open(ModalEditarUsuario, { usuario }).catch(() => undefined)
  }

  return (
    <>
      <TarjetaPerfil
        nombre={formatFullName(nombre)}
        iniciales={getInitials(nombre)}
        semilla={usuario.run}
        foto={usuario.fotoUrl ?? undefined}
        portada={buscarPortada(usuario.portada)}
        roles={usuario.roles.map((rol) => etiquetaRol(rol.nombre))}
        correo={usuario.emailInstitucional ?? usuario.emailEstudiantil}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <DatosPersonales
          run={usuario.run}
          digitoVerificador={usuario.digitoVerificador}
          correoInstitucional={usuario.emailInstitucional}
          correoEstudiantil={usuario.emailEstudiantil}
        />
        <CuentaUsuario
          usuario={usuario}
          onEditar={() => void abrirEdicion()}
          onCambiarEstado={() => void cambiarEstado(usuario, !usuario.estaActivo)}
          onQuitarFoto={puedeQuitarFoto ? () => void quitarFoto(usuario) : undefined}
        />
      </div>
    </>
  )
}
