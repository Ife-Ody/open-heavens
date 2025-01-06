/** @type {import('prettier').Config} */
export const endOfLine = "lf";
export const semi = false;
export const singleQuote = false;
export const tabWidth = 2;
export const trailingComma = "es5";
export const importOrderSeparation = false;
export const importOrderSortSpecifiers = true;
export const importOrderBuiltinModulesToTop = true;
export const importOrderParserPlugins = ["typescript", "jsx", "decorators-legacy"];
export const importOrderMergeDuplicateImports = true;
export const importOrderCombineTypeAndValueImports = true;
export const plugins = ["@ianvs/prettier-plugin-sort-imports"];
export const printWidth = 120;