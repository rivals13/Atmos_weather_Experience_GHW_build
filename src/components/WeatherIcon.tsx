import type { WeatherCondition } from '../api/types.ts'

type WeatherIconProps = {
  condition: WeatherCondition
  night?: boolean
  className?: string
}

export function WeatherIcon({ condition, night = false, className }: WeatherIconProps) {
  const nightSky = night && (condition === 'clear' || condition === 'partly-cloudy')

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {nightSky && condition === 'clear' ? <Moon /> : null}
      {nightSky && condition === 'partly-cloudy' ? (
        <>
          <Moon compact />
          <Cloud y={16} />
        </>
      ) : null}
      {!nightSky && condition === 'clear' ? <Sun /> : null}
      {!nightSky && condition === 'partly-cloudy' ? (
        <>
          <Sun compact />
          <Cloud y={16} />
        </>
      ) : null}
      {condition === 'overcast' || condition === 'unknown' ? <Cloud y={13} /> : null}
      {condition === 'fog' ? <Fog /> : null}
      {condition === 'drizzle' || condition === 'rain' ? (
        <>
          <Cloud y={11} />
          <Rain />
        </>
      ) : null}
      {condition === 'snow' ? (
        <>
          <Cloud y={11} />
          <Snow />
        </>
      ) : null}
      {condition === 'thunderstorm' ? (
        <>
          <Cloud y={10} />
          <Bolt />
        </>
      ) : null}
    </svg>
  )
}

function Sun({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <>
        <circle cx="16" cy="7" r="2.2" />
        <path d="M16 3.2v1.1M16 9.7v1.1M12.2 7h1.1M18.7 7h1.1" />
      </>
    )
  }

  return (
    <>
      <circle cx="12" cy="12" r="3.4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
    </>
  )
}

function Moon({ compact = false }: { compact?: boolean }) {
  return (
    <path
      d={
        compact
          ? 'M16.2 3.4a3.6 3.6 0 1 0 2.4 6.2 2.8 2.8 0 0 1-2.4-6.2Z'
          : 'M14.5 4.2a6.2 6.2 0 1 0 4.2 10.6 4.8 4.8 0 0 1-4.2-10.6Z'
      }
    />
  )
}

function Cloud({ y }: { y: number }) {
  return <path d={`M6.2 ${y}h8.6a3 3 0 0 0 .3-6 4 4 0 0 0-7.6-1A2.8 2.8 0 0 0 6.2 ${y}Z`} />
}

function Rain() {
  return <path d="M8 17.2v2.2M12 17.2v2.2M16 17.2v2.2" />
}

function Snow() {
  return (
    <>
      <path d="M8 17.4v.2M12 18.2v.2M16 17.4v.2" />
      <circle cx="8" cy="18.6" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="12" cy="19.5" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="16" cy="18.6" r="0.7" fill="currentColor" stroke="none" />
    </>
  )
}

function Fog() {
  return <path d="M5 9.5h14M4 13h16M6 16.5h12" />
}

function Bolt() {
  return <path d="M13 15.5 10.8 19h2.2l-1 3.2 3.6-4.2h-2.2l1-2.5Z" />
}
