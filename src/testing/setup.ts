import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest'
import { server } from '@/mocks/server'
import { restablecerTransacciones } from '@/mocks/handlers/transacciones.estado'
import { restablecerUsuarios } from '@/mocks/handlers/usuarios.estado'
import { iniciarSesionSimuladaPorRun, restablecerSesion } from '@/mocks/handlers/sesion.estado'
import { restablecerImagenes } from '@/mocks/handlers/imagenes.estado'
import { restablecerProyectos } from '@/mocks/handlers/proyectos.estado'
import { restablecerUnidadesSolicitantes } from '@/mocks/handlers/unidadesSolicitantes.estado'

afterEach(() => {
  cleanup()
})

if (typeof window !== 'undefined' && typeof SVGElement !== 'undefined') {
  if (!('getBBox' in SVGElement.prototype)) {
    Object.defineProperty(SVGElement.prototype, 'getBBox', {
      writable: true,
      configurable: true,
      value: function getBBox() {
        return { x: 0, y: 0, width: 100, height: 40 }
      },
    })
  }
}

if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })
}

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
}

if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function scrollIntoView() {}
}

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
  restablecerTransacciones()
  restablecerUsuarios()
  restablecerSesion()
  restablecerImagenes()
  restablecerProyectos()
  restablecerUnidadesSolicitantes()
  iniciarSesionSimuladaPorRun(12345678)
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})
