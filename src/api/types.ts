/** Condition groups used by the scene and the forecast labels. */
export type WeatherCondition =
  | 'clear'
  | 'partly-cloudy'
  | 'overcast'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'thunderstorm'
  | 'unknown'

export type WeatherSummary = {
  code: number
  label: string
  condition: WeatherCondition
}

/** A city returned by the Open-Meteo geocoding API. */
export type Place = {
  id: number
  name: string
  country: string
  admin1: string | null
  latitude: number
  longitude: number
  timezone: string | null
}

/**
 * Current conditions in metric units.
 * `time` is the location's local time from Open-Meteo, not a UTC instant.
 */
export type CurrentConditions = {
  time: string
  temperatureC: number
  apparentTemperatureC: number
  humidityPercent: number
  windSpeedKmh: number
  precipitationMm: number
  isDay: boolean
  weather: WeatherSummary
}

/** One hour of the forecast, in the location's local time. */
export type HourlyForecast = {
  time: string
  temperatureC: number
  precipitationProbabilityPercent: number | null
  weather: WeatherSummary
}

/** One local calendar day of the forecast. */
export type DailyForecast = {
  date: string
  temperatureMaxC: number
  temperatureMinC: number
  precipitationMm: number
  weather: WeatherSummary
}

/** Forecast normalized for the UI. Temperatures are Celsius and wind is km/h. */
export type Forecast = {
  latitude: number
  longitude: number
  timezone: string
  timezoneAbbreviation: string | null
  current: CurrentConditions
  hourly: HourlyForecast[]
  daily: DailyForecast[]
}
