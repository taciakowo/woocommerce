import '../../utils/dotenv.config.js';
import { fetchAllProductParameters } from './fetch.js';
import { updateWooParametersSheet } from './update.js';

dotenv.config();

export function getParameters() {
  const params = fetchAllProductParameters();
  updateWooParametersSheet(params);
  return params;
}

globalThis.getParameters = getParameters;
