import { promises as dns } from 'dns'
import tls from 'tls'
import { URL } from 'url'

export type Service = { name: string; url: string }
export type TLSInfo = {
  validFrom?: string
  validTo?: string
  daysRemaining?: number | null
  issuer?: string
  subject?: string
  error?: string
}
export type DNSInfo = {
  addresses?: Array<{ address: string; family: number }>
  error?: string
}
export type ServiceResult = {
  name: string
  url: string
  statusCode: number
  responseTime: number
  isDown: boolean
  error?: string
  dns?: DNSInfo
  tls?: TLSInfo
}

export const TIMEOUT_MS = 8000

export function getHostnameFromUrl(urlStr: string): string | null {
  try {
    const u = new URL(urlStr)
    return u.hostname
  } catch {
    return null
  }
}

export async function resolveDNS(hostname: string): Promise<DNSInfo> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    // dns.lookup doesn't support AbortSignal; we emulate with timeout only
    const results = await dns.lookup(hostname, { all: true })
    return { addresses: results.map(r => ({ address: r.address, family: r.family })) }
  } catch (e: any) {
    return { error: e?.message || 'DNS error' }
  } finally {
    clearTimeout(id)
  }
}

export async function getTLSInfo(hostname: string, port = 443): Promise<TLSInfo> {
  return new Promise<TLSInfo>((resolve) => {
    const socket = tls.connect({ host: hostname, port, servername: hostname, timeout: TIMEOUT_MS }, () => {
      try {
        const cert: any = socket.getPeerCertificate(true)
        const validFrom = cert?.valid_from
        const validTo = cert?.valid_to
        let daysRemaining: number | null = null
        if (validTo) {
          const to = new Date(validTo).getTime()
          const diffMs = to - Date.now()
          daysRemaining = Math.floor(diffMs / (1000 * 60 * 60 * 24))
        }
        resolve({
          validFrom,
          validTo,
          daysRemaining,
          issuer: cert?.issuer?.O || cert?.issuer?.CN || JSON.stringify(cert?.issuer),
          subject: cert?.subject?.CN || cert?.subject?.O || JSON.stringify(cert?.subject),
        })
      } catch (e: any) {
        resolve({ error: e?.message || 'TLS parsing error' })
      } finally {
        socket.end()
        socket.destroy()
      }
    })
    socket.on('error', (err) => {
      resolve({ error: (err as any)?.message || 'TLS error' })
      socket.destroy()
    })
    socket.on('timeout', () => {
      resolve({ error: 'TLS timeout' })
      socket.destroy()
    })
  })
}

export async function checkService(service: Service): Promise<ServiceResult> {
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

    // DNS + TLS (best-effort)
    const hostname = getHostnameFromUrl(service.url)
    let dnsInfo: DNSInfo | undefined
    let tlsInfo: TLSInfo | undefined
    if (hostname) {
      try { dnsInfo = await resolveDNS(hostname) } catch {}
      if (service.url.startsWith('https://')) {
        try { tlsInfo = await getTLSInfo(hostname, 443) } catch {}
      }
    }
    return { name: service.name, url: service.url, statusCode, responseTime: duration, isDown, dns: dnsInfo, tls: tlsInfo }
  } catch (err: any) {
    const duration = Date.now() - start
    const errorMsg = err?.name === 'AbortError' ? 'Timeout' : (err?.message || 'Network Error')
    const hostname = getHostnameFromUrl(service.url)
    let dnsInfo: DNSInfo | undefined
    let tlsInfo: TLSInfo | undefined
    if (hostname) {
      try { dnsInfo = await resolveDNS(hostname) } catch {}
      if (service.url.startsWith('https://')) {
        try { tlsInfo = await getTLSInfo(hostname, 443) } catch {}
      }
    }
    return { name: service.name, url: service.url, statusCode: 0, responseTime: duration, isDown: true, error: errorMsg, dns: dnsInfo, tls: tlsInfo }
  } finally {
    clearTimeout(timeout)
  }
}

// In-memory history and incidents (ephemeral in serverless). For persistence, use a real DB.
export type HistoryItem = ServiceResult & { timestamp: number }
const historyStore: Map<string, HistoryItem[]> = new Map()
const HISTORY_LIMIT = 200

export function addHistory(result: ServiceResult) {
  const list = historyStore.get(result.url) || []
  const item: HistoryItem = { ...result, timestamp: Date.now() }
  list.push(item)
  // cap size
  while (list.length > HISTORY_LIMIT) list.shift()
  historyStore.set(result.url, list)
}

export function getHistory(url?: string): Record<string, HistoryItem[]> | HistoryItem[] {
  if (url) {
    return historyStore.get(url) || []
  }
  const out: Record<string, HistoryItem[]> = {}
  for (const [k, v] of historyStore.entries()) out[k] = v
  return out
}

// Daily summary over the last N days. Today = index 0, yesterday = index 1, etc.
export function summarizeDaily(history: HistoryItem[], days = 30): Array<{ date: string; total: number; up: number; ratio: number | null }> {
  const byDay: Record<string, { total: number; up: number }> = {}
  for (const h of history) {
    const d = new Date(h.timestamp)
    // normalize to YYYY-MM-DD UTC to keep consistent in serverless
    const dateKey = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())).toISOString().slice(0, 10)
    const bucket = byDay[dateKey] || { total: 0, up: 0 }
    bucket.total += 1
    bucket.up += h.isDown ? 0 : 1
    byDay[dateKey] = bucket
  }
  const out: Array<{ date: string; total: number; up: number; ratio: number | null }> = []
  const now = new Date()
  // build from today backwards
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    d.setUTCDate(d.getUTCDate() - i)
    const key = d.toISOString().slice(0, 10)
    const stats = byDay[key]
    if (!stats) {
      out.push({ date: key, total: 0, up: 0, ratio: null })
    } else {
      out.push({ date: key, total: stats.total, up: stats.up, ratio: stats.total ? stats.up / stats.total : null })
    }
  }
  return out
}

export type Incident = {
  id: string
  title: string
  description?: string
  severity: 'minor' | 'major' | 'critical'
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved'
  createdAt: number
  updatedAt: number
  affectedUrls?: string[]
}

const incidents: Incident[] = []

export function listIncidents(): Incident[] {
  return incidents
}

export function createIncident(input: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>): Incident {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const now = Date.now()
  const inc: Incident = { id, createdAt: now, updatedAt: now, ...input }
  incidents.unshift(inc)
  return inc
}

export function updateIncident(id: string, patch: Partial<Omit<Incident, 'id' | 'createdAt'>>): Incident | null {
  const idx = incidents.findIndex(i => i.id === id)
  if (idx === -1) return null
  incidents[idx] = { ...incidents[idx], ...patch, updatedAt: Date.now() }
  return incidents[idx]
}
