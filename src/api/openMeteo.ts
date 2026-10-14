import { describeWeather } from '../weather/codes.ts'
import type {
  CurrentConditions,
  DailyForecast,
  Forecast,
  HourlyForecast,
  Place,
} from './types.ts'

const GEOCODING_ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_ENDPOINT = 'https://api.open-meteo.com/v1/forecast'

const CURRENT_FIELDS = [
  'temperature_2m',
  'apparent_temperature',
  'relative_humidity_2m',
  'weather_code',
  'wind_speed_10m',
  'precipitation',
  'is_day',
].join(',')

const HOURLY_FIELDS = ['temperature_2m', 'weather_code', 'precipitation_probability'].join(',')

const DAILY_FIELDS = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_sum',
].join(',')

export class OpenMeteoError extends Error {
  readonly status: number | undefined

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'OpenMeteoError'
    this.status = status
  }
}

/** Search cities. An empty query returns no places and does not call the API. */
export async function searchPlaces(query: string, signal?: AbortSignal): Promise<Place[]> {
  const name = query.trim()
  if (!name) return []

  const url = new URL(GEOCODING_ENDPOINT)
  url.searchParams.set('name', name)
  url.searchParams.set('count', '5')
  url.searchParams.set('language', 'en')
  url.searchParams.set('format', 'json')

  const payload = await requestJson(url, signal)
  if (!isRecord(payload)) {
    throw new OpenMeteoError('The location search returned an unexpected response.')
  }

  if (payload.results === undefined) return []
  if (!Array.isArray(payload.results)) {
    throw new OpenMeteoError('The location search returned an unexpected response.')
  }

  return payload.results.flatMap((result) => {
    const place = normalizePlace(result)
    return place ? [place] : []
  })
}

/**
 * Load a 7-day forecast. Values stay metric.
 * Times are local wall-clock strings for `timezone=auto`, so callers should
 * display them with `forecast.timezone` instead of parsing them as UTC.
 */
export async function getForecast(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<Forecast> {
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    throw new OpenMeteoError('Latitude must be between -90 and 90.')
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new OpenMeteoError('Longitude must be between -180 and 180.')
  }

  const url = new URL(FORECAST_ENDPOINT)
  url.searchParams.set('latitude', String(latitude))
  url.searchParams.set('longitude', String(longitude))
  url.searchParams.set('current', CURRENT_FIELDS)
  url.searchParams.set('hourly', HOURLY_FIELDS)
  url.searchParams.set('daily', DAILY_FIELDS)
  url.searchParams.set('timezone', 'auto')
  url.searchParams.set('forecast_days', '7')
  url.searchParams.set('temperature_unit', 'celsius')
  url.searchParams.set('wind_speed_unit', 'kmh')
  url.searchParams.set('precipitation_unit', 'mm')

  return normalizeForecast(await requestJson(url, signal))
}

export function normalizeForecast(payload: unknown): Forecast {
  if (!isRecord(payload)) {
    throw new OpenMeteoError('The forecast response was not an object.')
  }

  const latitude = readNumber(payload.latitude)
  const longitude = readNumber(payload.longitude)
  const timezone = readString(payload.timezone)
  if (latitude === null || longitude === null || timezone === null) {
    throw new OpenMeteoError('The forecast response was missing location details.')
  }

  return {
    latitude,
    longitude,
    timezone,
    timezoneAbbreviation: readString(payload.timezone_abbreviation),
    current: normalizeCurrent(payload.current),
    hourly: normalizeHourly(payload.hourly),
    daily: normalizeDaily(payload.daily),
  }
}

async function requestJson(url: URL, signal?: AbortSignal): Promise<unknown> {
  let response: Response
  try {
    response = await fetch(url, {
      signal,
      headers: { Accept: 'application/json' },
    })
  } catch (error) {
    if (isAbortError(error)) throw error
    throw new OpenMeteoError('The weather service could not be reached.')
  }

  const payload = await readBody(response)
  if (!response.ok) {
    throw new OpenMeteoError(
      errorReason(payload) ?? `Weather request failed with HTTP ${response.status}.`,
      response.status,
    )
  }
  if (isRecord(payload) && payload.error === true) {
    throw new OpenMeteoError(
      errorReason(payload) ?? 'The weather service rejected the request.',
      response.status,
    )
  }

  return payload
}

