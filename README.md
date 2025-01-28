
# Footing - System Zarządzania Produktami

## Opis projektu
Footing to aplikacja Google Apps Script zintegrowana z WooCommerce, umożliwiająca zarządzanie produktami, synchronizację stanów magazynowych oraz aktualizację informacji o produktach w Google Sheets.


## Spis treści
- [Opis projektu](#opis-projektu)
- [Moduły](#moduły)
  - [Struktura plików](#struktura-plików)
  - [Główne moduły](#główne-moduły)
  - [Narzędzia](#narzędzia)
- [Automatyczne generowanie dokumentacji](#automatyczne-generowanie-dokumentacji)
  

## Moduły

### Struktura plików
```plaintext
├── .clasp.json
├── Kod.js
├── appsscript.json
├── index.js
├── modules/
│   ├── category.js
│   ├── eslint.config.js
│   ├── export.js
│   ├── inventory.js
│   ├── parameters.js
│   ├── products.js
│   ├── schedule.js
│   ├── sync.js
├── utils/
│   ├── api.js
│   ├── config.js
│   ├── helpers.js
│   ├── logger.js
│   ├── spreadsheet.js
```

### Główne moduły
- **category.js**: Brak opisu.
- **eslint.config.js**: Brak opisu.
- **export.js**: Brak opisu.
- **inventory.js**: Brak opisu.
- **parameters.js**: Brak opisu.
- **products.js**: * Pobiera dane produktu z WooCommerce na podstawie ID.
- **schedule.js**: Brak opisu.
- **sync.js**: * Synchronizuje stany magazynowe między Google Sheets a WooCommerce.

### Narzędzia
- **api.js**: * Wysyła zapytanie do WooCommerce API.
- **config.js**: * Ustawia `SHEET_ID` w pamięci podręcznej po zaszyfrowaniu.
 * @param {string} sheetId - Identyfikator arkusza
- **helpers.js**: * Konwertuje datę w formacie Google Sheet na obiekt Date.
- **logger.js**: * Loguje zdarzenia w zakładce "logi".
- **spreadsheet.js**: * Pobiera ustawienia z zakładki "ustawienia".

## Automatyczne generowanie dokumentacji
Ten plik został wygenerowany automatycznie za pomocą skryptu `generate-readme.js`.

---

> Dokumentacja jest aktualizowana przy każdej zmianie w plikach modułów lub narzędzi.
