/** @import {State, Tokenizer, TokenizeContext, Extension, HtmlExtension} from 'micromark-util-types' */

import { types } from '@mdsv/constants';
import { factorySpace } from 'micromark-factory-space';
import { markdownLineEnding, markdownSpace } from 'micromark-util-character';
import { codes, types as coreTypes } from 'micromark-util-symbol';
import { factoryTag } from './utils/factory-tag.js';

/** @returns {Extension} */
export function mdsvTag() {
  return {
    flow: {
      [codes.leftCurlyBrace]: {
        name: types.tagFlow,
        tokenize: tokenizeTagFlow,
        concrete: true,
      },
    },
    text: {
      [codes.leftCurlyBrace]: {
        name: types.tagText,
        tokenize: tokenizeTagText,
        concrete: true,
      },
    },
  };
}

/** @returns {HtmlExtension} */
export function htmlMdsvTag() {
  return {
    exit: {
      [types.tag](token) {
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
    return factoryTag(
      effects,
      endAfter,
      nok,
      types.tag,
      types.marker,
      types.tagMarker,
      types.tagName,
      types.tagValue,
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
    return factoryTag(
      effects,
      ok,
      nok,
      types.tag,
      types.marker,
      types.tagMarker,
      types.tagName,
      types.tagValue,
    )(code);
  }
}
