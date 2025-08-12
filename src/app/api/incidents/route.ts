import { NextRequest, NextResponse } from 'next/server'
import { listIncidents, createIncident, updateIncident, Incident } from '@/lib/server/monitor'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  return NextResponse.json({ incidents: listIncidents() }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const payload = body as Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>
    if (!payload?.title || !payload?.severity || !payload?.status) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    const inc = createIncident(payload)
    return NextResponse.json({ incident: inc })
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...patch } = body as { id: string } & Partial<Incident>
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const inc = updateIncident(id, patch)
    if (!inc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ incident: inc })
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
}
