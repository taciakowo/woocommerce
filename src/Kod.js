/* ================= SYSTEM ZARZĄDZANIA PRODUKTAMI GOOGLE - WOOCOMMERCE ================= */

/* ===================== PODSTAWOWE PARAMETRY ===================== */
const SHEET_ID = getDynamicSheetId(); // Dynamically loaded from configuration for scalability
const PRODUCTS_SHEET = 'produkty';
const SETTINGS_SHEET = 'ustawienia';
const LOGS_SHEET = 'logi';
const WOO_PARAMETERS_SHEET = 'woo_parametry';

/* ===================== FUNKCJE GLOBALNE ===================== */
/**
 * G1. Pobiera ustawienia z zakładki "ustawienia".
 * Zwraca obiekt mapujący parametry na wartości.
 */
function getSettings() {
  try {
    const sheet =
      SpreadsheetApp.openById(SHEET_ID).getSheetByName(SETTINGS_SHEET);
    if (!sheet) throw new Error(`Zakładka "${SETTINGS_SHEET}" nie istnieje.`);

    const data = sheet.getDataRange().getValues();
    if (!data || data.length === 0)
      throw new Error(`Zakładka "${SETTINGS_SHEET}" jest pusta.`);

    return Object.fromEntries(
      data.map((row) => {
        if (row.length < 2 || !row[0])
          throw new Error(
            'Nieprawidłowy format danych w zakładce "ustawienia".',
          );
        return [row[0], row[1] || ''];
      }),
    );
  } catch (error) {
    logEvent('getSettings', 'Error', null, error.message);
    throw new Error(`Błąd podczas pobierania ustawień: ${error.message}`);
  }
}

/**
 * G2. Zapisuje zdarzenia w zakładce "logi".
 */
function logEvent(functionName, event, productId = null, error = null) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(LOGS_SHEET);
  const timestamp = new Date().toLocaleString('pl-PL', {
    timeZone: 'Europe/Warsaw',
  });
  sheet.appendRow([timestamp, functionName, event, productId, error]);
}

/**
 * G3. Wysyła dane do WooCommerce API.
 */
function sendToWooCommerce(url, method, payload = null) {
  const settings = getSettings();
  if (!url) {
    logEvent(
      'sendToWooCommerce',
      'Error',
      null,
      'URL jest wymagany do zapytania WooCommerce.',
    );
    return { status: 400, data: { message: 'URL jest wymagany' } };
  }

  const options = {
    method,
    headers: {
      Authorization: `Basic ${Utilities.base64Encode(`${settings.consumer_key}:${settings.consumer_secret}`)}`,
      'Content-Type': 'application/json',
    },
    muteHttpExceptions: true,
  };

  if (payload) {
    options.payload = JSON.stringify(payload);
  }

  try {
    const response = UrlFetchApp.fetch(url, options);
    const status = response.getResponseCode();

    if (status >= 400 && status < 500) {
      logEvent(
        'sendToWooCommerce',
        'Client Error',
        null,
        `Status: ${status} | Message: ${response.getContentText()}`,
      );
    } else if (status >= 500) {
      logEvent(
        'sendToWooCommerce',
        'Server Error',
        null,
        `Status: ${status} | Message: ${response.getContentText()}`,
      );
    }

    return { status, data: JSON.parse(response.getContentText()) };
  } catch (error) {
    logEvent(
      'sendToWooCommerce',
      'Error',
      null,
      `Błąd połączenia z WooCommerce: ${error.message}`,
    );
    return { status: 500, data: { message: 'Błąd połączenia z WooCommerce' } };
  }
}

/**
 * G4. Pobiera dynamiczny SHEET_ID z zakładki ustawienia.
 */
function getDynamicSheetId() {
  try {
    const sheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SETTINGS_SHEET);
    const data = sheet.getDataRange().getValues();
    const idRow = data.find((row) => row[0] === 'sheet_id');
    if (!idRow || idRow.length < 2 || !idRow[1]) {
      throw new Error('Nie znaleziono SHEET_ID w zakładce "ustawienia".');
    }
    return idRow[1];
  } catch (error) {
    throw new Error(`Błąd podczas pobierania SHEET_ID: ${error.message}`);
  }
}

