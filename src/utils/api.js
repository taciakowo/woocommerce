import { logEvent } from './logger.js';
import { getSettings } from './spreadsheet.js';

/**
 * Wysyła zapytanie do WooCommerce API.
 */
export function sendToWooCommerce(url, method, payload = null) {
  const settings = getSettings();
  if (!url) {
    logEvent('sendToWooCommerce', 'Error', null, 'URL jest wymagany do zapytania WooCommerce.');
    return { status: 400, data: { message: 'URL jest wymagany' } };
  }

  const options = {
    method,
    headers: {
      Authorization: `Basic ${Utilities.base64Encode(`${settings.consumer_key}:${settings.consumer_secret}`)}`,
      'Content-Type': 'application/json',
    },
    muteHttpExceptions: true,
  };

  if (payload) {
    options.payload = JSON.stringify(payload);
  }

  try {
    const response = UrlFetchApp.fetch(url, options);
    const status = response.getResponseCode();

    if (status >= 400 && status < 500) {
      logEvent('sendToWooCommerce', 'Client Error', null, `Status: ${status} | Message: ${response.getContentText()}`);
    } else if (status >= 500) {
      logEvent('sendToWooCommerce', 'Server Error', null, `Status: ${status} | Message: ${response.getContentText()}`);
    }

    return { status, data: JSON.parse(response.getContentText()) };
  } catch (error) {
    logEvent('sendToWooCommerce', 'Error', null, `Błąd połączenia z WooCommerce: ${error.message}`);
    return { status: 500, data: { message: 'Błąd połączenia z WooCommerce' } };
  }
}
