import dotenv from 'dotenv';
import { logEvent } from '../../src/utils/logger.js';

dotenv.config();

global.SpreadsheetApp = {
  openById: jest.fn(() => ({
    getSheetByName: jest.fn(() => ({
      appendRow: jest.fn(),
    })),
  })),
};

test('Loguje zdarzenie poprawnie', () => {
  logEvent('testFunction', 'INFO', null, 'Test message');
  expect(global.SpreadsheetApp.openById).toHaveBeenCalled();
});

test('Zgłasza błąd, jeśli arkusz logów nie istnieje', () => {
  global.SpreadsheetApp.openById.mockImplementationOnce(() => ({
    getSheetByName: jest.fn(() => null),
  }));

  expect(() => logEvent('testFunction', 'ERROR', null, 'Błąd testowy')).toThrow(
    'Nie udało się zapisać logu: Zakładka "logi" nie istnieje.'
  );
});
