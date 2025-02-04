import { getProductIdBySku, addNewProduct } from './products.js';
import { exportProductChanges } from './export.js';
import { logEvent } from '../utils/logger.js';
import { getSettings } from '../utils/spreadsheet.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Zaplanowany eksport produktów.
 */
export function scheduledProductExport() {
  const sheetId = process.env.SHEET_ID;
  const settings = getSettings();
  const now = new Date();
  const productSheet = SpreadsheetApp.openById(sheetId).getSheetByName(settings.PRODUCTS_SHEET);
  const data = productSheet.getDataRange().getValues();
  const headers = data[0];

  data.slice(1).forEach((row, index) => {
    const dateIndex = headers.indexOf('date_on_sale_from');
    if (dateIndex !== -1) {
      const saleDate = new Date(row[dateIndex]);
      if (saleDate <= now) {
        const sku = row[headers.indexOf('sku')];
        if (sku) {
          const productId = getProductIdBySku(sku);
          if (productId) {
            exportProductChanges(productId);
          } else {
            addNewProduct(row, index + 2);
          }
        }
      }
    }
  });

  logEvent('scheduledProductExport', 'SUCCESS', null, 'Zaplanowany eksport zakończony.');
}

import { updateInventoryHistory, syncStockBalanced } from '../../src/modules/inventory.js';
import { fetchAllProductParameters } from '../../src/modules/parameters/fetch.js';
import { getProductById } from '../../src/modules/products.js';

jest.mock('../../src/utils/logger.js', () => ({
  logEvent: jest.fn(),
}));

jest.mock('../../src/utils/api.js', () => ({
  sendToWooCommerce: jest.fn(() => ({
    status: 200,
    data: { id: 123, attributes: [{ name: 'Color', options: ['Red', 'Blue'] }] },
  })),
}));

jest.mock('../../src/modules/products.js', () => ({
  getProductById: jest.fn(() => ({ id: 123, name: 'Test Product' })),
}));

global.LockService = {
  getScriptLock: jest.fn(() => ({
    tryLock: jest.fn(() => true),
    releaseLock: jest.fn(),
  })),
};

test('Poprawnie aktualizuje historię stanów magazynowych', () => {
  const mockSheet = {
    getDataRange: jest.fn(() => ({
      getValues: jest.fn(() => [['sku1', 'sku2']]),
    })),
    getRange: jest.fn(() => ({
      setValue: jest.fn(),
    })),
    appendRow: jest.fn(),
  };

  global.SpreadsheetApp = {
    openById: jest.fn(() => ({
      getSheetByName: jest.fn(() => mockSheet),
    })),
  };

  updateInventoryHistory('sku1', 50, 'Manual');
  expect(global.SpreadsheetApp.openById).toHaveBeenCalled();
  expect(mockSheet.appendRow).toHaveBeenCalled();
});

test('Poprawnie synchronizuje stany magazynowe', () => {
  const mockSheet = {
    getDataRange: jest.fn(() => ({
      getValues: jest.fn(() => [
        ['id', 'stock_quantity', 'initial_stock', 'last_sync'],
        [123, 20, 15, ''],
      ]),
    })),
    getRange: jest.fn(() => ({
      setValue: jest.fn(),
    })),
  };

  global.SpreadsheetApp = {
    openById: jest.fn(() => ({
      getSheetByName: jest.fn(() => mockSheet),
    })),
  };

  require('../../src/utils/api.js').sendToWooCommerce.mockReturnValue({
    status: 200,
    data: { stock_quantity: 15 },
  });

  syncStockBalanced();
  expect(global.SpreadsheetApp.openById).toHaveBeenCalled();
  expect(mockSheet.getRange).toHaveBeenCalled();
});

test('Poprawnie wyciąga parametry produktu', async () => {
  const params = await fetchAllProductParameters();
  expect(params.has('id')).toBe(true);
  expect(params.get('attribute: Color')).toBe('Red, Blue');
  expect(getProductById).toHaveBeenCalledTimes(1);
});

import dotenv from 'dotenv';
import { logEvent } from '../../src/utils/logger.js';

dotenv.config();

global.SpreadsheetApp = {
  openById: jest.fn(() => ({
    getSheetByName: jest.fn(() => ({
      appendRow: jest.fn(),
    })),
  })),
};

test('Loguje zdarzenie poprawnie', () => {
  logEvent('testFunction', 'INFO', null, 'Test message');
  expect(global.SpreadsheetApp.openById).toHaveBeenCalled();
});

test('Zgłasza błąd, jeśli arkusz logów nie istnieje', () => {
  global.SpreadsheetApp.openById.mockImplementationOnce(() => ({
    getSheetByName: jest.fn(() => null),
  }));

  expect(() => logEvent('testFunction', 'ERROR', null, 'Błąd testowy')).toThrow(
    'Nie udało się zapisać logu: Zakładka "logi" nie istnieje.'
  );
});

import dotenv from 'dotenv';
import { getSettings } from '../../src/utils/spreadsheet.js';

dotenv.config();

global.SpreadsheetApp = {
  openById: jest.fn(() => ({
    getSheetByName: jest.fn(() => ({
      getDataRange: jest.fn(() => ({
        getValues: jest.fn(() => [
          ['SHEET_ID', process.env.SHEET_ID],
          ['LOGS_SHEET', process.env.LOGS_SHEET],
          ['ADMIN_EMAIL', process.env.ADMIN_EMAIL],
          ['ALLEGRO_TOKEN', process.env.ALLEGRO_TOKEN],
          ['SHOP_ID', process.env.SHOP_ID],
        ]),
      })),
    })),
  })),
};

test('Poprawnie pobiera ustawienia z pliku .env.', () => {
  const settings = getSettings();
  expect(settings).toEqual({
    SHEET_ID: process.env.SHEET_ID,
    LOGS_SHEET: process.env.LOGS_SHEET,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ALLEGRO_TOKEN: process.env.ALLEGRO_TOKEN,
    SHOP_ID: process.env.SHOP_ID,
  });
});
