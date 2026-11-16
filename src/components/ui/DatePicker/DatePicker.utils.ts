import { parse, isValid } from 'date-fns'

export function parseDateString(value: string, fmt = 'dd/MM/yyyy'): Date | null {
  const parsed = parse(value, fmt, new Date())
  return isValid(parsed) ? parsed : null
}
