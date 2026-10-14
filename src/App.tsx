import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Landscape } from './components/Landscape.tsx'
import { ForecastPanel } from './components/ForecastPanel.tsx'
import { SearchField } from './components/SearchField.tsx'
import { UnitToggle } from './components/UnitToggle.tsx'
import { WeatherHero } from './components/WeatherHero.tsx'
import { sceneFor, type SceneId } from './weather/display.ts'
import { useWeather } from './weather/useWeather.ts'

function App() {
  const reduceMotion = useReducedMotion()
  const weather = useWeather()
  const scene: SceneId = weather.forecast
    ? sceneFor(weather.forecast.current.weather.condition, weather.forecast.current.isDay)
    : 'day-overcast'
  const transition = { duration: reduceMotion ? 0 : 0.35 }

  return (
    <div className="app" data-scene={scene}>
      <header className="relative z-30 mx-auto flex w-full max-w-5xl flex-col gap-3 px-5 pt-5 sm:flex-row sm:items-center">
        <p className="text-sm tracking-[0.22em] uppercase">Atmos</p>
        <SearchField
          query={weather.query}
          results={weather.results}
          searchState={weather.searchState}
          searchError={weather.searchError}
          onQueryChange={weather.setQuery}
          onSelect={weather.selectPlace}
        />
        <UnitToggle unitSystem={weather.unitSystem} onChange={weather.setUnitSystem} />
      </header>

      <div className="stage relative flex min-h-[28rem] flex-1 flex-col md:min-h-[34rem]">
        <Landscape scene={scene} />
        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 items-end px-5 pt-10 pb-16">
          <AnimatePresence mode="wait">
            {weather.forecastState === 'ready' && weather.forecast && weather.place ? (
              <motion.div
                key={weather.place.id}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0 }}
                transition={transition}
              >
                <WeatherHero place={weather.place} forecast={weather.forecast} unitSystem={weather.unitSystem} />
              </motion.div>
            ) : null}
            {weather.forecastState === 'loading' ? (
              <motion.p
                key="loading"
                className="text-lg"
                role="status"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0 }}
                transition={transition}
              >
                {weather.place ? `Loading weather for ${weather.place.name}…` : 'Loading weather for Kathmandu…'}
              </motion.p>
            ) : null}
            {weather.forecastState === 'error' ? (
              <motion.div
                key="error"
                role="alert"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0 }}
                transition={transition}
              >
                <p className="max-w-md text-lg">
                  {weather.forecastError ?? 'Weather data could not be loaded.'}
                </p>
                <button
                  type="button"
                  className="mt-4 rounded-full bg-white/80 px-4 py-2 text-sm text-[#1c2830]"
                  onClick={weather.retry}
                >
                  Try again
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <ForecastPanel
        forecast={weather.forecastState === 'ready' ? weather.forecast : null}
        unitSystem={weather.unitSystem}
        message={
          weather.forecastState === 'error'
            ? 'The forecast is unavailable until the request succeeds.'
            : 'Forecast loading.'
        }
      />
    </div>
  )
}

export default App
