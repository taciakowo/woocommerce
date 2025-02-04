import { logEvent } from '../utils/logger.js';
import { sendToWooCommerce } from '../utils/api.js';
import { getSettings } from '../utils/spreadsheet.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Synchronizuje stany magazynowe między Google Sheets a WooCommerce.
 */
export function syncStockBalanced() {
  const sheetId = process.env.SHEET_ID;
  if (typeof LockService !== 'undefined') {
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(30000)) {
      logEvent('syncStockBalanced', 'Warning', null, 'Another sync process is running.');
      return;
    }
  }

  try {
    const settings = getSettings();
    const sheet = SpreadsheetApp.openById(sheetId).getSheetByName(settings.PRODUCTS_SHEET);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    const requiredColumns = ['id', 'stock_quantity', 'initial_stock', 'last_sync'];
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));

    if (missingColumns.length > 0) {
      logEvent('syncStockBalanced', 'Error', null, `Brak wymaganych kolumn: ${missingColumns.join(', ')}`);
      return;
    }

    const idIndex = headers.indexOf('id');
    const stockIndex = headers.indexOf('stock_quantity');
    const initialStockIndex = headers.indexOf('initial_stock');
    const lastSyncIndex = headers.indexOf('last_sync');

    data.slice(1).forEach((row, i) => {
      const productId = row[idIndex];
      if (!productId) return;

      const sheetStock = parseInt(row[stockIndex], 10) || 0;
      const initialStock = parseInt(row[initialStockIndex], 10) || 0;

      const url = `${settings.WOO_BASE_URL}/wp-json/wc/v3/products/${productId}`;
      const response = sendToWooCommerce(url, 'get');

      if (response.status !== 200) {
        logEvent('syncStockBalanced', 'Error', productId, `Błąd pobierania danych WooCommerce.`);
        return;
      }

      const wooStock = parseInt(response.data.stock_quantity, 10) || 0;
      if (sheetStock !== initialStock && wooStock === initialStock) {
        const updateResponse = sendToWooCommerce(url, 'put', { stock_quantity: sheetStock });

        if (updateResponse.status === 200) {
          sheet.getRange(i + 2, initialStockIndex + 1).setValue(sheetStock);
          sheet.getRange(i + 2, lastSyncIndex + 1).setValue(
            `${new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' })} (G->W)`
          );
          logEvent('syncStockBalanced', 'SUCCESS', productId, `Stock updated to ${sheetStock}`);
        }
      }
    });
  } catch (error) {
    logEvent('syncStockBalanced', 'Error', null, error.message);
  }
}
