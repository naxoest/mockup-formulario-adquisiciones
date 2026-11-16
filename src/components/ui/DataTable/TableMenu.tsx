import { useRef, useState, type ReactNode } from 'react'
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useClick,
  useDismiss,
  useListNavigation,
  useRole,
  useInteractions,
  FloatingFocusManager,
  FloatingPortal,
} from '@floating-ui/react'
import { cn } from '@/utils/cn'

export interface TableMenuItem {
  key: string
  content: ReactNode
  disabled?: boolean
  onSelect: () => void
}

interface TableMenuProps {
  label: string
  triggerClassName: string
  menuClassName: string
  items: TableMenuItem[]
  children: ReactNode
}

export function TableMenu({
  label,
  triggerClassName,
  menuClassName,
  items,
  children,
}: TableMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const listRef = useRef<Array<HTMLElement | null>>([])

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'bottom-end',
    whileElementsMounted: autoUpdate,
    middleware: [offset(4), flip({ fallbackAxisSideDirection: 'start' }), shift({ padding: 8 })],
  })

  const click = useClick(context)
  const dismiss = useDismiss(context)
  const role = useRole(context, { role: 'menu' })
  const listNavigation = useListNavigation(context, {
    listRef,
    activeIndex,
    onNavigate: setActiveIndex,
    loop: true,
  })

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    click,
    dismiss,
    role,
    listNavigation,
  ])

  return (
    <>
      <button
        ref={refs.setReference}
        type="button"
        aria-label={label}
        {...getReferenceProps()}
        className={triggerClassName}
      >
        {children}
      </button>

      {isOpen && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <div
              // eslint-disable-next-line react-hooks/refs -- floating-ui setFloating is a callback ref, not a ref object
              ref={refs.setFloating}
              style={floatingStyles}
              {...getFloatingProps()}
              className={cn(
                'rounded-lg shadow-lg bg-white border border-mercury-200 z-50 py-1',
                menuClassName,
              )}
            >
              {items.map((item, index) => (
                <button
                  key={item.key}
                  ref={(node) => {
                    listRef.current[index] = node
                  }}
                  type="button"
                  role="menuitem"
                  tabIndex={activeIndex === index ? 0 : -1}
                  disabled={item.disabled}
                  {...getItemProps({
                    onClick: (event) => {
                      event.stopPropagation()
                      item.onSelect()
                      setIsOpen(false)
                    },
                  })}
                  className="w-full text-left px-4 py-2 text-sm text-mercury-700 hover:bg-mercury-100 focus:bg-mercury-100 focus:outline-none flex items-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {item.content}
                </button>
              ))}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  )
}
