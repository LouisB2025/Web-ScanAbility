import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import * as XLSX from 'xlsx'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const { data: scan } = await supabase
    .from('scans')
    .select('*')
    .eq('share_token', token)
    .single()

  if (!scan) return NextResponse.json({ error: 'Report not found' }, { status: 404 })

  const { data: violations } = await supabase
    .from('violations')
    .select('*')
    .eq('scan_id', scan.id)

  const scanDate = new Date(scan.scanned_at).toLocaleString()

  const rows =
    violations && violations.length > 0
      ? violations.map(v => ({
          URL: scan.url,
          'Scan Date': scanDate,
          Criticality: v.criticality,
          'WCAG Criterion': v.wcag_criterion,
          'WCAG Criterion Title': v.wcag_criterion_title,
          Description: v.description,
          'Suggested Fix': v.suggested_fix,
          'Element Selector': v.element_selector,
          'HTML Snippet': v.html_snippet,
        }))
      : [{ URL: scan.url, 'Scan Date': scanDate, Result: 'No violations found' }]

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Violations')

  const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as number[]
  const uint8 = new Uint8Array(buffer)

  return new NextResponse(uint8, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="accessibility-report-${token}.xlsx"`,
    },
  })
}
