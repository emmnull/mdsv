import { frontmatter } from 'micromark-extension-frontmatter';
import {
  combineExtensions,
  combineHtmlExtensions,
} from 'micromark-util-combine-extensions';
import type { Extension, HtmlExtension } from 'micromark-util-types';
import { mdsvBlock, mdsvBlockHtml } from './lib/block.js';
import { mdsvElement, mdsvElementHtml } from './lib/element.js';
import { mdsvExpression, mdsvExpressionHtml } from './lib/expression.js';
import { mdsvTag, mdsvTagHtml } from './lib/tag.js';
import './micromark.d.ts';

export function mdsv(): Extension {
  return combineExtensions([
    frontmatter(),
    mdsvExpression(),
    mdsvTag(),
    mdsvBlock(),
    mdsvElement(),
  ]);
}

export function mdsvHtml(): HtmlExtension {
  return combineHtmlExtensions([
    mdsvExpressionHtml(),
    mdsvTagHtml(),
    mdsvBlockHtml(),
    mdsvElementHtml(),
  ]);
}
