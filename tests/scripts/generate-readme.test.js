import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = './src/';
const MODULES_PATH = path.join(PROJECT_ROOT, 'modules/');
const UTILS_PATH = path.join(PROJECT_ROOT, 'utils/');

/**
 * Rekurencyjnie buduje strukturę folderów i plików w formacie tekstowym.
 * @param {string} dirPath - Ścieżka do katalogu.
 * @param {string} indent - Wcięcie dla elementów podrzędnych.
 * @returns {string} Tekstowa reprezentacja struktury.
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
 * Wyodrębnia pierwszy komentarz JSDoc z pliku.
 * @param {string} filePath - Ścieżka do pliku.
 * @returns {string} Opis modułu/narzędzia.
 */
function extractDescription(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(/\/\*\*([\s\S]*?)\*\//);
    return match ? match[1].trim() : 'Brak opisu.';
  } catch (error) {
    return 'Nie można odczytać pliku.';
  }
}

/**
 * Tworzy listę plików z opisami w katalogu.
 * @param {string} dirPath - Ścieżka do katalogu.
 * @returns {string} Lista plików z opisami.
 */
function listFilesWithDescriptions(dirPath) {
  if (!fs.existsSync(dirPath)) return 'Brak modułów do wyświetlenia.';
  
  return fs.readdirSync(dirPath, { withFileTypes: true })
    .filter(entry => entry.isFile())
    .map(file => {
      const filePath = path.join(dirPath, file.name);
      const description = extractDescription(filePath);
      return `- **${file.name}**: ${description}`;
    })
    .join('\n');
}

/**
 * Tworzy dynamiczny spis treści.
 * @returns {string} Spis treści.
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
  console.log('📄 Generowanie README.md...');

  const modules = listFilesWithDescriptions(MODULES_PATH);
  const utils = listFilesWithDescriptions(UTILS_PATH);
  const fileStructure = buildFileStructure(PROJECT_ROOT);

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

  fs.writeFileSync(README_PATH, content);
  console.log('✅ README.md zaktualizowany.');
}

// Uruchamia generowanie README
generateReadme();

import fs from 'fs';
import path from 'path';
import { generateReadme } from '../../scripts/generate-readme.js';

jest.mock('fs');
jest.mock('path');

describe('generateReadme', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('Generuje README.md z poprawnymi danymi', () => {
    const mockModules = [
      { name: 'category.js', description: 'Pobiera kategorie produktów z WooCommerce.' },
      { name: 'inventory.js', description: 'Aktualizuje historię stanów magazynowych.' },
    ];

    const mockUtils = [
      { name: 'api.js', description: 'Wysyła zapytanie do WooCommerce.' },
      { name: 'logger.js', description: 'Zapisuje zdarzenia w zakładce "logi".' },
    ];

    fs.readdirSync.mockImplementation((dirPath) => {
      if (dirPath.includes('modules')) {
        return mockModules.map((mod) => mod.name);
      }
      if (dirPath.includes('utils')) {
        return mockUtils.map((util) => util.name);
      }
      return [];
    });

    fs.readFileSync.mockImplementation((filePath) => {
      const fileName = path.basename(filePath);
      const module = mockModules.find((mod) => mod.name === fileName);
      const util = mockUtils.find((util) => util.name === fileName);
      if (module) {
        return `/**\n * ${module.description}\n */`;
      }
      if (util) {
        return `/**\n * ${util.description}\n */`;
      }
      return '';
    });

    fs.writeFileSync.mockImplementation(() => {});

    generateReadme();

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('Pobiera kategorie produktów z WooCommerce.')
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('Aktualizuje historię stanów magazynowych.')
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('Wysyła zapytanie do WooCommerce.')
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('Zapisuje zdarzenia w zakładce "logi".')
    );
  });

  it('should generate README.md file', () => {
    const readmePath = path.join(__dirname, '../../README.md');
    generateReadme();
    expect(fs.existsSync(readmePath)).toBe(true);
  });
});
