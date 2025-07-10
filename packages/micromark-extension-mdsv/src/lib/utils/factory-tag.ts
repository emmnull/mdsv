import { ok as assert } from 'devlop';
import { factorySpace } from 'micromark-factory-space';
import {
  asciiAlpha,
  asciiAlphanumeric,
  markdownLineEndingOrSpace,
} from 'micromark-util-character';
import { codes, types } from 'micromark-util-symbol';
import type { Code, Effects, State, TokenType } from 'micromark-util-types';
import { factoryExpression } from './factory-expression.js';

export function factoryTag(
  effects: Effects,
  ok: State,
  nok: State,
  type: TokenType,
  markerType: TokenType,
  valueType: TokenType,
  symbolType: TokenType,
  nameType: TokenType,
  expressionType: TokenType,
) {
  return start;

  /**
   * ```markdown
   *  > | {
   *      ^
   * ```
   */
  function start(code: Code) {
    assert(code === codes.leftCurlyBrace, 'expected `{`');
    effects.enter(type);
    effects.enter(markerType);
    effects.consume(code);
    effects.exit(markerType);
    return tagMarker;
  }

  /**
   * ```markdown
   *  > | {@
   *       ^
   * ```
   */
  function tagMarker(code: Code) {
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
   */
  function nameStart(code: Code) {
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
   */
  function name(code: Code) {
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
   */
  function nameAfter(code: Code) {
    if (code === codes.eof) {
      return nok(code);
    }
    if (code === codes.rightCurlyBrace) {
      return end(code);
    }
    if (markdownLineEndingOrSpace(code)) {
      return factorySpace(effects, nameAfter, types.whitespace)(code);
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
   */
  function expressionAfter(code: Code) {
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
   */
  function end(code: Code) {
    assert(code === codes.rightCurlyBrace, 'expected `}`');
    effects.exit(valueType);
    effects.enter(markerType);
    effects.consume(code);
    effects.exit(markerType);
    effects.exit(type);
    return ok;
  }
}
