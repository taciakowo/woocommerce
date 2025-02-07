// src/modules/inventory.js
import { logEvent } from "../utils/logger.js";
import { sendToWooCommerce } from "../utils/api.js";
import { getSettings } from "../utils/settings.js";

export function updateInventoryHistory(sku, newStock, source) {
  try {
    const settings = getSettings();
    const sheet = SpreadsheetApp.openById(settings.SHEET_ID).getSheetByName(settings.INVENTORY_SHEET);
    if (!sheet) throw new Error("Zakładka 'INVENTORY_SHEET' nie istnieje.");

    const timestamp = new Date().toLocaleString("pl-PL", { timeZone: "Europe/Warsaw" });
    sheet.appendRow([sku, newStock, timestamp, source]);
    logEvent("updateInventoryHistory", "SUCCESS", sku, null);
  } catch (error) {
    logEvent("updateInventoryHistory", "ERROR", sku, error.message);
    throw error;
  }
}

globalThis.updateInventoryHistory = updateInventoryHistory;

export function syncStockBalanced() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    logEvent("syncStockBalanced", "Error", null, "Another sync process is running.");
    return;
  }

  try {
    const settings = getSettings();
    const sheet = SpreadsheetApp.openById(settings.SHEET_ID).getSheetByName(settings.PRODUCTS_SHEET);
    if (!sheet) throw new Error("Zakładka 'PRODUCTS_SHEET' nie istnieje.");

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idIndex = headers.indexOf("id");
    const stockIndex = headers.indexOf("stock_quantity");

    data.slice(1).forEach((row) => {
      const productId = row[idIndex];
      const sheetStock = parseInt(row[stockIndex], 10) || 0;

      if (!productId) return;

      const url = `${settings.WOO_BASE_URL}/wp-json/wc/v3/products/${productId}`;
      const response = sendToWooCommerce(url, "get");

      if (response.status === 200) {
        const wooStock = parseInt(response.data.stock_quantity, 10) || 0;
        if (sheetStock !== wooStock) {
          sendToWooCommerce(url, "put", { stock_quantity: sheetStock });
          updateInventoryHistory(response.data.sku, sheetStock, "G->W");
        }
      }
    });
    logEvent("syncStockBalanced", "SUCCESS", null, null);
  } catch (error) {
    logEvent("syncStockBalanced", "ERROR", null, error.message);
  } finally {
    lock.releaseLock();
  }
}

globalThis.syncStockBalanced = syncStockBalanced;