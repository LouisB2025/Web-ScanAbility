'use client'

import { useState, useMemo, useCallback } from 'react'
import { Logo } from '@/components/Logo'

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [text])
  return (
    <button
      onClick={copy}
      className="text-xs px-2 py-0.5 rounded border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 transition-colors"
    >
      {copied ? 'Copied!' : label}
    </button>
  )
}

const IMPACT_COLORS: Record<string, string> = {
  Vision: 'bg-blue-100 text-cyan-700',
  Hearing: 'bg-purple-100 text-purple-700',
  Motor: 'bg-green-100 text-green-700',
  Cognitive: 'bg-amber-100 text-amber-800',
  'Color Blind': 'bg-teal-100 text-teal-700',
  Vestibular: 'bg-orange-100 text-orange-700',
}

function getImpactCategories(wcag: string, title: string): string[] {
  const t = title.toLowerCase()
  if (wcag.startsWith('1.1')) return ['Vision']
  if (wcag.startsWith('1.2')) return ['Hearing', 'Vision']
  if (wcag.startsWith('1.3')) return ['Vision', 'Cognitive']
  if (wcag === '1.4.1') return ['Color Blind']
  if (wcag.startsWith('1.4')) return ['Vision']
  if (wcag.startsWith('2.1')) return ['Motor', 'Vision']
  if (wcag.startsWith('2.2')) return ['Cognitive', 'Motor']
  if (wcag.startsWith('2.3')) return ['Vestibular']
  if (wcag.startsWith('2.4')) return ['Vision', 'Motor']
  if (wcag.startsWith('2.5')) return ['Motor']
  if (wcag.startsWith('3.1')) return ['Cognitive']
  if (wcag.startsWith('3.2')) return ['Cognitive']
  if (wcag.startsWith('3.3')) return ['Cognitive', 'Vision']
  if (wcag.startsWith('4.1')) return ['Vision', 'Cognitive']
  // keyword fallback for rules without a WCAG criterion
  if (t.includes('landmark') || t.includes('region')) return ['Motor', 'Cognitive']
  if (t.includes('contrast') || t.includes('color')) return ['Vision', 'Color Blind']
  if (t.includes('label') || t.includes('alt') || t.includes('name')) return ['Vision']
  if (t.includes('keyboard') || t.includes('focus')) return ['Motor']
  if (t.includes('caption') || t.includes('transcript')) return ['Hearing']
  if (t.includes('flash') || t.includes('blink') || t.includes('animation')) return ['Vestibular']
  return ['Vision', 'Cognitive']
}

interface Scan {
  url: string
  scanned_at: string
  total_count: number
  critical_count: number
  serious_count: number
  moderate_count: number
  minor_count: number
  scan_note?: string | null
}

interface Violation {
  id: string
  criticality: string
  axe_rule_id?: string | null
  wcag_criterion: string
  wcag_criterion_title: string
  description: string
  plain_description?: string | null
  suggested_fix: string
  element_selector: string
  html_snippet: string
  help_url?: string | null
  suggested_code_fix?: string | null
}

const SEVERITY_LABEL: Record<string, string> = {
  critical: 'Critical',
  serious: 'High',
  moderate: 'Medium',
  minor: 'Low',
}

const SEVERITY_BADGE: Record<string, string> = {
  critical: 'bg-red-600 text-white',
  serious: 'bg-red-400 text-white',
  moderate: 'bg-orange-400 text-white',
  minor: 'bg-gray-400 text-white',
}

const SEVERITY_ORDER: Record<string, number> = {
  critical: 0,
  serious: 1,
  moderate: 2,
  minor: 3,
}

const SEVERITY_TOOLTIP =
  'Critical: user cannot complete a task. High: major difficulty. Medium: some inconvenience. Low: minor or cosmetic issue. Click to sort.'

const COLUMN_TOOLTIPS = {
  wcag: 'WCAG 2.2 success criterion this violation fails. Click to open full documentation in a new tab.',
  affected:
    'Which user groups encounter a barrier from this violation, based on WCAG guidelines and assistive technology impact.',
  issue:
    'What the accessibility problem is. Non-Technical view shows a plain-language summary. Technical view adds the full technical description.',
  confidence:
    'How certain the automated scanner is that this is a real violation. High = axe-core detected it with high certainty; false positives are rare. Note: automated tools detect only ~30–40% of all WCAG violations — manual testing is required for full coverage.',
  actions: 'Expand to see technical details and AI-generated code fix.',
}

