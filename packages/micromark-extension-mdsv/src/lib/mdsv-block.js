/** @import {State, Tokenizer, TokenizeContext, Extension, HtmlExtension, Token} from 'micromark-util-types' */

import { constructs, types } from '@mdsv/constants';
import { factorySpace } from 'micromark-factory-space';
import { markdownLineEnding, markdownSpace } from 'micromark-util-character';
import { codes, types as coreTypes } from 'micromark-util-symbol';
import { factoryBlockTag } from './utils/factory-block-tag.js';

/** @returns {Extension} */
export function mdsvBlock() {
  return {
    disable: {
      null: ['codeIndented'],
    },
    flow: {
      [codes.leftCurlyBrace]: {
        concrete: true,
        name: constructs.blockFlow,
        tokenize: tokenizeBlockFlow,
      },
    },
    text: {
      [codes.leftCurlyBrace]: {
        concrete: true,
        name: constructs.blockText,
        tokenize: tokenizeBlockText,
      },
    },
  };
}

/** @returns {HtmlExtension} */
export function htmlMdsvBlock() {
  return {
    exit: {
      [types.blockTag](token) {
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
      types.blockTag,
      types.marker,
      types.blockTagMarker,
      types.blockTagName,
      types.blockTagValue,
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
      types.blockTag,
      types.marker,
      types.blockTagMarker,
      types.blockTagName,
      types.blockTagValue,
    )(code);
  }
}
