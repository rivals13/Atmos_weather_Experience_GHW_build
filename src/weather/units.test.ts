import { describe, expect, it } from 'vitest'
import {
  celsiusToFahrenheit,
  kmhToMph,
  temperatureFromCelsius,
  temperatureUnit,
  windFromKmh,
  windUnit,
} from './units.ts'

describe('temperature conversion', () => {
  it('converts Celsius to Fahrenheit at the standard anchors', () => {
    expect(celsiusToFahrenheit(0)).toBe(32)
    expect(celsiusToFahrenheit(100)).toBe(212)
    expect(celsiusToFahrenheit(-40)).toBe(-40)
  })

  it('keeps Celsius as the stored value in the metric system', () => {
    expect(temperatureFromCelsius(23.6, 'metric')).toBe(23.6)
    expect(temperatureFromCelsius(23.6, 'imperial')).toBeCloseTo(74.48, 2)
    expect(temperatureUnit('metric')).toBe('°C')
    expect(temperatureUnit('imperial')).toBe('°F')
  })
})

describe('wind conversion', () => {
  it('converts km/h to mph with the statute mile', () => {
    expect(kmhToMph(0)).toBe(0)
    expect(kmhToMph(1.609344)).toBeCloseTo(1, 5)
    expect(kmhToMph(16.09344)).toBeCloseTo(10, 5)
  })

  it('keeps km/h as the stored value in the metric system', () => {
    expect(windFromKmh(4.5, 'metric')).toBe(4.5)
    expect(windFromKmh(4.5, 'imperial')).toBeCloseTo(2.79617, 4)
    expect(windUnit('metric')).toBe('km/h')
    expect(windUnit('imperial')).toBe('mph')
  })
})
