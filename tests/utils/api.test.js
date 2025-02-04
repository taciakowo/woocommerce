import { sendToWooCommerce } from '../../src/utils/api.js';

jest.mock('../../src/utils/api.js', () => ({
  sendToWooCommerce: jest.fn(() => ({ status: 200 })),
}));

test('Wysyła zapytanie do WooCommerce', () => {
  const data = { url: 'https://example.com', method: 'GET' };
  const response = sendToWooCommerce(data);
  expect(response.status).toBe(200);
});
