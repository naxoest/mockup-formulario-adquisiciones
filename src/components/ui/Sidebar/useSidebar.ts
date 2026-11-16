import { useState } from 'react'
import { useMediaQuery } from '@/components/ui/DataTable/useMediaQuery'

const MOBILE_QUERY = '(max-width: 1023px)'
const COLLAPSED_STORAGE_KEY = 'sidebar-collapsed'

function readCollapsed(): boolean {
  try {
    return window.localStorage.getItem(COLLAPSED_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

function writeCollapsed(collapsed: boolean): void {
  try {
    window.localStorage.setItem(COLLAPSED_STORAGE_KEY, String(collapsed))
  } catch {
    return
  }
}

export function useSidebar() {
  const mobile = useMediaQuery(MOBILE_QUERY)
  const [collapsed, setCollapsed] = useState(readCollapsed)
  const [mobileOpen, setMobileOpen] = useState(false)

  if (!mobile && mobileOpen) {
    setMobileOpen(false)
  }

  const toggle = () => {
    if (mobile) {
      setMobileOpen((open) => !open)
      return
    }

    const nextCollapsed = !collapsed
    setCollapsed(nextCollapsed)
    writeCollapsed(nextCollapsed)
  }

  return {
    mobile,
    collapsed: collapsed && !mobile,
    mobileOpen,
    setMobileOpen,
    toggle,
  }
}
