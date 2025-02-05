import { getSettings } from '../../src/utils/spreadsheet.js';

beforeAll(() => {
  process.env.SHEET_ID = 'test_sheet_id';
  process.env.LOGS_SHEET = 'test_logs_sheet';
  process.env.ADMIN_EMAIL = 'test_admin_email';
  process.env.ALLEGRO_TOKEN = 'test_allegro_token';
  process.env.SHOP_ID = 'test_shop_id';
  process.env.WOO_BASE_URL = 'test_woo_base_url';
});

test('Poprawnie pobiera ustawienia z pliku .env.', () => {
  const settings = getSettings();
  expect(settings).toEqual({
    SHEET_ID: 'test_sheet_id',
    LOGS_SHEET: 'test_logs_sheet',
    ADMIN_EMAIL: 'test_admin_email',
    ALLEGRO_TOKEN: 'test_allegro_token',
    SHOP_ID: 'test_shop_id',
    WOO_BASE_URL: 'test_woo_base_url',
  });
});
