// src/modules/category.js
import { logEvent } from "../utils/logger.js";
import { getSettings } from "../utils/settings.js";
import { sendToWooCommerce } from "../utils/api.js";

let categoryCache = null;

export function fetchProductCategories() {
  if (categoryCache) return categoryCache;

  const settings = getSettings();
  const url = `${settings.WOO_BASE_URL}/wp-json/wc/v3/products/categories?per_page=100`;
  const response = sendToWooCommerce(url, "get");

  if (response.status !== 200) {
    logEvent("fetchProductCategories", "Error", null, "Nie udało się pobrać kategorii produktów.");
    return [];
  }

  categoryCache = response.data.map((category) => `category: ${category.name}`);
  return categoryCache;
}

globalThis.fetchProductCategories = fetchProductCategories;