import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useEffect, useRef, useState } from 'react'
import type { SceneId } from '../weather/display.ts'

type LandscapeProps = {
  scene: SceneId
}

const RAIN = [
  [140, 150],
  [210, 210],
  [280, 170],
  [360, 240],
  [450, 160],
  [530, 220],
  [620, 180],
  [710, 250],
  [800, 170],
  [890, 230],
  [980, 160],
  [1080, 210],
  [1170, 180],
  [1260, 240],
] as const

const SNOW = [
  [160, 140],
  [250, 200],
  [340, 120],
  [460, 210],
  [560, 150],
  [680, 230],
  [790, 140],
  [900, 200],
  [1020, 130],
  [1140, 220],
  [1240, 160],
] as const

export function Landscape({ scene }: LandscapeProps) {
  const landscapeRef = useRef<SVGSVGElement>(null)
  const reducedMotion = useReducedMotionPreference()
  const night = scene.startsWith('night')

  useGSAP(
    () => {
      if (reducedMotion) return

      gsap.to('.mountain-far', {
        x: -16,
        duration: 54,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })
      gsap.to('.mountain', {
        x: -26,
        duration: 48,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })
      gsap.to('.hill-back', {
        x: 12,
        duration: 46,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })
      gsap.to('.hill-front', {
        x: 8,
        duration: 40,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })

      if (!scene.endsWith('-clear')) {
        gsap.to('.cloud-slow', {
          x: 36,
          duration: 56,
          ease: 'none',
          repeat: -1,
          yoyo: true,
        })
        gsap.to('.cloud-fast', {
          x: 58,
          duration: 42,
          ease: 'none',
          repeat: -1,
          yoyo: true,
        })
      }

      if (scene.endsWith('-clear') || scene.endsWith('-partly')) {
        gsap.to(night ? '.moon' : '.sun', {
          y: -8,
          duration: 18,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        })
      }

      if (scene.endsWith('-fog')) {
        gsap.to('.mist', {
          x: 28,
          duration: 36,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        })
      }

      if (scene.endsWith('-drizzle') || scene.endsWith('-rain') || scene.endsWith('-storm')) {
        const drizzle = scene.endsWith('-drizzle')
        gsap.to(drizzle ? '.precip-drizzle .drop' : '.precip-rain .drop', {
          y: drizzle ? 52 : 86,
          duration: drizzle ? 2.6 : scene.endsWith('-storm') ? 0.95 : 1.35,
          ease: 'none',
          repeat: -1,
          stagger: { each: 0.07, from: 'random' },
        })
      }

      if (scene.endsWith('-storm')) {
        gsap.fromTo(
          '.lightning',
          { opacity: 0.28 },
          {
            opacity: 0.95,
            duration: 0.08,
            ease: 'none',
            repeat: -1,
            yoyo: true,
            repeatDelay: 5.5,
          },
        )
      }

      if (scene.endsWith('-snow')) {
        gsap.to('.flake', {
          y: 110,
          duration: 8,
          ease: 'none',
          repeat: -1,
          stagger: { each: 0.35, from: 'random' },
        })
      }
    },
    { scope: landscapeRef, dependencies: [scene, reducedMotion] },
  )

  return (
    <svg
      ref={landscapeRef}
      className="landscape"
      viewBox="0 0 1440 760"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <g className="stars">
        <circle cx="160" cy="190" r="1.5" />
        <circle cx="280" cy="250" r="1.2" />
        <circle cx="390" cy="180" r="1.6" />
        <circle cx="520" cy="240" r="1.2" />
        <circle cx="640" cy="175" r="1.4" />
        <circle cx="760" cy="230" r="1.1" />
        <circle cx="210" cy="300" r="1.2" />
        <circle cx="900" cy="200" r="1.5" />
        <circle cx="1080" cy="250" r="1.2" />
      </g>
      <g className="sun">
        <circle className="sun-halo" cx="980" cy="250" r="70" />
        <circle cx="980" cy="250" r="36" />
      </g>
      <path className="moon" d="M968 210a30 30 0 1 0 2 60 24 24 0 1 1-2-60Z" />
      <g className="cloud-layer cloud-partly cloud-slow">
        <CloudShape x={250} y={200} scale={0.9} />
        <CloudShape x={620} y={230} scale={0.7} />
      </g>
      <g className="cloud-layer cloud-overcast cloud-fast">
        <CloudShape x={80} y={190} scale={1} />
        <CloudShape x={360} y={230} scale={1.2} />
        <CloudShape x={700} y={180} scale={1.1} />
        <CloudShape x={1020} y={240} scale={0.85} />
      </g>
      <g className="precip precip-drizzle">
        {RAIN.filter((_, index) => index % 2 === 0).map(([x, y]) => (
          <line key={`d-${x}`} className="drop" x1={x} y1={y} x2={x - 3} y2={y + 12} />
        ))}
      </g>
      <g className="precip precip-rain">
        {RAIN.map(([x, y]) => (
          <line key={`r-${x}`} className="drop" x1={x} y1={y} x2={x - 5} y2={y + 22} />
        ))}
      </g>
      <g className="precip precip-snow">
        {SNOW.map(([x, y]) => (
          <circle key={`s-${x}`} className="flake" cx={x} cy={y} r="2.4" />
        ))}
      </g>
      <path className="lightning" d="M700 210l-28 62h28l-34 74 78-84h-30l28-52Z" />
      <path
        className="mountain-far"
        d="M-80 470C40 430 120 280 240 360c80 54 130-20 210-70 90-56 150 40 250 10 110-32 150-120 260-90 120 34 160 90 270 40 90-40 160 20 250-10 80-26 140 30 240 10v510H-80Z"
      />
      <path
        className="mountain"
        d="M-80 540C60 470 150 390 280 460c120 64 160-40 280-10 130 32 170-80 300-20 140 64 180-30 310 20 110 42 170-10 270 16 70 18 120 40 180 24v270H-80Z"
      />
      <path
        className="hill-back"
        d="M-80 620C140 540 300 670 540 600c250-72 360 70 620-10 180-56 280 20 440-20v190H-80Z"
      />
      <ellipse className="mist" cx="420" cy="600" rx="360" ry="46" />
      <ellipse className="mist mist-far" cx="1040" cy="540" rx="400" ry="38" />
      <path
        className="hill-mid"
        d="M-80 680C180 620 360 740 640 670c280-70 400 60 680-16 140-38 220 10 280-8v114H-80Z"
      />
      <path className="snow-cap" d="M-80 680C180 620 360 740 640 670c280-70 400 60 680-16 140-38 220 10 280-8v34c-80 18-180-6-300 20-220 48-360-70-620 8C360 760 180 660-80 710Z" />
      <path
        className="hill-front"
        d="M-80 730C200 680 420 760 720 710c300-50 420 40 800-16v86H-80Z"
      />
    </svg>
  )
}

function CloudShape({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="46" cy="34" rx="36" ry="20" />
      <ellipse cx="78" cy="30" rx="28" ry="18" />
      <ellipse cx="62" cy="44" rx="48" ry="16" />
    </g>
  )
}

function useReducedMotionPreference() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return reduced
}
