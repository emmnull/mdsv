/** @import {State, Tokenizer, TokenizeContext, Extension, HtmlExtension, Token, Effects, TokenType} from 'micromark-util-types' */

import { assert } from '@mdsv/utils';
import { factorySpace } from 'micromark-factory-space';
import {
  asciiAlpha,
  markdownLineEnding,
  markdownSpace,
} from 'micromark-util-character';
import { codes, types as coreTypes } from 'micromark-util-symbol';
import { factoryExpression } from './factory-expression.js';

const blockMarkerType = /** @type {const} */ ({
  [codes.numberSign]: 'open',
  [codes.colon]: 'branch',
  [codes.slash]: 'close',
});

/**
 * @param {Effects} effects
 * @param {State} nok
 * @param {State} ok
 * @param {TokenType} nok
 * @param {TokenType} tagType
 * @param {TokenType} markerType
 * @param {TokenType} tagMarkerType
 * @param {TokenType} tagNameType
 * @param {TokenType} tagValueType
 */
export function factoryBlockTag(
  effects,
  ok,
  nok,
  tagType,
  markerType,
  tagMarkerType,
  tagNameType,
  tagValueType,
) {
  /** @type {(typeof blockMarkerType)[keyof typeof blockMarkerType]} */
  let type;

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
    effects.enter(tagType);
    effects.enter(markerType);
    effects.consume(code);
    effects.exit(markerType);
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
    effects.enter(tagMarkerType);
    effects.consume(code);
    effects.exit(tagMarkerType);
    type = blockMarkerType[code];
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
      effects.enter(tagNameType);
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
    effects.exit(tagNameType);
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
    effects.enter(tagValueType);
    return factoryExpression(effects, valueAfter, nok)(code);
  }

  /**
   * ```markdown
   * > | {...}
   *         ^
   * ```
   *
   * @type {State}
   */
  function valueAfter(brace) {
    assert(brace === codes.rightCurlyBrace, 'expected `}`');
    effects.exit(tagValueType);
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
    effects.enter(markerType);
    effects.consume(code);
    effects.exit(markerType);
    effects.exit(tagType);
    return ok;
  }
}
