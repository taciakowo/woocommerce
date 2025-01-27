/**
 * Loguje zdarzenia do zakładki "logi" w Google Sheets.
 */
export function logEvent(functionName, event, productId = null, error = null) {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(LOGS_SHEET);
    const timestamp = new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' });
    sheet.appendRow([timestamp, functionName, event, productId, error]);
  }
  