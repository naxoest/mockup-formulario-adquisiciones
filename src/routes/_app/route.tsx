import { useMemo } from 'react'
import { createFileRoute, Link, Outlet, redirect, useLocation } from '@tanstack/react-router'
import { Sidebar, useSidebar, type SidebarLinkProps } from '@/components/ui/Sidebar'
import { Header } from '@/components/ui/Header'
import { SystemLogo } from '@/components/ui/SystemLogo'
import { filterNavigationItems, navigationItems } from '@/config/navigation'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { sessionQueryOptions } from '@/features/auth/session'
import { useAuth } from '@/features/auth/useAuth'
import { useCicloDeSesion } from '@/features/auth/useCicloDeSesion'
import { useSessionExpiry } from '@/features/auth/useSessionExpiry'

const SIDEBAR_LINK_ACTIVE_OPTIONS = { exact: true, includeSearch: false }

export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ context, location }) => {
    const session = await context.queryClient.ensureQueryData(sessionQueryOptions)
    if (session === null) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
    return { sesion: session }
  },
  component: AppLayout,
})

function SidebarLink({ to, ...props }: SidebarLinkProps) {
  return <Link to={to} activeOptions={SIDEBAR_LINK_ACTIVE_OPTIONS} {...props} />
}

function AppLayout() {
  const { mobile, collapsed, mobileOpen, setMobileOpen, toggle } = useSidebar()
  const location = useLocation()
  const { user, viewProfile } = useCurrentUser()
  const { roles } = useAuth()
  const { cerrarSesion } = useCicloDeSesion()
  useSessionExpiry()

  const visibleItems = useMemo(() => filterNavigationItems(navigationItems, roles), [roles])

  const logo = (
    <SystemLogo colorMode="custom" variant={collapsed ? 'mini' : 'full'} className="h-8" />
  )

  return (
    <div className="flex min-h-screen font-open-sans bg-mercury-50">
      <Sidebar
        items={visibleItems}
        mobile={mobile}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        currentPath={location.pathname}
        linkComponent={SidebarLink}
        onMobileOpenChange={setMobileOpen}
        user={user}
        onLogout={cerrarSesion}
        onViewProfile={viewProfile}
        header={logo}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onToggleSidebar={toggle} />

        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
