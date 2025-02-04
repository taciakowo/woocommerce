import dotenv from 'dotenv';
import { sendToWooCommerce } from '../../src/utils/api.js';

dotenv.config();

jest.mock('../../src/utils/logger.js', () => ({
  logEvent: jest.fn(),
}));

test('Wysyła zapytanie do WooCommerce', () => {
  const data = {
    url: 'https://example.com',
    method: 'GET',
  };

  const response = sendToWooCommerce(data);
  expect(response.status).toBe(200);
});
