/** @import {Extension, HtmlExtension} from 'micromark-util-types' */

import {
  combineExtensions,
  combineHtmlExtensions,
} from 'micromark-util-combine-extensions';
import { mdsvBlock, mdsvBlockHtml } from './lib/mdsv-block.js';
import { mdsvElement, mdsvElementHtml } from './lib/mdsv-element.js';
import { mdsvExpression, mdsvExpressionHtml } from './lib/mdsv-expression.js';
import { mdsvAtTag, mdsvAtTagHtml } from './lib/mdsv-tag.js';

/**
 * @param {object} [options]
 * @returns {Extension}
 */
export function mdsv(options) {
  return combineExtensions([
    // frontmatter(options?.frontmatter),
    mdsvExpression(),
    mdsvAtTag(),
    mdsvBlock(),
    mdsvElement(),
  ]);
}

/**
 * @param {object} [options]
 * @param {Options} options.frontmatter
 * @returns {HtmlExtension}
 */
export function mdsvHtml(options) {
  return combineHtmlExtensions([
    // frontmatterHtml(options?.frontmatter),
    mdsvExpressionHtml(),
    mdsvAtTagHtml(),
    mdsvBlockHtml(),
    mdsvElementHtml(),
  ]);
}
