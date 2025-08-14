import { NextRequest, NextResponse } from 'next/server'
import { listIncidents, createIncident, updateIncident, Incident } from '@/lib/server/monitor'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Historical incidents data for the status page
const historicalIncidents: Incident[] = [
  {
    id: 'hist-001',
    title: 'Backend, explore, pixels, leaderboard and alliances don\'t work',
    status: 'resolved',
    severity: 'major',
    createdAt: new Date('2025-08-12T16:00:00Z').getTime(),
    updatedAt: new Date('2025-08-12T19:19:00Z').getTime(),
    description: 'Multiple services experiencing connectivity issues'
  },
  {
    id: 'hist-002',
    title: 'Backend doesn\'t work',
    status: 'resolved',
    severity: 'major',
    createdAt: new Date('2025-08-10T21:58:00Z').getTime(),
    updatedAt: new Date('2025-08-12T13:56:00Z').getTime(),
    description: 'Backend service experiencing issues'
  },
  {
    id: 'hist-003',
    title: 'Info about pixels don\'t work',
    status: 'resolved',
    severity: 'minor',
    createdAt: new Date('2025-08-10T21:58:00Z').getTime(),
    updatedAt: new Date('2025-08-12T13:55:00Z').getTime(),
    description: 'Pixel information service unavailable'
  },
  {
    id: 'hist-004',
    title: 'Leaderboard doesn\'t work',
    status: 'resolved',
    severity: 'minor',
    createdAt: new Date('2025-08-10T21:58:00Z').getTime(),
    updatedAt: new Date('2025-08-12T13:55:00Z').getTime(),
    description: 'Leaderboard service experiencing issues'
  },
  {
    id: 'hist-005',
    title: 'Alliances don\'t work',
    status: 'resolved',
    severity: 'minor',
    createdAt: new Date('2025-08-10T21:58:00Z').getTime(),
    updatedAt: new Date('2025-08-12T13:56:00Z').getTime(),
    description: 'Alliance service experiencing connectivity issues'
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') // e.g., "2025-08"
    const includeHistorical = searchParams.get('historical') === 'true'
    
    let currentIncidents = listIncidents()
    let allIncidents = currentIncidents

    // Include historical incidents if requested
    if (includeHistorical) {
      allIncidents = [...currentIncidents, ...historicalIncidents]
    }

    if (month) {
      allIncidents = allIncidents.filter(incident => {
        const incidentMonth = new Date(incident.createdAt).toISOString().substring(0, 7)
        return incidentMonth === month
      })
    }

    // Sort by creation date, newest first
    allIncidents.sort((a, b) => b.createdAt - a.createdAt)

    return NextResponse.json({ 
      incidents: allIncidents,
      total: allIncidents.length 
    }, { 
      headers: { 'Cache-Control': 'no-store' } 
    })
  } catch (error) {
    console.error('Error fetching incidents:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
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
