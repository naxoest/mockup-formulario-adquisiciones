import { Link } from '@tanstack/react-router'
import { Avatar } from '@/components/ui/Avatar'
import { nombreDeUsuario } from '@/features/usuarios/utils/usuario'
import { formatFullName, getInitials } from '@/utils/personName'
import type { Usuario } from '@/features/usuarios/types/usuario.types'

interface CeldaUsuarioProps {
  usuario: Usuario
}

export function CeldaUsuario({ usuario }: CeldaUsuarioProps) {
  const nombre = nombreDeUsuario(usuario)

  return (
    <span className="inline-flex min-w-0 items-center gap-3">
      <Avatar
        initials={getInitials(nombre)}
        seed={usuario.run}
        src={usuario.fotoUrl ?? undefined}
        loading="lazy"
        size="sm"
      />
      <span className="inline-flex min-w-0 flex-col">
        <Link
          to="/configuracion/admin_usuarios/$run"
          params={{ run: String(usuario.run) }}
          className="truncate rounded-sm font-semibold text-mercury-900 underline-offset-4 hover:text-primary-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        >
          {formatFullName(nombre)}
        </Link>
        <span className="truncate text-xs text-mercury-600">
          {usuario.emailInstitucional ?? usuario.emailEstudiantil ?? 'Sin correo'}
        </span>
      </span>
    </span>
  )
}
