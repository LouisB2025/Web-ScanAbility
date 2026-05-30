'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Logo } from '@/components/Logo'

const STATUSES = [
  'Launching headless browser…',
  'Loading page content…',
  'Running WCAG 2.2 accessibility checks…',
  'Generating plain-language explanations…',
  'Generating Before / After code fixes…',
  'Saving results…',
]

function ScanningView() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const url = searchParams.get('url') || ''
  const [progress, setProgress] = useState(0)
  const [complete, setComplete] = useState(false)
  const [statusIdx, setStatusIdx] = useState(0)
  const [error, setError] = useState('')
  const fetched = useRef(false)

  // Animate bar to 75% over 55s — gives visual progress without knowing real state
  useEffect(() => {
    const t = setTimeout(() => setProgress(75), 100)
    return () => clearTimeout(t)
  }, [])

  // Cycle status messages every ~10s
  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIdx(i => Math.min(i + 1, STATUSES.length - 1))
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (fetched.current) return
    fetched.current = true
    if (!url) { router.replace('/'); return }

    fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
          setTimeout(() => router.replace('/'), 4000)
          return
        }
        setComplete(true)
        setProgress(100)
        setTimeout(() => router.replace(`/report/${data.token}`), 600)
      })
      .catch(() => {
        setError('Something went wrong. Please try again.')
        setTimeout(() => router.replace('/'), 4000)
      })
  }, [url, router])

  if (error) {
    return (
      <main className="min-h-screen bg-[#08090a] flex flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl mb-5" aria-hidden="true">⚠️</div>
        <h1 className="text-xl font-semibold text-white mb-2">Scan failed</h1>
        <p className="text-gray-400 text-sm max-w-sm">{error}</p>
        <p className="text-gray-500 text-xs mt-3">Redirecting you back…</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#08090a] flex flex-col items-center justify-center px-6 text-center">
      {/* Logo at top */}
      <div className="absolute top-6 left-6">
        <Logo variant="dark" size={28} />
      </div>

      {/* Animated icon — decorative, hidden from screen readers */}
      <div className="relative w-40 h-40 mb-10" aria-hidden="true">
        <div className="absolute inset-0 rounded-full bg-[#111827]" />

        {/* Outer rotating arc */}
        <svg
          className="absolute inset-0 w-full h-full animate-spin"
          style={{ animationDuration: '3s' }}
          viewBox="0 0 160 160"
          aria-hidden="true"
        >
          <circle
            cx="80" cy="80" r="70"
            fill="none"
            stroke="#0fcfcf"
            strokeWidth="2"
            strokeDasharray="100 340"
            strokeLinecap="round"
          />
        </svg>

        {/* Inner counter-rotating arc */}
        <svg
          className="absolute inset-0 w-full h-full animate-spin"
          style={{ animationDuration: '5s', animationDirection: 'reverse' }}
          viewBox="0 0 160 160"
          aria-hidden="true"
        >
          <circle
            cx="80" cy="80" r="58"
            fill="none"
            stroke="#0891b2"
            strokeWidth="1.5"
            strokeDasharray="55 310"
            strokeLinecap="round"
          />
        </svg>

        {/* Lightning bolt */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            width="38" height="38"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
        Scanning for accessibility issues
      </h1>
      <p className="text-gray-400 text-base mb-1">
        Running WCAG 2.2 checks and generating AI explanations and code fixes.
      </p>
      <p className="text-gray-500 text-sm mb-12">
        This takes under 60 seconds.
      </p>

      {/* Progress bar */}
      <div className="w-80 max-w-xs">
        <div
          className="h-[3px] bg-[#1c2333] rounded-full overflow-hidden mb-3"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Scan progress"
        >
          <div
            className="h-full bg-cyan-500 rounded-full"
            style={{
              width: `${progress}%`,
              transition: complete ? 'width 0.4s ease-out' : 'width 55s linear',
            }}
          />
        </div>
        {/* aria-live so screen readers announce status changes — 4.1.3 */}
        <p className="text-gray-500 text-xs" aria-live="polite" aria-atomic="true">
          {STATUSES[statusIdx]}
        </p>
      </div>
    </main>
  )
}

export default function ScanningPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#08090a]" aria-label="Loading scan page" />}>
      <ScanningView />
    </Suspense>
  )
}
