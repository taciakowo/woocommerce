/**
 * Loguje zdarzenia w zakładce "logi".
 */
export function logEvent(functionName, event, productId = null, error = null) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(LOGS_SHEET);
    const timestamp = new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' });
    sheet.appendRow([timestamp, functionName, event, productId, error]);
  } catch (e) {
    throw new Error(`Błąd podczas logowania zdarzenia: ${e.message}`);
  }
}
/**
 * Loguje zdarzenia w zakładce "logi".
 */
export function logEvent(functionName, event, productId = null, error = null) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(LOGS_SHEET);
    const timestamp = new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' });
    sheet.appendRow([timestamp, functionName, event, productId, error]);
  } catch (e) {
    throw new Error(`Błąd podczas logowania zdarzenia: ${e.message}`);
  }
}
