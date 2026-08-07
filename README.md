# רונית פילאטיס — הזמנה ל-5 שנים

A one-page Hebrew digital invitation with RSVP. Every confirmation is saved
automatically to a Google Sheet.

Built with Next.js + TypeScript and three runtime dependencies (`next`, `react`,
`react-dom`). No CSS framework, no form library, no Google API client.

---

## Quick start

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. Until you connect a Google Sheet (below), RSVPs in
development are written to a local file called `.rsvp-dev.log` so you can try the
form straight away.

---

## How to update the invitation

**Almost everything lives in one file: [`config/event.ts`](config/event.ts).**
Open it, change the text, save. You never need to look at any other file.

| What you want to change | Where |
| --- | --- |
| Main headline (`חוגגים 5 שנים`) | `config/event.ts` → `headline` |
| Second line (`ומרימים כוסית לשנה החדשה`) | `config/event.ts` → `subheadline` (set to `''` to hide it) |
| Small line above the headline | `config/event.ts` → `eyebrow` (set to `''` to hide it) |
| The invitation sentence | `config/event.ts` → `intro` |
| **Date** | `config/event.ts` → `date` |
| **Time** | `config/event.ts` → `time` |
| Venue name and address | `config/event.ts` → `venue.name`, `venue.address` |
| The navigation ("לניווט") link | `config/event.ts` → `venue.mapsUrl` |
| "Add to calendar" date/time | `config/event.ts` → `calendar.start`, `calendar.end` |
| Field labels, button text, error messages | `config/event.ts` → `form` |
| The thank-you screen | `config/event.ts` → `success` |
| WhatsApp link preview text | `config/event.ts` → `meta` |
| **Logos** | put the new image in `public/`, then update `config/event.ts` → `logos` |
| **Google Sheet connection** | environment variables — see the next section |

### A few notes

- **The number in the headline is coloured rose automatically.** Just write a
  normal sentence like `חוגגים 5 שנים`; any digits in it turn rose on their own.
- **A `♥` in the thank-you text becomes a drawn heart.** Type the character
  normally in `success.title`; it is replaced with a rose SVG heart so it looks
  identical on every phone.
- **The invitation speaks to a mixed audience** (`אתכם`). For a women-only
  phrasing, change it to `אתכן` in `intro`.
- **The Nina logo comes in two tones.** `logos.venue.src` points at
  `/logo-nina-plum.png`, which matches the blush palette. To use Nina's original
  green instead, change it to `/logo-nina-green.png`.
- **Date and time are free text.** Write them however you like — `יום חמישי,
  14.05.2026` or `יום ה׳, 14 במאי`. They are only displayed, never parsed.
- **The `calendar` dates are different** — those must be exactly
  `YYYY-MM-DDTHH:MM` in Israel local time, because a real calendar file is
  generated from them. If you get the format wrong, the "add to calendar" button
  simply disappears rather than creating a wrong entry.
- **Replacing a logo:** drop the file into `public/` and point `logos.studio.src`
  or `logos.venue.src` at it (e.g. `/my-new-logo.png`). Also update the `width`
  and `height` to the real pixel size of the file, and `displayWidth` to how wide
  you want it to appear on screen.
  The two current logos have had their white backgrounds removed already, so they
  sit cleanly on the blush page. If you supply a new logo with a white
  background, it will show as a white rectangle — use a PNG with transparency.

---

## Connecting the Google Sheet

Submissions are saved through a small script that lives inside the spreadsheet
itself. **No Google Cloud project, no service account, no OAuth setup, no extra
Google APIs** — just Apps Script and Sheets. Takes about ten minutes.

**The short version:** create a Sheet → Extensions → Apps Script → paste
`apps-script/Code.gs` → set your own password at the top → Deploy as Web App
(*Execute as: Me*, *Who has access: Anyone*) → copy the `/exec` URL → put that
URL and the same password into `.env.local`.

The detailed version follows.

### 1. Create the spreadsheet

Go to <https://sheets.new> and give it a name, e.g. *אישורי הגעה — 5 שנים*.
Leave it empty; the columns are created automatically on the first RSVP.

### 2. Add the script

1. In the spreadsheet, open **Extensions → Apps Script**.
2. Delete whatever is in the editor.
3. Copy the entire contents of [`apps-script/Code.gs`](apps-script/Code.gs) and
   paste it in.
4. Near the top, replace `REPLACE_ME_WITH_A_LONG_RANDOM_SECRET` with your own
   long random password. Invent anything — 30+ random characters is good.
   **Keep this value; you need it again in step 4.**
5. Click the save icon.
6. *Optional but worth it:* pick `testWriteRow` from the function dropdown and
   press **Run**. Authorize when asked (see the warning screen note in step 3).
   A row reading *בדיקה — אפשר למחוק* should appear in the sheet, which proves
   the sheet side works before the website is involved at all. Delete that row
   by hand afterwards.

