/** @import {State, Tokenizer, TokenizeContext, Extension, HtmlExtension} from 'micromark-util-types' */

import { constructs, types } from '@mdsv/constants';
import { assert } from '@mdsv/utils';
import { codes } from 'micromark-util-symbol';
import { factoryExpression } from './utils/factory-expression.js';

/** @returns {Extension} */
export function mdsvExpression() {
  return {
    text: {
      [codes.leftCurlyBrace]: {
        concrete: true,
        name: constructs.expressionText,
        tokenize: tokenizeExpressionText,
      },
    },
  };
}

/** @returns {HtmlExtension} */
export function mdsvExpressionHtml() {
  return {
    exit: {
      [types.expression](token) {
        this.raw(this.sliceSerialize(token));
      },
    },
  };
}

/** @type {Tokenizer} */
function tokenizeExpressionText(effects, ok, nok) {
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
    return factoryExpression(effects, end, nok, codes.rightCurlyBrace)(code);
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
