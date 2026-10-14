import { describe, expect, it } from 'vitest'
import { describeWeather } from './codes.ts'

describe('describeWeather', () => {
  it('maps representative WMO codes to distinct conditions', () => {
    expect(describeWeather(0)).toMatchObject({ label: 'Clear', condition: 'clear' })
    expect(describeWeather(2)).toMatchObject({ label: 'Partly cloudy', condition: 'partly-cloudy' })
    expect(describeWeather(3)).toMatchObject({ label: 'Overcast', condition: 'overcast' })
    expect(describeWeather(45)).toMatchObject({ label: 'Fog', condition: 'fog' })
    expect(describeWeather(53)).toMatchObject({ label: 'Moderate drizzle', condition: 'drizzle' })
    expect(describeWeather(63)).toMatchObject({ label: 'Moderate rain', condition: 'rain' })
    expect(describeWeather(95)).toMatchObject({ label: 'Thunderstorm', condition: 'thunderstorm' })
  })

  it('keeps snow and thunderstorms out of the rain group', () => {
    for (const code of [71, 73, 75, 77, 85, 86]) {
      expect(describeWeather(code).condition).toBe('snow')
    }
    for (const code of [95, 96, 99]) {
      expect(describeWeather(code).condition).toBe('thunderstorm')
    }
    expect(describeWeather(66).condition).toBe('rain')
  })

  it('describes unknown codes without inventing a condition', () => {
    expect(describeWeather(999)).toEqual({
      code: 999,
      label: 'Unknown conditions',
      condition: 'unknown',
    })
    expect(describeWeather(1.5).condition).toBe('unknown')
    expect(describeWeather(Number.NaN).condition).toBe('unknown')
  })
})
