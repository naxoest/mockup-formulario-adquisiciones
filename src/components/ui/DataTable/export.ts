import type { ColumnDef } from './DataTable.types'

export function exportToCSV<T>(data: T[], columns: ColumnDef<T>[], filename = 'export.csv'): void {
  const headers = columns.map((col) => col.header).join(',')

  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = (row as Record<string, unknown>)[col.field]
        if (value === null || value === undefined) return ''
        const str = String(value)
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      })
      .join(','),
  )

  const csv = [headers, ...rows].join('\n')
  const blob = new Blob(['\ufeff' + csv], {
    type: 'text/csv;charset=utf-8;',
  })

  downloadBlob(blob, filename)
}

export function exportToExcel<T>(
  data: T[],
  columns: ColumnDef<T>[],
  filename = 'export.xls',
): void {
  let html = '<html xmlns:x="urn:schemas-microsoft-com:office:excel">'
  html += '<head><meta charset="UTF-8"></head>'
  html += '<body><table border="1">'

  html += '<tr>'
  columns.forEach((col) => {
    html += `<th style="background-color:#f0f0f0;font-weight:bold">${escapeHtml(col.header)}</th>`
  })
  html += '</tr>'

  data.forEach((row) => {
    html += '<tr>'
    columns.forEach((col) => {
      const value = (row as Record<string, unknown>)[col.field]
      html += `<td>${value !== null && value !== undefined ? escapeHtml(value) : ''}</td>`
    })
    html += '</tr>'
  })

  html += '</table></body></html>'

  const blob = new Blob([html], { type: 'application/vnd.ms-excel' })
  downloadBlob(blob, filename)
}

function downloadBlob(blob: Blob, filename: string): void {
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function escapeHtml(value: unknown): string {
  const str = String(value)
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
