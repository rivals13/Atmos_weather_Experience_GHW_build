import type { Forecast, Place } from '../api/types.ts'
import { formatClock, formatTemperatureValue, placeRegion } from '../weather/display.ts'
import { temperatureUnit, type UnitSystem } from '../weather/units.ts'
import { WeatherIcon } from './WeatherIcon.tsx'

type WeatherHeroProps = {
  place: Place
  forecast: Forecast
  unitSystem: UnitSystem
}

export function WeatherHero({ place, forecast, unitSystem }: WeatherHeroProps) {
  const current = forecast.current
  const period = current.isDay ? 'Day' : 'Night'

  return (
    <div className="max-w-xl">
      <p className="text-sm tracking-[0.16em] uppercase opacity-80">{placeRegion(place)}</p>
      <h1 className="mt-1 text-4xl font-medium tracking-tight sm:text-5xl">{place.name}</h1>
      <p className="mt-3 flex items-start gap-2 leading-none">
        <span className="text-[clamp(4.5rem,13vw,7.5rem)] font-light tracking-[-0.06em]">
          {formatTemperatureValue(current.temperatureC, unitSystem)}
        </span>
        <span className="pt-4 text-2xl sm:pt-6 sm:text-3xl">{temperatureUnit(unitSystem)}</span>
      </p>
      <p className="mt-2 flex items-center gap-2 text-lg">
        <WeatherIcon
          condition={current.weather.condition}
          night={!current.isDay}
          className="h-7 w-7"
        />
        <span>
          {current.weather.label}
          <span className="opacity-70"> · {period}</span>
        </span>
      </p>
      <p className="mt-2 text-sm opacity-75">Updated {formatClock(current.time)}</p>
    </div>
  )
}
