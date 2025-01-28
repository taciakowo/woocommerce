import { exportProductChanges } from '../../src/modules/export.js';

jest.mock('../../src/utils/api.js', () => ({
  sendToWooCommerce: jest.fn(() => ({
    status: 200,
    data: {},
  })),
}));

jest.mock('../../src/utils/logger.js', () => ({
  logEvent: jest.fn(),
}));

test('Eksportuje zmiany produktu', () => {
  const mockSheet = {
    getDataRange: jest.fn(() => ({
      getValues: jest.fn(() => [
        ['id', 'name', 'price'],
        [123, 'Product Name', '100.00'],
      ]),
    })),
  };

  global.SpreadsheetApp = {
    openById: jest.fn(() => ({
      getSheetByName: jest.fn(() => mockSheet),
    })),
  };

  exportProductChanges();
  expect(global.SpreadsheetApp.openById).toHaveBeenCalled();
});
