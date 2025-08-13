import { NextRequest } from "next/server";

async function fetchWithTimeout(resource: string, options: RequestInit & { timeout?: number } = {}) {
  const { timeout = 10000, ...rest } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(resource, { ...rest, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export async function GET(_req: NextRequest) {
  // Global regions leaderboard (all-time), per user-provided endpoint
  const target = `https://backend.wplace.live/leaderboard/region/all-time/0`;
  try {
    const res = await fetchWithTimeout(target, { headers: { accept: 'application/json' }, cache: 'no-store', timeout: 10000 } as any);
    const status = res.status;
    let data: any = null;
    try { data = await res.json(); } catch {}
    return new Response(JSON.stringify({ ok: res.ok, status, data, target }), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}
