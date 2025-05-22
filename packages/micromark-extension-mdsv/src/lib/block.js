/** @import {State, Tokenizer, TokenizeContext, Extension, HtmlExtension, Token} from 'micromark-util-types' */

import { tokens } from '@mdsv/constants';
import { factorySpace } from 'micromark-factory-space';
import { markdownLineEnding, markdownSpace } from 'micromark-util-character';
import { codes, types as coreTypes } from 'micromark-util-symbol';
import { factoryBlockTag } from './utils/factory-block-tag.js';

/**
 * Basic syntax for lax support of svelte block tags (`{#open}`, `{:branch}`,
 * `{/close}`). Does not validate block keywords.
 *
 * @returns {Extension}
 */
export function mdsvBlock() {
  return {
    disable: {
      null: ['codeIndented'],
    },
    flow: {
      [codes.leftCurlyBrace]: {
        concrete: true,
        name: tokens.flowBlock,
        tokenize: tokenizeBlockFlow,
      },
    },
    text: {
      [codes.leftCurlyBrace]: {
        concrete: true,
        name: tokens.textBlock,
        tokenize: tokenizeBlockText,
      },
    },
  };
}

/** @returns {HtmlExtension} */
export function mdsvBlockHtml() {
  return {
    exit: {
      [tokens.flowBlockTag](token) {
        this.raw(this.sliceSerialize(token));
      },
      [tokens.textBlockTag](token) {
        this.raw(this.sliceSerialize(token));
      },
    },
  };
}

/** @type {Tokenizer} */
function tokenizeBlockFlow(effects, ok, nok) {
  return start;

  /**
   * ```markdown
   * > | {#
   *     ^
   * > | {:
   *     ^
   * > | {/
   *     ^
   * ```
   *
   * @type {State}
   */
  function start(code) {
    return factoryBlockTag(
      effects,
      endAfter,
      nok,
      tokens.flowBlockTag,
      tokens.marker,
      tokens.blockTagValue,
      tokens.blockTagSymbol,
      tokens.blockTagName,
      tokens.blockTagExpression,
    )(code);
  }

  /**
   * ```markdown
   * > | {...}
   *         ^
   * ```
   *
   * @type {State}
   */
  function endAfter(code) {
    if (code === codes.eof) {
      return ok(code);
    }
    if (markdownSpace(code)) {
      return factorySpace(effects, endAfter, coreTypes.whitespace)(code);
    }
    if (markdownLineEnding(code)) {
      return ok(code);
    }
    return nok(code);
  }
}

/** @type {Tokenizer} */
function tokenizeBlockText(effects, ok, nok) {
  return start;

  /**
   * ```markdown
   * > | {#...}
   *     ^
   * > | {:...}
   *     ^
   * > | {/...}
   *     ^
   * ```
   *
   * @type {State}
   */
  function start(code) {
    return factoryBlockTag(
      effects,
      ok,
      nok,
      tokens.textBlockTag,
      tokens.marker,
      tokens.blockTagValue,
      tokens.blockTagSymbol,
      tokens.blockTagName,
      tokens.blockTagExpression,
    )(code);
  }
}
