import type { Forecast } from '../api/types.ts'
import { formatPrecipitation, formatPercent, formatTemperature, formatWind } from '../weather/display.ts'
import type { UnitSystem } from '../weather/units.ts'

type WeatherDetailsProps = {
  forecast: Forecast
  unitSystem: UnitSystem
}

export function WeatherDetails({ forecast, unitSystem }: WeatherDetailsProps) {
  const current = forecast.current
  const details = [
    ['Feels like', formatTemperature(current.apparentTemperatureC, unitSystem)],
    ['Humidity', formatPercent(current.humidityPercent)],
    ['Wind', formatWind(current.windSpeedKmh, unitSystem)],
    ['Precipitation', formatPrecipitation(current.precipitationMm)],
  ] as const

  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {details.map(([label, value]) => (
        <div key={label} className="rounded-2xl bg-[#f3f0ea] px-4 py-3">
          <dt className="text-xs tracking-[0.14em] text-[#5e6c74] uppercase">{label}</dt>
          <dd className="mt-1 text-2xl font-light text-[#1c2830]">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
