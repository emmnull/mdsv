/**
 * @import {Extension, Handle as FromMarkdown} from 'mdast-util-from-markdown'
 * @import {Options, Handle as ToMarkdown} from 'mdast-util-to-markdown'
 */

import { tokens } from '@mdsv/constants';
import { ok as assert } from 'devlop';

/**
 * Handle tokens related to Svelte's expression syntax inside a MDAST.
 *
 * @returns {Extension}
 */
export function mdsvExpressionFromMarkdown() {
  return {
    canContainEols: [tokens.textExpression],
    enter: {
      [tokens.textExpression]: enterTextExpression,
      [tokens.expressionValue]: enterExpressionValue,
    },
    exit: {
      [tokens.textExpression]: exitTextExpression,
    },
  };
}

/** @returns {Options} */
export function mdsvExpressionToMarkdown() {
  return {
    handlers: {
      [tokens.textExpression]: handleTextExpression,
    },
  };
}

/** @type {FromMarkdown} */
function enterTextExpression(token) {
  this.enter(
    {
      type: tokens.textExpression,
      value: '',
    },
    token,
  );
}

/** @type {FromMarkdown} */
function exitTextExpression(token) {
  this.exit(token);
}

/** @type {ToMarkdown} */
function handleTextExpression(node) {
  return '{' + node.value + '}';
}

/** @type {FromMarkdown} */
function enterExpressionValue(token) {
  const node = this.stack[this.stack.length - 1];
  assert(
    node.type === tokens.textExpression,
    'expected expression node to be found in stack',
  );
  node.value = this.sliceSerialize(token);
}
