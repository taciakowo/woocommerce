import '../../utils/dotenv.config.js';

dotenv.config();

/**
 * Pobiera ustawienia z pliku .env.
 * @returns {Object} - Obiekt mapujący parametry na wartości.
 */
export function getSettings() {
  return {
    SHEET_ID: process.env.SHEET_ID,
    LOGS_SHEET: process.env.LOGS_SHEET,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ALLEGRO_TOKEN: process.env.ALLEGRO_TOKEN,
    SHOP_ID: process.env.SHOP_ID,
    WOO_BASE_URL: process.env.WOO_BASE_URL,
  };
}
