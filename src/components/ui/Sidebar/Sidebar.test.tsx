import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LayoutDashboard, Settings } from 'lucide-react'
import { Sidebar } from './Sidebar'
import type { SidebarLinkProps, SidebarNavItem, SidebarProps, SidebarUser } from './Sidebar.types'

const baseItems: SidebarNavItem[] = [
  { type: 'link', icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  {
    type: 'group',
    icon: Settings,
    label: 'Configuración',
    items: [
      { label: 'Usuarios', path: '/config/usuarios' },
      { label: 'Permisos', path: '/config/permisos' },
    ],
  },
]

const baseUser: SidebarUser = {
  displayName: 'Juan Perez',
  initials: 'JP',
  roles: ['Administrador'],
}

function TestLink({ to, onClick, children, ...props }: SidebarLinkProps) {
  return (
    <a
      href={to}
      onClick={(event) => {
        event.preventDefault()
        onClick?.()
      }}
      {...props}
    >
      {children}
    </a>
  )
}

function renderSidebar(overrides: Partial<SidebarProps> = {}) {
  const props: SidebarProps = {
    items: baseItems,
    mobile: false,
    collapsed: false,
    mobileOpen: false,
    currentPath: '/dashboard',
    linkComponent: TestLink,
    onMobileOpenChange: vi.fn(),
    user: baseUser,
    onLogout: vi.fn(),
    onViewProfile: vi.fn(),
    ...overrides,
  }

  const result = render(<Sidebar {...props} />)
  return { ...result, props }
}

describe('Sidebar', () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = function showModal() {
      this.setAttribute('open', '')
    }
    HTMLDialogElement.prototype.close = function close() {
      this.removeAttribute('open')
    }
  })

  it('renders all link items', () => {
    renderSidebar()
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
  })

  it('renders group items as buttons', () => {
    renderSidebar()
    expect(screen.getByRole('button', { name: /configuración/i })).toBeInTheDocument()
  })

  it('does not show group subitems until expanded', () => {
    renderSidebar()
    expect(screen.queryByRole('link', { name: 'Usuarios' })).not.toBeInTheDocument()
  })

  it('expands the group on click when sidebar is open', async () => {
    const user = userEvent.setup()
    renderSidebar()
    await user.click(screen.getByRole('button', { name: /configuración/i }))
    expect(screen.getByRole('link', { name: 'Usuarios' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Permisos' })).toBeInTheDocument()
  })

  it('collapses the group on second click', async () => {
    const user = userEvent.setup()
    renderSidebar()
    const groupButton = screen.getByRole('button', { name: /configuración/i })
    await user.click(groupButton)
    await user.click(groupButton)
    expect(screen.queryByRole('link', { name: 'Usuarios' })).not.toBeInTheDocument()
  })

  it('renders link items pointing to their destination', () => {
    renderSidebar()
    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/dashboard')
  })

  it('renders group subitems pointing to their destination', async () => {
    const user = userEvent.setup()
    renderSidebar()
    await user.click(screen.getByRole('button', { name: /configuración/i }))
    expect(screen.getByRole('link', { name: 'Usuarios' })).toHaveAttribute(
      'href',
      '/config/usuarios',
    )
  })

  it('opens the group pages in a panel and closes it with Escape when collapsed', async () => {
    const user = userEvent.setup()
    renderSidebar({ collapsed: true })
    const groupButton = screen.getByRole('button', { name: /configuración/i })
    await user.click(groupButton)
    expect(await screen.findByRole('link', { name: 'Usuarios' })).toHaveAttribute(
      'href',
      '/config/usuarios',
    )
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('link', { name: 'Usuarios' })).not.toBeInTheDocument()
    expect(groupButton).toHaveFocus()
  })

  it('marks the active link with aria-current="page"', () => {
    renderSidebar({ currentPath: '/dashboard' })
    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('aria-current', 'page')
  })

  it('opens the group of the active subitem and marks it with aria-current="page"', () => {
    renderSidebar({ currentPath: '/config/usuarios' })
    expect(screen.getByRole('link', { name: 'Usuarios' })).toHaveAttribute('aria-current', 'page')
  })

  it('marks the section of a detail route with aria-current="true"', () => {
    renderSidebar({ currentPath: '/config/usuarios/15' })
    expect(screen.getByRole('link', { name: 'Usuarios' })).toHaveAttribute('aria-current', 'true')
    expect(screen.getByRole('link', { name: 'Permisos' })).not.toHaveAttribute('aria-current')
  })

  it('moves the mark to the group when the user closes it', async () => {
    const user = userEvent.setup()
    renderSidebar({ currentPath: '/config/usuarios' })
    const groupButton = screen.getByRole('button', { name: /configuración/i })
    expect(groupButton).not.toHaveAttribute('aria-current')
    await user.click(groupButton)
    expect(groupButton).toHaveAttribute('aria-current', 'true')
  })

  it('expands the group when navigation enters it', () => {
    const { rerender, props } = renderSidebar()
    rerender(<Sidebar {...props} currentPath="/config/permisos" />)
    expect(screen.getByRole('link', { name: 'Permisos' })).toHaveAttribute('aria-current', 'page')
  })

  it('renders displayName and formatted roles in user card when open', () => {
    renderSidebar({
      user: { displayName: 'Diego', initials: 'DI', roles: ['Admin', 'Analista'] },
    })
    expect(screen.getByText('Diego')).toBeInTheDocument()
    expect(screen.getByText('Admin y Analista')).toBeInTheDocument()
  })

  it('calls onLogout when logout button is clicked', async () => {
    const user = userEvent.setup()
    const { props } = renderSidebar()
    await user.click(screen.getByRole('button', { name: /cerrar sesión/i }))
    expect(props.onLogout).toHaveBeenCalledTimes(1)
  })

  it('calls onViewProfile when view profile button is clicked', async () => {
    const user = userEvent.setup()
    const { props } = renderSidebar()
    await user.click(screen.getByRole('button', { name: /ver perfil/i }))
    expect(props.onViewProfile).toHaveBeenCalledTimes(1)
  })

  it('renders the user initials when there is no avatar image', () => {
    renderSidebar()
    expect(screen.getByText('JP')).toBeInTheDocument()
  })

  it('labels the avatar with the user name when the sidebar is collapsed', () => {
    renderSidebar({ collapsed: true })
    expect(screen.getByRole('img', { name: 'Juan Perez' })).toHaveTextContent('JP')
  })

  it('renders the avatar image when avatarUrl is provided', () => {
    renderSidebar({
      collapsed: true,
      user: {
        displayName: 'Diego',
        initials: 'DI',
        roles: [],
        avatarUrl: 'https://example.com/a.jpg',
      },
    })
    expect(screen.getByRole('img', { name: 'Diego' })).toHaveAttribute(
      'src',
      'https://example.com/a.jpg',
    )
  })

  it('falls back to the initials when the avatar image fails to load', () => {
    renderSidebar({
      collapsed: true,
      user: {
        displayName: 'Diego',
        initials: 'DI',
        roles: [],
        avatarUrl: 'https://example.com/a.jpg',
      },
    })
    fireEvent.error(screen.getByRole('img', { name: 'Diego' }))
    expect(screen.getByRole('img', { name: 'Diego' })).toHaveTextContent('DI')
  })

  it('renders custom header when provided', () => {
    renderSidebar({ header: <span>Mi logo custom</span> })
    expect(screen.getByText('Mi logo custom')).toBeInTheDocument()
  })

  it('shows the navigation in a dialog when the mobile panel is open', () => {
    renderSidebar({ mobile: true, mobileOpen: true })
    expect(screen.getByRole('dialog', { name: 'Navegación principal' })).toBeInTheDocument()
  })

  it('closes the mobile panel when the backdrop is clicked', () => {
    const { props } = renderSidebar({ mobile: true, mobileOpen: true })
    const dialog = screen.getByRole('dialog', { name: 'Navegación principal' })
    fireEvent.mouseDown(dialog)
    fireEvent.click(dialog)
    expect(props.onMobileOpenChange).toHaveBeenCalledWith(false)
  })

  it('closes the mobile panel with its button', async () => {
    const user = userEvent.setup()
    const { props } = renderSidebar({ mobile: true, mobileOpen: true })
    await user.click(screen.getByRole('button', { name: 'Cerrar navegación' }))
    expect(props.onMobileOpenChange).toHaveBeenCalledWith(false)
  })

  it('closes the mobile panel after navigating', async () => {
    const user = userEvent.setup()
    const { props } = renderSidebar({ mobile: true, mobileOpen: true })
    await user.click(screen.getByRole('link', { name: /dashboard/i }))
    expect(props.onMobileOpenChange).toHaveBeenCalledWith(false)
  })

  it('does not request closing after navigating when the mobile panel is closed', async () => {
    const user = userEvent.setup()
    const { props } = renderSidebar()
    await user.click(screen.getByRole('link', { name: /dashboard/i }))
    expect(props.onMobileOpenChange).not.toHaveBeenCalled()
  })

  it('renders nav landmark with accessible label', () => {
    renderSidebar()
    const aside = screen.getByRole('complementary', { name: 'Navegación principal' })
    expect(aside).toBeInTheDocument()
    expect(within(aside).getByRole('navigation', { hidden: true })).toBeInTheDocument()
  })
})
