import type { WeatherCondition, WeatherSummary } from '../api/types.ts'

type WeatherDefinition = {
  label: string
  condition: WeatherCondition
}

/**
 * WMO weather interpretation codes used by Open-Meteo.
 * Snow and thunderstorms stay in their own groups.
 */
const WEATHER_CODES: Record<number, WeatherDefinition> = {
  0: { label: 'Clear', condition: 'clear' },
  1: { label: 'Mainly clear', condition: 'partly-cloudy' },
  2: { label: 'Partly cloudy', condition: 'partly-cloudy' },
  3: { label: 'Overcast', condition: 'overcast' },
  45: { label: 'Fog', condition: 'fog' },
  48: { label: 'Rime fog', condition: 'fog' },
  51: { label: 'Light drizzle', condition: 'drizzle' },
  53: { label: 'Moderate drizzle', condition: 'drizzle' },
  55: { label: 'Dense drizzle', condition: 'drizzle' },
  56: { label: 'Light freezing drizzle', condition: 'drizzle' },
  57: { label: 'Dense freezing drizzle', condition: 'drizzle' },
  61: { label: 'Slight rain', condition: 'rain' },
  63: { label: 'Moderate rain', condition: 'rain' },
  65: { label: 'Heavy rain', condition: 'rain' },
  66: { label: 'Light freezing rain', condition: 'rain' },
  67: { label: 'Heavy freezing rain', condition: 'rain' },
  71: { label: 'Slight snow', condition: 'snow' },
  73: { label: 'Moderate snow', condition: 'snow' },
  75: { label: 'Heavy snow', condition: 'snow' },
  77: { label: 'Snow grains', condition: 'snow' },
  80: { label: 'Slight rain showers', condition: 'rain' },
  81: { label: 'Moderate rain showers', condition: 'rain' },
  82: { label: 'Violent rain showers', condition: 'rain' },
  85: { label: 'Slight snow showers', condition: 'snow' },
  86: { label: 'Heavy snow showers', condition: 'snow' },
  95: { label: 'Thunderstorm', condition: 'thunderstorm' },
  96: { label: 'Thunderstorm with slight hail', condition: 'thunderstorm' },
  99: { label: 'Thunderstorm with heavy hail', condition: 'thunderstorm' },
}

const UNKNOWN_WEATHER: WeatherDefinition = {
  label: 'Unknown conditions',
  condition: 'unknown',
}

export function describeWeather(code: number): WeatherSummary {
  const definition = Number.isInteger(code) ? WEATHER_CODES[code] : undefined
  const weather = definition ?? UNKNOWN_WEATHER

  return {
    code,
    label: weather.label,
    condition: weather.condition,
  }
}
