import globals from "globals";
import pluginJs from "@eslint/js";
import js from "@eslint/js";
import googleappsscript from "eslint-plugin-googleappsscript";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["**/*.js"], languageOptions: {sourceType: "commonjs"}},
  {languageOptions: { globals: {...globals.browser, ...globals.node} }},
  pluginJs.configs.recommended,
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...googleappsscript.environments.global,
      },
    },
    plugins: {
      googleappsscript,
    },
    rules: {
      "no-undef": "off",
      "googleappsscript/no-undef": "off",
    },
  },
];