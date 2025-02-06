import '../../utils/dotenv.config.js';
import { fetchAllProductParameters } from '../../src/modules/parameters/fetch.js';
import { sendToWooCommerce } from '../../src/utils/api.js';

dotenv.config();

jest.mock('../../src/utils/api.js', () => ({
  sendToWooCommerce: jest.fn(),
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
  expect(sendToWooCommerce).toHaveBeenCalledTimes(1);
});
