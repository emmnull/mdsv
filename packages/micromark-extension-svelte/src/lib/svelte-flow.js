/** @import {Code, Construct, Extension, HtmlExtension, Resolver, State, TokenizeContext, Tokenizer} from 'micromark-util-types' */

import { htmlVoidNames, types } from 'common/constants';
import { assert } from 'common/utils';
import { blankLine } from 'micromark-core-commonmark';
import { factorySpace } from 'micromark-factory-space';
import {
  markdownLineEnding,
  markdownLineEndingOrSpace,
  markdownSpace,
} from 'micromark-util-character';
import { htmlRawNames } from 'micromark-util-html-tag-name';
import { codes, constants, types as coreTypes } from 'micromark-util-symbol';
import { factoryElementMisc } from './utils/element-misc.js';
import { factoryTagAttributes } from './utils/element-tag-attributes.js';
import { tagNameChar, tagNameStartChar } from './utils/element-tag-name.js';

/** @returns {Extension} */
export function svelteFlow() {
  return {
    disable: {
      null: ['htmlFlow', 'htmlText', 'codeIndented', 'autolink'],
    },
    flow: {
      [codes.lessThan]: {
        name: types.svelteFlow,
        concrete: true,
        tokenize,
        // resolveTo,
      },
    },
  };
}

/** @returns {HtmlExtension} */
export function htmlSvelteFlow() {
  return {
    exit: {
      [types.svelteFlowTag](token) {
        this.raw(this.sliceSerialize(token));
        // this.lineEndingIfNeeded();
      },
    },
  };
}

/** @type {Construct} */
const blankLineAfter = {
  partial: true,
  tokenize: tokenizeBlankLineAfter,
};

/** @type {Construct} */
const nonLazyContinuationStart = {
  partial: true,
  tokenize: tokenizeNonLazyContinuationStart,
};

// /** @type {Resolver} */
// function resolveTo(events) {
//   let index = events.length;
//   while (index--) {
//     if (
//       events[index][0] === 'enter' &&
//       events[index][1].type === types.svelteFlow
//     ) {
//       break;
//     }
//   }
//   if (index > 1 && events[index - 2][1].type === coreTypes.linePrefix) {
//     // Add the prefix start to the HTML token.
//     events[index][1].start = events[index - 2][1].start;
//     // Add the prefix start to the HTML line token.
//     events[index + 1][1].start = events[index - 2][1].start;
//     // Remove the line prefix.
//     events.splice(index - 2, 2);
//   }
//   return events;
// }

/** @type {Tokenizer} */
function tokenize(effects, ok, nok) {
  const self = this;
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
    // effects.enter(types.svelteFlow);
    effects.enter(types.svelteFlowTag);
    effects.enter(types.svelteFlowTagMarker);
    effects.consume(code);
    effects.exit(types.svelteFlowTagMarker);
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
      effects.enter(types.svelteFlowTagName);
      effects.consume(code);
      name = String.fromCharCode(code);
      return tagName;
    }
    if (markdownLineEndingOrSpace(code)) {
      effects.consume(code);
      return tagNameStart;
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
    effects.exit(types.svelteFlowTagName);
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
    return factoryTagAttributes(
      effects,
      attributesAfter,
      nok,
      types.svelteFlowTagAttribute,
    )(code);
  }

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
      effects.enter(types.svelteFlowTagMarker);
      effects.consume(code);
      effects.exit(types.svelteFlowTagMarker);
      effects.exit(types.svelteFlowTag);
      isSelfClosing ||= htmlVoidNames.includes(name);
      return endAfter;
    }
    return nok(code);
  }

  /**
   * ```markdown
   * > | <>
   *       ^
   * ```
   *
   * @type {State}
   */
  function endAfter(code) {
    if (code === codes.eof) {
      return ok(code);
    }
    if (markdownSpace(code)) {
      return factorySpace(effects, endAfter, coreTypes.whitespace)(code);
    }
    if (markdownLineEnding(code)) {
      return effects.check(
        blankLineAfter,
        continuationAfter,
        continuationStart,
      )(code);
    }
    return nok(code);
  }

  /**
   * ```markdown
   *   | <>
   * > |
   *     ^
   *   |
   * ```
   *
   * @type {State}
   */
  function continuationAfter(code) {
    // effects.exit(types.svelteFlow);
    return ok(code);
  }

  /**
   * ```markdown
   *   | <>
   * > |
   *    ^
   * ```
   *
   * @type {State}
   */
  function continuationStart(code) {
    return effects.check(
      nonLazyContinuationStart,
      continuationStartNonLazy,
      continuationAfter,
    )(code);
  }

  /**
   * ```markdown
   * > | <>
   *       ^
   *   |
   * ```
   *
   * @type {State}
   */
  function continuationStartNonLazy(code) {
    assert(markdownLineEnding(code), 'expected to be at line ending');
    effects.enter(coreTypes.lineEnding);
    effects.consume(code);
    effects.exit(coreTypes.lineEnding);
    return chunkStart;
  }

  /**
   * ```markdown
   *   | <>
   * > |
   *    ^
   * ```
   *
   * @type {State}
   */
  function chunkStart(code) {
    if (code === codes.eof) {
      return ok(code);
    }
    if (markdownLineEnding(code)) {
      return continuationStart(code);
    }
    effects.enter(coreTypes.chunkText, {
      contentType: constants.contentTypeText,
    });
    return chunk(code);
  }

  /**
   * ```markdown
   *   | <>
   * > | jello
   *      ^
   * ```
   *
   * @type {State}
   */
  function chunk(code) {
    if (code === codes.eof) {
      effects.exit(coreTypes.chunkText);
      return ok(code);
    }
    if (markdownLineEnding(code)) {
      effects.exit(coreTypes.chunkText);
      return effects.check(
        blankLineAfter,
        continuationAfter,
        continuationStart,
      )(code);
    }
    effects.consume(code);
    return chunk;
  }
}

/** @type {Tokenizer} */
function tokenizeBlankLineAfter(effects, ok, nok) {
  return start;

  /** @type {State} */
  function start(code) {
    assert(markdownLineEnding(code), 'expected to be at line ending');
    effects.enter(coreTypes.lineEnding);
    effects.consume(code);
    effects.exit(coreTypes.lineEnding);
    return effects.attempt(blankLine, ok, nok);
  }
}

/** @type {Tokenizer} */
function tokenizeNonLazyContinuationStart(effects, ok, nok) {
  const self = this;

  return start;

  /** @type {State} */
  function start(code) {
    if (markdownLineEnding(code)) {
      effects.enter(coreTypes.lineEnding);
      effects.consume(code);
      effects.exit(coreTypes.lineEnding);
      return after;
    }
    return nok(code);
  }

  /** @type {State} */
  function after(code) {
    return self.parser.lazy[self.now().line] ? nok(code) : ok(code);
  }
}
