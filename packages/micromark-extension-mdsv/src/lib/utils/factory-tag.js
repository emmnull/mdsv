/** @import {Effects,State, TokenType} from 'micromark-util-types' */

import { ok as assert } from 'devlop';
import {
  asciiAlpha,
  asciiAlphanumeric,
  markdownLineEnding,
  markdownSpace,
} from 'micromark-util-character';
import { codes } from 'micromark-util-symbol';
import { factoryExpression } from './factory-expression.js';

/**
 * @param {Effects} effects
 * @param {State} ok
 * @param {State} nok
 * @param {TokenType} type
 * @param {TokenType} markerType
 * @param {TokenType} valueType
 * @param {TokenType} symbolType
 * @param {TokenType} nameType
 * @param {TokenType} expressionType
 */
export function factoryTag(
  effects,
  ok,
  nok,
  type,
  markerType,
  valueType,
  symbolType,
  nameType,
  expressionType,
) {
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
    effects.enter(type);
    effects.enter(markerType);
    effects.consume(code);
    effects.exit(markerType);
    // effects.enter(valueType);
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
    effects.enter(symbolType);
    effects.consume(code);
    effects.exit(symbolType);
    effects.enter(valueType);
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
    if (asciiAlpha(code)) {
      effects.enter(nameType);
      effects.consume(code);
      return name;
    }
    return nok(code);
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
    effects.exit(nameType);
    return nameAfter(code);
  }

  /**
   * ```markdown
   *  > | {@xyz
   *           ^
   * ```
   *
   * @type {State}
   */
  function nameAfter(code) {
    if (code === codes.eof) {
      return nok(code);
    }
    if (code === codes.rightCurlyBrace) {
      return end(code);
    }
    if (markdownSpace(code) || markdownLineEnding(code)) {
      effects.consume(code);
      return nameAfter;
    }
    effects.enter(expressionType);
    return factoryExpression(
      effects,
      expressionAfter,
      nok,
      codes.rightCurlyBrace,
    )(code);
  }

  /**
   * ```markdown
   *  > | {@xyz ...}
   *               ^
   * ```
   *
   * @type {State}
   */
  function expressionAfter(code) {
    assert(code === codes.rightCurlyBrace, 'expected `}`');
    effects.exit(expressionType);
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
    effects.exit(valueType);
    effects.enter(markerType);
    effects.consume(code);
    effects.exit(markerType);
    effects.exit(type);
    return ok;
  }
}
