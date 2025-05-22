/**
 * @import {State, Tokenizer, TokenizeContext, Extension, HtmlExtension, Token, Effects, TokenType, Code} from 'micromark-util-types'
 * @import {blockTagTypes} from '@mdsv/constants'
 */

import { ok as assert } from 'devlop';
import { factorySpace } from 'micromark-factory-space';
import {
  asciiAlpha,
  markdownLineEnding,
  markdownSpace,
} from 'micromark-util-character';
import { codes, types as coreTypes } from 'micromark-util-symbol';
import { factoryExpression } from './factory-expression.js';

// const blockMarkerType =
//   /** @type {const} @satisfies {Record<Code, typeof blockTagTypes[number]>} */ ({
//     [codes.numberSign]: 'open',
//     [codes.colon]: 'branch',
//     [codes.slash]: 'close',
//   });

/**
 * @param {Effects} effects
 * @param {State} nok
 * @param {State} ok
 * @param {TokenType} nok
 * @param {TokenType} type
 * @param {TokenType} markerType
 * @param {TokenType} valueType
 * @param {TokenType} symbolType
 * @param {TokenType} nameType
 * @param {TokenType} expressionType
 */
export function factoryBlockTag(
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
  // /** @type {(typeof blockMarkerType)[keyof typeof blockMarkerType]} */
  // let role;
  /** @type {boolean} */
  let close;
  /** @type {boolean} */
  let branch;

  return start;

  /**
   * ```markdown
   * > | {
   *     ^
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
   *
   * @type {State}
   */
  function blockTagMarker(code) {
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
   *
   * @type {State}
   */
  function nameStart(code) {
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
   *
   * @type {State}
   */
  function name(code) {
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
    if (markdownSpace(code)) {
      return factorySpace(effects, nameAfter, coreTypes.whitespace);
    }
    if (markdownLineEnding(code)) {
      effects.consume(code);
      return nameAfter;
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
   *
   * @type {State}
   */
  function expressionAfter(brace) {
    assert(brace === codes.rightCurlyBrace, 'expected `}`');
    effects.exit(expressionType);
    return end(brace);
  }

  /**
   * ```markdown
   * > | {...}
   *         ^
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
    withTokenData(effects.exit(type));
    return ok;
  }

  /** @param {Token} token */
  function withTokenData(token) {
    token._blockBranch = branch;
    token._blockClose = close;
    return token;
  }
}
