import { htmlVoidNames } from '@mdsv/constants';
import { ok as assert } from 'devlop';
import { factorySpace } from 'micromark-factory-space';
import {
  asciiAlpha,
  asciiAlphanumeric,
  markdownLineEnding,
  markdownSpace,
} from 'micromark-util-character';
import { codes, types } from 'micromark-util-symbol';
import type {
  Code,
  Effects,
  State,
  TokenizeContext,
  TokenType,
} from 'micromark-util-types';
import { factoryElementMisc } from './factory-element-misc.js';
import { factoryElementTagAttributes } from './factory-element-tag-attributes.js';

/**
 * ```markdown
 * > | <x
 *      ^
 * ```
 */
function tagNameStartChar(code: Code): code is NonNullable<Code> {
  return asciiAlpha(code);
}

/**
 * ```markdown
 * > | <xy
 *       ^
 * ```
 */
function tagNameChar(code: Code): code is NonNullable<Code> {
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
 */
export function svelteName(name: string) {
  return /[A-Z]/.test(name[0]) || /[-.:]/.test(name);
}

export function factoryElementTag(
  this: TokenizeContext,
  effects: Effects,
  ok: State,
  nok: State,
  type: TokenType,
  markerType: TokenType,
  nameType: TokenType,
  attributeType: TokenType,
) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const self = this;
  let name: string;
  let isOpeningTag: boolean;
  let isClosingTag: boolean;

  return start;

  /**
   * ```markdown
   * > | <
   *     ^
   * ```
   */
  function start(code: Code) {
    assert(code === codes.lessThan, 'expected `<`');
    effects.enter(type);
    effects.enter(markerType);
    effects.consume(code);
    // effects.exit(markerType);
    return startAfter;
  }

  /**
   * ```markdown
   * > | <
   *      ^
   * ```
   */
  function startAfter(code: Code) {
    if (code === codes.exclamationMark || code === codes.questionMark) {
      return factoryElementMisc.call(self, effects, end, nok)(code);
    }
    if (code === codes.slash) {
      isClosingTag = true;
      effects.consume(code);
      effects.exit(markerType);
      return tagNameStart;
    } else {
      isOpeningTag = true;
    }
    effects.exit(markerType);
    return tagNameStart(code);
  }

  /**
   * ```markdown
   * > | <x
   *      ^
   * ```
   */
  function tagNameStart(code: Code) {
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
   */
  function tagName(code: Code) {
    if (tagNameChar(code)) {
      effects.consume(code);
      name += String.fromCharCode(code);
      return tagName;
    }
    effects.exit(nameType);
    self.mdsvElementTagName = name;
    return tagNameAfter(code);
  }

  /**
   * ```markdown
   * > | <xyz
   *         ^
   * ```
   */
  function tagNameAfter(code: Code) {
    if (code === codes.eof) {
      return nok(code);
    }
    if (markdownSpace(code)) {
      return factorySpace(effects, tagNameAfter, types.whitespace)(code);
    }
    if (markdownLineEnding(code)) {
      effects.enter(types.whitespace);
      effects.consume(code);
      effects.exit(types.whitespace);
      return tagNameAfter;
    }
    return factoryElementTagAttributes(
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
   */
  function attributesAfter(code: Code) {
    if (code === codes.slash) {
      isClosingTag = true;
      effects.enter(markerType);
      effects.consume(code);
      return end;
    }
    effects.enter(markerType);
    return end(code);
  }

  /**
   * ```markdown
   * > | <>
   *      ^
   * ```
   */
  function end(code: Code) {
    if (code === codes.greaterThan) {
      effects.consume(code);
      effects.exit(markerType);
      const token = effects.exit(type);
      isClosingTag ||= htmlVoidNames.includes(name);
      if (isClosingTag) {
        self.mdsvElementTagName = undefined;
      }
      token._elementClose = isClosingTag;
      token._elementOpen = isOpeningTag;
      return ok;
    }
    return nok(code);
  }
}
