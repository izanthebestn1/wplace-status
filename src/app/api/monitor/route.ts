import { NextRequest, NextResponse } from 'next/server'
import { checkService, addHistory, Service } from '@/lib/server/monitor'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const services: Service[] = Array.isArray(body) ? body : []
    if (!services.length) {
      return NextResponse.json({ error: 'No services provided' }, { status: 400 })
    }
  const results = await Promise.all(services.map(checkService))
  results.forEach(addHistory)
    return NextResponse.json({ results }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const urls = searchParams.getAll('u')
  const names = searchParams.getAll('n')

  let services: Service[]
  if (urls.length) {
    services = urls.map((u, i) => ({ name: names[i] || `Service ${i + 1}`, url: u }))
  } else {
    // Default demo services (same as dashboard)
    services = [
      { name: 'Frontend', url: 'https://wplace.live/' },
      { name: 'Backend', url: 'https://backend.wplace.live/' },
    ]
  }

  const results = await Promise.all(services.map(checkService))
  results.forEach(addHistory)
  return NextResponse.json({ results }, { headers: { 'Cache-Control': 'no-store' } })
}

export const dynamic = 'force-dynamic'
export const revalidate = 0
