import './dotenv.config.js';

/**
 * Loguje zdarzenia w arkuszu "logi".
 * @param {string} functionName - Nazwa funkcji.
 * @param {string} event - Typ zdarzenia (SUCCESS, ERROR).
 * @param {string|null} productId - Identyfikator produktu.
 * @param {string|null} error - Opis błędu.
 */
export function logEvent(functionName, event, productId = null, error = null) {
  try {
    const sheet = SpreadsheetApp.openById(globalThis.SHEET_ID).getSheetByName(
      globalThis.LOGS_SHEET,
    );
    const timestamp = new Date().toLocaleString('pl-PL', {
      timeZone: 'Europe/Warsaw',
    });
    sheet.appendRow([timestamp, functionName, event, productId, error]);
  } catch (e) {
    console.error(`Błąd podczas logowania zdarzenia: ${e.message}`);
  }
}

// Eksport funkcji do użytku globalnego
globalThis.logEvent = logEvent;
