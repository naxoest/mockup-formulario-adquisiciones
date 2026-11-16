export interface ParsedRun {
  run: number
  verifier: string
}

export function computeVerifierDigit(run: number): string {
  let sum = 0
  let multiplier = 2
  let remaining = run

  while (remaining > 0) {
    sum += (remaining % 10) * multiplier
    remaining = Math.floor(remaining / 10)
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }

  const result = 11 - (sum % 11)

  if (result === 11) return '0'
  if (result === 10) return 'K'
  return String(result)
}

export function parseRun(input: string): ParsedRun | null {
  const cleaned = input.replace(/[.\s-]/g, '').toUpperCase()

  if (cleaned.length < 2) return null

  const verifier = cleaned.slice(-1)
  const body = cleaned.slice(0, -1)

  if (!/^\d+$/.test(body)) return null
  if (!/^[\dK]$/.test(verifier)) return null

  const run = Number(body)

  if (!Number.isSafeInteger(run) || run <= 0) return null

  return { run, verifier }
}

export function formatRun(run: number, verifier: string): string {
  const grouped = String(run).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${grouped}-${verifier.toUpperCase()}`
}

export function isValidRun(input: string): boolean {
  const parsed = parseRun(input)
  if (parsed === null) return false
  return computeVerifierDigit(parsed.run) === parsed.verifier
}
