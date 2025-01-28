import { logEvent } from '../../src/utils/logger.js';

test('Loguje zdarzenie poprawnie', () => {
  const mockSheet = {
    appendRow: jest.fn(),
  };

  global.SpreadsheetApp = {
    openById: jest.fn(() => ({
      getSheetByName: jest.fn(() => mockSheet),
    })),
  };

  logEvent('testFunction', 'SUCCESS', '12345', null);
  expect(mockSheet.appendRow).toHaveBeenCalledWith(expect.any(Array));
});

test('Zgłasza błąd, jeśli arkusz logów nie istnieje', () => {
  global.SpreadsheetApp = {
    openById: jest.fn(() => ({
      getSheetByName: jest.fn(() => null),
    })),
  };

  expect(() => logEvent('testFunction', 'ERROR', null, 'Błąd testowy')).toThrow(
    'Zakładka "logi" nie istnieje.'
  );
});
