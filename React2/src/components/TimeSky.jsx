import { useEffect, useMemo, useRef, useState } from 'react'
import { useMode } from '../context/ModeContext'

/*
  TimeSky — an ambient "time of day" background.

  It reads the viewer's real local time and settles into one of four moods
  (Night · Morning · Day · Evening). Each mood carries a dark AND a light
  palette so the effect reads correctly in either theme. Deliberately few,
  wide time windows — the sky shifts a handful of times a day, not constantly.

  There is no sun/moon disc: the light is expressed as a soft horizon glow
  that leans left at sunrise and right at sunset, so the scene never adds
  another orb to compete with the hero's glass bubbles.

  Every colour below is drawn from the app's warm token ramp
  (espresso → amber → parchment / tawny) so the sky stays on-theme in both
  light and dark. They live here as inline "artwork" values rather than
  semantic tokens because they describe a painted sky, not a UI surface.

  Drop it into any `relative` container as a full-bleed background:
    <div className="relative">
      <TimeSky />
      <div className="relative z-10">…content…</div>
    </div>
*/

const BANDS = {
  night: {
    label: 'Night',
    // deep warm charcoal — espresso ramp; bright stars
    dark:  { top: '#0A0908', mid: '#12100E', bot: '#1D1A17', stars: 1.0, cloudCol: '#262220', cloudO: 0.14, hazeCol: '#543110', hazeO: 0.16, hx: 50, birdO: 0, bird: '#0A0908' },
    // soft warm dusk — parchment/tawny; faint stars, legible under dark text
    light: { top: '#A79E90', mid: '#C9C1B5', bot: '#E4DDD2', stars: 0.15, cloudCol: '#FDFCFA', cloudO: 0.28, hazeCol: '#D8C7A9', hazeO: 0.22, hx: 50, birdO: 0, bird: '#574F45' },
  },
  morning: {
    label: 'Morning',
    dark:  { top: '#1D1A17', mid: '#543110', bot: '#B5732A', stars: 0.18, cloudCol: '#7A4A18', cloudO: 0.30, hazeCol: '#D4924A', hazeO: 0.45, hx: 22, birdO: 0.6, bird: '#1D1A17' },
    light: { top: '#F4F1EB', mid: '#F4DCB4', bot: '#E9C286', stars: 0, cloudCol: '#FFFFFF', cloudO: 0.55, hazeCol: '#F4DCB4', hazeO: 0.50, hx: 22, birdO: 0.5, bird: '#8A6A4A' },
  },
  day: {
    label: 'Day',
    dark:  { top: '#574F45', mid: '#9A5F20', bot: '#E9C286', stars: 0, cloudCol: '#D8D0C3', cloudO: 0.40, hazeCol: '#E0A662', hazeO: 0.35, hx: 50, birdO: 0.7, bird: '#2A1D0E' },
    light: { top: '#E4DDD2', mid: '#F4F1EB', bot: '#FDFCFA', stars: 0, cloudCol: '#FFFFFF', cloudO: 0.60, hazeCol: '#F4DCB4', hazeO: 0.35, hx: 50, birdO: 0.55, bird: '#857C6F' },
  },
  evening: {
    label: 'Evening',
    // golden hour — richest, most saturated warm amber
    dark:  { top: '#2A1D0E', mid: '#9A5F20', bot: '#D4924A', stars: 0.10, cloudCol: '#7A4A18', cloudO: 0.38, hazeCol: '#E0A662', hazeO: 0.55, hx: 80, birdO: 0.6, bird: '#1D1A17' },
    light: { top: '#E9C286', mid: '#E0A662', bot: '#F4DCB4', stars: 0, cloudCol: '#FBFAF8', cloudO: 0.50, hazeCol: '#E0A662', hazeO: 0.50, hx: 80, birdO: 0.5, bird: '#6E6050' },
  },
}

function bandFor(hour) {
  if (hour >= 21 || hour < 5) return 'night'
  if (hour < 10) return 'morning'
  if (hour < 17) return 'day'
  return 'evening'
}

const currentBand = () => {
  const d = new Date()
  return bandFor(d.getHours() + d.getMinutes() / 60)
}

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduce(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduce
}

const TimeSky = ({ className = '', life = true, parallax = true }) => {
  const { mode } = useMode()
  const [band, setBand] = useState(currentBand)
  const reduce = usePrefersReducedMotion()
  const cloudsRef = useRef(null)

  // Re-evaluate the mood once a minute — bands change only a few times a day.
  useEffect(() => {
    const update = () => setBand(currentBand())
    update()
    const id = setInterval(update, 60_000)
    return () => clearInterval(id)
  }, [])

  const animate = life && !reduce
  const stars = useMemo(
    () =>
      Array.from({ length: 80 }, () => ({
        left: `${(Math.random() * 100).toFixed(2)}%`,
        top: `${(Math.random() * 78).toFixed(2)}%`,
        scale: (0.6 + Math.random() * 1.2).toFixed(2),
        dur: `${(2.5 + Math.random() * 4).toFixed(1)}s`,
        delay: `${(Math.random() * 4).toFixed(1)}s`,
      })),
    []
  )

  // Gentle cursor parallax on the drifting clouds (motion-safe only).
  useEffect(() => {
    if (!parallax || reduce) return
    const onMove = (e) => {
      const dx = e.clientX / window.innerWidth - 0.5
      if (cloudsRef.current) cloudsRef.current.style.transform = `translateX(${(dx * 22).toFixed(1)}px)`
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [parallax, reduce])

  const p = BANDS[band][mode === 'light' ? 'light' : 'dark']

  const vars = {
    '--ts-top': p.top,
    '--ts-mid': p.mid,
    '--ts-bot': p.bot,
    '--ts-haze': p.hazeCol,
    '--ts-haze-o': p.hazeO,
    '--ts-glow-x': `${p.hx}%`,
    '--ts-cloud': p.cloudCol,
    '--ts-cloud-o': p.cloudO,
    '--ts-bird': p.bird,
    '--ts-bird-o': p.birdO,
  }

  return (
    <div
      className={`timesky ${animate ? 'timesky--live' : ''} ${className}`}
      style={vars}
      aria-hidden="true"
    >
      <div className="timesky__sky" />
      <div className="timesky__haze" />
      <div className="timesky__stars" style={{ opacity: p.stars }}>
        {stars.map((s, i) => (
          <span
            key={i}
            className="timesky__star"
            style={{ left: s.left, top: s.top, '--ts-dur': s.dur, animationDelay: s.delay, transform: `scale(${s.scale})` }}
          />
        ))}
      </div>
      <div ref={cloudsRef} className="timesky__clouds">
        <span className="timesky__cloud" style={{ '--ts-cd': '140s', left: '-18vw', top: '24%', width: '360px', height: '120px' }} />
        <span className="timesky__cloud" style={{ '--ts-cd': '190s', left: '-18vw', top: '14%', width: '260px', height: '88px', opacity: 0.4 }} />
        <span className="timesky__cloud" style={{ '--ts-cd': '110s', left: '-18vw', top: '40%', width: '440px', height: '150px', opacity: 0.5 }} />
      </div>
      <svg className="timesky__birds" viewBox="0 0 120 40" width="120">
        <path
          d="M8,20 Q14,12 20,20 Q26,12 32,20 M52,26 Q58,18 64,26 Q70,18 76,26 M92,16 Q98,8 104,16 Q110,8 116,16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      <div className="timesky__grain" />
    </div>
  )
}

export default TimeSky
