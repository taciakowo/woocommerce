import { syncStockBalanced } from '../../src/modules/sync.js';

jest.mock('../../src/utils/api.js', () => ({
  sendToWooCommerce: jest.fn(() => ({
    status: 200,
    data: { stock_quantity: 20 },
  })),
}));

jest.mock('../../src/utils/logger.js', () => ({
  logEvent: jest.fn(),
}));

test('Synchronizuje stany magazynowe', () => {
  const mockSheet = {
    getDataRange: jest.fn(() => ({
      getDisplayValues: jest.fn(() => [
        ['id', 'stock_quantity', 'initial_stock', 'last_sync'],
        [123, 15, 10, ''],
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

  syncStockBalanced();
  expect(global.SpreadsheetApp.openById).toHaveBeenCalled();
});
