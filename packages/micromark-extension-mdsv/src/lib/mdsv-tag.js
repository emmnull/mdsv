/** @import {State, Tokenizer, TokenizeContext, Extension, HtmlExtension} from 'micromark-util-types' */

import { constructs, types } from '@mdsv/constants';
import { factorySpace } from 'micromark-factory-space';
import { markdownLineEnding, markdownSpace } from 'micromark-util-character';
import { codes, types as coreTypes } from 'micromark-util-symbol';
import { factoryAtTag } from './utils/factory-at-tag.js';

/** @returns {Extension} */
export function mdsvAtTag() {
  return {
    flow: {
      [codes.leftCurlyBrace]: {
        name: constructs.atTagFlow,
        tokenize: tokenizeTagFlow,
        concrete: true,
      },
    },
    text: {
      [codes.leftCurlyBrace]: {
        name: constructs.atTagText,
        tokenize: tokenizeTagText,
        concrete: true,
      },
    },
  };
}

/** @returns {HtmlExtension} */
export function mdsvAtTagHtml() {
  return {
    exit: {
      [types.atTag](token) {
        this.raw(this.sliceSerialize(token));
      },
    },
  };
}

/** @type {Tokenizer} */
function tokenizeTagFlow(effects, ok, nok) {
  return start;

  /**
   * ```markdown
   *  > | {
   *      ^
   * ```
   *
   * @type {State}
   */
  function start(code) {
    return factoryAtTag(
      effects,
      endAfter,
      nok,
      types.atTag,
      types.marker,
      types.atTagMarker,
      types.atTagName,
      types.atTagValue,
    )(code);
  }

  /** @type {State} */
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
function tokenizeTagText(effects, ok, nok) {
  return start;

  /**
   * ```markdown
   *  > | {
   *      ^
   * ```
   *
   * @type {State}
   */
  function start(code) {
    return factoryAtTag(
      effects,
      ok,
      nok,
      types.atTag,
      types.marker,
      types.atTagMarker,
      types.atTagName,
      types.atTagValue,
    )(code);
  }
}
