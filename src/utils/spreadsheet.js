/**
 * Pobiera ustawienia z zakładki "ustawienia".
 */
export function getSettings() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SETTINGS_SHEET);
    if (!sheet) throw new Error(`Zakładka "${SETTINGS_SHEET}" nie istnieje.`);

    const data = sheet.getDataRange().getValues();
    if (!data || data.length === 0) throw new Error(`Zakładka "${SETTINGS_SHEET}" jest pusta.`);

    return Object.fromEntries(data.map(row => {
      if (row.length < 2 || !row[0]) throw new Error('Nieprawidłowy format danych w zakładce "ustawienia".');
      return [row[0], row[1] || ''];
    }));
  } catch (error) {
    throw new Error(`Błąd podczas pobierania ustawień: ${error.message}`);
  }
}

/**
 * Pobiera dynamiczny SHEET_ID z zakładki "ustawienia".
 */
export function getDynamicSheetId() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SETTINGS_SHEET);
    const data = sheet.getDataRange().getValues();
    const idRow = data.find(row => row[0] === 'sheet_id');
    if (!idRow || idRow.length < 2 || !idRow[1]) {
      throw new Error('Nie znaleziono SHEET_ID w zakładce "ustawienia".');
    }
    return idRow[1];
  } catch (error) {
    throw new Error(`Błąd podczas pobierania SHEET_ID: ${error.message}`);
  }
}
