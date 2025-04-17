/** @import {State, Tokenizer, Extension, HtmlExtension} from 'micromark-util-types' */

import {
  combineExtensions,
  combineHtmlExtensions,
} from 'micromark-util-combine-extensions';
import { htmlSvelteBlock, svelteBlock } from './svelte-block.js';
import { htmlSvelteExpression, svelteExpression } from './svelte-expression.js';
import { htmlSvelteTag, svelteTag } from './svelte-tag.js';

/** @returns {Extension} */
export function svelte() {
  return combineExtensions([svelteBlock(), svelteTag(), svelteExpression()]);
}

/** @returns {HtmlExtension} */
export function htmlSvelte() {
  return combineHtmlExtensions([
    htmlSvelteBlock(),
    htmlSvelteTag(),
    htmlSvelteExpression(),
  ]);
}