### 3. Publish the script

1. Click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Set:
   - **Execute as:** *Me*
   - **Who has access:** *Anyone*

   ⚠️ *Anyone* is required — it means anyone who knows the URL can send data,
   which is exactly why the script also checks your secret password. The
   spreadsheet itself stays private.
4. Click **Deploy**.
5. Google will ask you to authorize the script. You will see a scary screen
   saying **"Google hasn't verified this app"**. This is normal for your own
   scripts. Click **Advanced**, then **Go to (project name) (unsafe)**, then
   **Allow**.
6. Copy the **Web app URL**. It looks like
   `https://script.google.com/macros/s/AKfy...long.../exec` and **must end in
   `/exec`**.

### 4. Give the website the URL and the password

Create a file called `.env.local` in the project folder (copy `.env.example`):

```bash
SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/AKfy..../exec
SHEETS_WEBHOOK_TOKEN=the-same-secret-you-put-in-the-script
```

`SHEETS_WEBHOOK_TOKEN` must match `SHARED_TOKEN` in the script **exactly**.

Restart `npm run dev`, submit a test RSVP, and check that a row appears in the
spreadsheet.

### 5. Set the same two variables on Vercel

In your Vercel project: **Settings → Environment Variables**, add
`SHEETS_WEBHOOK_URL` and `SHEETS_WEBHOOK_TOKEN` with the same values, for all
environments. **Redeploy** afterwards — environment variables are only picked up
on a new deployment.

### The spreadsheet

A tab called `RSVP` is created with exactly these columns:

| Full Name | Phone | Registration Date | Registration Time |
| --- | --- | --- | --- |
| רונית לוי | 0501234567 | 14/05/2026 | 20:14:03 |

Date and time are recorded in Israel time. Phone numbers are stored as text so
the leading zero is never lost, and they are normalised first — someone who
types `+972 50-123-4567` is saved as `0501234567`.

Every confirmation becomes its own row, including two people who submit with the
same phone number — couples often share one. If you would rather collapse repeat
submissions from the same number into a single row, set
`ALLOW_DUPLICATE_PHONES = false` at the top of `Code.gs` and redeploy. Be aware
that with it off, the second person using a shared number sees a confirmation on
screen but never reaches the sheet.

### If you edit the script later

Saving is not enough. You must go to **Deploy → Manage deployments →** pencil
icon **→ Version: New version → Deploy**, otherwise the old code keeps running.

### Troubleshooting

| Symptom | Cause |
| --- | --- |
| Guests see the error message every time | `SHEETS_WEBHOOK_URL` or `SHEETS_WEBHOOK_TOKEN` is wrong or missing on Vercel, or you didn't redeploy after adding them |
| The URL ends in `/dev` | That's the test URL. Use the `/exec` one from **Deploy → Manage deployments** |
| Rows never appear but the site says success | You are running locally without the variables set — check `.rsvp-dev.log` |
| Phone numbers lost their leading zero | The `Phone` column was reformatted by hand. Set it back to *Format → Number → Plain text* |

---

## Deploying to Vercel

1. Push this folder to a GitHub repository.
2. On <https://vercel.com>, **Add New → Project**, and import the repository.
3. Add the two environment variables from step 5 above.
4. Deploy.

That's it — no build settings to change. Vercel detects Next.js automatically.

Send the resulting link over WhatsApp. It will show a preview card using
`public/og.jpg` and the text from `config/event.ts` → `meta`. If you use a custom
domain, also set `NEXT_PUBLIC_SITE_URL` to it (e.g.
`https://invite.ronitpilates.co.il`) so the preview image resolves correctly.

---

## How it fits together

```
config/event.ts          all copy, dates, venue, logo paths   ← edit this
app/page.tsx             renders the invitation
components/Invitation.tsx  logo, headline, details, venue mark
components/RsvpForm.tsx    the form and its loading/success/error states
app/api/rsvp/route.ts    server-only: validates, then forwards to the Sheet
app/calendar.ics/route.ts  the "add to calendar" file
lib/phone.ts             Israeli phone validation, shared by browser + server
lib/calendar.ts          builds the calendar file
app/globals.css          the whole stylesheet
apps-script/Code.gs      paste this into the spreadsheet
public/                  logos and the WhatsApp preview image
```

The Apps Script URL and password are read **only** inside
`app/api/rsvp/route.ts`, which runs on the server. They are never sent to the
browser and never appear in the page source.

Phone numbers are accepted generously — `0501234567`, `050-123-4567`,
`+972 50 123 4567` and landlines like `09-7654321` all work — and are validated
again on the server, since the browser check is only there to be helpful.

The submit button cannot fire twice: it disables itself, and a synchronous guard
blocks a second tap that lands in the same instant. The script in the
spreadsheet also takes a lock and skips duplicate phone numbers, so even a retry
after a dropped connection produces exactly one row.
