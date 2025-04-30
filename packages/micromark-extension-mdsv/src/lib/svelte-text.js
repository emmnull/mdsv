/** @import {Code, Construct, Extension, HtmlExtension, State, TokenizeContext, Tokenizer} from 'micromark-util-types' */

import { types } from '@mdsv/constants';
import { assert } from '@mdsv/utils';
import { factorySpace } from 'micromark-factory-space';
import { markdownLineEnding, markdownSpace } from 'micromark-util-character';
import { htmlRawNames } from 'micromark-util-html-tag-name';
import { codes, types as coreTypes } from 'micromark-util-symbol';
import { factoryElementMisc } from './utils/element-misc.js';
import { factoryTagAttributes } from './utils/element-tag-attributes.js';
import { tagNameChar, tagNameStartChar } from './utils/element-tag-name.js';

/** @returns {Extension} */
export function svelteText() {
  return {
    disable: {
      null: ['htmlText', 'autolink'],
    },
    text: {
      [codes.lessThan]: {
        concrete: true,
        name: types.svelteText,
        tokenize: tokenizeSvelteTextElement,
      },
    },
  };
}

/** @returns {HtmlExtension} */
export function htmlSvelteText() {
  return {
    enter: {
      [types.svelteTextTag](token) {
        this.raw(this.sliceSerialize(token));
      },
    },
  };
}

/** @type {Tokenizer} */
function tokenizeSvelteTextElement(effects, ok, nok) {
  /** @type {string} */
  let name;
  /** @type {boolean} */
  let isRawTag;
  /** @type {boolean} */
  let isClosingTag;

  const self = this;

  return start;

  /**
   * ```markdown
   * > | jello <
   *           ^
   * ```
   *
   * @type {State}
   */
  function start(code) {
    assert(code === codes.lessThan, 'expected `<`');
    effects.enter(types.svelteTextTag);
    effects.enter(types.svelteTextTagMarker);
    effects.consume(code);
    effects.exit(types.svelteTextTagMarker);
    return startAfter;
  }

  /**
   * ```markdown
   * > | jello <
   *            ^
   * ```
   *
   * @type {State}
   */
  function startAfter(code) {
    if (code === codes.exclamationMark || code === codes.questionMark) {
      return factoryElementMisc.call(self, effects, end, nok);
    }
    if (code === codes.slash) {
      effects.consume(code);
      isClosingTag = true;
      return tagNameStart;
    }
    return tagNameStart(code);
  }

  /**
   * ```markdown
   * > | jello <x
   *            ^
   * ```
   *
   * @type {State}
   */
  function tagNameStart(code) {
    if (tagNameStartChar(code)) {
      effects.enter(types.svelteTextTagName);
      effects.consume(code);
      name = String.fromCharCode(code);
      return tagName;
    }
    if (markdownSpace(code)) {
      return factorySpace(effects, tagNameStart, coreTypes.whitespace)(code);
    }
    if (markdownLineEnding(code)) {
      effects.consume(code);
      return tagNameStart;
    }
    return nok(code);
  }

  /**
   * ```markdown
   * > | jello <xy
   *             ^
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
    effects.exit(types.svelteTextTagName);
    isRawTag = htmlRawNames.includes(name);
    return tagNameAfter(code);
  }

  /**
   * ```markdown
   * > | jello <xyz
   *               ^
   * ```
   *
   * @type {State}
   */
  function tagNameAfter(code) {
    if (code === codes.eof) {
      effects.exit(types.svelteTextTag);
      return ok(code);
    }
    if (markdownSpace(code)) {
      return factorySpace(effects, tagNameAfter, coreTypes.whitespace)(code);
    }
    if (code === codes.slash) {
      effects.consume(code);
      return end;
    }
    if (code === codes.greaterThan) {
      return end(code);
    }
    return factoryTagAttributes(
      effects,
      attributesAfter,
      nok,
      types.svelteTextTagAttribute,
    )(code);
  }

  /**
   * ```markdown
   * > | jello <xyz .../
   *                   ^
   * > | jello <xyz ...>
   *                   ^
   * ```
   *
   * @type {State}
   */
  function attributesAfter(code) {
    if (code === codes.slash) {
      effects.consume(code);
      return end;
    }
    return end(code);
  }

  /**
   * ```markdown
   * > | jello <...>
   *               ^
   * ```
   *
   * @type {State}
   */
  function end(code) {
    if (code === codes.greaterThan) {
      effects.enter(types.svelteTextTagMarker);
      effects.consume(code);
      effects.exit(types.svelteTextTagMarker);
      effects.exit(types.svelteTextTag);
      return ok(code);
    }
    return nok(code);
  }
}
