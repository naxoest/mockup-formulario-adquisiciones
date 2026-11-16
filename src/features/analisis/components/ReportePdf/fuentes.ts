import { Font } from '@react-pdf/renderer'

export const FAMILIA_DOCUMENTO = 'Open Sans'

let registradas = false

export function registrarFuentes() {
  if (registradas) return

  Font.register({
    family: FAMILIA_DOCUMENTO,
    fonts: [
      { src: '/fonts/open-sans/open-sans-v44-latin-regular.ttf', fontWeight: 400 },
      { src: '/fonts/open-sans/open-sans-v44-latin-600.ttf', fontWeight: 600 },
      { src: '/fonts/open-sans/open-sans-v44-latin-700.ttf', fontWeight: 700 },
    ],
  })

  Font.registerHyphenationCallback((palabra) => [palabra])

  registradas = true
}
