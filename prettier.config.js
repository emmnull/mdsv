/**
 * @type {import('prettier').Config}
 */
export default {
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',
  quoteProps: 'as-needed',
  proseWrap: 'preserve',
  jsdocDescriptionWithDot: true,
  jsdocPreferCodeFences: true,
  jsdocKeepUnParseAbleExampleIndent: true,
  jsdocTagsOrder: '{"this": 0, "example":100}',
  plugins: ['prettier-plugin-jsdoc', 'prettier-plugin-packagejson'],
};
