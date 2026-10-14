import type { Forecast } from '../api/types.ts'
import type { UnitSystem } from '../weather/units.ts'
import { DailyForecastList } from './DailyForecast.tsx'
import { HourlyForecastList } from './HourlyForecast.tsx'
import { WeatherDetails } from './WeatherDetails.tsx'

type ForecastPanelProps = {
  forecast: Forecast | null
  unitSystem: UnitSystem
  message: string | null
}

export function ForecastPanel({ forecast, unitSystem, message }: ForecastPanelProps) {
  return (
    <section className="relative z-10 -mt-8 rounded-t-[2rem] bg-[#f7f4ef] px-5 pt-7 pb-8 text-[#1c2830] sm:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-7">
        {forecast ? (
          <>
            <WeatherDetails forecast={forecast} unitSystem={unitSystem} />
            <HourlyForecastList forecast={forecast} unitSystem={unitSystem} />
            <DailyForecastList forecast={forecast} unitSystem={unitSystem} />
          </>
        ) : (
          <p className="text-sm text-[#5e6c74]" role="status">
            {message ?? 'Forecast loading.'}
          </p>
        )}
        <p className="text-xs text-[#5e6c74]">
          Weather data by{' '}
          <a className="underline" href="https://open-meteo.com/" target="_blank" rel="noreferrer">
            Open-Meteo
          </a>
        </p>
      </div>
    </section>
  )
}
