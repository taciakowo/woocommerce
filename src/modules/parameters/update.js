import { logEvent } from '../../utils/logger.js';
import { fetchAllProductParameters } from './fetch.js';

/**
 * Aktualizuje zakładkę "woo_parametry".
 * @param {Map<string, string>} params - Mapa parametrów produktu.
 */
export function updateWooParametersSheet(params) {
  if (!(params instanceof Map)) {
    logEvent('updateWooParametersSheet', 'Error', null, 'Nieprawidłowe dane parametrów. Oczekiwano obiektu Map.');
    return;
  }

  const sheet = SpreadsheetApp.openById(globalThis.SHEET_ID).getSheetByName(globalThis.WOO_PARAMETERS_SHEET);
  const existingData = sheet.getDataRange().getValues();
  const existingParams = new Set(existingData.map(row => row[0]));

  const newData = [];
  params.forEach((value, key) => {
    if (!existingParams.has(key)) {
      newData.push([key, '', value]);
    }
  });

  if (newData.length > 0) {
    sheet.getRange(existingData.length + 1, 1, newData.length, 3).setValues(newData);
  }

  logEvent('updateWooParametersSheet', 'SUCCESS', null, 'WooCommerce parameters updated successfully.');
}

globalThis.updateWooParametersSheet = updateWooParametersSheet;