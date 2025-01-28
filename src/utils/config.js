import CryptoJS from 'crypto-js';

export const CONFIG = {
  PRODUCTS_SHEET: 'produkty',
  SETTINGS_SHEET: 'ustawienia',
  LOGS_SHEET: 'logi',
  WOO_PARAMETERS_SHEET: 'woo_parametry',
  WOO_BASE_URL: 'base_url',
  WOO_CONSUMER_KEY: 'consumer_key',
  WOO_CONSUMER_SECRET: 'consumer_secret',
};

// Klucz szyfrujący
const ENCRYPTION_KEY = 'szyfrowany_klucz';

/**
 * Ustawia `SHEET_ID` w pamięci podręcznej po zaszyfrowaniu.
 * @param {string} sheetId - Identyfikator arkusza
 */
export function setSheetId(sheetId) {
  const encryptedId = CryptoJS.AES.encrypt(sheetId, ENCRYPTION_KEY).toString();
  CacheService.getScriptCache().put('SHEET_ID', encryptedId, 21600); // 6 godzin
}

/**
 * Pobiera i odszyfrowuje `SHEET_ID` z pamięci podręcznej.
 * @returns {string} - Odszyfrowany `SHEET_ID`
 */
export function getSheetId() {
  const encryptedId = CacheService.getScriptCache().get('SHEET_ID');
  if (!encryptedId) {
    throw new Error('SHEET_ID nie jest dostępne w pamięci podręcznej.');
  }
  const bytes = CryptoJS.AES.decrypt(encryptedId, ENCRYPTION_KEY);
  const decryptedId = bytes.toString(CryptoJS.enc.Utf8);
  if (!decryptedId) {
    throw new Error('Nie udało się odszyfrować SHEET_ID.');
  }
  return decryptedId;
}

/**
 * Inicjalizuje `SHEET_ID` w pamięci podręcznej, jeśli go tam nie ma.
 */
export function initializeSheetId() {
  const existingSheetId = CacheService.getScriptCache().get('SHEET_ID');
  if (!existingSheetId) {
    setSheetId('1f6W4pP4VtMNY2m6iytNZ-AYnr-XqmbXDOEkSt5QsEbg'); // Twój ID arkusza
  }
}
