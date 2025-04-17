/** @import {Tokenizer, State, Code, Effects, Construct, Previous} from 'micromark-util-types'; */

import { assert } from 'common/utils';
import { factorySpace } from 'micromark-factory-space';
import {
  markdownLineEnding,
  markdownLineEndingOrSpace,
} from 'micromark-util-character';
import { codes, types as coreTypes } from 'micromark-util-symbol';
import { createPlainExpression } from '../plain-expression.js';

/**
 * Creates a state machine for parsing tag content (attributes, etc.) until
 * ending '>'. Handles whitespace, quotes, and Svelte expressions {...}.
 *
 * @param {Effects} effects
 * @param {(
 *   code: typeof codes.greaterThan | typeof codes.slash,
 * ) => State | undefined} close
 * @param {State} nok State.
 */
export function createTagContent(effects, close, nok) {
  return content;

  /** @type {State} */
  function content(code) {
    if (code === codes.slash || code === codes.greaterThan) {
      return close(code);
    }
    if (code === codes.eof) {
      return nok;
    }
    if (markdownLineEndingOrSpace(code)) {
      return factorySpace(effects, content, coreTypes.whitespace)(code);
    }
    if (code === codes.quotationMark || code === codes.apostrophe) {
      return contentQuoted(code);
    }
    if (code === codes.leftCurlyBrace) {
      effects.consume(code);
      return createPlainExpression(effects, contentBracedEnd, nok);
    }
    effects.consume(code);
    return content;
  }

  /** @param {Code} brace */
  function contentBracedEnd(brace) {
    assert(brace === codes.rightCurlyBrace, 'expected "}"');
    effects.consume(brace);
    return content;
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
        return content;
      }
      if (code === codes.eof || markdownLineEnding(code)) {
        return nok;
      }
      if (code === codes.leftCurlyBrace) {
        return createPlainExpression(effects, quoteBraceEnd, nok)(code);
      }
      effects.consume(code);
      return insideQuote;
    }
  }
}
