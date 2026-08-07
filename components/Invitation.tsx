import Image from 'next/image';
import { event } from '@/config/event';
import { buildIcs } from '@/lib/calendar';
import RsvpForm from './RsvpForm';

/**
 * Splits the headline so any digits inside it render in the accent colour.
 * This is what lets config/event.ts keep `headline` as a plain sentence.
 */
function Headline({ text }: { text: string }) {
  return (
    <h1 className="headline">
      {text.split(/(\d+)/).map((part, i) =>
        /^\d+$/.test(part) ? (
          <span key={i} className="numeral">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </h1>
  );
}

/**
 * A single vertical hairline descending from the logo. It echoes the rules the
 * studio already uses in its own mark — לנשום | להתחטב | ליהנות — rather than
 * introducing the diamond-between-two-lines that every invitation template has.
 */
function Ornament() {
  return <div className="ornament" aria-hidden="true" />;
}

export default function Invitation() {
  const { logos, venue } = event;

  // Checked here rather than in the form so that a mistyped date in
  // config/event.ts simply hides the link instead of offering a broken one.
  const showCalendar = event.calendar.enabled && buildIcs(event.calendar) !== null;

  return (
    <main className="page">
      <header className="mast">
        <Image
          src={logos.studio.src}
          alt={logos.studio.alt}
          width={logos.studio.width}
          height={logos.studio.height}
          style={{ width: logos.studio.displayWidth, height: 'auto' }}
          priority
        />
      </header>

      <Ornament />

      <div className="hero">
        {event.eyebrow ? <p className="eyebrow">{event.eyebrow}</p> : null}
        <Headline text={event.headline} />
        {event.subheadline ? <p className="subheadline">{event.subheadline}</p> : null}
        <p className="intro">{event.intro}</p>
      </div>

      <section className="details" aria-label="פרטי האירוע">
        <p className="when">
          {event.date}
          <span className="time">בשעה {event.time}</span>
        </p>

        <hr className="rule" />

        <div className="where">
          <p className="venue-name">
            {venue.name}
            <span className="sep" aria-hidden="true" />
            {venue.address}
          </p>

          {venue.mapsUrl ? (
            <a className="maps-link" href={venue.mapsUrl} target="_blank" rel="noopener noreferrer">
              {venue.mapsLabel}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M8.4 3.2 4.6 7l3.8 3.8"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          ) : null}
        </div>
      </section>

      <RsvpForm showCalendar={showCalendar} />

      <footer className="venue-mark">
        <span className="caption">{logos.venue.caption}</span>
        <Image
          src={logos.venue.src}
          alt={logos.venue.alt}
          width={logos.venue.width}
          height={logos.venue.height}
          style={{ width: logos.venue.displayWidth, height: 'auto' }}
        />
      </footer>
    </main>
  );
}
