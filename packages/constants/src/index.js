export const constructs = /** @type {const} */ ({
  /**
   * ```markdown
   *   |
   * > | {...}
   *     ^^^^^
   *   |
   * ```
   */
  expressionFlow: 'svelteExpressionFlow',
  /**
   * ```markdown
   * > | ...{...}...
   *        ^^^^^
   * ```
   */
  expressionText: 'svelteExpressionText',
  /**
   * ```markdown
   *   |
   * > | {@...}
   *     ^^^^^^
   *   |
   * ```
   */
  tagFlow: 'svelteTagFlow',
  /**
   * ```markdown
   * > | ...{@...}....
   *        ^^^^^^
   * ```
   */
  tagText: 'svelteTagText',
  /**
   * ```markdown
   *   |
   * > | {#...}
   *     ^^^^^^
   *   |
   *
   *   |
   * > | {:...}
   *     ^^^^^^
   *   |
   *
   *   |
   * > | {/...}
   *     ^^^^^^
   *   |
   * ```
   */
  blockFlow: 'svelteBlockFlow',
  /**
   * ```markdown
   * > | ...{#...}...
   *        ^^^^^^
   *
   * > | ...{:...}...
   *        ^^^^^^
   *
   * > | ...{/...}...
   *        ^^^^^^
   * ```
   */
  blockText: 'svelteBlockText',
  /**
   * ```markdown
   *   |
   * > | <foo>
   *     ^^^^^
   *   |
   * ```
   */
  elementFlow: 'svelteFlow',
  /**
   * ```markdown
   * > | ...<foo>...
   *        ^^^^^
   * ```
   */
  elementText: 'svelteFlow',
});

/** Token and node types related to Svelte syntaxes in markdown. */
export const types = /** @type const */ ({
  /**
   * ```markdown
   * > | {...}
   *     ^   ^
   * ```
   */
  marker: 'svelteMarker',
  /**
   * ```markdown
   * > | {...}
   *     ^^^^^
   * ```
   */
  expression: 'svelteExpression',
  /**
   * ```markdown
   * > | {...}
   *      ^^^
   * ```
   */
  expressionValue: 'svelteExpressionValue',
  /**
   * ```markdown
   * > | {@...}
   *     ^^^^^^
   * ```
   */
  tag: 'svelteTag',
  /**
   * ```markdown
   * > | {@...}
   *      ^
   * ```
   */
  tagMarker: 'svelteTagMarker',
  /**
   * ```markdown
   * > | {@foo}
   *       ^^^
   * ```
   */
  tagName: 'svelteTagName',
  /**
   * ```markdown
   * > | {@foo ...}
   *           ^^^
   * ```
   */
  tagValue: 'svelteTagValue',
  /**
   * ```markdown
   * > | {#...}
   *     ^^^^^^
   * > | ...
   *     ^^^
   * > | {/...}
   *     ^^^^^^
   * ```
   */
  block: 'svelteBlock',
  /**
   * ```markdown
   * > | {#...}
   *     ^^^^^^
   *
   * > | {:...}
   *     ^^^^^^
   *
   * > | {/...}
   *     ^^^^^^
   * ```
   */
  blockTag: 'svelteBlockTag',
  /**
   * ```markdown
   * > | {#...}
   *      ^
   *
   * > | {:...}
   *      ^
   *
   * > | {/...}
   *      ^
   * ```
   */
  blockTagMarker: 'svelteBlockTagMarker',
  /**
   * ```markdown
   * > | {#foo}
   *       ^^^
   *
   * > | {:foo}
   *       ^^^
   *
   * > | {/foo}
   *       ^^^
   * ```
   */
  blockTagName: 'svelteBlockTagName',
  /**
   * ```markdown
   * > | {#foo ...}
   *           ^^^
   *
   * > | {:foo ...}
   *           ^^^
   *
   * > | {/foo ...}
   *           ^^^
   * ```
   */
  blockTagValue: 'svelteBlockTagValue',
  /**
   * ```markdown
   * > | <foo>
   *     ^^^^^
   * ```
   */
  elementTag: 'svelteElementTag',
  /**
   * ```markdown
   * > | <foo>
   *     ^   ^
   * ```
   */
  elementTagMarker: 'svelteElementTagMarker',
  /**
   * ```markdown
   * > | <foo>
   *      ^^^
   * ```
   */
  elementTagName: 'svelteElementTagName',
  /**
   * ```markdown
   * > | <foo bar>
   *          ^^^
   * ```
   */
  elementTagAttribute: 'svelteElementTagAttribute',
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

/** HTML element names for elements that can be replaced with custom components. */
export const htmlCustomizableNames = /** @type {const} */ ([
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'blockquote',
  'ul',
  'ol',
  'li',
  'a',
  'strong',
  'em',
  'br',
  'hr',
  'img',
  'code', // inline code
  'pre', // fenced code wrapper
]);
