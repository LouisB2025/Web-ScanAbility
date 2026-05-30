'use client'

import { useId } from 'react'

export function LogoMark({ size = 32 }: { size?: number }) {
  const uid = useId().replace(/:/g, '')
  const edgeGrad   = `sa-edge-${uid}`
  const bodyGrad   = `sa-body-${uid}`
  const glowGrad   = `sa-glow-${uid}`
  const leftBand   = `sa-lb-${uid}`
  const rightBand  = `sa-rb-${uid}`
  const centerBand = `sa-cb-${uid}`

  const h = Math.round(size * 1.2)

  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 48 58"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Outer shield edge: teal top-left → green → orange bottom-right */}
        <linearGradient id={edgeGrad} x1="0" y1="0" x2="48" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#0fcfcf" />
          <stop offset="35%"  stopColor="#22c55e" />
          <stop offset="65%"  stopColor="#16a34a" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
        {/* Dark inner body */}
        <linearGradient id={bodyGrad} x1="24" y1="4" x2="24" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#061c19" />
          <stop offset="100%" stopColor="#020d0b" />
        </linearGradient>
        {/* Radial teal glow inside */}
        <radialGradient id={glowGrad} cx="45%" cy="35%" r="55%">
          <stop offset="0%"   stopColor="#0fcfcf" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#0fcfcf" stopOpacity="0" />
        </radialGradient>
        {/* Left flowing band: teal → cyan → green */}
        <linearGradient id={leftBand} x1="10" y1="12" x2="26" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#0fcfcf" />
          <stop offset="50%"  stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
        {/* Right flowing band: orange → amber */}
        <linearGradient id={rightBand} x1="42" y1="10" x2="22" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#fb923c" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
        {/* Centre accent: electric blue */}
        <linearGradient id={centerBand} x1="24" y1="22" x2="24" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
      </defs>

      {/* ── WiFi arcs — top right, above shield ── */}
      <path d="M34 6 Q40 1 46 6"    stroke="#22c55e" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.95" />
      <path d="M36 9.5 Q40 6.5 44 9.5" stroke="#0fcfcf" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.8" />
      <circle cx="40" cy="12.5" r="1.5" fill="#0fcfcf" fillOpacity="0.85" />

      {/* ── Outer shield (gradient border shell) ── */}
      <path
        d="M24 2 C30 1.5 42 6 44 10 L44 30 C44 42 35 51 24 55 C13 51 4 42 4 30 L4 10 C6 6 18 1.5 24 2 Z"
        fill={`url(#${edgeGrad})`}
      />
      {/* ── Inner shield (dark body) ── */}
      <path
        d="M24 5.5 C29.5 5 40 9 41 12.5 L41 30 C41 40.5 33 48.5 24 52 C15 48.5 7 40.5 7 30 L7 12.5 C8 9 18.5 5 24 5.5 Z"
        fill={`url(#${bodyGrad})`}
      />
      {/* ── Radial glow ── */}
      <path
        d="M24 5.5 C29.5 5 40 9 41 12.5 L41 30 C41 40.5 33 48.5 24 52 C15 48.5 7 40.5 7 30 L7 12.5 C8 9 18.5 5 24 5.5 Z"
        fill={`url(#${glowGrad})`}
      />

      {/* ── Left flowing band (teal/cyan S-ribbon) ── */}
      <path
        d="M11 14 C14 12 18 16 18 21 C18 26 13 28 13 33 C13 38 18 41 20 46"
        stroke={`url(#${leftBand})`}
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
      {/* highlight edge on left band */}
      <path
        d="M11 14 C14 12 18 16 18 21 C18 26 13 28 13 33 C13 38 18 41 20 46"
        stroke="#0fcfcf"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />

      {/* ── Right flowing band (orange ribbon) ── */}
      <path
        d="M37 14 C34 12 30 16 30 21 C30 26 35 29 35 34 C35 39 30 42 28 46"
        stroke={`url(#${rightBand})`}
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
        opacity="0.88"
      />
      {/* highlight edge on right band */}
      <path
        d="M37 14 C34 12 30 16 30 21 C30 26 35 29 35 34 C35 39 30 42 28 46"
        stroke="#fb923c"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />

      {/* ── Centre electric-blue crossing accent ── */}
      <path
        d="M16 27 C19 24 22 27 24 28 C26 29 29 27 32 24"
        stroke={`url(#${centerBand})`}
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />

      {/* ── Eye icon (upper left) ── */}
      <g opacity="0.92">
        <path
          d="M9 20 Q13.5 15 18 20 Q13.5 25 9 20 Z"
          fill="white"
          fillOpacity="0.1"
          stroke="#0fcfcf"
          strokeWidth="0.9"
        />
        <circle cx="13.5" cy="20" r="2"   fill="#0fcfcf" fillOpacity="0.25" />
        <circle cx="13.5" cy="20" r="1.2" fill="white"   fillOpacity="0.9" />
        <circle cx="14.2" cy="19.4" r="0.5" fill="white" fillOpacity="0.7" />
      </g>

      {/* ── Lightbulb icon (upper right) ── */}
      <g opacity="0.9">
        {/* Bulb globe */}
        <circle cx="34.5" cy="18" r="3" fill="none" stroke="#f59e0b" strokeWidth="0.9" />
        {/* Filament base lines */}
        <line x1="33" y1="21" x2="36" y2="21" stroke="#f59e0b" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="33.3" y1="22.5" x2="35.7" y2="22.5" stroke="#f59e0b" strokeWidth="0.7" strokeLinecap="round" />
        {/* Rays */}
        <line x1="34.5" y1="14.5" x2="34.5" y2="13.2" stroke="#f59e0b" strokeWidth="0.7" strokeLinecap="round" />
        <line x1="37.7" y1="15.3" x2="38.6" y2="14.4" stroke="#f59e0b" strokeWidth="0.7" strokeLinecap="round" />
        <line x1="31.3" y1="15.3" x2="30.4" y2="14.4" stroke="#f59e0b" strokeWidth="0.7" strokeLinecap="round" />
        <line x1="38.8" y1="18" x2="40" y2="18" stroke="#f59e0b" strokeWidth="0.7" strokeLinecap="round" />
        <line x1="30.2" y1="18" x2="29" y2="18" stroke="#f59e0b" strokeWidth="0.7" strokeLinecap="round" />
        {/* Glow dot */}
        <circle cx="34.5" cy="18" r="1.2" fill="#f59e0b" fillOpacity="0.35" />
      </g>

      {/* ── Cursor / hand icon (centre) ── */}
      <g opacity="0.88">
        {/* Pointer finger */}
        <path
          d="M22 31 L22 36.5 Q22 38 23.5 38 Q25 38 25 36.5 L25 34"
          stroke="#38bdf8"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Circle button being pressed */}
        <circle cx="24" cy="30" r="2.2" fill="none" stroke="#38bdf8" strokeWidth="0.9" />
        <circle cx="24" cy="30" r="1"   fill="#38bdf8" fillOpacity="0.6" />
      </g>

      {/* ── Gear + W icon (lower centre) ── */}
      <g opacity="0.88">
        {/* Inner circle */}
        <circle cx="24" cy="43" r="2.8" fill="none" stroke="#22c55e" strokeWidth="0.9" />
        {/* 6 gear teeth */}
        {[0, 60, 120, 180, 240, 300].map(deg => {
          const r = Math.PI / 180
          const cos = Math.cos(deg * r)
          const sin = Math.sin(deg * r)
          return (
            <line
              key={deg}
              x1={24 + 3.4 * cos} y1={43 + 3.4 * sin}
              x2={24 + 4.6 * cos} y2={43 + 4.6 * sin}
              stroke="#22c55e"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          )
        })}
        {/* W letterform */}
        <text
          x="24" y="44.8"
          textAnchor="middle"
          fontSize="3.2"
          fontFamily="Arial, sans-serif"
          fontWeight="bold"
          fill="#22c55e"
        >
          w
        </text>
      </g>
    </svg>
  )
}

export function Logo({
  variant = 'dark',
  size = 32,
}: {
  variant?: 'dark' | 'light'
  size?: number
}) {
  const textSize = Math.round(size * 0.52)

  return (
    <div className="flex items-center gap-2.5 select-none">
      <LogoMark size={size} />
      <span style={{ fontSize: textSize, lineHeight: 1 }}>
        <span className={`font-light tracking-tight ${variant === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
          Scan
        </span>
        <span className={`font-bold tracking-tight ${variant === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Ability
        </span>
      </span>
    </div>
  )
}
