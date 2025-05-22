/** @import {State, Tokenizer, TokenizeContext, Extension, HtmlExtension} from 'micromark-util-types' */

import { tokens } from '@mdsv/constants';
import { ok as assert } from 'devlop';
import { codes } from 'micromark-util-symbol';
import { factoryExpression } from './utils/factory-expression.js';

/** @returns {Extension} */
export function mdsvExpression() {
  return {
    text: {
      [codes.leftCurlyBrace]: {
        concrete: true,
        name: tokens.textExpression,
        tokenize: tokenizeExpressionText,
      },
    },
  };
}

/** @returns {HtmlExtension} */
export function mdsvExpressionHtml() {
  return {
    exit: {
      [tokens.textExpression](token) {
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
    effects.enter(tokens.textExpression);
    effects.enter(tokens.marker);
    effects.consume(code);
    effects.exit(tokens.marker);
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
    effects.enter(tokens.expressionValue);
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
    effects.exit(tokens.expressionValue);
    effects.enter(tokens.marker);
    effects.consume(code);
    effects.exit(tokens.marker);
    effects.exit(tokens.textExpression);
    return ok(code);
  }
}
