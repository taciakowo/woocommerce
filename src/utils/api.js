// src/utils/logger.js
export function logEvent(functionName, event, productId = null, error = null) {
  try {
    const sheet = SpreadsheetApp.openById(globalThis.SHEET_ID).getSheetByName(globalThis.LOGS_SHEET);
    const timestamp = new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' });
    sheet.appendRow([timestamp, functionName, event, productId, error]);
  } catch (e) {
    console.error(`Błąd podczas logowania zdarzenia: ${e.message}`);
  }
}

globalThis.logEvent = logEvent;

// src/utils/api.js
import { logEvent } from './logger.js';
import dotenv from 'dotenv';

dotenv.config();
import './dotenv.config.js';

/**
 * Wysyła zapytanie do WooCommerce.
 */
export function sendToWooCommerce(url, method, payload = null) {
  // Implementacja funkcji sendToWooCommerce
}

globalThis.sendToWooCommerce = sendToWooCommerce;
