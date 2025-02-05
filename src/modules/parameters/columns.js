import { logEvent } from '../../utils/logger.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Dodaje brakujące kolumny w zakładce "produkty".
 * @param {Map<string, string>} params - Mapa parametrów produktu.
 */
export function addMissingColumnsToProducts(params) {
  const productSheet = SpreadsheetApp.openById(
    process.env.SHEET_ID,
  ).getSheetByName('produkty');
  const paramSheet = SpreadsheetApp.openById(
    process.env.SHEET_ID,
  ).getSheetByName('woo_parametry');
  const headers = productSheet.getDataRange().getValues()[0];
  const wooParams = paramSheet.getDataRange().getValues();

  if (!wooParams || wooParams.length < 2) {
    logEvent(
      'addMissingColumnsToProducts',
      'Error',
      null,
      'Brak danych w zakładce "woo_parametry".',
    );
    return;
  }

  const activeParams = wooParams
    .slice(1)
    .filter((row) => String(row[1]).toLowerCase() === 'true')
    .map((row) => row[0]);
  const newColumns = activeParams.filter((param) => !headers.includes(param));

  if (newColumns.length > 0) {
    newColumns.forEach((column, index) => {
      const colIndex = headers.length + index + 1;
      productSheet.getRange(1, colIndex).setValue(column);
    });

    logEvent(
      'addMissingColumnsToProducts',
      'SUCCESS',
      null,
      `Dodano nowe kolumny: ${newColumns.join(', ')}`,
    );
  } else {
    logEvent(
      'addMissingColumnsToProducts',
      'INFO',
      null,
      'Brak nowych kolumn do dodania.',
    );
  }
}

globalThis.addMissingColumnsToProducts = addMissingColumnsToProducts;

export function getColumns() {
  const productSheet = SpreadsheetApp.openById(
    process.env.SHEET_ID,
  ).getSheetByName('produkty');
  const headers = productSheet.getDataRange().getValues()[0];
  return headers;
}

globalThis.getColumns = getColumns;
