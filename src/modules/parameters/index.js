import dotenv from 'dotenv';
import { fetchAllProductParameters } from './fetch.js';
import { updateWooParametersSheet } from './update.js';

dotenv.config();

export function getParameters() {
  const params = fetchAllProductParameters();
  updateWooParametersSheet(params);
  return params;
}

globalThis.getParameters = getParameters;
