/** Display units. Stored weather values stay in Celsius and km/h. */
export type UnitSystem = 'metric' | 'imperial'

/** International statute mile, so km/h and mph stay reversible. */
export const KILOMETERS_PER_MILE = 1.609344

export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32
}

export function kmhToMph(kilometersPerHour: number): number {
  return kilometersPerHour / KILOMETERS_PER_MILE
}

export function temperatureFromCelsius(celsius: number, system: UnitSystem): number {
  return system === 'imperial' ? celsiusToFahrenheit(celsius) : celsius
}

export function windFromKmh(kilometersPerHour: number, system: UnitSystem): number {
  return system === 'imperial' ? kmhToMph(kilometersPerHour) : kilometersPerHour
}

export function temperatureUnit(system: UnitSystem): '°C' | '°F' {
  return system === 'imperial' ? '°F' : '°C'
}

export function windUnit(system: UnitSystem): 'km/h' | 'mph' {
  return system === 'imperial' ? 'mph' : 'km/h'
}
