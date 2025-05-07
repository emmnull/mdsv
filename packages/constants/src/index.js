export const constructs = /** @type {const} */ ({
  /**
   * ```markdown
   *   |
   * > | {...}
   *     ^^^^^
   *   |
   * ```
   */
  expressionFlow: 'mdsvExpressionFlow',
  /**
   * ```markdown
   * > | ...{...}...
   *        ^^^^^
   * ```
   */
  expressionText: 'mdsvExpressionText',
  /**
   * ```markdown
   *   |
   * > | {@...}
   *     ^^^^^^
   *   |
   * ```
   */
  atTagFlow: 'mdsvAtTagFlow',
  /**
   * ```markdown
   * > | ...{@...}....
   *        ^^^^^^
   * ```
   */
  atTagText: 'mdsvAtTagText',
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
  blockFlow: 'mdsvBlockFlow',
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
  blockText: 'mdsvBlockText',
  /**
   * ```markdown
   *   |
   * > | <foo>
   *     ^^^^^
   *   |
   * ```
   */
  elementFlow: 'mdsvFlow',
  /**
   * ```markdown
   * > | ...<foo>...
   *        ^^^^^
   * ```
   */
  elementText: 'mdsvFlow',
});

/** Token and node types related to Svelte syntaxes in markdown. */
export const types = /** @type const */ ({
  /**
   * ```markdown
   * > | {...}
   *     ^   ^
   * ```
   */
  marker: 'mdsvMarker',
  /**
   * ```markdown
   * > | {...}
   *     ^^^^^
   * ```
   */
  expression: 'mdsvExpression',
  /**
   * ```markdown
   * > | {...}
   *      ^^^
   * ```
   */
  expressionValue: 'mdsvExpressionValue',
  /**
   * ```markdown
   * > | {@...}
   *     ^^^^^^
   * ```
   */
  atTag: 'mdsvAtTag',
  /**
   * ```markdown
   * > | {@...}
   *      ^
   * ```
   */
  atTagMarker: 'mdsvTagMarker',
  /**
   * ```markdown
   * > | {@foo}
   *       ^^^
   * ```
   */
  atTagName: 'mdsvTagName',
  /**
   * ```markdown
   * > | {@foo ...}
   *           ^^^
   * ```
   */
  atTagValue: 'mdsvTagValue',
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
  block: 'mdsvBlock',
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
  blockTag: 'mdsvBlockTag',
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
  blockTagMarker: 'mdsvBlockTagMarker',
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
  blockTagName: 'mdsvBlockTagName',
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
  blockTagValue: 'mdsvBlockTagValue',
  /**
   * ```markdown
   * > | <foo>
   *     ^^^^^
   * ```
   */
  elementTag: 'mdsvElementTag',
  /**
   * ```markdown
   * > | <foo>
   *     ^   ^
   * ```
   */
  elementTagMarker: 'mdsvElementTagMarker',
  /**
   * ```markdown
   * > | <foo>
   *      ^^^
   * ```
   */
  elementTagName: 'mdsvElementTagName',
  /**
   * ```markdown
   * > | <foo bar>
   *          ^^^
   * ```
   */
  elementTagAttribute: 'mdsvElementTagAttribute',
  /**
   * ```markdown
   *   | <script>
   * > | const foo = bar;
   *     ^^^^^^^^^^^^^^^^
   *   | </script>
   * ```
   */
  elementRaw: 'mdsvElementRaw',
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
