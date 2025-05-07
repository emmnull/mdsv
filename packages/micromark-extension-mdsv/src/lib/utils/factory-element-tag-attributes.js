/** @import {State, Code, Effects, Tokenizer, TokenType} from 'micromark-util-types'; */

import { assert } from '@mdsv/utils';
import {
  markdownLineEnding,
  markdownLineEndingOrSpace,
} from 'micromark-util-character';
import { codes } from 'micromark-util-symbol';
import { factoryExpression } from './factory-expression.js';

/**
 * Creates a state machine for parsing tag content (attributes, directives,
 * etc.) until ending '>'. Handles whitespace, quotes, Svelte expressions {...}
 * and pre-closing '/'.
 *
 * ```markdown
 * > | <foo ...>
 *          ^^^^
 * > | <foo .../>
 *          ^^^^
 * ```
 *
 * @param {Effects} effects
 * @param {State} ok State transitioned to after encountering a closing bracket
 *   or slash.
 * @param {State} nok State transitioned to if invalid syntax.
 * @param {TokenType} attributeType
 */
export function factoryElementTagAttributes(effects, ok, nok, attributeType) {
  /**
   * @type {typeof codes.apostrophe
   *   | typeof codes.quotationMark
   *   | undefined}
   */
  let quote;

  return start;

  /**
   * ```markdown
   * > | <foo x
   *          ^
   * ```
   *
   * @type {State}
   */
  function start(code) {
    if (code === codes.slash || code === codes.greaterThan) {
      return ok(code);
    }
    if (code === codes.eof) {
      return nok(code);
    }
    if (markdownLineEndingOrSpace(code)) {
      effects.consume(code);
      return start;
    }
    return attributeStart(code);
  }

  /**
   * ```markdown
   * > | <foo x
   *          ^
   * ```
   *
   * @type {State}
   */
  function attributeStart(code) {
    effects.enter(attributeType);
    return attribute(code);
  }

  /**
   * ```markdown
   * > | <foo xy
   *           ^
   * ```
   *
   * @type {State}
   */
  function attribute(code) {
    if (code === codes.eof) {
      return nok(code);
    }
    if (code === codes.slash || code === codes.greaterThan) {
      effects.exit(attributeType);
      return ok(code);
    }
    if (markdownLineEndingOrSpace(code)) {
      effects.exit(attributeType);
      effects.consume(code);
      return start;
    }
    if (code === codes.quotationMark || code === codes.apostrophe) {
      return attributeQuoteStart(code);
    }
    if (code === codes.leftCurlyBrace) {
      effects.consume(code);
      return factoryExpression(
        effects,
        attributeBraceEnd,
        nok,
        codes.rightCurlyBrace,
      );
    }
    effects.consume(code);
    return attribute;
  }

  /**
   * ```markdown
   * > | <foo {bar}
   *              ^
   * ```
   *
   * @type {State}
   */
  function attributeBraceEnd(brace) {
    assert(brace === codes.rightCurlyBrace, 'expected `}`');
    effects.consume(brace);
    return attribute;
  }

  /**
   * ```markdown
   * > | <foo bar="
   *              ^
   * ```
   *
   * @type {State}
   */
  function attributeQuoteStart(code) {
    assert(
      code === codes.quotationMark || code === codes.apostrophe,
      'expected "\'" or """',
    );
    quote = code;
    effects.consume(code);
    return attributeQuote;
  }

  /**
   * ```markdown
   * > | <foo bar="...{...}
   *                      ^
   * ```
   *
   * @param {Code} brace
   */
  function attributeQuoteBraceEnd(brace) {
    assert(brace === codes.rightCurlyBrace, 'expected `}`');
    return attributeQuote;
  }

  /**
   * ```markdown
   * > | <foo bar="x
   *               ^
   * ```
   *
   * @type {State}
   */
  function attributeQuote(code) {
    assert(
      quote === codes.quotationMark || quote === codes.apostrophe,
      'expected quote to be "\'" or """',
    );
    if (code === quote) {
      effects.consume(code);
      quote = undefined;
      return attribute;
    }
    if (code === codes.eof || markdownLineEnding(code)) {
      return nok(code);
    }
    if (code === codes.leftCurlyBrace) {
      return factoryExpression(
        effects,
        attributeQuoteBraceEnd,
        nok,
        codes.rightCurlyBrace,
      )(code);
    }
    effects.consume(code);
    return attributeQuote;
  }
}
