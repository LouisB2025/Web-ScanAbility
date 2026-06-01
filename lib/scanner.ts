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

const BROWSERLESS_CODE = `
export default async function({ page, context }) {
  const { targetUrl } = context;

  await page.setViewport({ width: 390, height: 844 });
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

  try { await page.waitForNetworkIdle({ timeout: 15000 }); } catch(e) {}

  await page.evaluate(async () => {
    await new Promise(resolve => {
      let totalHeight = 0;
      const timer = setInterval(() => {
        window.scrollBy(0, 300);
        totalHeight += 300;
        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 80);
    });
  });

  await new Promise(r => setTimeout(r, 1500));
  await page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js' });

  return await page.evaluate(async () => await window.axe.run());
}
`

export async function runScan(url: string): Promise<ScanResult> {
  const apiKey = process.env.BROWSERLESS_API_KEY
  if (!apiKey) throw new Error('BROWSERLESS_API_KEY is not set')

  const res = await fetch(
    `https://production-sfo.browserless.io/chromium/function?token=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: BROWSERLESS_CODE, context: { targetUrl: url } }),
    }
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Browserless error ${res.status}: ${text}`)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const axeResults: any = await res.json()

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
}