export default function ReportClient({
  scan,
  violations,
  token,
}: {
  scan: Scan
  violations: Violation[]
  token: string
}) {
  const [view, setView] = useState<'plain' | 'technical'>('plain')
  const [filter, setFilter] = useState('all')
  const [copied, setCopied] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const isConformant = scan.critical_count === 0 && scan.serious_count === 0

  const filtered = useMemo(() => {
    const list =
      filter === 'all' ? violations : violations.filter(v => v.criticality === filter)
    return [...list].sort((a, b) => {
      const diff =
        (SEVERITY_ORDER[a.criticality] ?? 4) - (SEVERITY_ORDER[b.criticality] ?? 4)
      return sortDir === 'asc' ? diff : -diff
    })
  }, [violations, filter, sortDir])

  async function handleShare() {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo variant="light" size={30} />

          <div className="flex items-center gap-3">
            <div className="flex rounded-full border border-gray-300 overflow-hidden text-sm">
              <button
                onClick={() => setView('plain')}
                className={`px-4 py-1.5 font-medium transition-colors ${
                  view === 'plain' ? 'bg-cyan-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Non-Technical View
              </button>
              <button
                onClick={() => setView('technical')}
                className={`px-4 py-1.5 font-medium transition-colors ${
                  view === 'technical' ? 'bg-cyan-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Technical View
              </button>
            </div>
            <a
              href="/"
              className="px-4 py-1.5 bg-cyan-600 text-white text-sm font-medium rounded-full hover:bg-cyan-700 transition-colors"
            >
              ↻ New Scan
            </a>
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-7xl mx-auto px-6 py-6">
        {/* Report header */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Accessibility Report
          </p>
          <div className="flex items-start gap-3">
            {/* Favicon */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://www.google.com/s2/favicons?domain=${(() => { try { return new URL(scan.url).hostname } catch { return '' } })()}&sz=32`}
              alt=""
              width={24}
              height={24}
              className="mt-1 rounded-sm flex-shrink-0"
              onError={e => { e.currentTarget.style.display = 'none' }}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  {(() => { try { return new URL(scan.url).hostname } catch { return scan.url } })()}
                </h1>
                <a
                  href={scan.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-gray-200 text-xs font-medium text-gray-600 hover:border-cyan-300 hover:text-cyan-600 transition-colors flex-shrink-0"
                >
                  Open site
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 9L9 1M9 1H4M9 1V6" />
                  </svg>
                </a>
              </div>
              <p className="text-sm text-gray-400 mt-1 font-mono truncate" title={scan.url}>
                {scan.url}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Scanned&nbsp;
                {new Date(scan.scanned_at).toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric',
                })}
                &nbsp;at&nbsp;
                {new Date(scan.scanned_at).toLocaleTimeString('en-US', {
                  hour: 'numeric', minute: '2-digit', hour12: true,
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="border border-gray-200 rounded-xl p-5">
            <p className="text-sm text-gray-500 mb-3">Conformance Level</p>
            <span
              className={`inline-block px-3 py-1.5 rounded text-sm font-semibold text-white ${
                isConformant ? 'bg-green-600' : 'bg-red-600'
              }`}
            >
              {isConformant ? 'Conformant' : 'Non-Conformant'}
            </span>
          </div>
          {[
            { label: 'Total Issues', value: scan.total_count, color: 'text-gray-900' },
            { label: 'Critical', value: scan.critical_count, color: 'text-red-600' },
            { label: 'High', value: scan.serious_count, color: 'text-orange-500' },
            { label: 'Medium', value: scan.moderate_count, color: 'text-orange-400' },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="border border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center"
            >
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 mb-4">
          <a
            href={`/api/export/${token}`}
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Export Excel
          </a>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {copied ? 'Link copied!' : 'Share Report'}
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mb-6">
          Automated tools detect approximately 30–40% of WCAG violations. Manual review is required
          for full conformance.
        </p>

        {/* Violations */}
        {scan.total_count === 0 ? (
          <div className="space-y-3">
            {scan.scan_note && (
              <div className="border border-amber-200 bg-amber-50 rounded-xl px-5 py-4 flex items-start gap-3">
                <span className="text-amber-500 text-lg leading-none mt-0.5" aria-hidden="true">⚠</span>
                <p className="text-amber-800 text-sm">{scan.scan_note}</p>
              </div>
            )}
            <div className="border border-green-200 bg-green-50 rounded-xl p-10 text-center">
              <p className="text-green-700 font-semibold text-lg">No violations found</p>
              <p className="text-green-600 text-sm mt-1">
                {scan.scan_note
                  ? 'No automated violations were detected.'
                  : 'This page passed all automated WCAG 2.2 checks.'}
              </p>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Violations</h2>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <label className="text-gray-600">Filter by severity:</label>
                <select
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="all">All</option>
                  <option value="critical">Critical</option>
                  <option value="serious">High</option>
                  <option value="moderate">Medium</option>
                  <option value="minor">Low</option>
                </select>
              </div>
              <span className="text-sm text-gray-500">
                Showing {filtered.length} of {scan.total_count} issues
              </span>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm table-fixed">
                <colgroup>
                  <col style={{ width: '3%' }} />
                  <col style={{ width: '8%' }} />
                  <col style={{ width: '6%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '13%' }} />
                  <col style={{ width: '38%' }} />
                  <col style={{ width: '8%' }} />
                  <col style={{ width: '6%' }} />
                </colgroup>
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    <th scope="col" className="px-3 py-3 whitespace-nowrap">#</th>
                    <th
                      scope="col"
                      className="px-3 py-3 whitespace-nowrap cursor-pointer select-none hover:text-gray-900"
                      title={SEVERITY_TOOLTIP}
                      aria-sort={sortDir === 'asc' ? 'ascending' : 'descending'}
                      onClick={() => setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))}
                    >
                      <span className="flex items-center gap-1">
                        Severity
                        <span className="text-gray-400" aria-hidden="true">{sortDir === 'asc' ? '↑' : '↓'}</span>
                      </span>
                    </th>
                    <th scope="col" className="px-3 py-3 whitespace-nowrap" title={COLUMN_TOOLTIPS.wcag}>
                      WCAG <span className="text-gray-400 font-normal normal-case" aria-hidden="true">ⓘ</span>
                    </th>
                    <th scope="col" className="px-3 py-3 whitespace-nowrap" title="The axe-core rule ID that flagged this violation. Use this to look up the rule in axe-core documentation or search your codebase.">
                      Rule ID <span className="text-gray-400 font-normal normal-case" aria-hidden="true">ⓘ</span>
                    </th>
                    <th scope="col" className="px-3 py-3 whitespace-nowrap" title={COLUMN_TOOLTIPS.affected}>
                      Who&apos;s Affected <span className="text-gray-400 font-normal normal-case" aria-hidden="true">ⓘ</span>
                    </th>
                    <th scope="col" className="px-3 py-3 whitespace-nowrap" title={COLUMN_TOOLTIPS.issue}>
                      Issue <span className="text-gray-400 font-normal normal-case" aria-hidden="true">ⓘ</span>
                    </th>
                    <th scope="col" className="px-3 py-3 whitespace-nowrap" title={COLUMN_TOOLTIPS.confidence}>
                      Confidence <span className="text-gray-400 font-normal normal-case" aria-hidden="true">ⓘ</span>
                    </th>
                    <th scope="col" className="px-3 py-3 whitespace-nowrap" title={COLUMN_TOOLTIPS.actions}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((v, i) => {
                    const categories = getImpactCategories(v.wcag_criterion, v.wcag_criterion_title)
                    const displayDesc =
                      view === 'plain'
                        ? (v.plain_description || v.wcag_criterion_title)
                        : v.wcag_criterion_title
                    const fullDesc = v.description

                    return (
                      <tr key={v.id} className="border-b border-gray-100 hover:bg-gray-50 align-top">
                        <td className="px-3 py-3 text-gray-400 text-xs">{i + 1}</td>

                        {/* Severity */}
                        <td className="px-3 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                              SEVERITY_BADGE[v.criticality] || 'bg-gray-400 text-white'
                            }`}
                            title={`${SEVERITY_LABEL[v.criticality] || v.criticality}: ${
                              v.criticality === 'critical'
                                ? 'User cannot complete the task.'
                                : v.criticality === 'serious'
                                ? 'Major difficulty for affected users.'
                                : v.criticality === 'moderate'
                                ? 'Some inconvenience for affected users.'
                                : 'Minor or cosmetic issue.'
                            }`}
                          >
                            {SEVERITY_LABEL[v.criticality] || v.criticality}
                          </span>
                        </td>

                        {/* WCAG link */}
                        <td className="px-3 py-3 font-mono text-xs">
                          {v.wcag_criterion && v.help_url ? (
                            <a
                              href={v.help_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-600 hover:underline"
                              title={`Open WCAG ${v.wcag_criterion} documentation`}
                            >
                              {v.wcag_criterion}
                            </a>
                          ) : v.wcag_criterion ? (
                            <span className="text-gray-600">{v.wcag_criterion}</span>
                          ) : v.help_url ? (
                            <a
                              href={v.help_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-600 hover:underline text-[10px]"
                              title="Open axe-core rule documentation"
                            >
                              rule ↗
                            </a>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        {/* Rule ID */}
                        <td className="px-3 py-3 font-mono text-xs">
                          {v.axe_rule_id ? (
                            <a
                              href={v.help_url || `https://dequeuniversity.com/rules/axe/4.x/${v.axe_rule_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-600 hover:underline"
                              title={`Open axe-core rule documentation for "${v.axe_rule_id}"`}
                            >
                              {v.axe_rule_id}
                            </a>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        {/* Who's Affected */}
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-1">
                            {categories.map(cat => (
                              <span
                                key={cat}
                                className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                  IMPACT_COLORS[cat] || 'bg-gray-100 text-gray-600'
                                }`}
                                title={`${cat} users are affected by this violation.`}
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Issue description */}
                        <td className="px-3 py-3 text-gray-700">
                          <p className="leading-snug text-sm">
                            {displayDesc}
                          </p>
                          {view === 'technical' && (
                            <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                              {fullDesc}
                            </p>
                          )}

                          {/* Technical details + Before/After */}
                          {(view === 'technical' || expandedId === v.id) && (
                            <div className="mt-2 space-y-2 pt-2 border-t border-gray-100">
                              {v.suggested_fix && (
                                <p className="text-xs text-cyan-700" title={v.suggested_fix}>
                                  <span className="font-medium">Fix: </span>
                                  {v.suggested_fix}
                                </p>
                              )}
                              {v.element_selector && (
                                <div>
                                  <p className="text-xs text-gray-400 mb-0.5">Selector</p>
                                  <code
                                    className="text-xs bg-gray-100 px-2 py-1 rounded block text-gray-600 truncate"
                                    title={v.element_selector}
                                  >
                                    {v.element_selector}
                                  </code>
                                </div>
                              )}
                              {(v.html_snippet || v.suggested_code_fix) && (
                                <div className="rounded-lg overflow-hidden border border-gray-200 text-xs font-mono">
                                  {v.html_snippet && (
                                    <div className="bg-red-50 border-b border-gray-200">
                                      <div className="flex items-center justify-between px-3 py-1.5 border-b border-red-100">
                                        <span className="text-red-600 font-semibold tracking-wide uppercase text-[10px]">
                                          Before — failing
                                        </span>
                                        <CopyButton text={v.html_snippet} label="Copy" />
                                      </div>
                                      <pre
                                        className="px-3 py-2 text-red-800 whitespace-pre-wrap break-all overflow-x-auto"
                                        title={v.html_snippet}
                                      >
                                        {v.html_snippet}
                                      </pre>
                                    </div>
                                  )}
                                  {v.suggested_code_fix ? (
                                    <div className="bg-green-50">
                                      <div className="flex items-center justify-between px-3 py-1.5 border-b border-green-100">
                                        <span className="text-green-700 font-semibold tracking-wide uppercase text-[10px]">
                                          After — fixed
                                        </span>
                                        <CopyButton text={v.suggested_code_fix} label="Copy fix" />
                                      </div>
                                      <pre className="px-3 py-2 text-green-900 whitespace-pre-wrap break-all overflow-x-auto">
                                        {v.suggested_code_fix}
                                      </pre>
                                    </div>
                                  ) : (
                                    v.html_snippet && (
                                      <div className="bg-gray-50 px-3 py-2 text-gray-400 italic text-[11px]">
                                        AI fix not available for this violation
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Confidence */}
                        <td className="px-3 py-3">
                          <span
                            className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 cursor-help"
                            title={COLUMN_TOOLTIPS.confidence}
                          >
                            High
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-3 py-3">
                          {view === 'plain' && (
                            <button
                              onClick={() =>
                                setExpandedId(expandedId === v.id ? null : v.id)
                              }
                              aria-expanded={expandedId === v.id}
                              aria-label={`${expandedId === v.id ? 'Hide' : 'Show'} technical details for violation ${i + 1}`}
                              className="text-xs border border-gray-300 rounded px-2 py-1 text-gray-600 hover:bg-gray-100 whitespace-nowrap"
                            >
                              {expandedId === v.id ? 'Hide' : 'Details'}
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        <p className="mt-8 text-xs text-gray-400 text-center">
          Scanned against WCAG 2.2 using axe-core. Best-effort automated scan — not a compliance
          certificate.
        </p>
      </main>
    </div>
  )
}
