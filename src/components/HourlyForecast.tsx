import type { Forecast } from '../api/types.ts'
import { formatHourLabel, formatPercent, formatTemperature, upcomingHours } from '../weather/display.ts'
import type { UnitSystem } from '../weather/units.ts'
import { WeatherIcon } from './WeatherIcon.tsx'

type HourlyForecastProps = {
  forecast: Forecast
  unitSystem: UnitSystem
}

export function HourlyForecastList({ forecast, unitSystem }: HourlyForecastProps) {
  const hours = upcomingHours(forecast)

  return (
    <section aria-labelledby="hourly-heading">
      <h2 id="hourly-heading" className="text-sm tracking-[0.14em] text-[#5e6c74] uppercase">
        Next 24 hours
      </h2>
      {hours.length === 0 ? (
        <p className="mt-3 text-sm text-[#5e6c74]">Hourly forecast is unavailable.</p>
      ) : (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-2">
          {hours.map((hour) => (
            <li
              key={hour.time}
              className="flex w-20 shrink-0 flex-col items-center gap-1 rounded-2xl bg-[#f3f0ea] px-2 py-3 text-center text-[#1c2830]"
            >
              <span className="text-xs text-[#5e6c74]">{formatHourLabel(hour.time)}</span>
              <WeatherIcon condition={hour.weather.condition} className="h-6 w-6" />
              <span className="text-lg font-light">{formatTemperature(hour.temperatureC, unitSystem)}</span>
              {hour.precipitationProbabilityPercent !== null ? (
                <span className="text-xs text-[#5e6c74]">
                  {formatPercent(hour.precipitationProbabilityPercent)}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
