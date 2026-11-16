import { LogOut, User } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Tooltip } from '@/components/ui/Tooltip'
import { formatRoles } from './Sidebar.utils'
import type { SidebarUser } from './Sidebar.types'

interface SidebarUserCardProps {
  user: SidebarUser
  isOpen: boolean
  onLogout: () => void
  onViewProfile: () => void
}

export function SidebarUserCard({ user, isOpen, onLogout, onViewProfile }: SidebarUserCardProps) {
  const seed = user.avatarSeed ?? user.displayName

  if (!isOpen) {
    return (
      <div className="border-t border-sidebar-foreground/15 py-4 flex flex-col items-center space-y-2 flex-shrink-0">
        <Avatar
          initials={user.initials}
          seed={seed}
          src={user.avatarUrl}
          size="md"
          ariaLabel={user.displayName}
        />
        <Tooltip content="Ver perfil" role="label" placement="right">
          <button
            type="button"
            aria-label="Ver perfil"
            onClick={onViewProfile}
            className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground py-1 px-1 rounded-md transition-colors"
          >
            <User size={16} />
          </button>
        </Tooltip>
        <Tooltip content="Cerrar sesión" role="label" placement="right">
          <button
            type="button"
            aria-label="Cerrar sesión"
            onClick={onLogout}
            className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground py-1 px-1 rounded-md transition-colors"
          >
            <LogOut size={16} />
          </button>
        </Tooltip>
      </div>
    )
  }

  return (
    <div className="border-t border-sidebar-foreground/15 p-3 flex-shrink-0">
      <div className="flex flex-col items-center text-center">
        <div className="mb-2">
          <Avatar initials={user.initials} seed={seed} src={user.avatarUrl} size="xl" />
        </div>

        <div className="font-medium text-sm mb-1 text-sidebar-foreground">{user.displayName}</div>

        <div className="text-xs text-sidebar-foreground/80 mb-3">{formatRoles(user.roles)}</div>

        <button
          type="button"
          onClick={onViewProfile}
          className="w-full flex items-center justify-center py-1.5 px-3 mb-2 rounded text-xs text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <User size={14} className="mr-1.5" />
          Ver perfil
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-center py-1.5 px-3 rounded text-xs text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <LogOut size={14} className="mr-1.5" />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
