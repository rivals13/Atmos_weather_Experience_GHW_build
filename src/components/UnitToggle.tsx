import type { UnitSystem } from '../weather/units.ts'

type UnitToggleProps = {
  unitSystem: UnitSystem
  onChange: (unitSystem: UnitSystem) => void
}

export function UnitToggle({ unitSystem, onChange }: UnitToggleProps) {
  return (
    <div className="flex w-fit self-start rounded-full bg-white/75 p-1 text-sm text-[#1c2830] shadow-sm" role="group" aria-label="Temperature unit">
      <UnitButton active={unitSystem === 'metric'} onClick={() => onChange('metric')}>
        °C
      </UnitButton>
      <UnitButton active={unitSystem === 'imperial'} onClick={() => onChange('imperial')}>
        °F
      </UnitButton>
    </div>
  )
}

function UnitButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: string
}) {
  return (
    <button
      type="button"
      className={`rounded-full px-3 py-1.5 ${active ? 'bg-[#1c2830] text-white' : 'text-[#1c2830]'}`}
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