async function readBody(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch (error) {
    if (isAbortError(error)) throw error
    throw new OpenMeteoError('The weather service returned an unreadable response.', response.status)
  }
}

function normalizePlace(value: unknown): Place | null {
  if (!isRecord(value)) return null

  const id = readNumber(value.id)
  const name = readString(value.name)
  const country = readString(value.country)
  const latitude = readNumber(value.latitude)
  const longitude = readNumber(value.longitude)
  if (id === null || name === null || country === null || latitude === null || longitude === null) {
    return null
  }

  return {
    id,
    name,
    country,
    admin1: readString(value.admin1),
    latitude,
    longitude,
    timezone: readString(value.timezone),
  }
}

function normalizeCurrent(value: unknown): CurrentConditions {
  if (!isRecord(value)) {
    throw new OpenMeteoError('The forecast response was missing current conditions.')
  }

  const time = readString(value.time)
  const temperatureC = readNumber(value.temperature_2m)
  const apparentTemperatureC = readNumber(value.apparent_temperature)
  const humidityPercent = readNumber(value.relative_humidity_2m)
  const windSpeedKmh = readNumber(value.wind_speed_10m)
  const precipitationMm = readNumber(value.precipitation)
  const weatherCode = readInteger(value.weather_code)
  if (
    time === null ||
    temperatureC === null ||
    apparentTemperatureC === null ||
    humidityPercent === null ||
    windSpeedKmh === null ||
    precipitationMm === null ||
    weatherCode === null ||
    (value.is_day !== 0 && value.is_day !== 1)
  ) {
    throw new OpenMeteoError('The forecast response was missing current conditions.')
  }

  return {
    time,
    temperatureC,
    apparentTemperatureC,
    humidityPercent,
    windSpeedKmh,
    precipitationMm,
    isDay: value.is_day === 1,
    weather: describeWeather(weatherCode),
  }
}

function normalizeHourly(value: unknown): HourlyForecast[] {
  if (!isRecord(value)) return []

  const times = readStrings(value.time)
  const temperatures = readNumbers(value.temperature_2m)
  const codes = readNumbers(value.weather_code)
  const probabilities = readNumbers(value.precipitation_probability)
  const count = Math.min(times.length, temperatures.length, codes.length)
  const hours: HourlyForecast[] = []

  for (let index = 0; index < count; index += 1) {
    const time = times[index]
    const temperatureC = temperatures[index]
    const weatherCode = readInteger(codes[index])
    if (!time || temperatureC === null || weatherCode === null) continue

    hours.push({
      time,
      temperatureC,
      precipitationProbabilityPercent: probabilities[index] ?? null,
      weather: describeWeather(weatherCode),
    })
  }

  return hours
}

function normalizeDaily(value: unknown): DailyForecast[] {
  if (!isRecord(value)) return []

  const dates = readStrings(value.time)
  const codes = readNumbers(value.weather_code)
  const highs = readNumbers(value.temperature_2m_max)
  const lows = readNumbers(value.temperature_2m_min)
  const precipitation = readNumbers(value.precipitation_sum)
  const count = Math.min(dates.length, codes.length, highs.length, lows.length, precipitation.length)
  const days: DailyForecast[] = []

  for (let index = 0; index < count; index += 1) {
    const date = dates[index]
    const weatherCode = readInteger(codes[index])
    const temperatureMaxC = highs[index]
    const temperatureMinC = lows[index]
    const precipitationMm = precipitation[index]
    if (!date || weatherCode === null || temperatureMaxC === null || temperatureMinC === null || precipitationMm === null) {
      continue
    }

    days.push({
      date,
      temperatureMaxC,
      temperatureMinC,
      precipitationMm,
      weather: describeWeather(weatherCode),
    })
  }

  return days
}

function errorReason(payload: unknown): string | null {
  return isRecord(payload) ? readString(payload.reason) : null
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

function readNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function readInteger(value: unknown): number | null {
  const number = readNumber(value)
  return number !== null && Number.isInteger(number) ? number : null
}

function readStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.map((item) => (typeof item === 'string' ? item : ''))
}

function readNumbers(value: unknown): Array<number | null> {
  if (!Array.isArray(value)) return []
  return value.map((item) => readNumber(item))
}
