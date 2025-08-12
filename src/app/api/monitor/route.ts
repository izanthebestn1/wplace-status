import { NextRequest, NextResponse } from 'next/server'

type Service = { name: string; url: string }
type ServiceResult = {
  name: string
  url: string
  statusCode: number
  responseTime: number
  isDown: boolean
  error?: string
}

const TIMEOUT_MS = 8000

async function checkService(service: Service): Promise<ServiceResult> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)
  const start = Date.now()
  try {
    const res = await fetch(service.url, {
      method: 'GET',
      redirect: 'follow',
      cache: 'no-store',
      signal: controller.signal,
    })
    const duration = Date.now() - start
    const statusCode = res.status
    const isDown = !(statusCode >= 200 && statusCode < 300)
    return { name: service.name, url: service.url, statusCode, responseTime: duration, isDown }
  } catch (err: any) {
    const duration = Date.now() - start
    const errorMsg = err?.name === 'AbortError' ? 'Timeout' : (err?.message || 'Network Error')
    return { name: service.name, url: service.url, statusCode: 0, responseTime: duration, isDown: true, error: errorMsg }
  } finally {
    clearTimeout(timeout)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const services: Service[] = Array.isArray(body) ? body : []
    if (!services.length) {
      return NextResponse.json({ error: 'No services provided' }, { status: 400 })
    }
    const results = await Promise.all(services.map(checkService))
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
  return NextResponse.json({ results }, { headers: { 'Cache-Control': 'no-store' } })
}

export const dynamic = 'force-dynamic'
export const revalidate = 0
