import { logEvent } from '../../utils/logger.js';
import { getProductById } from '../products.js';
import { fetchProductCategories } from '../category.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Pobiera wszystkie parametry produktu, kategorie, atrybuty i metadane.
 * @returns {Map<string, string>} - Mapa zawierająca parametry produktu.
 */
export function fetchAllProductParameters() {
  const product = getProductById();
  const categories = fetchProductCategories();
  const params = new Map();

  // Podstawowe dane produktu
  Object.entries(product).forEach(([key, value]) => {
    params.set(
      key,
      typeof value === 'object' ? JSON.stringify(value) : value || '',
    );
  });

  // Kategorie produktu
  categories.forEach((category) => params.set(category, ''));

  // Atrybuty produktu
  if (Array.isArray(product.attributes)) {
    product.attributes.forEach((attribute) => {
      const key = `attribute: ${attribute.name}`;
      const value = attribute.options ? attribute.options.join(', ') : '';
      params.set(key, value);
    });
  }

  // Zdjęcia produktu
  if (Array.isArray(product.images)) {
    product.images.forEach((image, index) => {
      params.set(`Image ${index + 1}`, image.src || '');
    });
  } else {
    logEvent(
      'fetchAllProductParameters',
      'INFO',
      null,
      'Brak zdjęć w danych produktu.',
    );
  }

  return params;
}

globalThis.fetchAllProductParameters = fetchAllProductParameters;
