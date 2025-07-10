/**
 * @import {Extension, Handle as FromMarkdown, CompileContext, Token} from 'mdast-util-from-markdown'
 * @import {Options, Handle as ToMarkdown} from 'mdast-util-to-markdown'
 */

import { nodes, tokens } from '@mdsv/constants';
import { ok } from 'devlop';

// /**
//  * @param {string} name
//  * @param {string} value
//  * @param {boolean} [branch]
//  * @param {any[]} [children=[]] Default is `[]`
//  */
// function textBlock(name, value, branch, children = []) {
//   return {
//     type: nodes.textBlock,
//     name,
//     value,
//     branch,
//     children,
//   };
// }

// /**
//  * @param {string} name
//  * @param {string} value
//  * @param {boolean} [branch]
//  * @param {any[]} [children=[]] Default is `[]`
//  */
// function flowBlock(name, value, branch, children = []) {
//   return {
//     type: nodes.flowBlock,
//     name,
//     value,
//     branch,
//     children,
//   };
// }

/**
 * Handle tokens related to Svelte's block syntax inside a MDAST.
 *
 * @returns {Extension}
 */
export function mdsvBlockFromMarkdown() {
  return {
    canContainEols: [tokens.flowBlockTag, tokens.textBlockTag],
    enter: {
      [tokens.textBlockTag]: enterTextBlockTag,
      [tokens.flowBlockTag]: enterFlowBlockTag,
      [tokens.blockTagName]: enterBlockTagName,
      [tokens.blockTagExpression]: enterBlockTagExpression,
    },
    exit: {
      [tokens.textBlockTag]: exitBlockTag,
      [tokens.flowBlockTag]: exitBlockTag,
    },
  };
}

/** @returns {Options} */
export function mdsvBlockToMarkdown() {
  return {
    handlers: {},
  };
}

/**
 * Close pending branches when relevant.
 *
 * @this {CompileContext}
 * @param {Token} token
 */
function exitPending(token) {
  if (token._blockClose || token._blockBranch) {
    const branchIndex = this.stack.findLastIndex(
      (node) =>
        (node.type === nodes.textBlock || node.type === nodes.flowBlock) &&
        node.branch,
    );
    const blockIndex = this.stack.findLastIndex(
      (node) =>
        (node.type === nodes.textBlock || node.type === nodes.flowBlock) &&
        !node.branch,
    );
    if (branchIndex > blockIndex) {
      while (this.stack.length > branchIndex) {
        this.exit(token);
      }
    }
  }
}

/** @type {FromMarkdown} */
function enterTextBlockTag(token) {
  exitPending.call(this, token);
  if (!token._blockClose) {
    this.enter(
      {
        type: nodes.textBlock,
        name: '',
        children: [],
        ...(token._blockBranch ? { branch: true } : undefined),
      },
      token,
    );
  }
}

/** @type {FromMarkdown} */
function enterFlowBlockTag(token) {
  exitPending.call(this, token);
  if (!token._blockClose) {
    this.enter(
      {
        type: nodes.flowBlock,
        name: '',
        children: [],
        ...(token._blockBranch ? { branch: true } : undefined),
      },
      token,
    );
  }
}

/** @type {FromMarkdown} */
function enterBlockTagName(token) {
  if (!token._blockClose) {
    const node = this.stack[this.stack.length - 1];
    ok(node.type === nodes.flowBlock || node.type === nodes.textBlock);
    node.name = this.sliceSerialize(token);
  }
}

/** @type {FromMarkdown} */
function enterBlockTagExpression(token) {
  if (!token._blockClose) {
    const node = this.stack[this.stack.length - 1];
    ok(node.type === nodes.flowBlock || node.type === nodes.textBlock);
    node.expression = this.sliceSerialize(token);
  }
}

/** @type {FromMarkdown} */
function exitBlockTag(token) {
  if (token._blockClose) {
    this.exit(token);
  }
}
