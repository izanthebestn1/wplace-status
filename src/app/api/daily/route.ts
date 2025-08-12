import { NextRequest, NextResponse } from 'next/server'
import { getHistory, summarizeDaily } from '@/lib/server/monitor'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const urls = searchParams.getAll('u')
  const days = Number(searchParams.get('days') || '30')

  const result: Record<string, ReturnType<typeof summarizeDaily>> = {}
  if (urls.length) {
    for (const u of urls) {
      const h = getHistory(u) as any[]
      result[u] = summarizeDaily(h, days)
    }
  } else {
    // All known URLs in history
    const all = getHistory() as Record<string, any[]>
    for (const [u, h] of Object.entries(all)) {
      result[u] = summarizeDaily(h, days)
    }
  }
  return NextResponse.json({ summary: result }, { headers: { 'Cache-Control': 'no-store' } })
}
