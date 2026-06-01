import { chromium } from 'playwright'
import { resolve } from 'path'

export interface ScanViolation {
  criticality: 'critical' | 'serious' | 'moderate' | 'minor'
  axe_rule_id: string
  wcag_criterion: string
  wcag_criterion_title: string
  description: string
  suggested_fix: string
  element_selector: string
  html_snippet: string
  help_url: string
}

export interface ScanResult {
  violations: ScanViolation[]
  counts: { critical: number; serious: number; moderate: number; minor: number }
}

function extractWcagCriterion(tags: string[]): string {
  const tag = tags.find((t: string) => /^wcag\d{3,4}$/.test(t))
  if (!tag) return ''
  const d = tag.replace('wcag', '')
  if (d.length === 3) return `${d[0]}.${d[1]}.${d[2]}`
  if (d.length === 4) return `${d[0]}.${d[1]}.${d[2]}${d[3]}`
  return d
}

export async function runScan(url: string): Promise<ScanResult> {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--single-process',
      '--no-zygote',
      '--shm-size=1gb',
    ],
  })
  try {
    const page = await browser.newPage()

    // 390px catches mobile nav elements (e.g. Tailwind's lg:hidden buttons)
    // that are display:none at desktop and invisible to axe at 1280px
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })

    // Wait for JS frameworks to finish rendering
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})

    // Scroll to bottom to trigger lazy-loaded content, then back to top
    await page.evaluate(async () => {
      await new Promise<void>(resolve => {
        let totalHeight = 0
        const step = 300
        const timer = setInterval(() => {
          window.scrollBy(0, step)
          totalHeight += step
          if (totalHeight >= document.body.scrollHeight) {
            clearInterval(timer)
            window.scrollTo(0, 0)
            resolve()
          }
        }, 80)
      })
    })

    // Brief pause for any scroll-triggered renders to settle
    await page.waitForTimeout(1500)

    await page.addScriptTag({
      path: resolve(process.cwd(), 'node_modules/axe-core/axe.js'),
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const axeResults: any = await page.evaluate(async () => {
      // @ts-ignore
      return await window.axe.run()
    })

    // One row per failing node — matches AccIQ granularity
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const violations: ScanViolation[] = axeResults.violations.flatMap((v: any) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      v.nodes.map((n: any) => {
        const impact = (v.impact || 'minor') as ScanViolation['criticality']
        const selector = ((n.target || []).join(', ') || '').slice(0, 500)
        const rawFix = (n.failureSummary || v.help || '')
          .replace(/^Fix (any|all) of the following:\s*/i, '')
          .trim()

        return {
          criticality: impact,
          axe_rule_id: v.id || '',
          wcag_criterion: extractWcagCriterion(v.tags),
          wcag_criterion_title: v.help,
          description: v.description,
          suggested_fix: rawFix,
          element_selector: selector,
          html_snippet: (n.html || '').slice(0, 500),
          help_url: v.helpUrl || '',
        }
      })
    )

    const counts = { critical: 0, serious: 0, moderate: 0, minor: 0 }
    violations.forEach(v => { counts[v.criticality]++ })

    return { violations, counts }
  } finally {
    await browser.close()
  }
}
