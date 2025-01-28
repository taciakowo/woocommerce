let categoryCache = null; // Cache dla kategorii produktów

export function fetchProductCategories() {
  if (categoryCache) {
    return categoryCache; // Zwróć kategorie z cache, jeśli dostępne
  }

  const settings = getSettings();
  const url = `${settings.base_url}/wp-json/wc/v3/products/categories?per_page=100`;
  const response = sendToWooCommerce(url, 'get');

  if (response.status !== 200) {
    logEvent('fetchProductCategories', 'Error', null, 'Nie udało się pobrać kategorii produktów.');
    return [];
  }

  categoryCache = response.data.map(category => `category: ${category.name}`);
  return categoryCache;
}