/**
 * G5. Funkcja pomocnicza: Konwertuje datę w formacie Google Sheet na obiekt Date.
 */
function parseDate(dateString) {
  if (!dateString || typeof dateString !== 'string') {
    return new Date(0);
  }
  return new Date(Date.parse(dateString.replace(/\s*\(.*?\)/, '').trim()));
}

/* ===================== PARAMETRYZACJA PRODUKTÓW D1 ===================== */
/**
 * D1.1. Pobiera dane produktu z WooCommerce na podstawie ID.
 */
function getProductById() {
  const settings = getSettings();
  const url = settings.url_json_id;
  const response = sendToWooCommerce(url, 'get');

  if (response.status !== 200) {
    logEvent(
      'getProductById',
      'Error',
      null,
      `Nie udało się pobrać produktu. Status: ${response.status}`,
    );
    throw new Error(`Nie udało się pobrać produktu. Sprawdź URL: ${url}`);
  }

  return response.data;
}

/**
 * D1.2. Pobiera kategorie produktów z WooCommerce.
 */
function fetchProductCategories() {
  const settings = getSettings();
  const url = `${settings.base_url}/wp-json/wc/v3/products/categories?per_page=100`;
  const response = sendToWooCommerce(url, 'get');

  if (response.status !== 200) {
    logEvent(
      'fetchProductCategories',
      'Error',
      null,
      'Nie udało się pobrać kategorii produktów.',
    );
    return [];
  }

  return response.data.map((category) => `category: ${category.name}`);
}

/**
 * D1.3. Wyciąga parametry, kategorie, atrybuty i meta dane produktu.
 */
function fetchAllProductParameters() {
  const product = getProductById();
  const categories = fetchProductCategories();
  const params = new Map();

  // Podstawowe dane produktu
  Object.entries(product).forEach(([key, value]) => {
    params.set(
      key,
      typeof value === 'object' ? JSON.stringify(value) : value || '',
    );
  });

  // Kategorie produktu
  categories.forEach((category) => params.set(category, ''));

  // Atrybuty
  if (Array.isArray(product.attributes)) {
    product.attributes.forEach((attribute) => {
      const key = `attribute: ${attribute.name}`;
      const value = attribute.options ? attribute.options.join(', ') : '';
      params.set(key, value);
    });
  }

  // Zdjęcia
  if (Array.isArray(product.images)) {
    product.images.forEach((image, index) => {
      params.set(`Image ${index + 1}`, image.src || '');
    });
  } else {
    logEvent(
      'fetchAllProductParameters',
      'INFO',
      null,
      'Brak zdjęć w danych produktu.',
    );
  }

  return params;
}

/**
 * D1.4. Aktualizuje zakładkę "woo_parametry".
 */
function updateWooParametersSheet(params) {
  if (!(params instanceof Map)) {
    logEvent(
      'updateWooParametersSheet',
      'Error',
      null,
      'Nieprawidłowe dane parametrów. Oczekiwano obiektu Map.',
    );
    return;
  }

  const sheet =
    SpreadsheetApp.openById(SHEET_ID).getSheetByName(WOO_PARAMETERS_SHEET);
  const existingData = sheet.getDataRange().getValues();
  const existingParams = new Set(existingData.map((row) => row[0]));

  const newData = [];
  params.forEach((value, key) => {
    if (!existingParams.has(key)) {
      newData.push([key, '', value]);
    }
  });

  if (newData.length > 0) {
    sheet
      .getRange(existingData.length + 1, 1, newData.length, 3)
      .setValues(newData);
  }

  logEvent(
    'updateWooParametersSheet',
    'SUCCESS',
    null,
    'WooCommerce parameters updated successfully.',
  );
}

/**
 * D1.5. Dodaje brakujące kolumny w zakładce "produkty".
 */
