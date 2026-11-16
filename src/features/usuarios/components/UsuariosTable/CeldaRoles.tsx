import { Badge } from '@/components/ui/Badge'
import { etiquetaRol } from '@/features/auth/roles'
import type { Rol } from '@/features/usuarios/types/usuario.types'

interface CeldaRolesProps {
  roles: Rol[]
}

export function CeldaRoles({ roles }: CeldaRolesProps) {
  if (roles.length === 0) {
    return (
      <Badge variant="warning" size="sm">
        Sin roles
      </Badge>
    )
  }

  const [primero, ...resto] = roles

  return (
    <span className="inline-flex items-center gap-1">
      <Badge variant="neutral" size="sm">
        {etiquetaRol(primero.nombre)}
      </Badge>
      {resto.length > 0 && (
        <Badge
          variant="neutral"
          size="sm"
          title={resto.map((rol) => etiquetaRol(rol.nombre)).join(', ')}
        >
          +{resto.length}
        </Badge>
      )}
    </span>
  )
}
