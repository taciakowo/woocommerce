import { scheduleSync } from '../../src/modules/schedule.js';

jest.mock('../../src/utils/logger.js', () => ({
  logEvent: jest.fn(),
}));

test('Harmonogramuje synchronizację', () => {
  const mockTrigger = {
    getHandlerFunction: jest.fn(() => 'syncStockBalanced'),
  };

  global.ScriptApp = {
    getProjectTriggers: jest.fn(() => [mockTrigger]),
    newTrigger: jest.fn(() => ({
      timeBased: jest.fn(() => ({
        everyMinutes: jest.fn(() => ({
          create: jest.fn(),
        })),
      })),
    })),
  };

  scheduleSync();
  expect(global.ScriptApp.getProjectTriggers).toHaveBeenCalled();
});
