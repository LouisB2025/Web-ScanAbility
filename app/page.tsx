'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Logo, LogoMark } from '@/components/Logo'

export default function Home() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  function handleScan(e: React.SyntheticEvent) {
    e.preventDefault()
    setError('')
    const trimmed = url.trim()
    if (!trimmed) {
      setError('Please enter a URL to scan.')
      return
    }
    setLoading(true)
    router.push('/scanning?url=' + encodeURIComponent(trimmed))
  }

  return (
    <div className="min-h-screen bg-[#060d0b] text-white font-sans">

      {/* Skip nav — 2.4.1 */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#0fcfcf] focus:text-[#040e0c] focus:font-bold focus:rounded-lg focus:text-sm"
      >
        Skip to main content
      </a>

      {/* Nav */}
      <nav className="relative z-20 border-b border-white/[0.06] px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 select-none">
            <Logo variant="dark" size={28} />
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-medium leading-tight hidden sm:block">
              Web Accessibility Scanner
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-500/30 bg-green-500/5 text-xs text-green-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
            WCAG 2.2 Compliant
          </div>
        </div>
      </nav>

      <main id="main-content">

      {/* Hero */}
      <section className="relative px-6 pt-2 pb-5 overflow-hidden">
        {/* Animated orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="orb-1 absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[120px]" />
          <div className="orb-2 absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-green-500/8 blur-[100px]" />
          <div className="orb-3 absolute bottom-[-15%] left-[30%] w-[400px] h-[400px] rounded-full bg-orange-500/6 blur-[100px]" />
        </div>

        {/* Scan beam */}
        <div className="scan-beam absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none z-10" />

        {/* Noise grain overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: '128px 128px',
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Large hero logo */}
          <div className="flex flex-col items-center mb-6">
            <LogoMark size={80} />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-xs text-gray-400 font-medium tracking-widest uppercase mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0fcfcf] animate-pulse flex-shrink-0" />
            Instant Accessibility Audits
          </div>

          {/* Headline — word-level color treatment */}
          <h1 className="text-5xl sm:text-[4.25rem] font-bold leading-[1.08] tracking-tight mb-6">
            <span className="text-white">Make the web</span>
            <br />
            <span style={{ color: '#22c55e' }}>accessible</span>
            {' '}
            <span style={{ color: '#4ade80' }}>to</span>
            {' '}
            <span style={{ color: '#f97316' }}>all</span>
          </h1>

          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Scan any URL for WCAG 2.2 violations in seconds. Get actionable reports on contrast, semantics, keyboard navigation, and screen reader compatibility.
          </p>

          {/* Scan card */}
          <div className="max-w-xl mx-auto bg-[#0a1614] border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/40">
            <form onSubmit={handleScan} className="flex gap-3">
              <label htmlFor="url-input" className="sr-only">Website URL to scan</label>
              <input
                id="url-input"
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="apple.com or https://example.com"
                disabled={loading}
                aria-describedby={error ? 'url-error' : undefined}
                aria-invalid={!!error}
                className="flex-1 px-4 py-3 rounded-lg text-sm bg-white/5 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 disabled:opacity-50 transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-[#0fcfcf] hover:bg-[#0be5e5] text-[#040e0c] text-sm font-bold rounded-lg disabled:opacity-50 transition-colors whitespace-nowrap tracking-wide uppercase"
              >
                {loading ? 'Scanning…' : 'Scan Now'}
              </button>
            </form>

            {error && <p id="url-error" role="alert" className="mt-3 text-red-400 text-sm text-left">{error}</p>}

            {/* Capability tags */}
            <div className="mt-4 flex flex-wrap gap-2">
              {['WCAG AA', 'WCAG AAA', 'Color Contrast', 'Keyboard Nav', 'ARIA Roles'].map(tag => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full border border-cyan-500/40 text-xs text-cyan-400/80 bg-cyan-500/5"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <p className="mt-5 text-xs text-gray-500">No login required · No credit card · Best-effort scan</p>
        </div>
      </section>

      {/* Stats strip */}
      <div className="border-y border-white/[0.06] py-8">
        <div className="max-w-3xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
          {[
            { value: '< 60s', label: 'Average scan time' },
            { value: 'WCAG 2.2', label: 'Standard covered' },
            { value: '4 severity levels', label: 'Critical to Minor' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-sm text-gray-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="bg-white text-gray-900 px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm font-semibold text-cyan-700 text-center uppercase tracking-widest mb-3">
            Features
          </p>
          <h2 className="text-3xl font-bold text-center mb-3 tracking-tight">
            Everything you need to find and fix accessibility issues
          </h2>
          <p className="text-gray-500 text-center mb-14 max-w-xl mx-auto">
            Built for the whole team — PMs who need to understand the problem, engineers who need to fix it.
          </p>

          <div className="grid grid-cols-3 gap-5">
            {[
              {
                icon: '⚡',
                title: 'Instant scan',
                desc: 'Paste any public URL. Get a full WCAG 2.2 violation report in under 60 seconds. No setup, no browser extension.',
              },
              {
                icon: '📋',
                title: 'Plain-language results',
                desc: 'Every violation explained in plain English. PMs can understand severity and priority without reading the WCAG spec.',
              },
              {
                icon: '🔧',
                title: 'Engineer-ready detail',
                desc: 'CSS selectors, failing HTML snippets, WCAG references, and fix guidance per violation. Technical View shows everything.',
              },
              {
                icon: '🔗',
                title: 'Shareable reports',
                desc: 'Every scan gets a permanent unique URL. Share the report with your team — no account needed to view it.',
              },
              {
                icon: '📊',
                title: 'Export to Excel',
                desc: 'Download all violations as a spreadsheet. Track remediation, assign owners, and report progress to stakeholders.',
              },
              {
                icon: '📈',
                title: 'Scan history',
                desc: 'Re-scan after fixes are deployed to verify progress. Every scan is stored so you can compare before and after.',
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="border border-gray-200 rounded-xl p-5 hover:border-cyan-300 hover:shadow-sm transition-all"
              >
                <div className="text-2xl mb-3">{icon}</div>
                <h3 className="font-semibold mb-1.5">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cost / benefit */}
      <section className="bg-[#060d0b] px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm font-semibold text-cyan-400 uppercase tracking-widest mb-4">
            Why it matters
          </p>
          <h2 className="text-4xl font-bold tracking-tight mb-6 leading-tight">
            Fixing in development costs{' '}
            <span className="text-green-400">1×.</span>
            <br />
            Fixing after launch costs{' '}
            <span className="text-red-400">30–100×.</span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-14">
            ADA litigation is rising. Accessibility issues caught in development take minutes to fix.
            The same issues found after launch — or by a plaintiff&apos;s attorney — cost significantly
            more in engineering time, legal fees, and reputation damage.
          </p>

          <div className="grid grid-cols-3 gap-4 text-left">
            {[
              { stage: 'In design', cost: '1×', sub: 'Cheapest to fix', color: 'text-green-400' },
              { stage: 'In development', cost: '10×', sub: 'Still manageable', color: 'text-yellow-400' },
              { stage: 'Post-launch', cost: '30–100×', sub: 'Expensive and risky', color: 'text-red-400' },
            ].map(({ stage, cost, sub, color }) => (
              <div key={stage} className="border border-white/10 rounded-xl p-5">
                <p className={`text-3xl font-bold ${color}`}>{cost}</p>
                <p className="text-white font-medium mt-1">{stage}</p>
                <p className="text-gray-400 text-sm mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-white/[0.06] px-6 py-24 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight mb-3">
            Ready to see what you&apos;re missing?
          </h2>
          <p className="text-gray-400 mb-8">Paste any URL. No login, no credit card.</p>

          <div className="bg-[#0a1614] border border-white/10 rounded-2xl p-6">
            <form onSubmit={handleScan} className="flex gap-3">
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="apple.com or https://example.com"
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-lg text-sm bg-white/5 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 disabled:opacity-50 transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-[#0fcfcf] hover:bg-[#0be5e5] text-[#040e0c] text-sm font-bold rounded-lg disabled:opacity-50 transition-colors whitespace-nowrap tracking-wide uppercase"
              >
                {loading ? 'Scanning…' : 'Scan Now'}
              </button>
            </form>
            {error && <p className="mt-3 text-red-400 text-sm text-left">{error}</p>}
          </div>
        </div>
      </section>

      {/* Regulatory Standards */}
      <section className="border-t border-white/[0.06] px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm font-semibold text-cyan-400 uppercase tracking-widest mb-3 text-center">
            Regulatory Standards
          </p>
          <h2 className="text-2xl font-bold text-center text-white mb-2 tracking-tight">
            Built for global compliance requirements
          </h2>
          <p className="text-gray-400 text-center text-sm mb-10 max-w-xl mx-auto">
            ScanAbility checks your site against the standards that matter for legal and regulatory
            compliance in the US and Europe.
          </p>

          <div className="grid grid-cols-3 gap-4">
            {[
              {
                tag: 'United States',
                title: 'ADA Title III',
                subtitle: 'Americans with Disabilities Act',
                desc: 'Requires public accommodations and commercial facilities to be accessible. Non-compliance is the most common basis for web accessibility litigation.',
                url: 'https://www.ada.gov/resources/web-guidance/',
              },
              {
                tag: 'US Federal',
                title: 'Section 508',
                subtitle: 'Rehabilitation Act',
                desc: 'Federal agencies and contractors must make electronic and information technology accessible to employees and members of the public with disabilities.',
                url: 'https://www.section508.gov/',
              },
              {
                tag: 'European Union',
                title: 'European Accessibility Act',
                subtitle: 'EU Directive 2019/882',
                desc: 'Requires key digital products and services sold in the EU to meet accessibility standards. In effect from June 2025 — applies to companies outside the EU serving EU customers.',
                url: 'https://ec.europa.eu/social/main.jsp?catId=1202',
              },
            ].map(({ tag, title, subtitle, desc, url }) => (
              <a
                key={title}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-white/10 rounded-xl p-5 hover:border-cyan-500/40 hover:bg-white/[0.02] transition-all group flex flex-col"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-cyan-500 font-medium">{tag}</span>
                  <svg
                    width="12" height="12" viewBox="0 0 12 12" fill="none"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                    className="text-gray-600 group-hover:text-cyan-400 transition-colors flex-shrink-0"
                  >
                    <path d="M1 11L11 1M11 1H5M11 1V7" />
                  </svg>
                </div>
                <p className="text-white font-semibold mb-0.5">{title}</p>
                <p className="text-gray-400 text-xs mb-3">{subtitle}</p>
                <p className="text-gray-400 text-sm leading-relaxed flex-1">{desc}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      </main>

      <footer className="border-t border-white/[0.06] px-6 py-6 text-center">
        <p className="text-xs text-gray-400">
          Scanned against WCAG 2.2 using axe-core. Results are best-effort — not a legal compliance certificate.
        </p>
      </footer>
    </div>
  )
}
