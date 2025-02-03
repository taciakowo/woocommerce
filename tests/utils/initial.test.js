import { getSheetId, setSheetId } from '../../src/utils/initial.gs';

jest.mock('../../src/utils/initial.gs', () => ({
  getSheetId: jest.fn(() => 'mock-sheet-id'),
  setSheetId: jest.fn(),
}));

test('Poprawnie pobiera SHEET_ID', () => {
  expect(getSheetId()).toBe('mock-sheet-id');
});

test('Poprawnie ustawia SHEET_ID', () => {
  setSheetId('new-sheet-id');
  expect(setSheetId).toHaveBeenCalledWith('new-sheet-id');
});
