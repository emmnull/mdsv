/** @import {Extension, HtmlExtension} from 'micromark-util-types' */

import {
  combineExtensions,
  combineHtmlExtensions,
} from 'micromark-util-combine-extensions';
import { htmlMdsvBlock, mdsvBlock } from './lib/mdsv-block.js';
import { htmlMdsvElement, mdsvElement } from './lib/mdsv-element.js';
import { htmlMdsvExpression, mdsvExpression } from './lib/mdsv-expression.js';
import { htmlMdsvTag, mdsvTag } from './lib/mdsv-tag.js';

/** @returns {Extension} */
export function mdsv() {
  return combineExtensions([
    mdsvExpression(),
    mdsvTag(),
    mdsvBlock(),
    mdsvElement(),
  ]);
}

/** @returns {HtmlExtension} */
export function htmlMdsv() {
  return combineHtmlExtensions([
    htmlMdsvExpression(),
    htmlMdsvTag(),
    htmlMdsvBlock(),
    htmlMdsvElement(),
    htmlMdsvTag(),
  ]);
}
