import { useEffect, useRef, type MouseEvent, type ReactNode, type SyntheticEvent } from 'react'
import { lockDocumentScroll, unlockDocumentScroll } from '@/components/ui/Modal/Modal.utils'
import { cn } from '@/utils/cn'

interface SidebarDrawerProps {
  open: boolean
  onClose: () => void
  className?: string
  children: ReactNode
}

export function SidebarDrawer({ open, onClose, className, children }: SidebarDrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const mouseDownTargetRef = useRef<EventTarget | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) {
      lockDocumentScroll()
      dialog.showModal()
      dialog.querySelector<HTMLElement>('nav [aria-current]')?.focus()
    }

    if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  useEffect(() => unlockDocumentScroll, [])

  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault()
    onClose()
  }

  const handleDialogClose = () => {
    unlockDocumentScroll()
    onClose()
  }

  const handleMouseDown = (event: MouseEvent<HTMLDialogElement>) => {
    mouseDownTargetRef.current = event.target
  }

  const handleClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target !== event.currentTarget) return
    if (mouseDownTargetRef.current !== event.currentTarget) return
    onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label="Navegación principal"
      onCancel={handleCancel}
      onClose={handleDialogClose}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      className={cn(
        'm-0 h-dvh max-h-dvh w-72 max-w-[85vw] overflow-hidden bg-sidebar p-0 text-sidebar-foreground',
        '-translate-x-full open:translate-x-0 starting:open:-translate-x-full',
        'transition-[translate,overlay,display] transition-discrete duration-200 ease-out motion-reduce:transition-none',
        'backdrop:bg-black/50',
        className,
      )}
    >
      <div className="flex h-full flex-col">{children}</div>
    </dialog>
  )
}
