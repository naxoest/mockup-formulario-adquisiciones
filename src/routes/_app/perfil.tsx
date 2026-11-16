import { createFileRoute } from '@tanstack/react-router'
import { useModal } from '@/components/ui/Modal'
import { PageLayout } from '@/components/ui/PageLayout'
import { ENABLE_PROFILE_IMAGES } from '@/config/env'
import { exigirPermiso } from '@/features/auth/permisos'
import { useAuth } from '@/features/auth/useAuth'
import { DatosPersonales, TarjetaPerfil } from '@/features/usuarios/components/PerfilUsuario'
import { buscarPortada, PORTADAS } from '@/features/usuarios/utils/imagenesPortada'
import { useCurrentUser } from '@/hooks/useCurrentUser'

export const Route = createFileRoute('/_app/perfil')({
  beforeLoad: ({ context }) => {
    exigirPermiso(context.sesion.roles, 'perfil:ver')
  },
  component: Perfil,
})

function Perfil() {
  const { user } = useAuth()
  const { user: persona } = useCurrentUser()
  const { open } = useModal()

  if (!user) {
    return null
  }

  const abrirFoto = async () => {
    const { ModalFotoPerfil } =
      await import('@/features/usuarios/components/PerfilUsuario/ModalFotoPerfil')
    await open(ModalFotoPerfil, {
      foto: persona.avatarUrl,
      iniciales: persona.initials,
      semilla: user.run,
    }).catch(() => undefined)
  }

  const abrirPortada = async () => {
    const { ModalPortadaPerfil } =
      await import('@/features/usuarios/components/PerfilUsuario/ModalPortadaPerfil')
    await open(ModalPortadaPerfil, { portadas: PORTADAS, actual: user.portada }).catch(
      () => undefined,
    )
  }

  return (
    <PageLayout maxWidth="7xl">
      <TarjetaPerfil
        nombre={persona.displayName}
        iniciales={persona.initials}
        semilla={user.run}
        foto={persona.avatarUrl}
        portada={buscarPortada(user.portada)}
        roles={persona.roles}
        correo={user.email_institucional ?? user.email_estudiantil}
        onEditarFoto={ENABLE_PROFILE_IMAGES ? () => void abrirFoto() : undefined}
        onEditarPortada={ENABLE_PROFILE_IMAGES ? () => void abrirPortada() : undefined}
      />
      <DatosPersonales
        run={user.run}
        digitoVerificador={user.digito_verificador}
        correoInstitucional={user.email_institucional}
        correoEstudiantil={user.email_estudiantil}
      />
    </PageLayout>
  )
}
