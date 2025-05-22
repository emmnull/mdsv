/** Token and node types related to Svelte syntaxes in markdown. */
export const tokens = /** @type const */ ({
  /**
   * ```markdown
   * > | {...}
   *     ^   ^
   * ```
   */
  marker: 'mdsvMarker',
  /**
   * ```markdown
   * > | ...{...}...
   *        ^^^^^
   * ```
   */
  textExpression: 'mdsvTextExpression',
  /**
   * ```markdown
   * > | {...}
   *      ^^^
   * ```
   */
  expressionValue: 'mdsvExpressionValue',
  /**
   * ```markdown
   *   |
   * > | {@...}
   *     ^^^^^^
   *   |
   * ```
   */
  flowTag: 'mdsvFlowTag',
  /**
   * ```markdown
   * > | ...{@...}....
   *        ^^^^^^
   * ```
   */
  textTag: 'mdsvTextTag',
  /**
   * ```markdown
   * > | {@...}
   *      ^
   * ```
   */
  tagSymbol: 'mdsvTagSymbol',
  /**
   * ```markdown
   * > | {@foo}
   *       ^^^
   * ```
   */
  tagKeyword: 'mdsvTagKeyword',
  /**
   * ```markdown
   * > | {@foo ...}
   *           ^^^
   * ```
   */
  tagExpression: 'mdsvTagExpression',
  /**
   * ```markdown
   * > | {@foo ...}
   *      ^^^^^^^^
   * ```
   */
  tagValue: 'mdsvTagValue',
  /**
   * ```markdown
   *   |
   * > | {#...}
   *     ^^^^^^
   * > | ...
   *     ^^^
   * > | {/...}
   *     ^^^^^^
   *   |
   * ```
   */
  flowBlock: 'mdsvFlowBlock',
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
  flowBlockTag: 'mdsvFlowBlockTag',
  /**
   * ```markdown
   * > | ...{#...}...{/...}...
   *        ^^^^^^^^^^^^^^^
   * ```
   */
  textBlock: 'mdsvTextBlock',
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
  textBlockTag: 'mdsvTextBlockTag',
  /**
   * ```markdown
   * > | ...{#...}...
   *         ^
   *
   * > | ...{:...}...
   *         ^
   *
   * > | ...{/...}...
   *         ^
   * ```
   */
  blockTagSymbol: 'mdsvBlockTagSymbol',
  /**
   * ```markdown
   * > | ...{#foo}...
   *          ^^^
   *
   * > | ...{:foo}...
   *          ^^^
   *
   * > | ...{/foo}...
   *          ^^^
   * ```
   */
  blockTagName: 'mdsvBlockTagName',
  /**
   * ```markdown
   * > | ...{#foo ...}...
   *              ^^^
   *
   * > | ...{:foo ...}...
   *              ^^^
   *
   * > | ...{/foo ...}...
   *              ^^^
   * ```
   */
  blockTagExpression: 'mdsvBlockTagExpression',
  /**
   * ```markdown
   * > | ...{#foo ...}...
   *         ^^^^^^^^
   *
   * > | ...{:foo ...}...
   *         ^^^^^^^^
   *
   * > | ...{/foo ...}...
   *         ^^^^^^^^
   * ```
   */
  blockTagValue: 'mdsvBlockTagValue',
  /**
   * ```markdown
   *   |
   * > | <foo>
   *     ^^^^^
   * > | ...
   *     ^^^
   * > | </foo>
   *     ^^^^^^
   * ```
   */
  flowElement: 'mdsvFlowElement',
  /**
   * ```markdown
   *   |
   * > | <foo>
   *     ^^^^^
   *   |
   * ```
   */
  flowElementTag: 'mdsvFlowElementTag',
  /**
   * ```markdown
   * > | ...<foo>...
   *        ^^^^^
   * ```
   */
  textElement: 'mdsvTextElement',
  /**
   * ```markdown
   * > | <foo>
   *     ^^^^^
   * ```
   */
  textElementTag: 'mdsvTextElementTag',
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
   *
   * > | <foo {bar}>
   *          ^^^^^
   *
   * > | <foo bar=baz>
   *          ^^^^^^^
   *
   * > | <foo bar:baz>
   *          ^^^^^^^
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

export const nodes = /** @type {const} */ ({
  textExpression: 'mdsvTextExpression',
  textTag: 'mdsvTextTag',
  flowTag: 'mdsvFlowTag',
  textBlock: 'mdsvTextBlock',
  flowBlock: 'mdsvFlowBlock',
  textElement: 'mdsvTextElement',
  flowElement: 'mdsvFlowElement',
  textRaw: 'mdsvTextRaw',
  flowRaw: 'mdsvFlowRaw',
});

export const blockTagTypes = /** @type {const} */ (['open', 'branch', 'close']);

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
