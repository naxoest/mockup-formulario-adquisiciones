import { useNavigate } from '@tanstack/react-router'
import type { SidebarUser } from '@/components/ui/Sidebar'
import { etiquetaRol } from '@/features/auth/roles'
import { useAuth } from '@/features/auth/useAuth'
import { formatFullName, getInitials } from '@/utils/personName'
import type { Rol, Usuario } from '@/features/auth/types'
import type { PersonName } from '@/utils/personName'

interface UseCurrentUserResult {
  user: SidebarUser
  viewProfile: () => void
}

const FALLBACK_USER: SidebarUser = {
  displayName: '',
  initials: '',
  roles: [],
}

function toSidebarUser(authUser: Usuario, roles: readonly Rol[]): SidebarUser {
  const name: PersonName = {
    givenNames: authUser.nombres,
    paternalSurname: authUser.apellido_paterno,
    maternalSurname: authUser.apellido_materno,
  }

  return {
    displayName: formatFullName(name),
    initials: getInitials(name),
    avatarSeed: authUser.run,
    avatarUrl: authUser.foto_url ?? undefined,
    roles: roles.map((role) => etiquetaRol(role.nombre)),
  }
}

export function useCurrentUser(): UseCurrentUserResult {
  const { user: authUser, roles } = useAuth()
  const navigate = useNavigate()

  const user = authUser ? toSidebarUser(authUser, roles) : FALLBACK_USER

  const viewProfile = () => {
    void navigate({ to: '/perfil' })
  }

  return { user, viewProfile }
}