function addMissingColumnsToProducts(params) {
  const productSheet =
    SpreadsheetApp.openById(SHEET_ID).getSheetByName(PRODUCTS_SHEET);
  const paramSheet =
    SpreadsheetApp.openById(SHEET_ID).getSheetByName(WOO_PARAMETERS_SHEET);
  const headers = productSheet.getDataRange().getValues()[0];
  const wooParams = paramSheet.getDataRange().getValues();

  if (!wooParams || wooParams.length < 2) {
    logEvent(
      'addMissingColumnsToProducts',
      'Error',
      null,
      'Brak danych w zakładce "woo_parametry".',
    );
    return;
  }

  const activeParams = wooParams
    .slice(1)
    .filter((row) => String(row[1]).toLowerCase() === 'true')
    .map((row) => row[0]);
  const newColumns = activeParams.filter((param) => !headers.includes(param));

  if (newColumns.length > 0) {
    newColumns.forEach((column, index) => {
      const colIndex = headers.length + index + 1;
      productSheet.getRange(1, colIndex).setValue(column);
    });

    logEvent(
      'addMissingColumnsToProducts',
      'SUCCESS',
      null,
      `Dodano nowe kolumny: ${newColumns.join(', ')}`,
    );
  } else {
    logEvent(
      'addMissingColumnsToProducts',
      'INFO',
      null,
      'Brak nowych kolumn do dodania.',
    );
  }
}

/**
 * D1.6. Wywołuje pełną aktualizację parametrów na podstawie ID produktu.
 */
function updateAllWooCommerceParameters() {
  const params = fetchAllProductParameters();
  if (params instanceof Map) {
    updateWooParametersSheet(params);
    addMissingColumnsToProducts(params);
    logEvent(
      'updateAllWooCommerceParameters',
      'SUCCESS',
      null,
      'WooCommerce parameters updated successfully.',
    );
  }
}

/* ===================== EXPORT PRODUKTÓW D2 ===================== */

/**
 * D2.1. Pobiera ID produktu na podstawie SKU.
 * Zwraca ID produktu, jeśli istnieje w WooCommerce, w przeciwnym razie null.
 */
function getProductIdBySku(sku) {
  const settings = getSettings();
  const url = `${settings.url_json}?sku=${sku}`;
  const response = sendToWooCommerce(url, 'get');

  if (response.status === 200 && response.data.length > 0) {
    return response.data[0].id;
  }

  logEvent('getProductIdBySku', 'Error', sku, 'Nie udało się pobrać produktu.');
  return null;
}

/**
 * D2.2. Dodaje nowy produkt do WooCommerce.
 * Wymaga minimalnych parametrów: SKU, nazwy, ceny.
 */
function addNewProduct(row, rowNumber) {
  const settings = getSettings();
  const productSheet =
    SpreadsheetApp.openById(SHEET_ID).getSheetByName(PRODUCTS_SHEET);
  const headers = productSheet.getDataRange().getValues()[0];
  const requiredFields = ['sku', 'name', 'regular_price'];
  for (const field of requiredFields) {
    if (!row[headers.indexOf(field)]) {
      logEvent(
        'addNewProduct',
        'Error',
        null,
        `Brak wymaganego pola: ${field} w wierszu ${rowNumber}`,
      );
      return;
    }
  }
  const payload = {
    sku: row[headers.indexOf('sku')],
    name: row[headers.indexOf('name')],
    regular_price: row[headers.indexOf('regular_price')].toString(),
  };

  const url = settings.url_json;
  const response = sendToWooCommerce(url, 'post', payload);

  if (response.status === 201) {
    const productId = response.data.id;
    productSheet
      .getRange(rowNumber, headers.indexOf('id') + 1)
      .setValue(productId);
    logEvent('addNewProduct', 'SUCCESS', productId, 'Produkt został dodany.');
  } else {
    logEvent(
      'addNewProduct',
      'Error',
      null,
      `Nie udało się dodać produktu. Status: ${response.status}`,
    );
  }
}

/**
 * D2.3. Eksportuje zmiany parametrów produktów do WooCommerce.
 * Aktualizuje istniejące produkty na podstawie ich ID.
 */
