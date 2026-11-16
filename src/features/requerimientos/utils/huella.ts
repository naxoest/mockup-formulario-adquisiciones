export async function calcularHuella(contenido: ArrayBuffer): Promise<string> {
  const resumen = await crypto.subtle.digest('SHA-256', contenido)

  return Array.from(new Uint8Array(resumen), (byte) => byte.toString(16).padStart(2, '0')).join('')
}
