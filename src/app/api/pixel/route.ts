import { NextRequest } from "next/server";

// Simple timeout wrapper for fetch
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { url, x, y, a, b } = body || {};

    // Enforce s0 only. If a URL is provided, extract parts and rebuild against s0.
  let ax: number | undefined = (typeof a === 'number' && Number.isFinite(a)) ? a : undefined;
  let bx: number | undefined = (typeof b === 'number' && Number.isFinite(b)) ? b : undefined;
  let xx: number | undefined = (typeof x === 'number' && Number.isFinite(x)) ? x : undefined;
  let yy: number | undefined = (typeof y === 'number' && Number.isFinite(y)) ? y : undefined;

    if (typeof url === 'string' && url.trim().length > 0) {
      try {
        const u = new URL(url);
        // Match /pixel/a/b or /sN/pixel/a/b
        const m = u.pathname.match(/\/(?:s\d+\/)?pixel\/(\d+)\/(\d+)/i);
        if (m) {
          ax ??= Number(m[1]);
          bx ??= Number(m[2]);
        }
        const xp = u.searchParams.get('x');
        const yp = u.searchParams.get('y');
        if (xp != null) xx ??= Number(xp);
        if (yp != null) yy ??= Number(yp);
      } catch {}
    }

    if (!Number.isFinite(ax as number) || !Number.isFinite(bx as number) || !Number.isFinite(xx as number) || !Number.isFinite(yy as number)) {
      return new Response(
        JSON.stringify({ ok: false, error: "Provide valid numeric a, b, x, y (or paste a backend pixel URL)." }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    const target = `https://backend.wplace.live/s0/pixel/${ax}/${bx}?x=${xx}&y=${yy}`;

    const res = await fetchWithTimeout(target, {
      headers: {
        accept: "application/json",
      },
      cache: "no-store",
      // @ts-ignore - custom prop for our helper
      timeout: 10000,
    } as any);

    const status = res.status;
    let data: any = null;
    try {
      data = await res.json();
    } catch {
      // best effort
    }

    return new Response(
      JSON.stringify({ ok: res.ok, status, data, target }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({ ok: false, error: String(e?.message || e || "unknown error") }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
