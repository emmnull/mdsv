/** @import {Effects,State, TokenType} from 'micromark-util-types' */

import { assert } from '@mdsv/utils';
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
 * @param {TokenType} tagType
 * @param {TokenType} markerType
 * @param {TokenType} tagMarkerType
 * @param {TokenType} tagNameType
 * @param {TokenType} tagValueType
 */
export function factoryTag(
  effects,
  ok,
  nok,
  tagType,
  markerType,
  tagMarkerType,
  tagNameType,
  tagValueType,
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
    effects.enter(tagType);
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
   *
   * @type {State}
   */
  function tagMarker(code) {
    if (code !== codes.atSign) {
      return nok(code);
    }
    effects.enter(tagMarkerType);
    effects.consume(code);
    effects.exit(tagMarkerType);
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
      effects.enter(tagNameType);
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
    effects.exit(tagNameType);
    return afterName(code);
  }

  /**
   * ```markdown
   *  > | {@xyz
   *           ^
   * ```
   *
   * @type {State}
   */
  function afterName(code) {
    if (code === codes.eof) {
      return nok(code);
    }
    if (code === codes.rightCurlyBrace) {
      return end(code);
    }
    if (markdownSpace(code) || markdownLineEnding(code)) {
      effects.consume(code);
      return afterName;
    }
    effects.enter(tagValueType);
    return factoryExpression(effects, afterValue, nok)(code);
  }

  /**
   * ```markdown
   *  > | {@xyz ...}
   *               ^
   * ```
   *
   * @type {State}
   */
  function afterValue(code) {
    assert(code === codes.rightCurlyBrace, 'expected `}`');
    effects.exit(tagValueType);
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
    effects.enter(markerType);
    effects.consume(code);
    effects.exit(markerType);
    effects.exit(tagType);
    return ok;
  }
}
