function decodeExtendedValue(value: string): string | null {
  const parts = value.split("'")
  if (parts.length < 3) return null

  const charset = parts[0]?.toLowerCase()
  if (charset !== 'utf-8') return null

  try {
    return decodeURIComponent(parts.slice(2).join("'"))
  } catch {
    return null
  }
}

export function parseContentDispositionFilename(header: string | null): string | null {
  if (!header) return null

  const extended = /filename\*\s*=\s*([^;]+)/i.exec(header)
  if (extended?.[1]) {
    const decoded = decodeExtendedValue(extended[1].trim())
    if (decoded) return decoded
  }

  const quoted = /filename\s*=\s*"([^"]*)"/i.exec(header)
  if (quoted?.[1]) return quoted[1]

  const plain = /filename\s*=\s*([^;]+)/i.exec(header)
  if (plain?.[1]) return plain[1].trim()

  return null
}
