import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import ReportClient from './ReportClient'

interface Props {
  params: Promise<{ token: string }>
}

const CRITICALITY_ORDER: Record<string, number> = {
  critical: 0,
  serious: 1,
  moderate: 2,
  minor: 3,
}

export default async function ReportPage({ params }: Props) {
  const { token } = await params

  const { data: scan } = await supabase
    .from('scans')
    .select('*')
    .eq('share_token', token)
    .single()

  if (!scan) notFound()

  const { data: violations } = await supabase
    .from('violations')
    .select('*')
    .eq('scan_id', scan.id)

  const sorted = (violations || []).sort(
    (a, b) =>
      (CRITICALITY_ORDER[a.criticality] ?? 4) - (CRITICALITY_ORDER[b.criticality] ?? 4)
  )

  return <ReportClient scan={scan} violations={sorted} token={token} />
}
