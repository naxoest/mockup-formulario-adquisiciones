import { useState } from 'react'
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'
import { Modal } from './Modal'
import type { ModalHeaderTone, ModalSize } from './Modal.types'

export type ConfirmVariant = 'info' | 'warning' | 'error' | 'success'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: React.ReactNode
  variant: ConfirmVariant
  confirmText: string
  cancelText: string
  size: ModalSize
  onConfirm: () => void | Promise<void>
  onCancel: () => void
  onExited: () => void
}

interface VariantConfig {
  icon: React.ReactNode
  iconWrapperClass: string
  buttonVariant: 'primary' | 'danger'
  tone: ModalHeaderTone
}

const variantConfig: Record<ConfirmVariant, VariantConfig> = {
  info: {
    icon: <Info className="size-5" />,
    iconWrapperClass: 'bg-primary-100 text-primary-600',
    buttonVariant: 'primary',
    tone: 'info',
  },
  warning: {
    icon: <AlertTriangle className="size-5" />,
    iconWrapperClass: 'bg-saffron-100 text-saffron-700',
    buttonVariant: 'primary',
    tone: 'warning',
  },
  error: {
    icon: <AlertCircle className="size-5" />,
    iconWrapperClass: 'bg-scarlet-100 text-scarlet-600',
    buttonVariant: 'danger',
    tone: 'error',
  },
  success: {
    icon: <CheckCircle className="size-5" />,
    iconWrapperClass: 'bg-jade-100 text-jade-700',
    buttonVariant: 'primary',
    tone: 'success',
  },
}

export const ConfirmDialog = ({
  open,
  title,
  message,
  variant,
  confirmText,
  cancelText,
  size,
  onConfirm,
  onCancel,
  onExited,
}: ConfirmDialogProps) => {
  const [loading, setLoading] = useState(false)
  const config = variantConfig[variant]

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
    } catch (error) {
      console.error('ConfirmDialog: error en onConfirm', error)
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (loading) return
    onCancel()
  }

  return (
    <Modal
      open={open}
      onClose={handleCancel}
      onExited={onExited}
      size={size}
      closeOnBackdrop={!loading}
      closeOnEscape={!loading}
      showCloseButton={!loading}
    >
      <Modal.Header
        tone={config.tone}
        icon={
          <div
            className={cn(
              'flex items-center justify-center size-10 rounded-full',
              config.iconWrapperClass,
            )}
          >
            {config.icon}
          </div>
        }
      >
        {title}
      </Modal.Header>
      <Modal.Body>
        <div className="text-sm text-mercury-700">{message}</div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCancel} disabled={loading}>
          {cancelText}
        </Button>
        <Button variant={config.buttonVariant} onClick={handleConfirm} loading={loading}>
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
