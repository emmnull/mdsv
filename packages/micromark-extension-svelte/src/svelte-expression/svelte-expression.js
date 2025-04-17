/** @import {State, Tokenizer, TokenizeContext, Extension, HtmlExtension} from 'micromark-util-types' */

import { types } from 'common/constants';
import { assert } from 'common/utils';
import { codes } from 'micromark-util-symbol';
import { createPlainExpression } from '../plain-expression.js';

/** @returns {Extension} */
export function svelteExpression() {
  return {
    text: {
      [codes.leftCurlyBrace]: {
        name: types.svelteExpression,
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
      [types.svelteExpression](token) {
        this.raw(this.sliceSerialize(token));
      },
    },
  };
}

/**
 * @this {TokenizeContext}
 * @type {Tokenizer}
 */
function tokenize(effects, ok, nok) {
  return start;

  /** @type {State} */
  function start(code) {
    assert(code === codes.leftCurlyBrace, 'expected "{"');
    effects.enter(types.svelteExpression);
    effects.enter(types.svelteMarker);
    effects.consume(code);
    effects.exit(types.svelteMarker);
    return noTag;
  }

  /** @type {State} */
  function noTag(code) {
    // bail out on tags and block tags
    if (
      code === codes.atSign ||
      code === codes.numberSign ||
      code === codes.colon
    ) {
      return nok;
    }
    effects.enter(types.svelteExpressionValue);
    return createPlainExpression(effects, end, nok)(code);
  }

  /** @param {typeof codes.rightCurlyBrace} brace */
  function end(brace) {
    assert(brace === codes.rightCurlyBrace, 'expected "}"');
    effects.exit(types.svelteExpressionValue);
    effects.enter(types.svelteMarker);
    effects.consume(brace);
    effects.exit(types.svelteMarker);
    effects.exit(types.svelteExpression);
    return ok;
  }
}
