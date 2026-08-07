'use client';

import { useRef, useState } from 'react';
import { event } from '@/config/event';
import { isValidName, isValidPhone } from '@/lib/phone';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const { form, success, calendar } = event;

/** Small inline warning glyph, so errors don't rely on colour alone. */
function WarnIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="6.1" stroke="currentColor" strokeWidth="1.1" />
      <path d="M7 4v3.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="7" cy="9.9" r="0.75" fill="currentColor" />
    </svg>
  );
}

/**
 * Renders the success title, swapping a ♥ in the copy for a drawn heart so it
 * looks the same on every phone instead of falling back to a system glyph.
 */
function SuccessTitle({ text }: { text: string }) {
  return (
    <h2>
      {text.split(/(♥)/).map((part, i) =>
        part === '♥' ? (
          <svg
            key={i}
            className="heart"
            width="19"
            height="17"
            viewBox="0 0 19 17"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M9.5 16.1 2.6 9.4A4.55 4.55 0 0 1 9.5 3.5a4.55 4.55 0 0 1 6.9 5.9Z" />
          </svg>
        ) : (
          part
        ),
      )}
    </h2>
  );
}

export default function RsvpForm({ showCalendar }: { showCalendar: boolean }) {
  const [status, setStatus] = useState<Status>('idle');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const nameInput = useRef<HTMLInputElement>(null);
  const phoneInput = useRef<HTMLInputElement>(null);

  /**
   * A ref rather than the `status` state, because a double tap can fire two
   * submits in the same tick — before React has re-rendered the disabled
   * button. The ref flips synchronously, so the second one is dropped.
   */
  const inFlight = useRef(false);

  async function handleSubmit(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();

    if (inFlight.current || status === 'submitting' || status === 'success') return;

    const badName = !isValidName(name);
    const badPhone = !isValidPhone(phone);
    setNameError(badName ? form.errorName : '');
    setPhoneError(badPhone ? form.errorPhone : '');

    if (badName || badPhone) {
      (badName ? nameInput : phoneInput).current?.focus();
      return;
    }

    inFlight.current = true;
    setStatus('submitting');

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: name, phone }),
      });

      const data = (await response.json().catch(() => null)) as { ok?: boolean } | null;

      if (!response.ok || !data?.ok) throw new Error('rsvp failed');

      setStatus('success');
    } catch {
      setStatus('error');
    } finally {
      inFlight.current = false;
    }
  }

  if (status === 'success') {
    return (
      <section className="rsvp" aria-label="אישור הגעה">
        <div className="confirmation" role="status">
          <span className="seal" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path
                d="M6.5 13.4 11 17.9l8.5-9.8"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>

          <SuccessTitle text={success.title} />
          <p>{success.body}</p>

          {showCalendar ? (
            <a className="calendar-link" href="/calendar.ics" download="event.ics">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                <rect x="1.6" y="2.9" width="11.8" height="10.5" rx="2" stroke="currentColor" strokeWidth="1.1" />
                <path d="M1.6 6.2h11.8M5 1.6v2.6M10 1.6v2.6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
              </svg>
              {calendar.label}
            </a>
          ) : null}
        </div>
      </section>
    );
  }

  const busy = status === 'submitting';

  return (
    <section className="rsvp" aria-label="אישור הגעה">
      <form className="form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="rsvp-name">{form.nameLabel}</label>
          <input
            id="rsvp-name"
            ref={nameInput}
            type="text"
            name="name"
            value={name}
            placeholder={form.namePlaceholder}
            autoComplete="name"
            enterKeyHint="next"
            disabled={busy}
            aria-invalid={nameError ? true : undefined}
            aria-describedby={nameError ? 'rsvp-name-error' : undefined}
            onChange={(e) => {
              setName(e.target.value);
              // Clear the complaint as soon as it stops being true.
              if (nameError && isValidName(e.target.value)) setNameError('');
            }}
            onBlur={(e) => {
              // Don't scold someone who merely tabbed past an empty field.
              if (e.target.value.trim() && !isValidName(e.target.value)) setNameError(form.errorName);
            }}
          />
          {nameError ? (
            <span className="error" id="rsvp-name-error">
              <WarnIcon />
              {nameError}
            </span>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="rsvp-phone">{form.phoneLabel}</label>
          <input
            id="rsvp-phone"
            ref={phoneInput}
            type="tel"
            name="phone"
            value={phone}
            placeholder={form.phonePlaceholder}
            inputMode="tel"
            autoComplete="tel"
            enterKeyHint="done"
            disabled={busy}
            aria-invalid={phoneError ? true : undefined}
            aria-describedby={phoneError ? 'rsvp-phone-error' : undefined}
            onChange={(e) => {
              setPhone(e.target.value);
              if (phoneError && isValidPhone(e.target.value)) setPhoneError('');
            }}
            onBlur={(e) => {
              if (e.target.value.trim() && !isValidPhone(e.target.value)) setPhoneError(form.errorPhone);
            }}
          />
          {phoneError ? (
            <span className="error" id="rsvp-phone-error">
              <WarnIcon />
              {phoneError}
            </span>
          ) : null}
        </div>

        {status === 'error' ? (
          <p className="form-error" role="alert">
            <WarnIcon />
            {form.errorSubmit}
          </p>
        ) : null}

        <button className="submit" type="submit" disabled={busy}>
          {busy ? (
            <>
              <span className="spinner" aria-hidden="true" />
              {form.ctaBusy}
            </>
          ) : status === 'error' ? (
            form.retry
          ) : (
            form.cta
          )}
        </button>
      </form>

      <p className="visually-hidden" role="status" aria-live="polite">
        {busy ? form.ctaBusy : ''}
      </p>
    </section>
  );
}
