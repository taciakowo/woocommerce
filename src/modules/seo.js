import { logEvent } from '../utils/logger.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Generuje propozycje słów kluczowych na podstawie produktów.
 * @returns {string[]} - Tablica słów kluczowych.
 */
globalThis.generateKeywordSuggestions = function () {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('produkty');
    if (!sheet) {
      throw new Error('Zakładka "produkty" nie istnieje.');
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const nameIndex = headers.indexOf('name');
    const descriptionIndex = headers.indexOf('description');

    if (nameIndex === -1 || descriptionIndex === -1) {
      throw new Error('Brak wymaganych kolumn "name" i "description".');
    }

    const keywords = new Set();
    data.slice(1).forEach(row => {
      const name = row[nameIndex] || '';
      const description = row[descriptionIndex] || '';
      name.split(' ').concat(description.split(' ')).forEach(word => {
        if (word.length > 3) {
          keywords.add(word.toLowerCase());
        }
      });
    });

    logEvent('generateKeywordSuggestions', 'SUCCESS', null, `Wygenerowano ${keywords.size} słów kluczowych.`);
    return Array.from(keywords);
  } catch (error) {
    logEvent('generateKeywordSuggestions', 'ERROR', null, error.message);
    throw error;
  }
};