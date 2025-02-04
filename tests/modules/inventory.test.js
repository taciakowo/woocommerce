import dotenv from 'dotenv';
import { updateInventoryHistory, syncStockBalanced } from '../../src/modules/inventory.js';

dotenv.config();

jest.mock('../../src/utils/logger.js', () => ({
  logEvent: jest.fn(),
}));

jest.mock('../../src/utils/api.js', () => ({
  sendToWooCommerce: jest.fn(),
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