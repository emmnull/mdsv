import { ok as assert } from 'devlop';
import {
  markdownLineEnding,
  markdownLineEndingOrSpace,
} from 'micromark-util-character';
import { codes } from 'micromark-util-symbol';
import type { Code, Effects, State, TokenType } from 'micromark-util-types';
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
 */
export function factoryElementTagAttributes(
  effects: Effects,
  ok: State,
  nok: State,
  attributeType: TokenType,
) {
  let quote: typeof codes.apostrophe | typeof codes.quotationMark | undefined;

  return start;

  /**
   * ```markdown
   * > | <foo x
   *          ^
   * ```
   */
  function start(code: Code): State | undefined {
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
   */
  function attributeStart(code: Code) {
    effects.enter(attributeType);
    return attribute(code);
  }

  /**
   * ```markdown
   * > | <foo xy
   *           ^
   * ```
   */
  function attribute(code: Code) {
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
   */
  function attributeBraceEnd(brace: Code) {
    assert(brace === codes.rightCurlyBrace, 'expected `}`');
    effects.consume(brace);
    return attribute;
  }

  /**
   * ```markdown
   * > | <foo bar="
   *              ^
   * ```
   */
  function attributeQuoteStart(code: Code) {
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
   */
  function attributeQuoteBraceEnd(brace: Code) {
    assert(brace === codes.rightCurlyBrace, 'expected `}`');
    return attributeQuote;
  }

  /**
   * ```markdown
   * > | <foo bar="x
   *               ^
   * ```
   */
  function attributeQuote(code: Code) {
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
