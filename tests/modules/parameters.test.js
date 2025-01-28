import { fetchAllProductParameters } from '../../src/modules/parameters.js';

jest.mock('../../src/utils/api.js', () => ({
  sendToWooCommerce: jest.fn(() => ({
    status: 200,
    data: { id: 123, attributes: [{ name: 'Color', options: ['Red', 'Blue'] }] },
  })),
}));

jest.mock('../../src/utils/logger.js', () => ({
  logEvent: jest.fn(),
}));

test('Poprawnie wyciąga parametry produktu', () => {
  const params = fetchAllProductParameters();
  expect(params.has('id')).toBe(true);
  expect(params.get('attribute: Color')).toBe('Red, Blue');
});
