/// <reference path="./mdast.d.ts" />

/**
 * @import {Extension} from 'mdast-util-from-markdown'
 * @import {Options} from 'mdast-util-to-markdown'
 */

import { mdsvBlockFromMarkdown, mdsvBlockToMarkdown } from './lib/block.js';
import {
  mdsvElementFromMarkdown,
  mdsvElementToMarkdown,
} from './lib/element.js';
import {
  mdsvExpressionFromMarkdown,
  mdsvExpressionToMarkdown,
} from './lib/expression.js';
import { mdsvMetadataFromMarkdown } from './lib/metadata.js';
import { mdsvTagFromMarkdown, mdsvTagToMarkdown } from './lib/tag.js';

/** @returns {Extension[]} */
export function mdsvFromMarkdown() {
  return [
    mdsvExpressionFromMarkdown(),
    mdsvTagFromMarkdown(),
    mdsvBlockFromMarkdown(),
    mdsvElementFromMarkdown(),
    mdsvMetadataFromMarkdown(),
  ];
}

/** @returns {Options} */
export function mdsvToMarkdown() {
  return {
    extensions: [
      mdsvExpressionToMarkdown(),
      mdsvTagToMarkdown(),
      mdsvBlockToMarkdown(),
      mdsvElementToMarkdown(),
    ],
  };
}
