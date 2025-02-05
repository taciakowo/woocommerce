// src/utils/helpers.js
/**
 * Parsuje datę z formatu string do obiektu Date.
 * @param {string} dateString - Data w formacie string.
 * @returns {Date} - Obiekt Date.
 */
export function parseDate(dateString) {
  if (!dateString || typeof dateString !== 'string') {
    return new Date(0);
  }
  return new Date(Date.parse(dateString.replace(/\s*\(.*?\)/, '').trim()));
}

globalThis.parseDate = parseDate;

export function helperFunction() {
  // Implementacja funkcji pomocniczej
}
