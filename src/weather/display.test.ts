import { describe, expect, it } from 'vitest'
import type { Forecast } from '../api/types.ts'
import { formatTemperature, sceneFor, upcomingHours } from './display.ts'

const hour = (time: string, temperatureC: number): Forecast['hourly'][number] => ({
  time,
  temperatureC,
  precipitationProbabilityPercent: null,
  weather: { code: 0, label: 'Clear', condition: 'clear' },
})

const forecast = {
  current: { time: '2026-10-14T15:15' },
  hourly: [
    hour('2026-10-14T14:00', 24),
    hour('2026-10-14T15:00', 23),
    hour('2026-10-14T16:00', 22),
    hour('2026-10-15T15:00', 21),
  ],
} as Forecast

describe('upcomingHours', () => {
  it('starts at the current local hour and keeps the requested count', () => {
    expect(upcomingHours(forecast, 2).map((item) => item.time)).toEqual([
      '2026-10-14T15:00',
      '2026-10-14T16:00',
    ])
  })
})

describe('scene and temperature display', () => {
  it('keeps day and night separate from the weather condition', () => {
    expect(sceneFor('snow', false)).toBe('night-snow')
    expect(sceneFor('rain', true)).toBe('day-rain')
    expect(sceneFor('drizzle', true)).toBe('day-drizzle')
    expect(sceneFor('fog', false)).toBe('night-fog')
    expect(sceneFor('thunderstorm', true)).toBe('day-storm')
    expect(sceneFor('partly-cloudy', false)).toBe('night-partly')
    expect(sceneFor('overcast', true)).toBe('day-overcast')
    expect(sceneFor('clear', false)).toBe('night-clear')
  })

  it('rounds a converted temperature without changing the Celsius source', () => {
    expect(formatTemperature(23.6, 'metric')).toBe('24°')
    expect(formatTemperature(0, 'imperial')).toBe('32°')
  })
})
