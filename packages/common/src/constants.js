/** Token and node types related to Svelte syntaxes in markdown. */
export const types = /** @type const */ ({
  marker: 'svelteMarker',
  rawData: 'svelteRawData',
  expression: 'svelteExpression',
  expressionValue: 'svelteExpressionValue',
  tag: 'svelteTag',
  tagMarker: 'svelteTagMarker',
  tagName: 'svelteTagName',
  tagValue: 'svelteTagValue',
  block: 'svelteBlock',
  blockTag: 'svelteBlockTag',
  blockTagMarker: 'svelteBlockTagMarker',
  blockTagName: 'svelteBlockTagName',
  blockTagValue: 'svelteBlockTagValue',
  svelteFlow: 'svelteFlow',
  svelteFlowTag: 'svelteFlowTag',
  svelteFlowTagMarker: 'svelteFlowTagMarker',
  svelteFlowTagName: 'svelteFlowTagName',
  svelteFlowTagAttribute: 'svelteFlowTagAttribute',
  svelteText: 'svelteText',
  svelteTextTag: 'svelteTextTag',
  svelteTextTagMarker: 'svelteTextTagMarker',
  svelteTextTagName: 'svelteTextTagName',
  svelteTextTagAttribute: 'svelteTextTagAttribute',
});

/**
 * HTML element names for elements that do not have end tags nor should have
 * self-closing syntax (lax enforcement).
 *
 * @see https://developer.mozilla.org/en-US/docs/Glossary/Void_element
 */
export const htmlVoidNames = [
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
];
