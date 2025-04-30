/** @import {State, Tokenizer, TokenizeContext, Extension, HtmlExtension} from 'micromark-util-types' */

import { types } from 'common/constants';
import { assert } from 'common/utils';
import { codes } from 'micromark-util-symbol';
import { factoryPlainExpression } from './utils/plain-expression.js';

/** @returns {Extension} */
export function svelteExpression() {
  return {
    text: {
      [codes.leftCurlyBrace]: {
        name: types.expression,
        tokenize,
        concrete: true,
      },
    },
  };
}

/** @returns {HtmlExtension} */
export function htmlSvelteExpression() {
  return {
    exit: {
      [types.expression](token) {
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
    effects.enter(types.expression);
    effects.enter(types.marker);
    effects.consume(code);
    effects.exit(types.marker);
    return noTag;
  }

  /**
   * ```markdown
   *  > | {
   *       ^
   * ```
   *
   * @type {State}
   */
  function noTag(code) {
    // bail out on tags and block tags
    if (
      code === codes.atSign ||
      code === codes.numberSign ||
      code === codes.colon
    ) {
      return nok(code);
    }
    effects.enter(types.expressionValue);
    return factoryPlainExpression(effects, end, nok)(code);
  }

  /**
   * ```markdown
   *  > | {...}
   *          ^
   * ```
   *
   * @type {State}
   */
  function end(code) {
    assert(code === codes.rightCurlyBrace, 'expected `}`');
    effects.exit(types.expressionValue);
    effects.enter(types.marker);
    effects.consume(code);
    effects.exit(types.marker);
    effects.exit(types.expression);
    return ok(code);
  }
}
