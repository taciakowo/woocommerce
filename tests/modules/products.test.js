import { exportProductChanges, addNewProduct } from '../../src/modules/products.js';

jest.mock('../../src/utils/api.js', () => ({
  sendToWooCommerce: jest.fn(() => ({
    status: 200,
    data: {},
  })),
}));

jest.mock('../../src/utils/logger.js', () => ({
  logEvent: jest.fn(),
}));

global.SpreadsheetApp = {
  openById: jest.fn(() => ({
    getSheetByName: jest.fn(() => ({
      getDataRange: jest.fn(() => ({
        getValues: jest.fn(() => [['sku', 'name', 'regular_price']]),
      })),
      getRange: jest.fn(() => ({
        setValue: jest.fn(),
      })),
    })),
  })),
};

test('Eksportuje zmiany produktu', () => {
  exportProductChanges();
  expect(global.SpreadsheetApp.openById).toHaveBeenCalled();
});

test('Dodaje nowy produkt poprawnie', () => {
  addNewProduct(['sku123', 'Product Name', '100.00'], 2);
  expect(global.SpreadsheetApp.openById).toHaveBeenCalled();
});
