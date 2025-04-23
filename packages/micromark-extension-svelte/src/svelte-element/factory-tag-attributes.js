/** @import {State, Code, Effects, Tokenizer} from 'micromark-util-types'; */

import { types } from 'common/constants';
import { assert } from 'common/utils';
import { factorySpace } from 'micromark-factory-space';
import {
  markdownLineEnding,
  markdownLineEndingOrSpace,
  markdownSpace,
} from 'micromark-util-character';
import { codes, types as coreTypes } from 'micromark-util-symbol';
import { factoryPlainExpression } from '../factory-plain-expression.js';

/**
 * @param {Effects} effects
 * @param {State} ok
 * @param {State} nok
 */
function factoryTagAttribute(effects, ok, nok) {
  return start;

  /** @type {State} */
  function start(code) {
    effects.enter(types.svelteElementTagAttribute);
    return attribute(code);
  }

  /** @type {State} */
  function attribute(code) {
    if (code === codes.slash || code === codes.greaterThan) {
      effects.exit(types.svelteElementTagAttribute);
      return ok(code);
    }
    if (code === codes.eof) {
      return nok(code);
    }
    if (markdownLineEndingOrSpace(code)) {
      effects.exit(types.svelteElementTagAttribute);
      return ok(code);
    }
    if (code === codes.quotationMark || code === codes.apostrophe) {
      return contentQuoted(code);
    }
    if (code === codes.leftCurlyBrace) {
      effects.consume(code);
      return factoryPlainExpression(effects, contentBracedEnd, nok);
    }
    effects.consume(code);
  }

  /** @param {Code} brace */
  function contentBracedEnd(brace) {
    assert(brace === codes.rightCurlyBrace, 'expected "}"');
    effects.consume(brace);
    return attribute;
  }

  /**
   * @param {typeof codes.quotationMark | typeof codes.apostrophe} quote
   * @returns {State}
   */
  function contentQuoted(quote) {
    return startQuote;

    /** @type {State} */
    function startQuote(code) {
      assert(code === quote, `expected "${quote}"`);
      effects.consume(code);
      return insideQuote;
    }

    /** @param {Code} brace */
    function quoteBraceEnd(brace) {
      assert(brace === codes.rightCurlyBrace, 'expected "}"');
      return insideQuote;
    }

    /** @type {State} */
    function insideQuote(code) {
      if (code === quote) {
        effects.consume(code);
        return attribute;
      }
      if (code === codes.eof || markdownLineEnding(code)) {
        return nok;
      }
      if (code === codes.leftCurlyBrace) {
        return factoryPlainExpression(effects, quoteBraceEnd, nok)(code);
      }
      effects.consume(code);
      return insideQuote;
    }
  }
}

/**
 * Creates a state machine for parsing tag content (attributes, etc.) until
 * ending '>'. Handles whitespace, quotes, and Svelte expressions {...}.
 *
 * @param {Effects} effects
 * @param {(
 *   code: typeof codes.greaterThan | typeof codes.slash,
 * ) => State | undefined} ok
 * @param {State} nok State.
 */
export function factoryTagAttributes(effects, ok, nok) {
  return content;

  /** @type {State} */
  function content(code) {
    if (code === codes.slash || code === codes.greaterThan) {
      return ok(code);
    }
    if (code === codes.eof) {
      return nok;
    }
    if (markdownLineEnding(code)) {
      effects.consume(code);
      return content;
    }
    if (markdownSpace(code)) {
      return factorySpace(effects, content, coreTypes.whitespace)(code);
    }
    return factoryTagAttribute(effects, content, nok);
  }
}
