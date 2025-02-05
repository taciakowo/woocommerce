import dotenv from 'dotenv';
import { syncStockBalanced } from '../../src/modules/sync.js';

dotenv.config();

jest.mock('../../src/utils/api.js', () => ({
  sendToWooCommerce: jest.fn(() => ({
    status: 200,
    data: { stock_quantity: 20 },
  })),
}));

jest.mock('../../src/utils/logger.js', () => ({
  logEvent: jest.fn(),
}));

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
    })),
  })),
};

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

  syncStockBalanced();
  expect(global.SpreadsheetApp.openById).toHaveBeenCalled();
  expect(mockSheet.getRange).toHaveBeenCalled();
});
