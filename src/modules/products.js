import { logEvent } from '../utils/logger.js';
import { sendToWooCommerce } from '../utils/api.js';
import { getSettings } from '../utils/spreadsheet.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Eksportuje zmiany produktów do WooCommerce.
 */
export function exportProductChanges(productId) {
  const settings = getSettings();
  const sheet = SpreadsheetApp.openById(settings.SHEET_ID).getSheetByName(
    settings.PRODUCTS_SHEET,
  );
  if (!sheet) throw new Error('Zakładka "PRODUCTS_SHEET" nie istnieje.');

  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  data.slice(1).forEach((row) => {
    const productData = Object.fromEntries(
      headers.map((key, index) => [key, row[index]]),
    );

    const url = `${settings.WOO_BASE_URL}/wp-json/wc/v3/products/${productId}`;
    sendToWooCommerce(url, 'put', productData);
  });

  logEvent('exportProductChanges', 'Success', null, null);
}

/**
 * Eksportuje zdjęcia produktów do WooCommerce.
 * @param {string} productId - ID produktu.
 * @param {string[]} images - Tablica URL zdjęć.
 */
export function exportProductImages(productId, images) {
  if (!images || images.length === 0) {
    logEvent(
      'exportProductImages',
      'Error',
      productId,
      'Lista zdjęć jest pusta.',
    );
    return;
  }
  const payload = { images: images.map((src) => ({ src })) };
  const settings = getSettings();
  const url = `${settings.WOO_BASE_URL}/wp-json/wc/v3/products/${productId}`;
  const response = sendToWooCommerce(url, 'put', payload);
  logEvent(
    'exportProductImages',
    response.status === 200 ? 'SUCCESS' : 'Error',
    productId,
    response.status,
  );
}

globalThis.exportProductImages = exportProductImages;

/**
 * Dodaje nowy produkt do WooCommerce.
 * @param {Object} productData - Dane produktu.
 */
export function addNewProduct(productData) {
  const settings = getSettings();
  const url = `${settings.WOO_BASE_URL}/wp-json/wc/v3/products`;

  const response = sendToWooCommerce(url, 'post', productData);
  if (response.status === 201) {
    logEvent('addNewProduct', 'Success', response.data.id, null);
  } else {
    logEvent(
      'addNewProduct',
      'Error',
      null,
      'Błąd podczas dodawania produktu.',
    );
  }
}

/**
 * Pobiera dane produktu z WooCommerce na podstawie ID.
 * @param {string} productId - ID produktu.
 * @returns {Object} - Dane produktu.
 */
export function getProductById(productId) {
  const settings = getSettings();
  const url = `${settings.WOO_BASE_URL}/wp-json/wc/v3/products/${productId}`;
  const response = sendToWooCommerce(url, 'get');

  if (response.status !== 200) {
    logEvent(
      'getProductById',
      'Error',
      productId,
      `Nie udało się pobrać produktu. Status: ${response.status}`,
    );
    throw new Error(`Nie udało się pobrać produktu. Sprawdź URL: ${url}`);
  }

  return response.data;
}

globalThis.getProductById = getProductById;
