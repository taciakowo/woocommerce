import { sendToWooCommerce } from '../../src/utils/api.js';

jest.mock('../../src/utils/logger.js', () => ({
  logEvent: jest.fn(),
}));

test('Wysyła poprawne zapytanie GET do WooCommerce', () => {
  const mockResponse = {
    getResponseCode: jest.fn(() => 200),
    getContentText: jest.fn(() => JSON.stringify({ success: true })),
  };

  global.UrlFetchApp = {
    fetch: jest.fn(() => mockResponse),
  };

  const result = sendToWooCommerce('https://example.com', 'get');
  expect(global.UrlFetchApp.fetch).toHaveBeenCalledWith('https://example.com', expect.any(Object));
  expect(result.status).toBe(200);
  expect(result.data).toEqual({ success: true });
});

test('Zwraca błąd przy niepoprawnym URL', () => {
  const mockResponse = {
    getResponseCode: jest.fn(() => 400),
    getContentText: jest.fn(() => JSON.stringify({ message: 'Invalid URL' })),
  };

  global.UrlFetchApp = {
    fetch: jest.fn(() => mockResponse),
  };

  const result = sendToWooCommerce('', 'get');
  expect(result.status).toBe(400);
  expect(result.data.message).toBe('Invalid URL');
});
