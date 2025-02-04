import dotenv from 'dotenv';
import { getSheetId, setSheetId } from '../../src/utils/initial.js';

dotenv.config();

test('Poprawnie pobiera i ustawia ID arkusza', () => {
  const sheetId = getSheetId();
  expect(sheetId).toBe(process.env.SHEET_ID);
  setSheetId('new-sheet-id');
  expect(process.env.SHEET_ID).toBe('new-sheet-id');
});
