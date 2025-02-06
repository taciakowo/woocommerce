import '../../utils/dotenv.config.js';
import { getSettings } from '../utils/spreadsheet.js';
import { sendToWooCommerce } from '../utils/api.js';
import { logEvent } from '../utils/logger.js';

dotenv.config();

let categoryCache = null;

export function fetchProductCategories() {
  if (categoryCache) {
    return categoryCache;
  }

  const settings = getSettings();
  const url = `${settings.WOO_BASE_URL}/wp-json/wc/v3/products/categories?per_page=100`;
  const response = sendToWooCommerce(url, 'get');

  if (response.status !== 200) {
    logEvent(
      'fetchProductCategories',
      'Error',
      null,
      'Nie udało się pobrać kategorii produktów.',
    );
    return [];
  }

  categoryCache = response.data.map((category) => `category: ${category.name}`);
  return categoryCache;
}

export function getCategory() {
  const categoryId = process.env.CATEGORY_ID;
  // Implementacja funkcji getCategory
}

globalThis.fetchProductCategories = fetchProductCategories;
