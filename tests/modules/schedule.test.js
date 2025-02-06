import '../../utils/dotenv.config.js';
import { scheduledProductExport } from '../../src/modules/schedule.js';

dotenv.config();

jest.mock('../../src/utils/logger.js', () => ({
  logEvent: jest.fn(),
}));

jest.mock('../../src/modules/products.js', () => ({
  getProductIdBySku: jest.fn(),
  addNewProduct: jest.fn(),
}));

jest.mock('../../src/utils/spreadsheet.js', () => ({
  getSettings: jest.fn(() => ({
    SHEET_ID: process.env.SHEET_ID,
    PRODUCTS_SHEET: process.env.PRODUCTS_SHEET,
  })),
}));

global.SpreadsheetApp = {
  openById: jest.fn(() => ({
    getSheetByName: jest.fn(() => ({
      getDataRange: jest.fn(() => ({
        getValues: jest.fn(() => [
          ['sku', 'date_on_sale_from'],
          ['sku123', new Date().toISOString()],
        ]),
      })),
    })),
  })),
};

test('Zaplanowany eksport produktów', () => {
  scheduledProductExport();
  expect(global.SpreadsheetApp.openById).toHaveBeenCalled();
  expect(global.SpreadsheetApp.openById().getSheetByName).toHaveBeenCalled();
  expect(
    global.SpreadsheetApp.openById().getSheetByName().getDataRange,
  ).toHaveBeenCalled();
  expect(
    global.SpreadsheetApp.openById().getSheetByName().getDataRange().getValues,
  ).toHaveBeenCalled();
});
