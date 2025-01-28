import { sendToWooCommerce } from '../utils/api.js';
import { logEvent } from '../utils/logger.js';

/**
 * Pobiera dane produktu z WooCommerce na podstawie ID.
 */
export function getProductById(productId) {
  const url = `${getSettings().base_url}/wp-json/wc/v3/products/${productId}`;
  return sendToWooCommerce(url, 'get');
}
