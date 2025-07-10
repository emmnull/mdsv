/**
 * @import {Extension, Handle as FromMarkdown} from 'mdast-util-from-markdown'
 * @import {Options, Handle as ToMarkdown} from 'mdast-util-to-markdown'
 */

import { tokens } from '@mdsv/constants';
import { ok } from 'devlop';

/**
 * Handle tokens related to Svelte's tag syntax inside a MDAST.
 *
 * @returns {Extension}
 */
export function mdsvTagFromMarkdown() {
  return {
    canContainEols: [tokens.flowTag, tokens.textTag],
    enter: {
      [tokens.textTag]: enterTextTag,
      [tokens.flowTag]: enterFlowTag,
      [tokens.tagValue]: enterTagValue,
    },
    exit: {
      [tokens.textTag]: exitTag,
      [tokens.flowTag]: exitTag,
    },
  };
}

/** @returns {Options} */
export function mdsvTagToMarkdown() {
  return {
    handlers: {
      [tokens.textTag]: handleTextTag,
      [tokens.flowTag]: handleFlowTag,
    },
  };
}

/** @type {FromMarkdown} */
function enterTextTag(token) {
  this.enter(
    {
      type: tokens.textTag,
      value: '',
    },
    token,
  );
}

/** @type {FromMarkdown} */
function enterFlowTag(token) {
  this.enter(
    {
      type: tokens.flowTag,
      value: '',
    },
    token,
  );
}

/** @type {FromMarkdown} */
function exitTag(token) {
  this.exit(token);
}

/** @type {FromMarkdown} */
function enterTagValue(token) {
  const tagNode = this.stack[this.stack.length - 1];
  ok(
    tagNode.type === tokens.flowTag || tagNode.type === tokens.textTag,
    'expected to find at tag node',
  );
  tagNode.value = this.sliceSerialize(token);
}

/** @type {ToMarkdown} */
function handleTextTag(node) {
  ok(
    typeof node.value === 'string' && node.value.startsWith('@'),
    'expected tag node value to start with `@` tag symbol',
  );
  return '{' + node.value + '}';
}

/** @type {ToMarkdown} */
function handleFlowTag(node) {
  ok(
    typeof node.value === 'string' && node.value.startsWith('@'),
    'expected tag node value to start with `@` tag symbol',
  );
  return '{' + node.value + '}';
}
