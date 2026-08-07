/**
 * ============================================================================
 *  Ronit Pilates — RSVP  ->  Google Sheet
 * ============================================================================
 *
 *  העתיקו את כל הקובץ הזה לתוך Extensions -> Apps Script בגיליון שלכם.
 *  Copy this whole file into Extensions -> Apps Script in your spreadsheet.
 *
 *  הוראות מלאות נמצאות ב-README.
 *  Full step-by-step instructions are in the README.
 * ============================================================================
 */

/* ---------------------------------------------------------------- settings */

/**
 * ⚠️ החליפו את הטקסט הזה בסיסמה משלכם, ושימו בדיוק את אותה הסיסמה
 *    במשתנה הסביבה SHEETS_WEBHOOK_TOKEN ב-Vercel.
 *
 * ⚠️ Replace this with your own secret and put the EXACT same value in the
 *    SHEETS_WEBHOOK_TOKEN environment variable on Vercel.
 */
var SHARED_TOKEN = 'REPLACE_ME_WITH_A_LONG_RANDOM_SECRET';

/** שם הלשונית בגיליון / Name of the tab inside the spreadsheet. */
var SHEET_NAME = 'RSVP';

/**
 * true  = כל אישור הגעה נשמר כשורה חדשה (ברירת מחדל).
 * false = אם אותו מספר טלפון נשלח פעמיים, תישמר רק שורה אחת.
 *
 * ברירת המחדל היא true כי בני זוג רבים חולקים מספר טלפון אחד — עם סינון
 * כפילויות השני מביניהם היה מקבל אישור על המסך אבל לא היה מופיע בגיליון.
 * שורה כפולה קל לראות ולמחוק; אורח חסר הוא בלתי נראה.
 *
 * Default is true because couples often share one phone number. With
 * de-duplication on, the second person would see a confirmation on screen but
 * never appear in the sheet. A duplicate row is visible and easy to delete;
 * a missing guest is invisible.
 */
var ALLOW_DUPLICATE_PHONES = true;

/** אזור הזמן לתאריך ולשעת ההרשמה / Timezone for the registration stamps. */
var TIMEZONE = 'Asia/Jerusalem';

var HEADERS = ['Full Name', 'Phone', 'Registration Date', 'Registration Time'];

/* -------------------------------------------------------------- the endpoint */

function doPost(e) {
  var lock = LockService.getScriptLock();

  // Two guests submitting at the same instant must not land on the same row.
  try {
    lock.waitLock(20000);
  } catch (err) {
    return jsonResponse({ ok: false, error: 'busy' });
  }

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ ok: false, error: 'empty_request' });
    }

    var body = JSON.parse(e.postData.contents);

    if (!body.token || body.token !== SHARED_TOKEN) {
      return jsonResponse({ ok: false, error: 'unauthorized' });
    }

    var fullName = String(body.fullName || '').trim();
    var phone = String(body.phone || '').trim();

    if (!fullName || !phone) {
      return jsonResponse({ ok: false, error: 'missing_fields' });
    }

    var sheet = getSheet();

    if (!ALLOW_DUPLICATE_PHONES && phoneAlreadyRegistered(sheet, phone)) {
      // Already saved — report success so a guest retrying after a flaky
      // connection still sees the confirmation screen.
      return jsonResponse({ ok: true, duplicate: true });
    }

    var now = new Date();
    sheet.appendRow([
      fullName,
      phone,
      Utilities.formatDate(now, TIMEZONE, 'dd/MM/yyyy'),
      Utilities.formatDate(now, TIMEZONE, 'HH:mm:ss'),
    ]);

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** A plain GET is only used to check the deployment is alive. */
function doGet() {
  return jsonResponse({ ok: true, service: 'ronit-pilates-rsvp' });
}

/**
 * בדיקה מהירה — לוחצים Run על הפונקציה הזו בעורך של Apps Script,
 * ואמורה להתווסף שורת בדיקה לגיליון. אפשר למחוק אותה אחר כך ביד.
 * כך אפשר לוודא שהחיבור לגיליון עובד עוד לפני שמחברים את האתר.
 *
 * Quick check — press Run on this function in the Apps Script editor and a test
 * row should appear in the sheet. Delete the row by hand afterwards. This
 * confirms the sheet side works before you involve the website at all.
 */
function testWriteRow() {
  var sheet = getSheet();
  var now = new Date();
  sheet.appendRow([
    'בדיקה — אפשר למחוק',
    '0500000000',
    Utilities.formatDate(now, TIMEZONE, 'dd/MM/yyyy'),
    Utilities.formatDate(now, TIMEZONE, 'HH:mm:ss'),
  ]);
}

/* ------------------------------------------------------------------ helpers */

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 220);
    sheet.setColumnWidth(2, 140);
  }

  // Phone numbers must stay text, or Sheets eats the leading zero and
  // 0501234567 becomes 501234567.
  sheet.getRange('B2:B').setNumberFormat('@');

  return sheet;
}

function phoneAlreadyRegistered(sheet, phone) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;

  var existing = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
  for (var i = 0; i < existing.length; i++) {
    if (String(existing[i][0]).trim() === phone) return true;
  }
  return false;
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
