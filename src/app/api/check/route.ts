export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { url } = (await request.json()) as { url?: string };
    if (!url || typeof url !== 'string') {
      return Response.json(
        { ok: false, status: 0, responseTime: 0, error: 'Invalid URL' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const start = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch(url, {
        method: 'GET',
        cache: 'no-store',
        // Let redirects follow (captures final status). If you prefer initial status, set 'manual'.
        redirect: 'follow',
        signal: controller.signal,
      });
      const responseTime = Date.now() - start;
      clearTimeout(timeout);
      return Response.json(
        { ok: res.ok, status: res.status, responseTime },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    } catch (err: any) {
      clearTimeout(timeout);
      return Response.json(
        { ok: false, status: 0, responseTime: Date.now() - start, error: 'Network error' },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }
  } catch (e) {
    return Response.json(
      { ok: false, status: 0, responseTime: 0, error: 'Bad Request' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
