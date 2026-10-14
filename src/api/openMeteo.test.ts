import { afterEach, describe, expect, it, vi } from 'vitest'
import { OpenMeteoError, getForecast, normalizeForecast, searchPlaces } from './openMeteo.ts'

const kathmanduForecast = {
  latitude: 27.732864,
  longitude: 85.34831,
  timezone: 'Asia/Kathmandu',
  timezone_abbreviation: 'GMT+5:45',
  current: {
    time: '2026-10-14T15:15',
    temperature_2m: 23.6,
    apparent_temperature: 24.1,
    relative_humidity_2m: 53,
    weather_code: 1,
    wind_speed_10m: 4.5,
    precipitation: 0,
    is_day: 1,
  },
  hourly: {
    time: ['2026-10-14T14:00', '2026-10-14T15:00', '2026-10-14T16:00'],
    temperature_2m: [24.1, null, 22.4],
    weather_code: [1, 71, 71],
    precipitation_probability: [49, 10, 0],
  },
  daily: {
    time: ['2026-10-14', '2026-10-15'],
    weather_code: [51, 71],
    temperature_2m_max: [25.1, 18.2],
    temperature_2m_min: [14.5, null],
    precipitation_sum: [0.5, 3.2],
  },
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('normalizeForecast', () => {
  it('keeps metric values, local time, and drops incomplete rows', () => {
    const forecast = normalizeForecast(kathmanduForecast)

    expect(forecast.timezone).toBe('Asia/Kathmandu')
    expect(forecast.current).toMatchObject({
      time: '2026-10-14T15:15',
      temperatureC: 23.6,
      windSpeedKmh: 4.5,
      isDay: true,
      weather: { code: 1, condition: 'partly-cloudy' },
    })
    expect(forecast.hourly.map((hour) => hour.weather.condition)).toEqual([
      'partly-cloudy',
      'snow',
    ])
    expect(forecast.hourly[1]?.precipitationProbabilityPercent).toBe(0)
    expect(forecast.daily).toHaveLength(1)
    expect(forecast.daily[0]?.weather.condition).toBe('drizzle')
  })

  it('reads is_day as night only when the API sends 0', () => {
    const forecast = normalizeForecast({
      ...kathmanduForecast,
      current: { ...kathmanduForecast.current, is_day: 0, weather_code: 0 },
    })

    expect(forecast.current.isDay).toBe(false)
    expect(forecast.current.weather.condition).toBe('clear')
  })

  it('rejects a forecast that cannot describe current conditions', () => {
    expect(() => normalizeForecast({ latitude: 1, longitude: 2, timezone: 'UTC' })).toThrow(
      OpenMeteoError,
    )
    expect(() =>
      normalizeForecast({
        ...kathmanduForecast,
        current: { ...kathmanduForecast.current, temperature_2m: null },
      }),
    ).toThrow(/current conditions/)
  })
})

describe('Open-Meteo requests', () => {
  it('requests the forecast fields, metric units, and timezone=auto', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      expect(String(input)).toContain('timezone=auto')
      expect(String(input)).toContain('temperature_unit=celsius')
      expect(String(input)).toContain('wind_speed_unit=kmh')
      expect(String(input)).toContain('is_day')
      return Response.json(kathmanduForecast)
    })
    vi.stubGlobal('fetch', fetchMock)

    const forecast = await getForecast(27.70169, 85.3206)

    expect(fetchMock).toHaveBeenCalledOnce()
    expect(forecast.current.temperatureC).toBe(23.6)
  })

  it('surfaces HTTP errors and rethrows aborted requests', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ reason: 'Latitude must be in range' }, { status: 400 })),
    )

    await expect(getForecast(27.7, 85.3)).rejects.toMatchObject({
      name: 'OpenMeteoError',
      status: 400,
      message: 'Latitude must be in range',
    })

    const aborted = new DOMException('The operation was aborted.', 'AbortError')
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw aborted
      }),
    )
    await expect(getForecast(27.7, 85.3)).rejects.toBe(aborted)
  })

  it('returns no places for a blank search and skips malformed geocoding rows', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    await expect(searchPlaces('   ')).resolves.toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()

    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({
          results: [
            {
              id: 1283240,
              name: 'Kathmandu',
              latitude: 27.70169,
              longitude: 85.3206,
              country: 'Nepal',
              admin1: 'Bagmati Province',
              timezone: 'Asia/Kathmandu',
            },
            { name: 'Incomplete' },
          ],
        }),
      ),
    )

    await expect(searchPlaces('Kathmandu')).resolves.toEqual([
      {
        id: 1283240,
        name: 'Kathmandu',
        country: 'Nepal',
        admin1: 'Bagmati Province',
        latitude: 27.70169,
        longitude: 85.3206,
        timezone: 'Asia/Kathmandu',
      },
    ])
  })
})
