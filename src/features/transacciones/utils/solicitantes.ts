export const claveSolicitantePersistido = (id: number): string => `servidor-${id}`

export const nuevaClaveSolicitante = (): string => crypto.randomUUID()
