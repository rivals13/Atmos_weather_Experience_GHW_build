import { useCallback, useEffect, useRef, useState } from 'react'
import { OpenMeteoError, getForecast, searchPlaces } from '../api/openMeteo.ts'
import type { Forecast, Place } from '../api/types.ts'
import type { UnitSystem } from './units.ts'

const DEFAULT_CITY = 'Kathmandu'
const SEARCH_DELAY_MS = 300

export type RequestState = 'idle' | 'loading' | 'ready' | 'error'

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError'
}

function messageFrom(error: unknown, fallback: string): string {
  return error instanceof OpenMeteoError ? error.message : fallback
}

function kathmanduMatch(places: Place[]): Place | undefined {
  return places.find((place) => place.name === 'Kathmandu' && place.country === 'Nepal') ?? places[0]
}

export function useWeather() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Place[]>([])
  const [searchState, setSearchState] = useState<RequestState>('idle')
  const [searchError, setSearchError] = useState<string | null>(null)
  const [place, setPlace] = useState<Place | null>(null)
  const [forecast, setForecast] = useState<Forecast | null>(null)
  const [forecastState, setForecastState] = useState<RequestState>('loading')
  const [forecastError, setForecastError] = useState<string | null>(null)
  const forecastRequest = useRef<AbortController | null>(null)
  const placeRef = useRef<Place | null>(null)

  const loadForecast = useCallback(async (nextPlace: Place) => {
    forecastRequest.current?.abort()
    const controller = new AbortController()
    forecastRequest.current = controller
    placeRef.current = nextPlace
    setPlace(nextPlace)
    setForecast(null)
    setForecastState('loading')
    setForecastError(null)

    try {
      const nextForecast = await getForecast(nextPlace.latitude, nextPlace.longitude, controller.signal)
      if (controller.signal.aborted) return
      setForecast(nextForecast)
      setForecastState('ready')
    } catch (error) {
      if (isAbortError(error) || controller.signal.aborted) return
      setForecast(null)
      setForecastState('error')
      setForecastError(messageFrom(error, 'Weather data could not be loaded.'))
    }
  }, [])

  const loadDefaultCity = useCallback(
    async (signal?: AbortSignal) => {
      setPlace(null)
      setForecast(null)
      setForecastState('loading')
      setForecastError(null)

      try {
        const places = await searchPlaces(DEFAULT_CITY, signal)
        if (signal?.aborted) return
        const match = kathmanduMatch(places)
        if (!match) {
          setForecastState('error')
          setForecastError('Kathmandu could not be found.')
          return
        }
        await loadForecast(match)
      } catch (error) {
        if (isAbortError(error) || signal?.aborted) return
        setForecastState('error')
        setForecastError(messageFrom(error, 'Weather data could not be loaded.'))
      }
    },
    [loadForecast],
  )

  useEffect(() => {
    const controller = new AbortController()
    void loadDefaultCity(controller.signal)
    return () => {
      controller.abort()
      forecastRequest.current?.abort()
    }
  }, [loadDefaultCity])

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setResults([])
      setSearchState('idle')
      setSearchError(null)
      return
    }

    const controller = new AbortController()
    setSearchState('idle')
    setSearchError(null)

    const timer = window.setTimeout(() => {
      setResults([])
      setSearchState('loading')
      void searchPlaces(trimmed, controller.signal)
        .then((places) => {
          if (controller.signal.aborted) return
          setResults(places)
          setSearchState('ready')
        })
        .catch((error: unknown) => {
          if (isAbortError(error) || controller.signal.aborted) return
          setResults([])
          setSearchState('error')
          setSearchError(messageFrom(error, 'City search could not be completed.'))
        })
    }, SEARCH_DELAY_MS)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  const selectPlace = useCallback(
    (nextPlace: Place) => {
      setQuery('')
      setResults([])
      setSearchState('idle')
      setSearchError(null)
      void loadForecast(nextPlace)
    },
    [loadForecast],
  )

  const retry = useCallback(() => {
    const current = placeRef.current
    if (current) {
      void loadForecast(current)
      return
    }
    void loadDefaultCity()
  }, [loadDefaultCity, loadForecast])

  return {
    unitSystem,
    setUnitSystem,
    query,
    setQuery,
    results,
    searchState,
    searchError,
    place,
    forecast,
    forecastState,
    forecastError,
    selectPlace,
    retry,
  }
}
