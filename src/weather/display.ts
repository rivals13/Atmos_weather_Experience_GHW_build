import type { Forecast, HourlyForecast, Place, WeatherCondition } from '../api/types.ts'
import { temperatureFromCelsius, windFromKmh, windUnit, type UnitSystem } from './units.ts'

export type SceneId =
  | 'day-clear'
  | 'day-partly'
  | 'day-overcast'
  | 'day-fog'
  | 'day-drizzle'
  | 'day-rain'
  | 'day-snow'
  | 'day-storm'
  | 'night-clear'
  | 'night-partly'
  | 'night-overcast'
  | 'night-fog'
  | 'night-drizzle'
  | 'night-rain'
  | 'night-snow'
  | 'night-storm'

const HOUR_COUNT = 24

/** Hours from the current local hour forward. Times stay as API wall-clock strings. */
export function upcomingHours(forecast: Forecast, count = HOUR_COUNT): HourlyForecast[] {
  const currentHour = forecast.current.time.slice(0, 13)
  const start = forecast.hourly.findIndex((hour) => hour.time.slice(0, 13) >= currentHour)
  const index = start === -1 ? 0 : start
  return forecast.hourly.slice(index, index + count)
}

const SCENES: Record<WeatherCondition, { day: SceneId; night: SceneId }> = {
  clear: { day: 'day-clear', night: 'night-clear' },
  'partly-cloudy': { day: 'day-partly', night: 'night-partly' },
  overcast: { day: 'day-overcast', night: 'night-overcast' },
  fog: { day: 'day-fog', night: 'night-fog' },
  drizzle: { day: 'day-drizzle', night: 'night-drizzle' },
  rain: { day: 'day-rain', night: 'night-rain' },
  snow: { day: 'day-snow', night: 'night-snow' },
  thunderstorm: { day: 'day-storm', night: 'night-storm' },
  unknown: { day: 'day-overcast', night: 'night-overcast' },
}

/** Scene comes from the forecast condition and Open-Meteo's is_day flag. */
export function sceneFor(condition: WeatherCondition, isDay: boolean): SceneId {
  return SCENES[condition][isDay ? 'day' : 'night']
}

export function formatTemperatureValue(celsius: number, system: UnitSystem): string {
  return String(Math.round(temperatureFromCelsius(celsius, system)))
}

export function formatTemperature(celsius: number, system: UnitSystem): string {
  return `${formatTemperatureValue(celsius, system)}°`
}

export function formatWind(kilometersPerHour: number, system: UnitSystem): string {
  return `${Math.round(windFromKmh(kilometersPerHour, system))} ${windUnit(system)}`
}

export function formatPrecipitation(millimeters: number): string {
  const rounded = Math.round(millimeters * 10) / 10
  return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)} mm`
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`
}

export function formatHourLabel(time: string): string {
  return formatClock(time, false)
}

export function formatClock(time: string, withMinutes = true): string {
  const hour = Number(time.slice(11, 13))
  const minute = time.slice(14, 16)
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) return time
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  if (!withMinutes || minute.length !== 2) return `${hour12} ${suffix}`
  return `${hour12}:${minute} ${suffix}`
}

export function formatDayLabel(date: string, today: string): string {
  if (date === today) return 'Today'
  const parsed = new Date(`${date}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime())) return date
  return new Intl.DateTimeFormat('en', { weekday: 'short', timeZone: 'UTC' }).format(parsed)
}

export function placeRegion(place: Pick<Place, 'admin1' | 'country'>): string {
  return [place.admin1, place.country].filter((part) => part && part.length > 0).join(', ')
}
