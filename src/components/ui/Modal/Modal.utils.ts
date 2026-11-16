const SCROLLBAR_COMPENSATION = '--scrollbar-compensation'

function measureScrollbarWidth(): number {
  const { clientWidth } = document.documentElement
  if (clientWidth === 0) {
    return 0
  }
  return Math.max(0, window.innerWidth - clientWidth)
}

export function lockDocumentScroll(): void {
  const root = document.documentElement
  if (root.style.getPropertyValue(SCROLLBAR_COMPENSATION) !== '') {
    return
  }
  const width = measureScrollbarWidth()
  if (width === 0) {
    return
  }
  root.style.setProperty(SCROLLBAR_COMPENSATION, `${width}px`)
}

export function unlockDocumentScroll(): void {
  if (document.querySelector('dialog[open]') !== null) {
    return
  }
  document.documentElement.style.removeProperty(SCROLLBAR_COMPENSATION)
}
