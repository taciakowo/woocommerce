const ENCRYPTION_KEY = 'szyfrowany_klucz';

/**
 * Szyfruje ID arkusza i zapisuje w pamięci podręcznej.
 * @param {string} sheetId - Identyfikator arkusza
 */
export function setSheetId(sheetId) {
  const encryptedId = Utilities.base64Encode(
    Utilities.computeRsaSha256Signature(sheetId, ENCRYPTION_KEY)
  );
  CacheService.getScriptCache().put('SHEET_ID', encryptedId, 21600); // 6 godzin
}

/**
 * Pobiera i odszyfrowuje `SHEET_ID`.
 * @returns {string} - Odszyfrowany `SHEET_ID`
 */
export function getSheetId() {
  const encryptedId = CacheService.getScriptCache().get('SHEET_ID');
  if (!encryptedId) {
    throw new Error('SHEET_ID nie jest dostępne w pamięci podręcznej.');
  }
  return Utilities.base64Decode(encryptedId, Utilities.Charset.UTF_8);
}

/**
 * Inicjalizuje `SHEET_ID`, jeśli go brakuje.
 */
export function initializeSheetId() {
  if (!CacheService.getScriptCache().get('SHEET_ID')) {
    setSheetId('1f6W4pP4VtMNY2m6iytNZ-AYnr-XqmbXDOEkSt5QsEbg');
  }
}

/**
 * Inicjalizuje cache.
 */
export function initializeCache() {
  initializeSheetId();
  Logger.log('SHEET_ID został zapisany w pamięci podręcznej.');
}
