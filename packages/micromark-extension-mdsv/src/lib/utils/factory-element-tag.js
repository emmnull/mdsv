/** @import {Code, Effects, State, TokenType} from 'micromark-util-types' */

import { htmlVoidNames } from '@mdsv/constants';
import { assert } from '@mdsv/utils';
import {
  asciiAlpha,
  asciiAlphanumeric,
  markdownLineEndingOrSpace,
} from 'micromark-util-character';
import { htmlRawNames } from 'micromark-util-html-tag-name';
import { codes } from 'micromark-util-symbol';
import { factoryElementMisc } from './factory-element-misc.js';
import { factoryElementTagContent } from './factory-element-tag-content.js';

/**
 * ```markdown
 * > | <x
 *      ^
 * ```
 *
 * @param {Code} code
 * @returns {code is NonNullable<Code>}
 */
function tagNameStartChar(code) {
  return asciiAlpha(code);
}

/**
 * ```markdown
 * > | <xy
 *       ^
 * ```
 *
 * @param {Code} code
 * @returns {code is NonNullable<Code>}
 */
function tagNameChar(code) {
  return (
    asciiAlphanumeric(code) ||
    code === codes.dash ||
    code === codes.dot ||
    code === codes.colon
  );
}

/**
 * Test if a name is a component or custom element name.
 *
 * ```markdown
 * <FooBar>
 * <foo-bar>
 * <foo.bar>
 * <foo:bar>
 * ```
 *
 * @param {string} name
 */
export function svelteName(name) {
  return /[A-Z]/.test(name[0]) || /[-.:]/.test(name);
}

/**
 * @param {Effects} effects
 * @param {State} ok
 * @param {State} nok
 * @param {TokenType} type
 * @param {TokenType} markerType
 * @param {TokenType} nameType
 * @param {TokenType} attributeType
 */
export function factoryElementTag(
  effects,
  ok,
  nok,
  type,
  markerType,
  nameType,
  attributeType,
) {
  /** @type {string} */
  let name;
  /** @type {boolean} */
  let isClosingTag;
  /** @type {boolean} */
  let isSelfClosing;
  /** @type {boolean} */
  let isRawTag;

  return start;

  /**
   * ```markdown
   * > | <
   *     ^
   * ```
   *
   * @type {State}
   */
  function start(code) {
    assert(code === codes.lessThan, 'expected `<`');
    effects.enter(type);
    effects.enter(markerType);
    effects.consume(code);
    effects.exit(markerType);
    return startAfter;
  }

  /**
   * ```markdown
   * > | <
   *      ^
   * ```
   *
   * @type {State}
   */
  function startAfter(code) {
    if (code === codes.exclamationMark || code === codes.questionMark) {
      return factoryElementMisc.call(self, effects, end, nok)(code);
    }
    if (code === codes.slash) {
      isClosingTag = true;
      effects.consume(code);
      return tagNameStart;
    }
    return tagNameStart(code);
  }

  /**
   * ```markdown
   * > | <x
   *      ^
   * ```
   *
   * @type {State}
   */
  function tagNameStart(code) {
    if (tagNameStartChar(code)) {
      effects.enter(nameType);
      effects.consume(code);
      name = String.fromCharCode(code);
      return tagName;
    }
    return nok(code);
  }

  /**
   * ```markdown
   * > | <xy
   *       ^
   * ```
   *
   * @type {State}
   */
  function tagName(code) {
    if (tagNameChar(code)) {
      effects.consume(code);
      name += String.fromCharCode(code);
      return tagName;
    }
    effects.exit(nameType);
    isRawTag = htmlRawNames.includes(name);
    return tagNameAfter(code);
  }

  /**
   * ```markdown
   * > | <xyz
   *         ^
   * ```
   *
   * @type {State}
   */
  function tagNameAfter(code) {
    if (code === codes.eof) {
      return nok(code);
    }
    if (markdownLineEndingOrSpace(code)) {
      effects.consume(code);
      return tagNameAfter;
    }
    return factoryElementTagContent(
      effects,
      attributesAfter,
      nok,
      attributeType,
    )(code);
  }

  // function attributesStart(code) {

  // }

  /**
   * ```markdown
   * > | <x ...>
   *           ^
   * > | <x .../
   *           ^
   * ```
   *
   * @type {State}
   */
  function attributesAfter(code) {
    if (code === codes.slash) {
      isSelfClosing = true;
      effects.consume(code);
      return end;
    }
    return end(code);
  }

  /**
   * ```markdown
   * > | <>
   *      ^
   * ```
   *
   * @type {State}
   */
  function end(code) {
    if (code === codes.greaterThan) {
      effects.enter(markerType);
      effects.consume(code);
      effects.exit(markerType);
      effects.exit(type);
      isSelfClosing ||= htmlVoidNames.includes(name);
      return ok;
    }
    return nok(code);
  }
}
