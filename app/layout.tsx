import type { Metadata, Viewport } from 'next';
import { Bellefair, Assistant } from 'next/font/google';
import { event } from '@/config/event';
import './globals.css';

/**
 * Bellefair is a high-contrast serif with full Hebrew coverage — it gives the
 * headline the look of an engraved invitation rather than a web page.
 */
const serif = Bellefair({
  subsets: ['hebrew', 'latin'],
  weight: ['400'],
  variable: '--font-serif',
  display: 'swap',
});

const sans = Assistant({
  subsets: ['hebrew', 'latin'],
  weight: ['200', '300', '400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

/**
 * Needed so the WhatsApp link preview points at an absolute image URL.
 * On Vercel this is filled in automatically; set NEXT_PUBLIC_SITE_URL only if
 * you use a custom domain.
 */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: event.meta.title,
  description: event.meta.description,
  openGraph: {
    title: event.meta.title,
    description: event.meta.description,
    type: 'website',
    locale: 'he_IL',
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: event.meta.title }],
  },
  // A private invitation has no business showing up in search results.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#FBEFEB',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
