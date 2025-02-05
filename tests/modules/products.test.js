import {
  exportProductChanges,
  addNewProduct,
} from '../../src/modules/products.js';
import { sendToWooCommerce } from '../../src/utils/api.js';

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

jest.mock('../../src/utils/api.js', () => ({
  sendToWooCommerce: jest.fn(),
}));

jest.mock('../../src/utils/spreadsheet.js', () => ({
  getSettings: jest.fn(() => ({
    SHEET_ID: 'test_sheet_id',
    PRODUCTS_SHEET: 'test_products_sheet',
    WOO_BASE_URL: 'test_woo_base_url',
  })),
}));

test('Eksportuje zmiany produktu', () => {
  exportProductChanges(123);
  expect(global.SpreadsheetApp.openById).toHaveBeenCalled();
  expect(sendToWooCommerce).toHaveBeenCalled();
});

test('Dodaje nowy produkt poprawnie', () => {
  addNewProduct({ name: 'New Product', price: 200 });
  expect(sendToWooCommerce).toHaveBeenCalled();
});
