// src/modules/parameters/index.js
import { fetchAllProductParameters } from "./fetch.js";
import { updateWooParametersSheet } from "./update.js";

export function getParameters() {
  const params = fetchAllProductParameters();
  updateWooParametersSheet(params);
  return params;
}

globalThis.getParameters = getParameters;