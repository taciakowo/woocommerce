# Footing - System Zarządzania Produktami

## Opis projektu
Footing to aplikacja Google Apps Script zintegrowana z WooCommerce, umożliwiająca zarządzanie produktami, synchronizację stanów magazynowych oraz aktualizację informacji o produktach w Google Sheets.

---

## Funkcje

### G. Funkcje globalne
1. **G1** `<getDynamicSheetId>`: Pobieranie dynamicznego ID arkusza z zakładki "ustawienia".
   - Umożliwia pracę z wieloma skoroszytami bez konieczności zmiany kodu.
2. **G2** `<getSettings>`: Pobieranie ustawień z zakładki "ustawienia".
   - Ładuje parametry z Google Sheet.
   - Obsługuje błędy w przypadku braku zakładki.
3. **G3** `<logEvent>`: Logowanie zdarzeń w zakładce "logi".
   - Zapisywanie informacji o funkcji, zdarzeniu, produkcie i ewentualnym błędzie.
4. **G4** `<sendToWooCommerce>`: Integracja z WooCommerce API.
   - Obsługuje metody GET, POST, PUT z autoryzacją Basic Auth.
5. **G5** `<parseDate>`: Konwersja daty Google Sheet na obiekt `Date`.
   - Obsługuje formaty dat z Google Sheet.

---

### D1. Parametryzacja produktów
1. **D1.1** `<getProductById>`: Pobieranie danych produktu z WooCommerce na podstawie ID.
2. **D1.2** `<fetchProductCategories>`: Pobieranie kategorii produktów.
   - Zwraca listę kategorii w formacie: `category: <nazwa>`.
3. **D1.3** `<fetchAllProductParameters>`: Wyciąganie parametrów, kategorii, atrybutów i meta danych produktu.
4. **D1.4** `<updateWooParametersSheet>`: Aktualizacja zakładki "woo_parametry".
   - Dodaje brakujące wiersze z parametrami produktów.
5. **D1.5** `<addMissingColumnsToProducts>`: Dodawanie brakujących kolumn w zakładce "produkty".
   - Porównuje parametry oznaczone jako `TRUE` z istniejącymi kolumnami.
6. **D1.6** `<updateAllWooCommerceParameters>`: Wywołanie pełnej aktualizacji parametrów.

---

### D2. Obsługa produktów
1. **D2.1** `<getProductIdBySku>`: Pobieranie ID produktu na podstawie SKU.
   - Weryfikuje istnienie produktu w WooCommerce na podstawie SKU.
2. **D2.2** `<addNewProduct>`: Dodawanie nowego produktu do WooCommerce.
   - Wymaga minimalnych parametrów: SKU, nazwy, ceny.
3. **D2.3** `<exportProductChanges>`: Aktualizacja istniejącego produktu w WooCommerce.
   - Obsługuje zmiany parametrów takich jak cena, opis, atrybuty.
4. **D2.4** `<exportProductImages>`: Eksport zdjęć produktów do WooCommerce.
   - Przyjmuje ID produktu i tablicę URL zdjęć.
5. **D2.5** `<scheduledProductExport>`: Zaplanowany eksport produktów.
   - Eksportuje produkty, które mają ustawioną datę aktywacji oferty.

---

### D3. Synchronizacja stanów magazynowych
1. **D3.1** `<updateInventoryHistory>`: Aktualizacja historii stanów magazynowych.
   - Zapisuje zmiany w Google Sheet, wraz z datą, godziną i źródłem.
2. **D3.2** `<syncStockBalanced>`: Synchronizacja stanów magazynowych między Google Sheet a WooCommerce.
   - Bilansuje stany na podstawie wartości początkowych.
3. **D3.3** `<onEdit>`: Synchronizacja stanów magazynowych po zmianie w Google Sheet.
   - Automatyczna synchronizacja przy edycji arkusza.
4. **D3.4** `<scheduleSync>`: Harmonogram synchronizacji stanów magazynowych.
   - Ustawia automatyczną synchronizację co określony czas.

---

## Struktura katalogów
```plaintext
project-root/
├── src/
│   ├── appsscript.json
│   ├── utils/
│   │   ├── api.js
│   │   ├── logger.js
│   │   └── spreadsheet.js
│   ├── modules/
│   │   ├── parameters.js
│   │   ├── products.js
│   │   ├── sync.js
│   │   └── inventory.js
│   ├── index.js
├── .clasp.json
├── .claspignore
├── .eslintrc.json
├── package.json
└── README.md
