import { isCommonAssetRequest } from 'msw'
import { setupWorker } from 'msw/browser'
import { API_BASE_URL } from '@/config/env'
import { handlers } from '@/mocks/handlers'
import { habilitarPersistenciaDeSesion } from '@/mocks/handlers/sesion.estado'

const PREFIJOS_DEL_API = ['/api/', '/auth/']

export const worker = setupWorker(...handlers)

function esPeticionAlApi(request: Request): boolean {
  const base = new URL(API_BASE_URL, window.location.origin)
  const url = new URL(request.url)

  if (url.origin !== base.origin) return false

  const raiz = base.pathname.replace(/\/$/, '')
  return PREFIJOS_DEL_API.some((prefijo) => url.pathname.startsWith(`${raiz}${prefijo}`))
}

export function iniciarSimulacion() {
  habilitarPersistenciaDeSesion()

  return worker.start({
    onUnhandledRequest(request, print) {
      if (esPeticionAlApi(request)) {
        print.error()
        return
      }

      if (isCommonAssetRequest(request)) {
        return
      }

      print.warning()
    },
  })
}
