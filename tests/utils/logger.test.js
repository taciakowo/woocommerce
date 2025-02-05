import { logEvent } from '../../src/utils/logger.js';

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
    'Nie udało się zapisać logu: Zakładka "logi" nie istnieje.',
  );
});
