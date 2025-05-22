/**
 * @import {Extension, Handle as FromMarkdown} from 'mdast-util-from-markdown'
 * @import {Options, Handle as ToMarkdown} from 'mdast-util-to-markdown'
 */

import { nodes, tokens } from '@mdsv/constants';

/**
 * Handle tokens related to Svelte's element and component syntax inside a
 * MDAST.
 *
 * @returns {Extension}
 */
export function mdsvElementFromMarkdown() {
  return {
    canContainEols: [
      tokens.flowElement,
      tokens.flowElementTag,
      tokens.textElementTag,
    ],
    enter: {
      [tokens.textElementTag]: enterTextElementTag,
      [tokens.flowElementTag]: enterFlowElementTag,
    },
    exit: {
      [tokens.textElementTag]: exitElementTag,
      [tokens.flowElementTag]: exitElementTag,
    },
  };
}

/** @returns {Options} */
export function mdsvElementToMarkdown() {
  return {
    handlers: {
      [nodes.textElement]: handleElementTag,
      [nodes.flowElement]: handleElementTag,
    },
  };
}

/** @type {FromMarkdown} */
function enterTextElementTag(token) {
  // this.enter(
  //   { type: nodes.textElement, value: this.sliceSerialize(token) },
  //   token,
  // );
}

/** @type {FromMarkdown} */
function enterFlowElementTag(token) {
  // this.enter(
  //   { type: nodes.flowElement, value: this.sliceSerialize(token) },
  //   token,
  // );
}

/** @type {FromMarkdown} */
function exitElementTag(token) {
  this.exit(token);
}

/** @type {ToMarkdown} */
function handleElementTag(node) {
  return node.value;
}
