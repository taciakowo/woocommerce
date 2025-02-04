import { fetchProductCategories } from './modules/category.js';
import { updateAllWooCommerceParameters } from './modules/parameters/update.js';
import { exportProductImages, exportProductChanges } from './modules/products.js';
import { syncStockBalanced } from './modules/sync.js';
import { generateKeywordSuggestions } from './modules/seo.js';
import { fetchAllProductParameters } from './modules/parameters.js';
import fs from 'fs';
import path from 'path';
import './utils/dotenv.config.js';

const README_PATH = './README.md';
const PROJECT_ROOT = './src/';
const MODULES_PATH = path.join(PROJECT_ROOT, 'modules/');
const UTILS_PATH = path.join(PROJECT_ROOT, 'utils/');

/**
 * Sprawdza, czy dany plik to katalog.
 * @param {string} filePath - Ścieżka do pliku.
 * @returns {boolean} - True, jeśli to katalog.
 */
function isDirectory(filePath) {
  return fs.statSync(filePath).isDirectory();
}

/**
 * Buduje strukturę folderów i plików w formacie tekstowym.
 * @param {string} dirPath - Ścieżka do katalogu.
 * @param {string} indent - Wcięcie dla elementów podrzędnych.
 * @returns {string} - Tekstowa reprezentacja struktury.
 */
function buildFileStructure(dirPath, indent = '') {
  if (!fs.existsSync(dirPath)) return '';
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  return entries
    .map(entry => {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        return `${indent}├── ${entry.name}/\n${buildFileStructure(fullPath, indent + '│   ')}`;
      } else {
        return `${indent}├── ${entry.name}`;
      }
    })
    .join('\n');
}

/**
 * Pobiera pierwszy komentarz z pliku jako opis modułu.
 * @param {string} filePath - Ścieżka do pliku.
 * @returns {string} - Opis modułu lub "Brak opisu."
 */
