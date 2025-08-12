import { NextRequest, NextResponse } from 'next/server'
import { getHostnameFromUrl, resolveDNS } from '@/lib/server/monitor'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const input = searchParams.get('url') || ''
  const host = getHostnameFromUrl(input) || input
  if (!host) return NextResponse.json({ error: 'Missing or invalid url/host' }, { status: 400 })
  const info = await resolveDNS(host)
  return NextResponse.json({ host, info }, { headers: { 'Cache-Control': 'no-store' } })
}
