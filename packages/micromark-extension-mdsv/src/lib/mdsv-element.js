/** @import {Code, Construct, Extension, HtmlExtension, Resolver, State, TokenizeContext, Tokenizer} from 'micromark-util-types' */

import { constructs, types } from '@mdsv/constants';
import { assert } from '@mdsv/utils';
import { blankLine } from 'micromark-core-commonmark';
import { factorySpace } from 'micromark-factory-space';
import { markdownLineEnding, markdownSpace } from 'micromark-util-character';
import { htmlRawNames } from 'micromark-util-html-tag-name';
import { codes, constants, types as coreTypes } from 'micromark-util-symbol';
import { factoryElementTag } from './utils/factory-element-tag.js';
import { factoryExpression } from './utils/factory-expression.js';

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
export function mdsvElementHtml() {
  return {
    exit: {
      [types.elementTag](token) {
        this.raw(this.sliceSerialize(token));
      },
      [types.elementRaw](token) {
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
const rawCloseTag = {
  partial: true,
  tokenize: tokenizeRawCloseTag,
};

/** @type {Construct} */
const nonLazyContinuationStart = {
  partial: true,
  tokenize: tokenizeNonLazyContinuationStart,
};

/** @type {Tokenizer} */
function tokenizeElementFlow(effects, ok, nok) {
  const self = this;

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
    return factoryElementTag.call(
      self,
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
    if (
      self.mdsvElementTagName &&
      htmlRawNames.includes(self.mdsvElementTagName)
    ) {
      effects.enter(types.elementRaw);
      return raw(code);
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

  /**
   * ```markdown
   * > | <script>const foo = "bar"</script>
   *             ^^^^^^^^^^^^^^^^^
   * ```
   *
   * @type {State}
   */
  function raw(code) {
    return factoryExpression(
      effects,
      effects.attempt(rawCloseTag, ok, rawConsume),
      nok,
      codes.lessThan,
    )(code);
  }

  /** @type {State} */
  function rawConsume(code) {
    effects.consume(code);
    return raw;
  }
}

/**
 * ```markdown
 *   | <>
 *   |
 * > |
 *    ^
 * ```
 *
 * @type {Tokenizer}
 */
function tokenizeBlankLineAfter(effects, ok, nok) {
  return start;

  /**
   * ```markdown
   * > | <>
   *       ^
   * ```
   *
   * @type {State}
   */
  function start(code) {
    assert(markdownLineEnding(code), 'expected to be at line ending');
    effects.enter(coreTypes.lineEnding);
    effects.consume(code);
    effects.exit(coreTypes.lineEnding);
    return effects.attempt(blankLine, ok, nok);
  }
}

/**
 * ```markdown
 *   | <>
 * > |
 *    ^
 * ```
 *
 * @type {Tokenizer}
 */
function tokenizeNonLazyContinuationStart(effects, ok, nok) {
  const self = this;

  return start;

  /**
   * ```markdown
   * > | <>
   *       ^
   * ```
   *
   * @type {State}
   */
  function start(code) {
    if (markdownLineEnding(code)) {
      effects.enter(coreTypes.lineEnding);
      effects.consume(code);
      effects.exit(coreTypes.lineEnding);
      return after;
    }
    return nok(code);
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
  function after(code) {
    return self.parser.lazy[self.now().line] ? nok(code) : ok(code);
  }
}

/**
 * ```markdown
 *   | <script>
 * > |
 *    ^
 * ```
 *
 * @type {Tokenizer}
 */
function tokenizeRawCloseTag(effects, ok, nok) {
  const rawName = this.mdsvElementTagName;
  let index = 0;

  assert(
    rawName != undefined,
    'expected tokenizer current element name to be defined',
  );
  assert(
    htmlRawNames.includes(rawName),
    'expected current element name to be raw name',
  );

  return start;

  /**
   * ```markdown
   * > | <script>const foo = "bar"</script>
   *                              ^
   * ```
   *
   * @type {State}
   */
  function start(code) {
    assert(code === codes.lessThan, 'expected `<`');
    effects.exit(types.elementRaw);
    effects.enter(types.elementTag);
    effects.enter(types.elementTagMarker);
    effects.consume(code);
    effects.exit(types.elementTagMarker);
    return startAfter;
  }

  /**
   * ```markdown
   * > | <script>const foo = "bar"</script>
   *                               ^
   * ```
   *
   * @type {State}
   */
  function startAfter(code) {
    if (code === codes.slash) {
      effects.consume(code);
      effects.enter(types.elementTagName);
      return tagName;
    }
    return nok(code);
  }

  /**
   * ```markdown
   * > | <script>const foo = "bar"</script>
   *                                ^^^^^^
   * ```
   *
   * @type {State}
   */
  function tagName(code) {
    assert(
      rawName != undefined,
      'expected open raw element tag name to be defined',
    );
    if (index < rawName.length && code === rawName.charCodeAt(index++)) {
      effects.consume(code);
      if (index < rawName.length) {
        return tagName;
      }
      effects.exit(types.elementTagName);
      return end;
    }
    return nok(code);
  }

  /**
   * ```markdown
   * > | <script>const foo = "bar"</script>
   *                                      ^
   * ```
   *
   * @type {State}
   */
  function end(code) {
    if (code === codes.greaterThan) {
      effects.enter(types.elementTagMarker);
      effects.consume(code);
      effects.exit(types.elementTagMarker);
      effects.exit(types.elementTag);
      return ok;
    }
    return nok(code);
  }

  // /**
  //  * ```markdown
  //  * > | <script>const foo = "bar"</script>
  //  *                                       ^
  //  * ```
  //  *
  //  * @type {State}
  //  */
  // function endAfter(code) {
  //   if (markdownLineEnding(code)) {
  //     effects.enter(coreTypes.lineEnding);
  //     effects.consume(code);
  //     effects.exit(coreTypes.lineEnding);
  //     return ok;
  //   }
  //   if (markdownSpace(code)) {
  //     return factorySpace(effects, ok, coreTypes.whitespace);
  //   }
  //   return ok(code);
  // }
}

/** @type {Tokenizer} */
function tokenizeElementText(effects, ok, nok) {
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
    return factoryElementTag.call(
      self,
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
