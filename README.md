
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
│   ├── inventory.js
│   ├── parameters/
│   │   ├── columns.js
│   │   ├── fetch.js
│   │   ├── index.js
│   │   ├── update.js
│   ├── products.js
│   ├── schedule.js
│   ├── seo.js
│   ├── sync.js
├── utils/
│   ├── api.js
│   ├── config.js
│   ├── helpers.js
│   ├── logger.js
│   ├── settings.js
│   ├── spreadsheet.js
```

### Główne moduły
- **category.js**: * Pobiera kategorie produktów z WooCommerce.
 * @returns {string[]} - Tablica kategorii produktów.
- **eslint.config.js**: Brak opisu.
- **inventory.js**: * Aktualizuje historię stanów magazynowych.
 * @param {string} sku - SKU produktu.
 * @param {number} newStock - Nowy stan magazynowy.
 * @param {string} source - Źródło aktualizacji.
- **products.js**: * Eksportuje zmiany produktów do WooCommerce.
- **schedule.js**: * Zaplanowany eksport produktów.
- **seo.js**: * Generuje propozycje słów kluczowych na podstawie produktów.
 * @returns {string[]} - Tablica słów kluczowych.
- **sync.js**: * Synchronizuje stany magazynowe między Google Sheets a WooCommerce.

### Narzędzia
- **api.js**: * Wysyła zapytanie do WooCommerce.
- **config.js**: * Ustawia identyfikator arkusza.
 * @param {string} sheetId - Identyfikator arkusza.
- **helpers.js**: * Parsuje datę z formatu string do obiektu Date.
 * @param {string} dateString - Data w formacie string.
 * @returns {Date} - Obiekt Date.
- **logger.js**: * Loguje zdarzenia w arkuszu "logi".
 * @param {string} functionName - Nazwa funkcji.
 * @param {string} event - Typ zdarzenia (SUCCESS, ERROR).
 * @param {string|null} productId - Identyfikator produktu.
 * @param {string|null} error - Opis błędu.
- **settings.js**: * Pobiera ustawienia WooCommerce i deszyfruje klucze.
 * @returns {Object} - Obiekt ustawień.
- **spreadsheet.js**: * Pobiera ustawienia z zakładki "ustawienia".
 * @returns {Object} - Obiekt mapujący parametry na wartości.

## Automatyczne generowanie dokumentacji
Ten plik został wygenerowany automatycznie za pomocą skryptu `generate-readme.js`.

---

> Dokumentacja jest aktualizowana przy każdej zmianie w plikach modułów lub narzędzi.
