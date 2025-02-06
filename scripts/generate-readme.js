import fs from 'fs';
import path from 'path';

const README_PATH = './README.md';
const PROJECT_ROOT = './src/';
const MODULES_PATH = path.join(PROJECT_ROOT, 'modules/');
const UTILS_PATH = path.join(PROJECT_ROOT, 'utils/');

function buildFileStructure(dirPath, indent = '') {
  if (!fs.existsSync(dirPath)) return '';
  return fs.readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.name !== 'Kod.js') // Ignoruj plik Kod.js
    .map((entry) => {
      const fullPath = path.join(dirPath, entry.name);
      return entry.isDirectory()
        ? `${indent}├── ${entry.name}/\n${buildFileStructure(fullPath, indent + '│   ')}`
        : `${indent}├── ${entry.name}`;
    })
    .join('\n');
}

function extractDescription(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(/\/\*\*([\s\S]*?)\*\//);
    return match ? match[1].trim() : 'Brak opisu.';
  } catch {
    return 'Nie można odczytać pliku.';
  }
}

function listFilesWithDescriptions(dirPath) {
  if (!fs.existsSync(dirPath)) return 'Brak modułów do wyświetlenia.';
  return fs.readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((file) => {
      const filePath = path.join(dirPath, file.name);
      const description = extractDescription(filePath);
      return `- **${file.name}**: ${description}`;
    })
    .join('\n');
}

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

function generateReadme() {
  console.log('📄 Generowanie README.md...');
  try {
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
  } catch (error) {
    console.error('Błąd podczas generowania README:', error);
  }
}

generateReadme();
