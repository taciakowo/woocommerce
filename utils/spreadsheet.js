/**
 * Pobiera ustawienia z zakładki "ustawienia".
 */
export function getSettings() {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SETTINGS_SHEET);
    const data = sheet.getDataRange().getValues();
    return Object.fromEntries(data.map(row => [row[0], row[1] || '']));
  }
  