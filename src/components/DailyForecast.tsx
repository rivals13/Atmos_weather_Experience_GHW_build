import type { Forecast } from '../api/types.ts'
import { formatDayLabel, formatTemperature } from '../weather/display.ts'
import type { UnitSystem } from '../weather/units.ts'
import { WeatherIcon } from './WeatherIcon.tsx'

type DailyForecastProps = {
  forecast: Forecast
  unitSystem: UnitSystem
}

export function DailyForecastList({ forecast, unitSystem }: DailyForecastProps) {
  const today = forecast.current.time.slice(0, 10)

  return (
    <section aria-labelledby="daily-heading">
      <h2 id="daily-heading" className="text-sm tracking-[0.14em] text-[#5e6c74] uppercase">
        Seven day
      </h2>
      {forecast.daily.length === 0 ? (
        <p className="mt-3 text-sm text-[#5e6c74]">Daily forecast is unavailable.</p>
      ) : (
        <ul className="mt-2 divide-y divide-[#e4e0d8]">
          {forecast.daily.map((day) => (
            <li key={day.date} className="grid grid-cols-[4.5rem_1.5rem_1fr_auto] items-center gap-3 py-3">
              <span className="font-medium text-[#1c2830]">{formatDayLabel(day.date, today)}</span>
              <WeatherIcon condition={day.weather.condition} className="h-6 w-6 text-[#1c2830]" />
              <span className="truncate text-sm text-[#5e6c74]">{day.weather.label}</span>
              <span className="text-[#1c2830]">
                <span className="font-medium">{formatTemperature(day.temperatureMaxC, unitSystem)}</span>
                <span className="ml-2 text-[#5e6c74]">{formatTemperature(day.temperatureMinC, unitSystem)}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
