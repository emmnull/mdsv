/** @import {Extension, HtmlExtension} from 'micromark-util-types' */

import {
  combineExtensions,
  combineHtmlExtensions,
} from 'micromark-util-combine-extensions';
import { htmlSvelteBlock, svelteBlock } from './lib/svelte-block.js';
import {
  htmlSvelteExpression,
  svelteExpression,
} from './lib/svelte-expression.js';
import { htmlSvelteFlow, svelteFlow } from './lib/svelte-flow.js';
import { htmlSvelteTag, svelteTag } from './lib/svelte-tag.js';
import { svelteText } from './lib/svelte-text.js';

/** @returns {Extension} */
export function svelte() {
  return combineExtensions([
    svelteExpression(),
    svelteTag(),
    svelteBlock(),
    svelteFlow(),
    svelteText(),
  ]);
}

/** @returns {HtmlExtension} */
export function htmlSvelte() {
  return combineHtmlExtensions([
    htmlSvelteExpression(),
    htmlSvelteTag(),
    htmlSvelteBlock(),
    htmlSvelteFlow(),
    htmlSvelteTag(),
  ]);
}
