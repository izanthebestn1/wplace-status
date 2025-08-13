import type { HistoryItem } from './monitor'

// Vercel Marketplace: try Upstash Redis first, then legacy @vercel/kv
let upstash: { Redis?: any } | null = null
let upstashClient: any = null
let kvClient: typeof import('@vercel/kv') | null = null

try {
  // Check both standard Upstash env vars and Vercel-prefixed versions
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_KV_REST_API_TOKEN
  
  if (url && token) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    upstash = require('@upstash/redis')
    if (upstash?.Redis) {
      upstashClient = new upstash.Redis({
        url,
        token,
      })
    }
  }
} catch {
  upstash = null
  upstashClient = null
}

try {
  // Legacy KV (deprecated UI, still works if envs exist and package installed)
  if (!upstashClient && process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    kvClient = require('@vercel/kv')
  }
} catch {
  kvClient = null
}

const HISTORY_LIMIT = 200

function keyFor(url: string) {
  // base64url encode to keep key safe
  const b = Buffer.from(url).toString('base64').replace(/=+$/,'').replace(/\+/g,'-').replace(/\//g,'_')
  return `wplace:status:history:${b}`
}

export function hasKV() {
  return !!upstashClient || !!kvClient
}

export async function kvAddHistory(item: HistoryItem) {
  const key = keyFor(item.url)
  try {
    if (upstashClient) {
      await upstashClient.lpush(key, JSON.stringify(item))
      await upstashClient.ltrim(key, 0, HISTORY_LIMIT - 1)
      return
    }
    if (kvClient) {
      await kvClient.kv.lpush(key, JSON.stringify(item))
      await kvClient.kv.ltrim(key, 0, HISTORY_LIMIT - 1)
    }
  } catch {}
}

export async function kvGetHistory(url: string): Promise<HistoryItem[]> {
  const key = keyFor(url)
  try {
    if (upstashClient) {
      const arr: any = await upstashClient.lrange(key, 0, HISTORY_LIMIT - 1)
      const list: any[] = Array.isArray(arr) ? arr : []
      return list.map((s: any) => {
        try { return JSON.parse(s) as HistoryItem } catch { return null as any }
      }).filter(Boolean)
    }
    if (kvClient) {
      const arr = await kvClient.kv.lrange<string>(key, 0, HISTORY_LIMIT - 1)
      return (arr || []).map((s: string) => {
        try { return JSON.parse(s) as HistoryItem } catch { return null as any }
      }).filter(Boolean)
    }
    return []
  } catch {
    return []
  }
}
