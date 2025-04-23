/** @import {State, Tokenizer, TokenizeContext, Extension, HtmlExtension} from 'micromark-util-types' */

import { types } from 'common/constants';
import { assert } from 'common/utils';
import {
  asciiAlpha,
  asciiAlphanumeric,
  markdownLineEnding,
  markdownSpace,
} from 'micromark-util-character';
import { codes } from 'micromark-util-symbol';
import { factoryPlainExpression } from '../factory-plain-expression.js';

/** @returns {Extension} */
export function svelteTag() {
  return {
    flow: {
      [codes.leftCurlyBrace]: {
        name: types.svelteTag,
        tokenize,
        concrete: true,
      },
    },
    text: {
      [codes.leftCurlyBrace]: {
        name: types.svelteTag,
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
      [types.svelteTag](token) {
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
    effects.enter(types.svelteTag);
    effects.enter(types.svelteMarker);
    effects.consume(code);
    effects.exit(types.svelteMarker);
    return tagMarker;
  }

  /** @type {State} */
  function tagMarker(code) {
    if (code !== codes.atSign) {
      return nok;
    }
    effects.enter(types.svelteTagMarker);
    effects.consume(code);
    effects.exit(types.svelteTagMarker);
    return nameStart;
  }

  /** @type {State} */
  function nameStart(code) {
    if (code === codes.eof || !asciiAlpha(code)) {
      return nok;
    }
    effects.enter(types.svelteTagName);
    effects.consume(code);
    return name;
  }

  /** @type {State} */
  function name(code) {
    if (asciiAlphanumeric(code)) {
      effects.consume(code);
      return name;
    }
    effects.exit(types.svelteTagName);
    return afterName(code);
  }

  /** @type {State} */
  function afterName(code) {
    if (code === codes.eof) {
      return nok;
    }
    if (code === codes.rightCurlyBrace) {
      return end(code);
    }
    if (markdownSpace(code) || markdownLineEnding(code)) {
      effects.consume(code);
      return afterName;
    }
    effects.enter(types.svelteTagValue);
    return factoryPlainExpression(effects, afterValue, nok)(code);
  }

  /** @param {typeof codes.rightCurlyBrace} brace */
  function afterValue(brace) {
    effects.exit(types.svelteTagValue);
    return end(brace);
  }

  /** @param {typeof codes.rightCurlyBrace} brace */
  function end(brace) {
    assert(brace === codes.rightCurlyBrace, 'expected "}"');
    effects.enter(types.svelteMarker);
    effects.consume(brace);
    effects.exit(types.svelteMarker);
    effects.exit(types.svelteTag);
    return ok;
  }
}
