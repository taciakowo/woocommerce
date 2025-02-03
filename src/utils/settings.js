import CryptoJS from 'crypto-js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Pobiera ustawienia WooCommerce i deszyfruje klucze.
 * @returns {Object} - Obiekt ustawień.
 */
function getSettings() {
  try {
    const SHEET_ID = getDynamicSheetId();
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SETTINGS_SHEET);
    if (!sheet) throw new Error(`Zakładka "${SETTINGS_SHEET}" nie istnieje.`);

    const data = sheet.getDataRange().getValues();
    if (!data || data.length === 0) throw new Error(`Zakładka "${SETTINGS_SHEET}" jest pusta.`);

    const settings = Object.fromEntries(
      data.map(row => {
        if (row.length < 2 || !row[0]) throw new Error('Nieprawidłowy format danych w ustawieniach.');
        return [row[0], decryptData(row[1]) || ''];
      })
    );

    return settings;
  } catch (error) {
    logEvent('getSettings', 'Error', null, error.message);
    throw new Error(`Błąd pobierania ustawień: ${error.message}`);
  }
}

/**
 * Deszyfruje klucze WooCommerce.
 * @param {string} encryptedData - Szyfrowane dane.
 * @returns {string} - Odszyfrowane wartości.
 */
function decryptData(encryptedData) {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) throw new Error('Brak klucza szyfrowania.');
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}
