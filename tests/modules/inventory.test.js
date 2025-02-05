import dotenv from 'dotenv';
import {
  updateInventoryHistory,
  syncStockBalanced,
} from '../../src/modules/inventory.js';
import { sendToWooCommerce } from '../../src/utils/api.js';
import { getSettings } from '../../src/utils/spreadsheet.js';

dotenv.config();

jest.mock('../../src/utils/logger.js', () => ({
  logEvent: jest.fn(),
}));

jest.mock('../../src/utils/api.js', () => ({
  sendToWooCommerce: jest.fn(() => ({
    status: 200,
    data: {
      id: 123,
      attributes: [{ name: 'Color', options: ['Red', 'Blue'] }],
    },
  })),
}));

jest.mock('../../src/modules/products.js', () => ({
  getProductById: jest.fn(() => ({ id: 123, name: 'Test Product' })),
}));

jest.mock('../../src/utils/spreadsheet.js', () => ({
  getSettings: jest.fn(() => ({
    SHEET_ID: '1f6W4pP4VtMNY2m6iytNZ-AYnr-XqmbXDOEkSt5QsEbg',
    INVENTORY_SHEET: 'inventory',
  })),
}));

global.LockService = {
  getScriptLock: jest.fn(() => ({
    tryLock: jest.fn(() => true),
    releaseLock: jest.fn(),
  })),
};

global.SpreadsheetApp = {
  openById: jest.fn(() => ({
    getSheetByName: jest.fn(() => ({
      getDataRange: jest.fn(() => ({
        getValues: jest.fn(() => [
          ['id', 'stock_quantity', 'initial_stock', 'last_sync'],
          [123, 20, 15, ''],
        ]),
      })),
      getRange: jest.fn(() => ({
        getValues: jest.fn(() => [[123, 20, 15, '']]),
        setValue: jest.fn(),
      })),
      appendRow: jest.fn(),
    })),
  })),
};

test('Poprawnie aktualizuje historię stanów magazynowych', () => {
  updateInventoryHistory('sku1', 50, 'Manual');
  expect(global.SpreadsheetApp.openById).toHaveBeenCalled();
  expect(
    global.SpreadsheetApp.openById().getSheetByName().appendRow,
  ).toHaveBeenCalled();
});

test('Synchronizuje stany magazynowe', () => {
  const mockSheet = {
    getDataRange: jest.fn(() => ({
      getValues: jest.fn(() => [
        ['id', 'stock_quantity', 'initial_stock', 'last_sync'],
        [123, 20, 15, ''],
      ]),
    })),
    getRange: jest.fn(() => ({
      getValues: jest.fn(() => [[123, 20, 15, '']]),
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
