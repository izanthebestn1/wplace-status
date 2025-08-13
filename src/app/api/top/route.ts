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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const regionId = searchParams.get('regionId');
  const period = searchParams.get('period') || 'all-time'; // today | week | month | all-time
  if (!regionId) {
    return new Response(JSON.stringify({ ok: false, error: 'Missing regionId' }), { status: 400, headers: { 'content-type': 'application/json' } });
  }
  const target = `https://backend.wplace.live/leaderboard/region/players/${encodeURIComponent(regionId)}/${encodeURIComponent(period)}`;
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
