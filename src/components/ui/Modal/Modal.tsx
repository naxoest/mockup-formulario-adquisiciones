import { createContext, useContext, useEffect, useId, useRef, type MouseEvent } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { lockDocumentScroll, unlockDocumentScroll } from './Modal.utils'
import type {
  ModalBodyProps,
  ModalFooterProps,
  ModalHeaderProps,
  ModalHeaderTone,
  ModalProps,
  ModalSize,
} from './Modal.types'

const ModalContext = createContext<{ titleId: string } | null>(null)

const useModalContext = () => {
  const ctx = useContext(ModalContext)
  if (!ctx) {
    throw new Error('Modal.Header, Modal.Body y Modal.Footer deben usarse dentro de Modal')
  }
  return ctx
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'w-[min(28rem,calc(100vw-2rem))]',
  md: 'w-[min(32rem,calc(100vw-2rem))]',
  lg: 'w-[min(42rem,calc(100vw-2rem))]',
  xl: 'w-[min(56rem,calc(100vw-2rem))]',
}

const headerToneClasses: Record<ModalHeaderTone, string> = {
  default: 'bg-white',
  info: 'bg-primary-50',
  warning: 'bg-saffron-50',
  error: 'bg-scarlet-50',
  success: 'bg-jade-50',
}

const ModalHeader = ({ children, icon, tone = 'default', className }: ModalHeaderProps) => {
  const { titleId } = useModalContext()
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-6 py-4 border-b border-mercury-200',
        headerToneClasses[tone],
        className,
      )}
    >
      {icon && <div className="flex-shrink-0">{icon}</div>}
      <h2 id={titleId} className="text-lg font-semibold text-mercury-900 leading-6">
        {children}
      </h2>
    </div>
  )
}

const ModalBody = ({ children, className }: ModalBodyProps) => {
  useModalContext()
  return <div className={cn('px-6 py-4 overflow-y-auto flex-1', className)}>{children}</div>
}

const ModalFooter = ({ children, className }: ModalFooterProps) => {
  useModalContext()
  return (
    <div
      className={cn(
        'flex justify-end gap-2 px-6 py-4 border-t border-mercury-200 bg-mercury-50',
        className,
      )}
    >
      {children}
    </div>
  )
}

export const Modal = ({
  open,
  onClose,
  onExited,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  className,
  children,
}: ModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const mouseDownTargetRef = useRef<EventTarget | null>(null)
  const onExitedRef = useRef(onExited)
  const titleId = useId()

  useEffect(() => {
    onExitedRef.current = onExited
  }, [onExited])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      if (!dialog.open) {
        lockDocumentScroll()
        dialog.showModal()
      }
      dialog.dataset.open = ''
      return
    }

    if (!dialog.open) return

    delete dialog.dataset.open

    let finalized = false

    const finalize = () => {
      if (finalized) return
      finalized = true
      dialog.removeEventListener('transitionend', handleTransitionEnd)
      if (dialog.open) {
        dialog.close()
      }
      unlockDocumentScroll()
      onExitedRef.current?.()
    }

    const handleTransitionEnd = (event: TransitionEvent) => {
      if (event.target !== dialog) return
      if (event.propertyName !== 'opacity') return
      finalize()
    }

    dialog.addEventListener('transitionend', handleTransitionEnd)

    return () => {
      dialog.removeEventListener('transitionend', handleTransitionEnd)
    }
  }, [open])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleCancel = (event: Event) => {
      event.preventDefault()
      if (closeOnEscape) {
        onClose()
      }
    }

    dialog.addEventListener('cancel', handleCancel)
    return () => {
      dialog.removeEventListener('cancel', handleCancel)
    }
  }, [closeOnEscape, onClose])

  const handleMouseDown = (event: MouseEvent<HTMLDialogElement>) => {
    mouseDownTargetRef.current = event.target
  }

  const handleClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (!closeOnBackdrop) return
    if (event.target !== event.currentTarget) return
    if (mouseDownTargetRef.current !== event.currentTarget) return
    onClose()
  }

  return (
    <ModalContext.Provider value={{ titleId }}>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        className={cn(
          'modal-dialog',
          'p-0 m-auto bg-white rounded-lg shadow-xl overflow-hidden',
          'max-h-[calc(100vh-4rem)]',
          'flex flex-col',
          'backdrop:bg-mercury-950/60 backdrop:backdrop-blur-sm',
          sizeClasses[size],
          className,
        )}
      >
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="absolute top-3 right-3 z-10 text-mercury-400 hover:text-mercury-700 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md p-1 transition-colors"
          >
            <X className="size-5" />
          </button>
        )}
        {children}
      </dialog>
    </ModalContext.Provider>
  )
}

Modal.Header = ModalHeader
Modal.Body = ModalBody
Modal.Footer = ModalFooter
