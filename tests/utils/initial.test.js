import { initializeCache, getSheetId } from '../../src/utils/initial.js';
import { getSheetId, setSheetId } from '../../src/utils/initial.js';

dotenv.config();

test('Poprawnie pobiera i ustawia ID arkusza', () => {
  const sheetId = '1f6W4pP4VtMNY2m6iytNZ-AYnr-XqmbXDOEkSt5QsEbg';
  setSheetId(sheetId);
  expect(getSheetId()).toBe(sheetId);
});
