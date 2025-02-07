// src/modules/parameters/fetch.js
import { logEvent } from "../../utils/logger.js";
import { getProductById } from "../products.js";
import { fetchProductCategories } from "../category.js";

/**
 * Pobiera wszystkie parametry produktu, kategorie, atrybuty i metadane.
 * @returns {Map<string, string>} - Mapa zawierająca parametry produktu.
 */
export function fetchAllProductParameters() {
  const product = getProductById();
  const categories = fetchProductCategories();
  const params = new Map();

  Object.entries(product).forEach(([key, value]) => {
    params.set(key, typeof value === "object" ? JSON.stringify(value) : value || "");
  });

  categories.forEach((category) => params.set(category, ""));

  if (Array.isArray(product.attributes)) {
    product.attributes.forEach((attribute) => {
      const key = `attribute: ${attribute.name}`;
      const value = attribute.options ? attribute.options.join(", ") : "";
      params.set(key, value);
    });
  }

  if (Array.isArray(product.images)) {
    product.images.forEach((image, index) => {
      params.set(`Image ${index + 1}`, image.src || "");
    });
  } else {
    logEvent("fetchAllProductParameters", "INFO", null, "Brak zdjęć w danych produktu.");
  }

  return params;
}

globalThis.fetchAllProductParameters = fetchAllProductParameters;