import { NextRequest, NextResponse } from 'next/server'
import { getHostnameFromUrl, getTLSInfo } from '@/lib/server/monitor'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const input = searchParams.get('url') || ''
  const host = getHostnameFromUrl(input) || input
  if (!host) return NextResponse.json({ error: 'Missing or invalid url/host' }, { status: 400 })
  const info = await getTLSInfo(host)
  return NextResponse.json({ host, info }, { headers: { 'Cache-Control': 'no-store' } })
}
