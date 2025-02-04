import dotenv from 'dotenv';
import { fetchAllProductParameters } from '../../src/modules/parameters/fetch.js';
import { getProductById } from '../../src/modules/products.js';

dotenv.config();

jest.mock('../../src/utils/api.js', () => ({
  sendToWooCommerce: jest.fn(() => ({
    status: 200,
    data: { id: 123, attributes: [{ name: 'Color', options: ['Red', 'Blue'] }] },
  })),
}));

jest.mock('../../src/utils/logger.js', () => ({
  logEvent: jest.fn(),
}));

jest.mock('../../src/modules/products.js', () => ({
  getProductById: jest.fn(() => ({ id: 123, name: 'Test Product' })),
}));

test('Poprawnie wyciąga parametry produktu', async () => {
  const params = await fetchAllProductParameters();
  expect(params.has('id')).toBe(true);
  expect(params.get('attribute: Color')).toBe('Red, Blue');
  expect(getProductById).toHaveBeenCalledTimes(1);
});
