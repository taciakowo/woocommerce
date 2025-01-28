import { addNewProduct } from '../../src/modules/products.js';

jest.mock('../../src/utils/api.js', () => ({
  sendToWooCommerce: jest.fn(() => ({
    status: 201,
    data: { id: 12345 },
  })),
}));

jest.mock('../../src/utils/logger.js', () => ({
  logEvent: jest.fn(),
}));

test('Dodaje nowy produkt poprawnie', () => {
  const mockSheet = {
    getDataRange: jest.fn(() => ({
      getValues: jest.fn(() => [['sku', 'name', 'regular_price']]),
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

  addNewProduct(['sku123', 'Product Name', '100.00'], 2);
  expect(global.SpreadsheetApp.openById).toHaveBeenCalled();
});