() => {
  const productSheet =
    SpreadsheetApp.openById(SHEET_ID).getSheetByName(PRODUCTS_SHEET);
  const data = productSheet.getDataRange().getValues();
  const headers = data[0];

  data.slice(1).forEach((row, index) => {
    const rowNumber = index + 2;
    const productId = row[headers.indexOf('id')];

    if (!productId) {
      logEvent(
        'exportProductChanges',
        'Error',
        null,
        `Produkt w wierszu ${rowNumber} nie posiada ID.`,
      );
      return;
    }

    const payload = {};
    headers.forEach((header, colIndex) => {
      if (header !== 'stock_quantity' && row[colIndex]) {
        payload[header] = row[colIndex];
      }
    });

    const url = `${getSettings().url_json}/${productId}`;
    const response = sendToWooCommerce(url, 'put', payload);

    if (response.status === 200) {
      logEvent(
        'exportProductChanges',
        'SUCCESS',
        productId,
        'Zaktualizowano produkt.',
      );
    } else {
      logEvent(
        'exportProductChanges',
        'Error',
        productId,
        `Nie udało się zaktualizować produktu. Status: ${response.status}`,
      );
    }
  });
};

/**
 * D2.4. Eksportuje zdjęcia produktów do WooCommerce.
 * Przyjmuje ID produktu i tablicę URL zdjęć.
 */
function exportProductImages(productId, images) {
  if (!images || images.length === 0) {
    logEvent(
      'exportProductImages',
      'Error',
      productId,
      'Lista zdjęć jest pusta.',
    );
    return;
  }

  const payload = { images: images.map((src) => ({ src })) };
  const url = `${getSettings().url_json}/${productId}`;
  const response = sendToWooCommerce(url, 'put', payload);

  if (response.status === 200) {
    logEvent(
      'exportProductImages',
      'SUCCESS',
      productId,
      'Zaktualizowano zdjęcia produktu.',
    );
  } else {
    logEvent(
      'exportProductImages',
      'Error',
      productId,
      `Nie udało się zaktualizować zdjęć. Status: ${response.status}`,
    );
  }
}

/**
 * D2.5. Zaplanowany eksport produktów.
 * Eksportuje produkty, które mają ustawioną datę aktywacji oferty.
 */
function scheduledProductExport() {
  const now = new Date();
  const productSheet =
    SpreadsheetApp.openById(SHEET_ID).getSheetByName(PRODUCTS_SHEET);
  const data = productSheet.getDataRange().getValues();
  const headers = data[0];

  data.slice(1).forEach((row, index) => {
    const dateIndex = headers.indexOf('date_on_sale_from');
    if (dateIndex !== -1) {
      const saleDate = new Date(row[dateIndex]);
      if (saleDate <= now) {
        const sku = row[headers.indexOf('sku')];
        if (sku) {
          const productId = getProductIdBySku(sku);
          if (productId) {
            exportProductChanges(productId);
          } else {
            addNewProduct(row, index + 2);
          }
        }
      }
    }
  });

  logEvent(
    'scheduledProductExport',
    'SUCCESS',
    null,
    'Zaplanowany eksport zakończony.',
  );
}

/* ===================== SYNCHRONIZACJA STANÓW MAGAZYNOWYCH D3 ===================== */

/**
 * D3.1. Aktualizacja historii stanów magazynowych
 * W zakładce magazyn zapisuje datę, godzinę i stan po zmianie.
 */
function updateInventoryHistory(sku, newStock, source) {
  const sheet =
    SpreadsheetApp.openById(SHEET_ID).getSheetByName(INVENTORY_SHEET);
  const data = sheet.getDataRange().getDisplayValues();
  const headers = data[0];

  let skuIndex = headers.indexOf(sku);
  if (skuIndex === -1) {
    // Dodaj nowe SKU jako nową kolumnę
    skuIndex = headers.length;
    sheet.getRange(1, skuIndex + 1).setValue(sku);
  }

  // Znajdź pierwsze wolne wiersze w tej kolumnie
  let row = 2;
  while (sheet.getRange(row, skuIndex + 1).getValue() !== '') {
    row++;
  }

  const timestamp = new Date().toLocaleString('pl-PL', {
    timeZone: 'Europe/Warsaw',
  });
  sheet.getRange(row, skuIndex + 1).setValue(newStock); // Zapisz stan
  sheet.getRange(row + 1, skuIndex + 1).setValue(`${timestamp} (${source})`); // Zapisz datę i źródło
}

/**
 * D3.2. Synchronizacja stanów magazynowych między Google Sheet a WooCommerce
 * Bilansuje stan w Google Sheet i WooCommerce z initial_stock.
 */
