import { NextRequest, NextResponse } from 'next/server'
import { getHistory } from '@/lib/server/monitor'
import { hasKV, kvGetHistory } from '@/lib/server/storage'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url') || undefined
  const data = getHistory(url || undefined)
  if (url && hasKV()) {
    try {
      const kv = await kvGetHistory(url)
      // Merge and sort by timestamp desc, then cap
      const mem = Array.isArray(data) ? data : []
      const merged = [...kv, ...mem].sort((a,b)=>b.timestamp - a.timestamp).slice(0, 200)
      return NextResponse.json({ data: merged }, { headers: { 'Cache-Control': 'no-store' } })
    } catch {}
  }
  return NextResponse.json({ data }, { headers: { 'Cache-Control': 'no-store' } })
}
