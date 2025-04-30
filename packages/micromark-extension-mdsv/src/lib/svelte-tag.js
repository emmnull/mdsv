/** @import {State, Tokenizer, TokenizeContext, Extension, HtmlExtension} from 'micromark-util-types' */

import { types } from '@mdsv/constants';
import { assert } from '@mdsv/utils';
import {
  asciiAlpha,
  asciiAlphanumeric,
  markdownLineEnding,
  markdownSpace,
} from 'micromark-util-character';
import { codes } from 'micromark-util-symbol';
import { factoryPlainExpression } from './utils/plain-expression.js';

/** @returns {Extension} */
export function svelteTag() {
  return {
    flow: {
      [codes.leftCurlyBrace]: {
        name: types.tag,
        tokenize,
        concrete: true,
      },
    },
    text: {
      [codes.leftCurlyBrace]: {
        name: types.tag,
        tokenize,
        concrete: true,
      },
    },
  };
}

/** @returns {HtmlExtension} */
export function htmlSvelteTag() {
  return {
    exit: {
      [types.tag](token) {
        this.raw(this.sliceSerialize(token));
      },
    },
  };
}

/** @type {Tokenizer} */
function tokenize(effects, ok, nok) {
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
    assert(code === codes.leftCurlyBrace, 'expected `{`');
    effects.enter(types.tag);
    effects.enter(types.marker);
    effects.consume(code);
    effects.exit(types.marker);
    return tagMarker;
  }

  /**
   * ```markdown
   *  > | {@
   *       ^
   * ```
   *
   * @type {State}
   */
  function tagMarker(code) {
    if (code !== codes.atSign) {
      return nok(code);
    }
    effects.enter(types.tagMarker);
    effects.consume(code);
    effects.exit(types.tagMarker);
    return nameStart;
  }

  /**
   * ```markdown
   *  > | {@x
   *        ^
   * ```
   *
   * @type {State}
   */
  function nameStart(code) {
    if (code === codes.eof || !asciiAlpha(code)) {
      return nok(code);
    }
    effects.enter(types.tagName);
    effects.consume(code);
    return name;
  }

  /**
   * ```markdown
   *  > | {@xy...
   *         ^
   * ```
   *
   * @type {State}
   */
  function name(code) {
    if (asciiAlphanumeric(code)) {
      effects.consume(code);
      return name;
    }
    effects.exit(types.tagName);
    return afterName(code);
  }

  /**
   * ```markdown
   *  > | {@xyz
   *           ^
   * ```
   *
   * @type {State}
   */
  function afterName(code) {
    if (code === codes.eof) {
      return nok(code);
    }
    if (code === codes.rightCurlyBrace) {
      return end(code);
    }
    if (markdownSpace(code) || markdownLineEnding(code)) {
      effects.consume(code);
      return afterName;
    }
    effects.enter(types.tagValue);
    return factoryPlainExpression(effects, afterValue, nok)(code);
  }

  /**
   * ```markdown
   *  > | {@xyz ...}
   *               ^
   * ```
   *
   * @type {State}
   */
  function afterValue(code) {
    assert(code === codes.rightCurlyBrace, 'expected `}`');
    effects.exit(types.tagValue);
    return end(code);
  }

  /**
   * ```markdown
   *  > | {@xyz}
   *           ^
   *  > | {@xyz   }
   *              ^
   * ```
   *
   * @type {State}
   */
  function end(code) {
    assert(code === codes.rightCurlyBrace, 'expected `}`');
    effects.enter(types.marker);
    effects.consume(code);
    effects.exit(types.marker);
    effects.exit(types.tag);
    return ok(code);
  }
}
