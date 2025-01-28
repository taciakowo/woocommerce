import { updateAllWooCommerceParameters } from './modules/parameters/update.js';
import { exportProductImages, exportProductChanges } from './modules/products.js';

/**
 * Tworzy niestandardowe menu w Google Sheets
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Footing Menu')
    .addItem('Aktualizuj parametry WooCommerce', 'runUpdateParameters')
    .addItem('Eksportuj zmiany produktów', 'runExportChanges')
    .addItem('Eksportuj zdjęcia produktów', 'runExportImages')
    .addToUi();
}

/**
 * Uruchamia aktualizację parametrów WooCommerce.
 */
function runUpdateParameters() {
  try {
    updateAllWooCommerceParameters();
    SpreadsheetApp.getUi().alert('Parametry WooCommerce zostały zaktualizowane.');
  } catch (error) {
    SpreadsheetApp.getUi().alert(`Błąd: ${error.message}`);
  }
}

/**
 * Uruchamia eksport zmian produktów do WooCommerce.
 */
function runExportChanges() {
  try {
    exportProductChanges();
    SpreadsheetApp.getUi().alert('Zmiany produktów zostały wyeksportowane.');
  } catch (error) {
    SpreadsheetApp.getUi().alert(`Błąd: ${error.message}`);
  }
}

/**
 * Uruchamia eksport zdjęć produktów do WooCommerce.
 */
function runExportImages() {
  try {
    exportProductImages();
    SpreadsheetApp.getUi().alert('Zdjęcia produktów zostały wyeksportowane.');
  } catch (error) {
    SpreadsheetApp.getUi().alert(`Błąd: ${error.message}`);
  }
}
import { syncStockBalanced } from './modules/sync.js';

/**
 * Reaguje na zmiany w arkuszu Google.
 * @param {GoogleAppsScript.Events.SheetsOnEdit} e - Zdarzenie onEdit
 */
function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  const editedRange = e.range;
  const sheetName = sheet.getName();

  if (sheetName === 'produkty') {
    syncStockBalanced(); // Synchronizuj stany magazynowe
  }
}
