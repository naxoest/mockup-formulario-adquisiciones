import { useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useModal } from '@/components/ui/Modal'
import { ImportacionPlanillaModal } from '../components/ImportacionPlanilla/ImportacionPlanillaModal'
export function useImportacionPlanilla() {
  const modal = useModal()
  const navigate = useNavigate()

  return useCallback(async () => {
    const destino = await modal.open(ImportacionPlanillaModal, {}).catch(() => null)

    if (destino === 'importaciones') {
      await navigate({ to: '/requerimientos/importaciones' })
      return
    }

    if (destino === 'requerimientos') {
      await navigate({ to: '/requerimientos' })
    }
  }, [modal, navigate])
}
