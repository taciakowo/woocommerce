import fs from 'fs';
import path from 'path';

const README_PATH = './README.md';
const MODULES_PATH = './src/modules/';
const UTILS_PATH = './src/utils/';

/**
 * Wyodrębnia pierwszy komentarz z pliku.
 * @param {string} filePath - Ścieżka do pliku.
 * @returns {string} Opis modułu/narzędzia.
 */
function extractDescription(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/\/\*\*([\s\S]*?)\*\//);
  return match ? match[1].trim() : 'Brak opisu.';
}

/**
 * Tworzy listę plików z opisami w katalogu.
 * @param {string} dirPath - Ścieżka do katalogu.
 * @returns {string} Lista plików z opisami.
 */
function listFilesWithDescriptions(dirPath) {
  if (!fs.existsSync(dirPath)) return 'Brak modułów do wyświetlenia.';
  return fs.readdirSync(dirPath)
    .map(file => {
      const filePath = path.join(dirPath, file);
      const description = extractDescription(filePath);
      return `- **${file}**: ${description}`;
    })
    .join('\n');
}

/**
 * Tworzy spis treści.
 * @returns {string} Spis treści.
 */
function generateTableOfContents() {
  return `
## Spis treści
- [Opis projektu](#opis-projektu)
- [Moduły](#moduły)
  - [Główne moduły](#główne-moduły)
  - [Narzędzia](#narzędzia)
- [Automatyczne generowanie dokumentacji](#automatyczne-generowanie-dokumentacji)
  `;
}

/**
 * Generuje README.md.
 */
function generateReadme() {
  const modules = listFilesWithDescriptions(MODULES_PATH);
  const utils = listFilesWithDescriptions(UTILS_PATH);

  const content = `
# Footing - System Zarządzania Produktami

## Opis projektu
Footing to aplikacja Google Apps Script zintegrowana z WooCommerce, umożliwiająca zarządzanie produktami, synchronizację stanów magazynowych oraz aktualizację informacji o produktach w Google Sheets.

${generateTableOfContents()}

## Moduły

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
  console.log('README.md zaktualizowany.');
}

// Generuj dokumentację
generateReadme();
