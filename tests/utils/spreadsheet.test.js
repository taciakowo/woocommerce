import dotenv from 'dotenv';
import { getSettings } from '../../src/utils/spreadsheet.js';

dotenv.config();

global.SpreadsheetApp = {
  openById: jest.fn(() => ({
    getSheetByName: jest.fn(() => ({
      getDataRange: jest.fn(() => ({
        getValues: jest.fn(() => [
          ['SHEET_ID', process.env.SHEET_ID],
          ['LOGS_SHEET', process.env.LOGS_SHEET],
          ['ADMIN_EMAIL', process.env.ADMIN_EMAIL],
          ['ALLEGRO_TOKEN', process.env.ALLEGRO_TOKEN],
          ['SHOP_ID', process.env.SHOP_ID],
        ]),
      })),
    })),
  })),
};

test('Poprawnie pobiera ustawienia z pliku .env.', () => {
  const settings = getSettings();
  expect(settings).toEqual({
    SHEET_ID: process.env.SHEET_ID,
    LOGS_SHEET: process.env.LOGS_SHEET,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ALLEGRO_TOKEN: process.env.ALLEGRO_TOKEN,
    SHOP_ID: process.env.SHOP_ID,
  });
});
