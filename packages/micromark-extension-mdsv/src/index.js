/// <reference path="./micromark.d.ts" />

/** @import {Extension, HtmlExtension} from 'micromark-util-types' */

import { frontmatter } from 'micromark-extension-frontmatter';
import {
  combineExtensions,
  combineHtmlExtensions,
} from 'micromark-util-combine-extensions';
import { mdsvBlock, mdsvBlockHtml } from './lib/block.js';
import { mdsvElement, mdsvElementHtml } from './lib/element.js';
import { mdsvExpression, mdsvExpressionHtml } from './lib/expression.js';
import { mdsvTag, mdsvTagHtml } from './lib/tag.js';

/**
 * @param {object} [options]
 * @returns {Extension}
 */
export function mdsv(options) {
  return combineExtensions([
    frontmatter(),
    mdsvExpression(),
    mdsvTag(),
    mdsvBlock(),
    mdsvElement(),
  ]);
}

/**
 * @param {object} [options]
 * @param {object} options.frontmatter
 * @returns {HtmlExtension}
 */
export function mdsvHtml(options) {
  return combineHtmlExtensions([
    mdsvExpressionHtml(),
    mdsvTagHtml(),
    mdsvBlockHtml(),
    mdsvElementHtml(),
  ]);
}
