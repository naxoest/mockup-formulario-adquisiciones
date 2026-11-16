export type CsvValue = string | number | null

const FIELD_SEPARATOR = ','
const RECORD_SEPARATOR = '\r\n'
const FORMULA_TRIGGER = /^[-=+@\t\r\n\uFF1D\uFF0B\uFF0D\uFF20]/
const QUOTING_TRIGGER = /[",\r\n]/

function neutralizeFormula(text: string): string {
  return FORMULA_TRIGGER.test(text) ? `'${text}` : text
}

function formatField(value: CsvValue): string {
  if (value === null) {
    return ''
  }

  if (typeof value === 'number') {
    return String(value)
  }

  const text = neutralizeFormula(value)

  return QUOTING_TRIGGER.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function toCsv(rows: readonly (readonly CsvValue[])[]): string {
  return rows.map((row) => row.map(formatField).join(FIELD_SEPARATOR)).join(RECORD_SEPARATOR)
}
