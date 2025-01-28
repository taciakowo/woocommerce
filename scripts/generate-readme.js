import fs from 'fs';
import path from 'path';

const README_PATH = './README.md';
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
  console.log('README.md zaktualizowany.');
}

// Generuj dokumentację
generateReadme();
