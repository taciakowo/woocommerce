/**
 * Konwertuje datę w formacie Google Sheet na obiekt Date.
 */
export function parseDate(dateString) {
    if (!dateString || typeof dateString !== 'string') {
      return new Date(0);
    }
    return new Date(Date.parse(dateString.replace(/\s*\(.*?\)/, '').trim()));
  }
  