import { getSettings } from '../../src/utils/spreadsheet.js';

test('Poprawnie pobiera ustawienia z arkusza', () => {
  const mockSheet = {
    getDataRange: jest.fn(() => ({
      getValues: jest.fn(() => [
        ['consumer_key', '12345'],
        ['consumer_secret', '67890'],
      ]),
    })),
  };

  global.SpreadsheetApp = {
    openById: jest.fn(() => ({
      getSheetByName: jest.fn(() => mockSheet),
    })),
  };

  const settings = getSettings();
  expect(settings.consumer_key).toBe('12345');
  expect(settings.consumer_secret).toBe('67890');
});

test('Zwraca błąd, jeśli brak zakładki "ustawienia"', () => {
  global.SpreadsheetApp = {
    openById: jest.fn(() => ({
      getSheetByName: jest.fn(() => null),
    })),
  };

  expect(() => getSettings()).toThrow('Zakładka "ustawienia" nie istnieje.');
});
