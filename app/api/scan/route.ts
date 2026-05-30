import { NextRequest, NextResponse } from 'next/server'
import { runScan } from '@/lib/scanner'
import { supabase } from '@/lib/supabase'
import { generateCodeFixes, type FixResult } from '@/lib/claude'

export const maxDuration = 120

export async function POST(req: NextRequest) {
  let url: string
  try {
    const body = await req.json()
    url = body.url
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // Normalize: add https:// if no protocol present
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url.trim()
  }

  try {
    url = new URL(url).toString()
  } catch {
    return NextResponse.json({ error: 'Could not parse that URL. Please check it and try again.' }, { status: 400 })
  }

  try {
    const { violations, counts } = await runScan(url)

    const share_token = crypto.randomUUID().replace(/-/g, '').slice(0, 12)

    const { data: scan, error: scanError } = await supabase
      .from('scans')
      .insert({
        url,
        scanned_at: new Date().toISOString(),
        has_violations: violations.length > 0,
        total_count: violations.length,
        critical_count: counts.critical,
        serious_count: counts.serious,
        moderate_count: counts.moderate,
        minor_count: counts.minor,
        share_token,
      })
      .select()
      .single()

    if (scanError) {
      console.error('Supabase insert error:', scanError)
      return NextResponse.json({ error: 'Failed to save scan results' }, { status: 500 })
    }

    if (violations.length > 0) {
      let codeFixes: FixResult[] = violations.map(() => ({ fix: '', plainDesc: '' }))
      if (process.env.ANTHROPIC_API_KEY) {
        try {
          codeFixes = await generateCodeFixes(
            violations.map((v, i) => ({
              index: i,
              wcag_criterion_title: v.wcag_criterion_title,
              description: v.description,
              suggested_fix: v.suggested_fix,
              html_snippet: v.html_snippet,
            }))
          )
        } catch (err) {
          console.error('Claude fix generation error:', err)
        }
      }

      const { error: violationsError } = await supabase
        .from('violations')
        .insert(violations.map((v, i) => ({
          ...v,
          scan_id: scan.id,
          suggested_code_fix: codeFixes[i]?.fix || null,
          plain_description: codeFixes[i]?.plainDesc || null,
        })))
      if (violationsError) console.error('Violations insert error:', violationsError)
    }

    return NextResponse.json({ token: share_token, total: violations.length })
  } catch (err) {
    console.error('Scan error:', err)
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { error: `Scan failed: ${msg}. The page may be unreachable or blocking automated access.` },
      { status: 500 }
    )
  }
}