function syncStockBalanced() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    logEvent('Sync skipped', null, 'Another sync process is running.');
    return;
  }

  try {
    const settings = getSettings();
    const sheet =
      SpreadsheetApp.openById(SHEET_ID).getSheetByName(PRODUCTS_SHEET);
    const data = sheet.getDataRange().getDisplayValues();
    const headers = data[0];

    const idIndex = headers.indexOf('id');
    const stockIndex = headers.indexOf('stock_quantity');
    const initialStockIndex = headers.indexOf('initial_stock');
    const lastSyncIndex = headers.indexOf('last_sync');

    if ([idIndex, stockIndex, initialStockIndex, lastSyncIndex].includes(-1)) {
      logEvent(
        'Error',
        null,
        'Missing required columns: id, stock_quantity, initial_stock, or last_sync.',
      );
      return;
    }

    data.slice(1).forEach((row, i) => {
      const productId = row[idIndex];
      const sheetStock = parseInt(row[stockIndex], 10) || 0;
      const initialStock = parseInt(row[initialStockIndex], 10) || 0;

      if (!productId) {
        logEvent('Missing product ID', null, `Row ${i + 2} has no product ID.`);
        return;
      }

      const url = `${settings.base_url}/wp-json/wc/v3/products/${productId}`;
      const response = sendToWooCommerce(url, 'get');

      if (response.status === 200) {
        const wooStock = parseInt(response.data.stock_quantity, 10) || 0;

        if (sheetStock !== initialStock && wooStock === initialStock) {
          const updateResponse = sendToWooCommerce(url, 'put', {
            stock_quantity: sheetStock,
          });
          if (updateResponse.status === 200) {
            sheet.getRange(i + 2, initialStockIndex + 1).setValue(sheetStock);
            sheet
              .getRange(i + 2, lastSyncIndex + 1)
              .setValue(
                `${new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' })} (G->W)`,
              );
            updateInventoryHistory(response.data.sku, sheetStock, 'G->W');
            logEvent(
              'Stock updated',
              productId,
              `WooCommerce updated to ${sheetStock}`,
            );
          }
        } else if (wooStock !== initialStock) {
          const delta = sheetStock - initialStock;
          const newStock = wooStock + delta;

          sheet.getRange(i + 2, stockIndex + 1).setValue(newStock);
          sheet.getRange(i + 2, initialStockIndex + 1).setValue(newStock);
          sheet
            .getRange(i + 2, lastSyncIndex + 1)
            .setValue(
              `${new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' })} (W->G)`,
            );
          updateInventoryHistory(response.data.sku, newStock, 'W->G');
          const updateResponse = sendToWooCommerce(url, 'put', {
            stock_quantity: newStock,
          });
          if (updateResponse.status === 200) {
            logEvent(
              'Balanced stock updated',
              productId,
              `New stock: ${newStock}`,
            );
          }
        }
      }
    });
  } catch (error) {
    logEvent('Sync error', null, error.message);
  } finally {
    lock.releaseLock();
  }
}

/**
 * D3.3. Synchronizacja stanów magazynowych po zmianie w Google Sheet
 * Pyta o stan w WooCommerce o bilansuje stan o ew. zmianę.
 */
function onEdit(e) {
  if (!e || !e.source) {
    logEvent('Error', null, 'onEdit triggered without proper event object.');
    return;
  }

  const sheet = e.source.getActiveSheet();
  if (sheet.getName() === PRODUCTS_SHEET) {
    syncStockBalanced();
  }
}

/**
 * D3.4. Harmonogram synchronizacji stanów magazynowych.
 * Ustawia częstotliwość sesji synchronizacji między Google Sheet a WooCommerce.
 */
function scheduleSync() {
  const allTriggers = ScriptApp.getProjectTriggers();
  const alreadyScheduled = allTriggers.some(
    (trigger) => trigger.getHandlerFunction() === 'syncStockBalanced',
  );
  if (!alreadyScheduled) {
    ScriptApp.newTrigger('syncStockBalanced')
      .timeBased()
      .everyMinutes(2)
      .create();
    logEvent('Scheduled', null, 'Sync stock scheduled every 2 minutes.');
  }
}
