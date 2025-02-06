import { logEvent } from '../utils/logger.js';
import { sendToWooCommerce } from '../utils/api.js';
import { getSettings } from '../utils/spreadsheet.js';
import '../../utils/dotenv.config.js';

dotenv.config();

/**
 * Aktualizuje historię stanów magazynowych.
 * @param {string} sku - SKU produktu.
 * @param {number} newStock - Nowy stan magazynowy.
 * @param {string} source - Źródło aktualizacji.
 */
export function updateInventoryHistory(sku, newStock, source) {
  try {
    const sheetId = process.env.SHEET_ID;
    const settings = getSettings();
    const sheet = SpreadsheetApp.openById(sheetId).getSheetByName(
      settings.INVENTORY_SHEET,
    );
    if (!sheet) throw new Error('Zakładka "INVENTORY_SHEET" nie istnieje.');

    const timestamp = new Date().toLocaleString('pl-PL', {
      timeZone: 'Europe/Warsaw',
    });
    sheet.appendRow([sku, newStock, timestamp, source]);

    logEvent('updateInventoryHistory', 'SUCCESS', sku, null);
  } catch (error) {
    logEvent('updateInventoryHistory', 'ERROR', sku, error.message);
    throw error;
  }
}

/**
 * Synchronizuje stany magazynowe między Google Sheets a WooCommerce.
 */
export function syncStockBalanced() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    logEvent(
      'syncStockBalanced',
      'Error',
      null,
      'Another sync process is running.',
    );
    return;
  }

  try {
    const sheetId = process.env.SHEET_ID;
    const settings = getSettings();
    const sheet = SpreadsheetApp.openById(sheetId).getSheetByName(
      settings.PRODUCTS_SHEET,
    );
    if (!sheet) throw new Error('Zakładka "PRODUCTS_SHEET" nie istnieje.');

    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    const idIndex = headers.indexOf('id');
    const stockIndex = headers.indexOf('stock_quantity');

    data.slice(1).forEach((row) => {
      const productId = row[idIndex];
      const sheetStock = parseInt(row[stockIndex], 10) || 0;

      if (!productId) return;

      const url = `${settings.WOO_BASE_URL}/wp-json/wc/v3/products/${productId}`;
      const response = sendToWooCommerce(url, 'get');

      if (response.status === 200) {
        const wooStock = parseInt(response.data.stock_quantity, 10) || 0;
        if (sheetStock !== wooStock) {
          sendToWooCommerce(url, 'put', { stock_quantity: sheetStock });
          updateInventoryHistory(response.data.sku, sheetStock, 'G->W');
        }
      }
    });

    logEvent('syncStockBalanced', 'SUCCESS', null, null);
  } catch (error) {
    logEvent('syncStockBalanced', 'ERROR', null, error.message);
  } finally {
    lock.releaseLock();
  }
}

// Eksport funkcji
globalThis.updateInventoryHistory = updateInventoryHistory;
globalThis.syncStockBalanced = syncStockBalanced;
