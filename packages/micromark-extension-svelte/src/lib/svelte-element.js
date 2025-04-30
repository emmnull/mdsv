/** @import {Extension, HtmlExtension, Tokenizer, State, Code, Effects, TokenizeContext, Construct, Previous, Token} from 'micromark-util-types' */

import {
  combineExtensions,
  combineHtmlExtensions,
} from 'micromark-util-combine-extensions';

import {
  htmlSvelteFlowElement,
  svelteFlowElement,
} from './svelte-flow-element.js';

/**
 * Micromark extension to replace core HTML parsing with Svelte-aware parsing.
 *
 * @returns {Extension}
 */
export function svelteElement() {
  return combineExtensions([
    svelteFlowElement(),
    // svelteTextElement()
  ]);
}

/**
 * HTML extension to output parsed Svelte elements and raw data without
 * escaping.
 *
 * @returns {HtmlExtension}
 */
export function htmlSvelteElement() {
  return combineHtmlExtensions([
    htmlSvelteFlowElement(),
    // htmlSvelteTextElement(),
  ]);
}
