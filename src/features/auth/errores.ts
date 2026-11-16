export class AccesoDenegadoError extends Error {
  constructor() {
    super('No tiene permisos para acceder a esta sección.')
    this.name = 'AccesoDenegadoError'
  }
}

export class CuentaSinAccesoError extends Error {
  constructor() {
    super('Su cuenta no tiene acceso asignado al sistema. Contacte al administrador.')
    this.name = 'CuentaSinAccesoError'
  }
}
