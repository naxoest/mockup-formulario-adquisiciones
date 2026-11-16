import { cloneElement, useState, type ReactElement, type ReactNode, type Ref } from 'react'
import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  safePolygon,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useMergeRefs,
  useRole,
} from '@floating-ui/react'

export interface TooltipProps {
  content: ReactNode
  children: ReactElement<{ ref?: Ref<HTMLElement> }>
  role?: 'tooltip' | 'label'
  placement?: 'top' | 'right' | 'bottom' | 'left'
  disabled?: boolean
}

export function Tooltip({
  content,
  children,
  role = 'tooltip',
  placement = 'top',
  disabled = false,
}: TooltipProps) {
  const [open, setOpen] = useState(false)
  const [reference, setReference] = useState<HTMLElement | null>(null)
  const [floating, setFloating] = useState<HTMLElement | null>(null)
  const visible = open && !disabled

  const { floatingStyles, context } = useFloating({
    open: visible,
    onOpenChange: setOpen,
    placement,
    elements: { reference, floating },
    whileElementsMounted: autoUpdate,
    middleware: [offset(8), flip(), shift({ padding: 8 })],
  })

  const hover = useHover(context, {
    move: false,
    delay: { open: 150 },
    handleClose: safePolygon(),
  })
  const focus = useFocus(context)
  const dismiss = useDismiss(context)
  const ariaRole = useRole(context, { role })
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, ariaRole])

  const setTrigger = useMergeRefs<HTMLElement>([setReference, children.props.ref])

  return (
    <>
      {cloneElement(children, getReferenceProps({ ...children.props, ref: setTrigger }))}
      {visible && (
        <FloatingPortal root={reference?.closest('dialog') ?? undefined}>
          <div
            ref={setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="z-50 max-w-64 rounded-md bg-espresso-900 px-2 py-1 text-xs font-medium text-white shadow-md"
          >
            {content}
          </div>
        </FloatingPortal>
      )}
    </>
  )
}
