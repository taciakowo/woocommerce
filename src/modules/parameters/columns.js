// src/modules/parameters/columns.js
import { logEvent } from "../../utils/logger.js";
import { getSettings } from "../../utils/settings.js";

/**
 * Dodaje brakujące kolumny w zakładce "produkty".
 * @param {Map<string, string>} params - Mapa parametrów produktu.
 */
export function addMissingColumnsToProducts(params) {
  const settings = getSettings();
  const productSheet = SpreadsheetApp.openById(settings.SHEET_ID).getSheetByName(settings.PRODUCTS_SHEET);
  const paramSheet = SpreadsheetApp.openById(settings.SHEET_ID).getSheetByName(settings.WOO_PARAMETERS_SHEET);

  if (!productSheet || !paramSheet) {
    logEvent("addMissingColumnsToProducts", "Error", null, "Brak wymaganych arkuszy.");
    return;
  }

  const headers = productSheet.getDataRange().getValues()[0];
  const wooParams = paramSheet.getDataRange().getValues();

  if (!wooParams || wooParams.length < 2) {
    logEvent("addMissingColumnsToProducts", "Error", null, "Brak danych w zakładce 'woo_parametry'.");
    return;
  }

  const activeParams = wooParams.slice(1).filter((row) => String(row[1]).toLowerCase() === "true").map((row) => row[0]);
  const newColumns = activeParams.filter((param) => !headers.includes(param));

  if (newColumns.length > 0) {
    newColumns.forEach((column, index) => {
      productSheet.getRange(1, headers.length + index + 1).setValue(column);
    });
    logEvent("addMissingColumnsToProducts", "SUCCESS", null, `Dodano nowe kolumny: ${newColumns.join(", ")}`);
  } else {
    logEvent("addMissingColumnsToProducts", "INFO", null, "Brak nowych kolumn do dodania.");
  }
}

globalThis.addMissingColumnsToProducts = addMissingColumnsToProducts;

/**
 * Pobiera kolumny z arkusza "produkty".
 * @returns {string[]} - Tablica nazw kolumn.
 */
export function getColumns() {
  const settings = getSettings();
  const productSheet = SpreadsheetApp.openById(settings.SHEET_ID).getSheetByName(settings.PRODUCTS_SHEET);
  if (!productSheet) {
    logEvent("getColumns", "Error", null, "Brak arkusza 'produkty'.");
    return [];
  }
  return productSheet.getDataRange().getValues()[0];
}

globalThis.getColumns = getColumns;