/**
 * Builds the .ics file served at /calendar.ics. Times in config/event.ts are
 * written in Israel local time and converted to UTC here.
 *
 * This is served from a route rather than a `data:` URI because the in-app
 * browsers most guests will use (WhatsApp, and iOS Safari) refuse to open
 * `data:text/calendar` links.
 */

const ISRAEL_TZ = 'Asia/Jerusalem';

/** Converts a local-time string ("2026-05-14T19:00") in Israel to a UTC ICS stamp. */
function toIcsUtc(local: string): string {
  // Insist on the exact shape. `new Date()` is lenient enough to turn a typo
  // into a plausible-looking wrong date, and a wrong calendar entry is worse
  // than no calendar entry.
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local ?? '');
  if (!match) return '';

  const [, y, mo, d, h, mi] = match.map(Number) as unknown as number[];

  const asUtc = new Date(Date.UTC(y, mo - 1, d, h, mi, 0));
  if (Number.isNaN(asUtc.getTime())) return '';

  // Reject dates that rolled over, e.g. 2026-02-30 quietly becoming 2026-03-02.
  if (asUtc.getUTCFullYear() !== y || asUtc.getUTCMonth() !== mo - 1 || asUtc.getUTCDate() !== d) {
    return '';
  }
  if (h > 23 || mi > 59) return '';

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: ISRAEL_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(asUtc);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';
  const shifted = Date.UTC(
    Number(get('year')),
    Number(get('month')) - 1,
    Number(get('day')),
    Number(get('hour')) % 24,
    Number(get('minute')),
    Number(get('second')),
  );

  const offset = shifted - asUtc.getTime();
  const utc = new Date(asUtc.getTime() - offset);
  return utc.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function escapeIcs(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

export function buildIcs(input: {
  title: string;
  start: string;
  end: string;
  location: string;
}): string | null {
  const start = toIcsUtc(input.start);
  const end = toIcsUtc(input.end);
  if (!start || !end) return null;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ronit-pilates//rsvp//HE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${start}-ronit-pilates@invite`,
    `DTSTAMP:${start}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeIcs(input.title)}`,
    `LOCATION:${escapeIcs(input.location)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  // CRLF line endings are required by RFC 5545.
  return lines.join('\r\n');
}
