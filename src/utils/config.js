import '../../utils/dotenv.config.js';
import CryptoJS from 'crypto-js';

dotenv.config();

const ENCRYPTION_KEY = 'szyfrowany_klucz';

globalThis.SHEET_ID = process.env.SHEET_ID;
globalThis.PRODUCTS_SHEET = 'produkty';
globalThis.SETTINGS_SHEET = 'ustawienia';
globalThis.LOGS_SHEET = 'logi';
globalThis.WOO_PARAMETERS_SHEET = 'woo_parametry';
globalThis.WOO_BASE_URL = process.env.BASE_URL;
globalThis.WOO_CONSUMER_KEY = process.env.WOO_CONSUMER_KEY;
globalThis.WOO_CONSUMER_SECRET = process.env.WOO_CONSUMER_SECRET;

/**
 * Ustawia identyfikator arkusza.
 * @param {string} sheetId - Identyfikator arkusza.
 */
export function setSheetId(sheetId) {
  const encryptedId = CryptoJS.AES.encrypt(sheetId, ENCRYPTION_KEY).toString();
  CacheService.getScriptCache().put('SHEET_ID', encryptedId, 21600);
}

globalThis.setSheetId = setSheetId;

/**
 * Pobiera identyfikator arkusza.
 * @returns {string} - Identyfikator arkusza.
 */
export function getSheetId() {
  const encryptedId = CacheService.getScriptCache().get('SHEET_ID');
  if (!encryptedId) {
    throw new Error('SHEET_ID nie jest dostępne w pamięci podręcznej.');
  }
  const bytes = CryptoJS.AES.decrypt(encryptedId, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

globalThis.getSheetId = getSheetId;
