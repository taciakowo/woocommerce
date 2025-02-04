import { exportProductChanges, addNewProduct } from '../../src/modules/products.js';
import { sendToWooCommerce } from '../../src/utils/api.js';
import { getSettings } from '../../src/utils/spreadsheet.js';

jest.mock('../../src/utils/logger.js', () => ({
  logEvent: jest.fn(),
}));

jest.mock('../../src/utils/api.js', () => ({
  sendToWooCommerce: jest.fn(),
}));

jest.mock('../../src/modules/products.js', () => ({
  getProductById: jest.fn(() => ({ id: 123, name: 'Test Product' })),
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
    })),
  })),
};

test('Eksportuje zmiany produktu', () => {
  exportProductChanges(123);
  expect(global.SpreadsheetApp.openById).toHaveBeenCalled();
  expect(sendToWooCommerce).toHaveBeenCalled();
});

test('Dodaje nowy produkt poprawnie', () => {
  addNewProduct({ name: 'New Product', price: 200 });
  expect(sendToWooCommerce).toHaveBeenCalled();
});