function extractDescription(filePath) {
  if (isDirectory(filePath)) return ''; // Unikamy błędu EISDIR
  console.log(`Odczytywanie pliku: ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/\/\*\*([\s\S]*?)\*\//);
  if (match) {
    console.log(`Znaleziono opis w pliku ${filePath}: ${match[1].trim()}`);
  } else {
    console.log(`Brak opisu w pliku ${filePath}`);
  }
  return match ? match[1].trim() : 'Brak opisu.';
}

/**
 * Tworzy listę plików z opisami w katalogu.
 * @param {string} dirPath - Ścieżka do katalogu.
 * @returns {string} - Lista plików z opisami.
 */
function listFilesWithDescriptions(dirPath) {
  if (!fs.existsSync(dirPath)) return 'Brak modułów do wyświetlenia.';
  return fs.readdirSync(dirPath)
    .map(file => {
      const filePath = path.join(dirPath, file);
      if (isDirectory(filePath)) return ''; // Ignorujemy katalogi
      const description = extractDescription(filePath);
      return `- **${file}**: ${description}`;
    })
    .filter(entry => entry !== '') // Usuwa puste wpisy
    .join('\n');
}

/**
 * Tworzy spis treści.
 * @returns {string} - Spis treści README.
 */
function generateTableOfContents() {
  return `
## Spis treści
- [Opis projektu](#opis-projektu)
- [Moduły](#moduły)
  - [Struktura plików](#struktura-plików)
  - [Główne moduły](#główne-moduły)
  - [Narzędzia](#narzędzia)
- [Automatyczne generowanie dokumentacji](#automatyczne-generowanie-dokumentacji)
  `;
}

/**
 * Generuje README.md.
 */
function generateReadme() {
  console.log('Generowanie README...');
  const modules = listFilesWithDescriptions(MODULES_PATH);
  console.log('Moduły:', modules);
  const utils = listFilesWithDescriptions(UTILS_PATH);
  console.log('Narzędzia:', utils);
  const fileStructure = buildFileStructure(PROJECT_ROOT);
  console.log('Struktura plików:', fileStructure);

  const content = `
# Footing - System Zarządzania Produktami

## Opis projektu
Footing to aplikacja Google Apps Script zintegrowana z WooCommerce, umożliwiająca zarządzanie produktami, synchronizację stanów magazynowych oraz aktualizację informacji o produktach w Google Sheets.

${generateTableOfContents()}

## Moduły

### Struktura plików
\`\`\`plaintext
${fileStructure}
\`\`\`

### Główne moduły
${modules}

### Narzędzia
${utils}

## Automatyczne generowanie dokumentacji
Ten plik został wygenerowany automatycznie za pomocą skryptu \`generate-readme.js\`.

---

> Dokumentacja jest aktualizowana przy każdej zmianie w plikach modułów lub narzędzi.
`;

  console.log('Zapisuję README.md...');
  fs.writeFileSync(README_PATH, content);
  console.log('README.md zaktualizowany.');
}

// Generuj dokumentację
generateReadme();

/**
 * Tworzy niestandardowe menu w Google Sheets
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Footing Menu')
    .addItem('Pobierz parametry produktu', 'runFetchProductParameters')
    .addItem('Pobierz kategorie WooCommerce', 'runFetchCategories')
    .addItem('Synchronizuj stany magazynowe', 'runSyncStock')
    .addItem('Generuj propozycje słów kluczowych', 'runGenerateKeywords')
    .addSeparator()
    .addItem('Aktualizuj parametry WooCommerce', 'runUpdateParameters')
    .addItem('Eksportuj zmiany produktów', 'runExportChanges')
    .addItem('Eksportuj zdjęcia produktów', 'runExportImages')
    .addToUi();
}

globalThis.runUpdateParameters = function () {
  try {
    updateAllWooCommerceParameters();
    SpreadsheetApp.getUi().alert('Parametry WooCommerce zostały zaktualizowane.');
  } catch (error) {
    SpreadsheetApp.getUi().alert(`Błąd: ${error.message}`);
  }
};

globalThis.runFetchProductParameters = function () {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Podaj ID produktu:', ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() === ui.Button.OK) {
    const productId = response.getResponseText().trim();
    if (productId) {
      const params = fetchAllProductParameters(productId);
      const params = getParameters();
      ui.alert(`Pobrano parametry dla produktu ID: ${productId}`);
    } else {
      ui.alert('Nie podano ID produktu.');
    }
  }
};

globalThis.runExportImages = function () {
  try {
    exportProductImages();
    SpreadsheetApp.getUi().alert('Zdjęcia produktów zostały wyeksportowane.');
  } catch (error) {
    SpreadsheetApp.getUi().alert(`Błąd: ${error.message}`);
  }
};

globalThis.runFetchCategories = function () {
  try {
    const categories = fetchProductCategories();
    SpreadsheetApp.getUi().alert(`Pobrano ${categories.length} kategorii z WooCommerce.`);
  } catch (error) {
    SpreadsheetApp.getUi().alert(`Błąd: ${error.message}`);
  }
};

globalThis.runGenerateKeywords = function () {
  try {
    const keywords = generateKeywordSuggestions();
    SpreadsheetApp.getUi().alert(`Wygenerowano słowa kluczowe: ${keywords.join(', ')}`);
  } catch (error) {
    SpreadsheetApp.getUi().alert(`Błąd: ${error.message}`);
  }
};

globalThis.runExportChanges = function () {
  try {
    exportProductChanges();
    SpreadsheetApp.getUi().alert('Zmiany produktów zostały wyeksportowane.');
  } catch (error) {
    SpreadsheetApp.getUi().alert(`Błąd: ${error.message}`);
  }
};

globalThis.runSyncStock = function () {
  try {
    syncStockBalanced();
    SpreadsheetApp.getUi().alert('Synchronizacja stanów magazynowych zakończona.');
  } catch (error) {
    SpreadsheetApp.getUi().alert(`Błąd: ${error.message}`);
  }
};

globalThis.onEdit = function (e) {
  const sheet = e.source.getActiveSheet();
  const sheetName = sheet.getName();

  if (sheetName === 'produkty') {
    syncStockBalanced();
  }
};

globalThis.onOpen = onOpen;

export function getParameters() {
  // Implementacja funkcji getParameters
}
