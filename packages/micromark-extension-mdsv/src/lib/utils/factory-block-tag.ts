import { ok as assert } from 'devlop';
import { factorySpace } from 'micromark-factory-space';
import {
  asciiAlpha,
  markdownLineEndingOrSpace,
} from 'micromark-util-character';
import { codes, types } from 'micromark-util-symbol';
import type {
  Code,
  Effects,
  State,
  Token,
  TokenType,
} from 'micromark-util-types';
import '../../micromark.d.ts';
import { factoryExpression } from './factory-expression.js';

export function factoryBlockTag(
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
  let close: boolean;
  let branch: boolean;

  function withTokenData(token: Token) {
    token._blockBranch = branch;
    token._blockClose = close;
    return token;
  }

  return start;

  /**
   * ```markdown
   * > | {
   *     ^
   * ```
   */
  function start(code: Code) {
    assert(code === codes.leftCurlyBrace, 'expected `{`');
    effects.enter(type);
    effects.enter(markerType);
    effects.consume(code);
    effects.exit(markerType);
    // effects.enter(valueType);
    return blockTagMarker;
  }

  /**
   * ```markdown
   * > | {#
   *      ^
   * > | {:
   *      ^
   * > | {/
   *      ^
   * ```
   */
  function blockTagMarker(code: Code) {
    if (
      code !== codes.numberSign &&
      code !== codes.colon &&
      code !== codes.slash
    ) {
      return nok(code);
    }
    close = code === codes.slash;
    branch = code === codes.colon;
    withTokenData(effects.enter(symbolType));
    effects.consume(code);
    effects.exit(symbolType);
    withTokenData(effects.enter(valueType));
    return nameStart;
  }

  /**
   * ```markdown
   * > | {#x
   *       ^
   * > | {:x
   *       ^
   * > | {/x
   *       ^
   * ```
   */
  function nameStart(code: Code) {
    if (asciiAlpha(code)) {
      withTokenData(effects.enter(nameType));
      effects.consume(code);
      return name;
    }
    return nok(code);
  }

  /**
   * ```markdown
   * > | {#xy
   *        ^
   * > | {:xy
   *        ^
   * > | {/xy
   *        ^
   * ```
   */
  function name(code: Code) {
    if (asciiAlpha(code)) {
      effects.consume(code);
      return name;
    }
    effects.exit(nameType);
    return nameAfter(code);
  }

  /**
   * ```markdown
   * > | {#foo
   *          ^
   * > | {:foo
   *          ^
   * > | {/foo
   *          ^
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
    withTokenData(effects.enter(expressionType));
    return factoryExpression(
      effects,
      expressionAfter,
      nok,
      codes.rightCurlyBrace,
    )(code);
  }

  /**
   * ```markdown
   * > | {...}
   *         ^
   * ```
   */
  function expressionAfter(brace: Code) {
    assert(brace === codes.rightCurlyBrace, 'expected `}`');
    effects.exit(expressionType);
    return end(brace);
  }

  /**
   * ```markdown
   * > | {...}
   *         ^
   * ```
   */
  function end(code: Code) {
    assert(code === codes.rightCurlyBrace, 'expected `}`');
    effects.exit(valueType);
    effects.enter(markerType);
    effects.consume(code);
    effects.exit(markerType);
    withTokenData(effects.exit(type));
    return ok;
  }
}
