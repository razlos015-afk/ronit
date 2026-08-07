import { event } from '@/config/event';
import { buildIcs } from '@/lib/calendar';

/** Serves the event as a calendar file for the "add to calendar" link. */
export function GET() {
  const ics = buildIcs(event.calendar);

  if (!ics) {
    // The calendar dates in config/event.ts are missing or malformed.
    return new Response('Calendar is not configured', { status: 404 });
  }

  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="event.ics"',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
