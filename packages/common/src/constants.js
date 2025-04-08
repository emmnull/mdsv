/** Token and node types related to svelte. */
export const types = /** @type const */ ({
  /** `{` and `}` */
  svelteMarker: 'svelteMarker',
  /** `{expression}` */
  svelteExpression: 'svelteExpression',
  /** `expression` */
  svelteExpressionValue: 'svelteExpressionValue',
  /** `{@name value}` */
  svelteTag: 'svelteTag',
  /** `@` */
  svelteTagSymbol: 'svelteTagSymbol',
  /** `name` */
  svelteTagName: 'svelteTagName',
  /** `value` */
  svelteTagValue: 'svelteTagValue',
  /** `{#name value}content{/name}` */
  svelteBlock: 'svelteBlock',
  /** `{#name value}` */
  svelteBlockOpen: 'svelteBlockOpen',
  /** `#` or `/` */
  svelteBlockMarker: 'svelteBlockMarker',
  /** `name` */
  svelteBlockName: 'svelteBlockName',
  /** `value` */
  svelteBlockValue: 'svelteBlockValue',
  /** `content` */
  svelteBlockContent: 'svelteBlockContent',
  /** `{:name value}` */
  svelteBlockBranch: 'svelteBlockBranch',
  /** `:` */
  svelteBlockBranchMarker: 'svelteBlockBranchMarker',
  /** `name` */
  svelteBlockBranchName: 'svelteBlockBranchName',
  /** `value` */
  svelteBlockBranchValue: 'svelteBlockBranchValue',
  /** `<name value>content</name>` */
  svelteElement: 'svelteElement',
  /** `<` and `>` */
  svelteElementMarker: 'svelteElementMarker',
  /** `name` */
  svelteElementName: 'svelteElementName',
  /** `content` */
  svelteElementContent: 'svelteElementContent',
});
