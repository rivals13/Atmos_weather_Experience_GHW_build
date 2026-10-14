import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import type { FormEvent } from 'react'
import type { Place } from '../api/types.ts'
import type { RequestState } from '../weather/useWeather.ts'
import { placeRegion } from '../weather/display.ts'

type SearchFieldProps = {
  query: string
  results: Place[]
  searchState: RequestState
  searchError: string | null
  onQueryChange: (query: string) => void
  onSelect: (place: Place) => void
}

export function SearchField({
  query,
  results,
  searchState,
  searchError,
  onQueryChange,
  onSelect,
}: SearchFieldProps) {
  const reduceMotion = useReducedMotion()
  const trimmed = query.trim()
  const showResults = trimmed.length >= 2 && (searchState === 'ready' || searchState === 'error' || searchState === 'loading')
  const transition = { duration: reduceMotion ? 0 : 0.2 }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const first = results[0]
    if (first) onSelect(first)
  }

  return (
    <form className="relative min-w-0 flex-1" onSubmit={submit} role="search">
      <label className="sr-only" htmlFor="city-search">
        Search for a city
      </label>
      <input
        id="city-search"
        className="w-full rounded-full border border-white/50 bg-white/80 px-4 py-3 text-base text-[#1c2830] shadow-sm outline-none placeholder:text-[#6d7b83]"
        value={query}
        placeholder="Search for a city"
        role="combobox"
        aria-expanded={showResults && results.length > 0}
        aria-controls="city-results"
        aria-autocomplete="list"
        autoComplete="off"
        onChange={(event) => onQueryChange(event.target.value)}
      />
      <AnimatePresence>
        {showResults ? (
          <motion.div
            key="search-panel"
            className="absolute top-[calc(100%+0.45rem)] right-0 left-0 z-20 overflow-hidden rounded-2xl bg-white text-[#1c2830] shadow-lg"
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 4 }}
            transition={transition}
          >
            {searchState === 'loading' ? (
              <p className="px-4 py-3 text-sm text-[#5e6c74]" role="status">
                Searching…
              </p>
            ) : null}
            {searchState === 'error' ? (
              <p className="px-4 py-3 text-sm text-[#8a3d32]" role="alert">
                {searchError ?? 'City search could not be completed.'}
              </p>
            ) : null}
            {searchState === 'ready' && results.length === 0 ? (
              <p className="px-4 py-3 text-sm text-[#5e6c74]" role="status">
                No matching locations.
              </p>
            ) : null}
            {results.length > 0 ? (
              <ul id="city-results" role="listbox" className="max-h-72 overflow-auto py-1">
                {results.map((place) => (
                  <li key={place.id} role="presentation">
                    <button
                      type="button"
                      role="option"
                      className="flex w-full flex-col px-4 py-2.5 text-left hover:bg-[#f4f1eb]"
                      onClick={() => onSelect(place)}
                    >
                      <span className="font-medium">{place.name}</span>
                      <span className="text-sm text-[#5e6c74]">{placeRegion(place)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </form>
  )
}
