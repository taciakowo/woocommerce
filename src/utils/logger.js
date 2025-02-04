import './dotenv.config.js';

/**
 * Loguje zdarzenia w arkuszu "logi".
 * @param {string} functionName - Nazwa funkcji.
 * @param {string} event - Typ zdarzenia (SUCCESS, ERROR).
 * @param {string|null} productId - Identyfikator produktu.
 * @param {string|null} error - Opis błędu.
 */
export function logEvent(functionName, event, productId = null, error = null) {
  // Implementacja funkcji logEvent
}

// Eksport funkcji do użytku globalnego
globalThis.logEvent = logEvent;
