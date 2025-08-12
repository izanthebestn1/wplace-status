import { NextRequest, NextResponse } from 'next/server'
import { getHistory } from '@/lib/server/monitor'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url') || undefined
  const data = getHistory(url || undefined)
  return NextResponse.json({ data }, { headers: { 'Cache-Control': 'no-store' } })
}
