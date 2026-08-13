/* ============================================================================
 *  ⭐ כל מה שצריך לערוך בהזמנה נמצא בקובץ הזה בלבד ⭐
 *  EVERYTHING you need to edit lives in this one file.
 *
 *  אין צורך לגעת בשום קובץ אחר כדי לשנות טקסט, תאריך, שעה, מקום או לוגו.
 *  You never need to touch another file to change text, date, time,
 *  venue or logos.
 *
 *  מקומות שמסומנים ב־PLACEHOLDER חייבים להתעדכן לפני שליחת ההזמנה.
 *  Anything marked PLACEHOLDER must be updated before you send the invite.
 * ==========================================================================*/

export const event = {
  /* ------------------------------------------------------------------ */
  /*  1. כותרת ראשית / MAIN HEADLINE                                     */
  /* ------------------------------------------------------------------ */
  // המספר בכותרת נצבע אוטומטית בוורוד — פשוט כתבו משפט רגיל.
  // The number inside the headline is auto-coloured rose — just write
  // a normal sentence, no special formatting needed.
  headline: 'חוגגים 5 שנים',

  // שורה שנייה מתחת לכותרת (אפשר להשאיר ריק '' כדי להסתיר)
  // Second line under the headline (set to '' to hide it)
  subheadline: 'ומרימים כוסית לשנה החדשה',

  // שורת פתיחה קטנה מעל הכותרת (אפשר להשאיר ריק '' כדי להסתיר)
  // Small line above the headline (set to '' to hide it)
  eyebrow: 'הזמנה אישית',

  // משפט ההזמנה — שורה או שתיים, לא יותר
  // The invitation sentence — one or two lines, no more
  // (רוצים פנייה בלשון נקבה? החליפו "אתכם" ב"אתכן")
  intro: 'חמש שנים של נשימות, צמיחה וקהילה מדהימה. שמחה להזמין אתכם להרים כוסית לשנה החדשה ולחגוג יחד ערב של יופי, אוכל טוב ואנשים אהובים.',

  /* ------------------------------------------------------------------ */
  /*  2. פרטי האירוע / EVENT DETAILS                                     */
  /* ------------------------------------------------------------------ */
  date: 'יום שלישי, 1 בספטמבר 2026',
  time: '19:00',

  venue: {
    name: 'נינה',
    address: 'מושב חגור',
    // קישור ניווט. אפשר להחליף בקישור Waze או Google Maps מדויק.
    // Navigation link — swap for an exact Waze / Google Maps link if you have one.
    mapsUrl: 'https://waze.com/ul?q=%D7%A0%D7%99%D7%A0%D7%94%20%D7%9E%D7%95%D7%A9%D7%91%20%D7%97%D7%92%D7%95%D7%A8&navigate=yes',
    mapsLabel: 'לניווט',
  },

  /* ------------------------------------------------------------------ */
  /*  3. הוספה ליומן / ADD TO CALENDAR                                   */
  /* ------------------------------------------------------------------ */
  // מופיע רק אחרי אישור ההגעה.
  // Shown only after the guest confirms.
  // פורמט: 'YYYY-MM-DDTHH:MM' בשעון ישראל
  // Format: 'YYYY-MM-DDTHH:MM' in Israel local time.
  calendar: {
    enabled: true,
    title: 'רונית פילאטיס — חוגגים 5 שנים',
    start: '2026-09-01T19:00',
    end: '2026-09-01T23:00',
    location: 'נינה, מושב חגור',
    label: 'הוספה ליומן',
  },

  /* ------------------------------------------------------------------ */
  /*  4. לוגואים / LOGOS                                                 */
  /* ------------------------------------------------------------------ */
  // כדי להחליף לוגו: שימו קובץ חדש בתיקיית public/ ועדכנו את השם כאן.
  // To replace a logo: drop a new file into public/ and update the name here.
  // רוחב מוצג בפיקסלים — אפשר לכוונן.  Displayed width in px — tweak freely.
  logos: {
    studio: {
      src: '/logo-studio.png',
      alt: 'רונית פילאטיס',
      width: 700,
      height: 645,
      displayWidth: 190,
    },
    // לוגו נינה קיים בשתי גרסאות:
    //   /logo-nina.png       — גוון שזוף־ורוד שמשתלב עם עיצוב ההזמנה (ברירת מחדל)
    //   /logo-nina-green.png — הירוק המקורי של נינה
    // Two versions of the Nina mark are available: the plum tint that matches
    // the invitation (default), and Nina's original green.
    venue: {
      src: '/logo-nina-plum.png',
      alt: 'נינה — קפה, אירוח, נופי',
      width: 308,
      height: 188,
      displayWidth: 112,
      caption: 'מתארחים ב',
    },
  },

  /* ------------------------------------------------------------------ */
  /*  5. טפסים והודעות / FORM & MESSAGES                                 */
  /* ------------------------------------------------------------------ */
  form: {
    nameLabel: 'שם מלא',
    namePlaceholder: 'ישראלה ישראלי',
    phoneLabel: 'טלפון',
    phonePlaceholder: '050-0000000',
    cta: 'אישור הגעה',
    ctaBusy: 'רגע אחד…',

    // הודעות שגיאה בטופס
    errorName: 'נא להזין שם מלא',
    errorPhone: 'נא להזין מספר טלפון תקין',
    // שגיאה כשההרשמה לא נשמרה
    errorSubmit: 'משהו השתבש ולא הצלחנו לשמור את ההרשמה. אפשר לנסות שוב.',
    retry: 'נסו שוב',
  },

  // המסך שמופיע אחרי אישור הגעה
  // The screen shown after a successful RSVP
  // סימן ♥ בטקסט מוחלף אוטומטית בלב מצויר בוורוד.
  // A ♥ in the text is automatically replaced with a drawn rose heart.
  success: {
    title: 'תודה, ההרשמה התקבלה ♥',
    body: 'מחכים לחגוג איתך',
  },

  /* ------------------------------------------------------------------ */
  /*  6. תצוגה מקדימה בוואטסאפ / WHATSAPP LINK PREVIEW                   */
  /* ------------------------------------------------------------------ */
  // מה שיופיע כשתשלחו את הקישור בוואטסאפ.
  // What people see when you share the link on WhatsApp.
  meta: {
    title: 'רונית פילאטיס — חוגגים 5 שנים',
    description: 'הזמנה אישית · יום שלישי, 1 בספטמבר, 19:00 · נינה, מושב חגור. נשמח שתאשרו הגעה.',
  },
} as const;

export type EventConfig = typeof event;
