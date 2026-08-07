import { isValidName, isValidPhone, normalizeName, normalizePhone } from '@/lib/phone';

/**
 * Receives an RSVP and forwards it to the Google Apps Script attached to the
 * spreadsheet. This runs on the server only — the Apps Script URL and its
 * token live in environment variables and never reach the browser.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RATE_LIMIT_WINDOW_MS = 60_000;
/**
 * Deliberately generous. Israeli mobile carriers put a lot of subscribers
 * behind one NAT address, so several genuine guests can share an IP — a tight
 * limit would turn them away. This only needs to stop a runaway loop.
 */
const RATE_LIMIT_MAX = 30;
const UPSTREAM_TIMEOUT_MS = 10_000;

/**
 * Best-effort throttle. It lives in the memory of one serverless instance, so
 * it resets on cold start and doesn't coordinate across instances — which is
 * fine here. It exists to blunt an accidental loop, not to withstand a
 * determined attacker.
 */
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);

  // Keep the map from growing without bound on a long-lived instance.
  if (hits.size > 500) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) hits.delete(key);
    }
  }

  return recent.length > RATE_LIMIT_MAX;
}

function fail(status: number, reason: string) {
  return Response.json({ ok: false, error: reason }, { status });
}

export async function POST(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  if (isRateLimited(ip)) return fail(429, 'rate_limited');

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, 'invalid_json');
  }

  const { fullName, phone } = (body ?? {}) as { fullName?: unknown; phone?: unknown };

  if (typeof fullName !== 'string' || typeof phone !== 'string') return fail(400, 'invalid_payload');

  // The browser already checked these; this is the check that actually counts.
  if (!isValidName(fullName)) return fail(400, 'invalid_name');
  if (!isValidPhone(phone)) return fail(400, 'invalid_phone');

  const record = {
    fullName: normalizeName(fullName),
    phone: normalizePhone(phone),
  };

  const webhookUrl = process.env.SHEETS_WEBHOOK_URL;
  const webhookToken = process.env.SHEETS_WEBHOOK_TOKEN;

  if (!webhookUrl || !webhookToken) {
    // No spreadsheet connected yet. In development we log to a file so the
    // whole flow can be exercised; in production this is a hard failure,
    // because silently dropping a real RSVP would be much worse than an error.
    if (process.env.NODE_ENV !== 'production') {
      const { appendFile } = await import('node:fs/promises');
      const line = `${new Date().toISOString()}\t${record.fullName}\t${record.phone}\n`;
      await appendFile('.rsvp-dev.log', line, 'utf8');
      console.warn('[rsvp] No SHEETS_WEBHOOK_URL set — wrote to .rsvp-dev.log instead.');
      return Response.json({ ok: true, dev: true });
    }

    console.error('[rsvp] SHEETS_WEBHOOK_URL or SHEETS_WEBHOOK_TOKEN is missing.');
    return fail(500, 'not_configured');
  }

  try {
    const upstream = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: webhookToken, ...record }),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      // Apps Script answers with a 302 to googleusercontent.com; fetch follows
      // it by default, which is why the body is parsed defensively below.
      redirect: 'follow',
    });

    const text = await upstream.text();
    let result: { ok?: boolean; error?: string } | null = null;
    try {
      result = JSON.parse(text);
    } catch {
      /* Apps Script returned an HTML error page rather than JSON. */
    }

    if (!upstream.ok || !result?.ok) {
      console.error('[rsvp] Sheet rejected the submission:', upstream.status, text.slice(0, 300));
      return fail(502, 'sheet_error');
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error('[rsvp] Could not reach the sheet:', error);
    return fail(504, 'sheet_unreachable');
  }
}
