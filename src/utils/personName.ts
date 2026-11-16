export interface PersonName {
  givenNames: string
  paternalSurname: string
  maternalSurname: string
}

export function formatFullName(name: PersonName): string {
  return [name.givenNames, name.paternalSurname, name.maternalSurname]
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .join(' ')
}

export function getInitials(name: PersonName): string {
  const givenInitial = name.givenNames.trim().charAt(0)
  const surnameInitial = (name.paternalSurname.trim() || name.maternalSurname.trim()).charAt(0)
  return `${givenInitial}${surnameInitial}`.toUpperCase()
}
