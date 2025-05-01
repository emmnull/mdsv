/** @import {Code, Construct, Extension, HtmlExtension, Resolver, State, TokenizeContext, Tokenizer} from 'micromark-util-types' */

import { constructs, types } from '@mdsv/constants';
import { assert } from '@mdsv/utils';
import { blankLine } from 'micromark-core-commonmark';
import { factorySpace } from 'micromark-factory-space';
import { markdownLineEnding, markdownSpace } from 'micromark-util-character';
import { codes, constants, types as coreTypes } from 'micromark-util-symbol';
import { factoryElementTag } from './utils/factory-element-tag.js';

/** @returns {Extension} */
export function mdsvElement() {
  return {
    disable: {
      null: ['htmlFlow', 'htmlText', 'codeIndented', 'autolink'],
    },
    flow: {
      [codes.lessThan]: {
        concrete: true,
        name: constructs.elementFlow,
        tokenize: tokenizeElementFlow,
        // resolveTo,
      },
    },
    text: {
      [codes.lessThan]: {
        concrete: true,
        name: constructs.elementText,
        tokenize: tokenizeElementText,
      },
    },
  };
}

/** @returns {HtmlExtension} */
export function htmlMdsvElement() {
  return {
    exit: {
      [types.elementTag](token) {
        this.raw(this.sliceSerialize(token));
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
function tokenizeElementFlow(effects, ok, nok) {
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
    return factoryElementTag(
      effects,
      endAfter,
      nok,
      types.elementTag,
      types.elementTagMarker,
      types.elementTagName,
      types.elementTagAttribute,
    )(code);
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

/** @type {Tokenizer} */
function tokenizeElementText(effects, ok, nok) {
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
    return factoryElementTag(
      effects,
      ok,
      nok,
      types.elementTag,
      types.elementTagMarker,
      types.elementTagName,
      types.elementTagAttribute,
    )(code);
  }
}
