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
export function svelteFlowElement() {
  return {
    disable: {
      null: ['htmlFlow', 'htmlText', 'codeIndented', 'autolink'],
    },
    flow: {
      [codes.lessThan]: {
        name: types.svelteFlow,
        concrete: true,
        tokenize,
      },
    },
  };
}

/** @returns {HtmlExtension} */
export function htmlSvelteFlowElement() {
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
const nonLazyContinuation = {
  partial: true,
  tokenize: tokenizeNonLazyContinuation,
};

/** @type {Tokenizer} */
function tokenize(effects, ok, nok) {
  const self = this;
  const stack = this.svelteElementStack || (this.svelteElementStack = []);
  /** @type {Construct} */
  const closeStart = { partial: true, tokenize: tokenizeCloseTag };
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
    effects.enter(types.svelteFlow);
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
    // if (code === codes.slash) {
    //   // self-closing tag, with slash after name
    //   isSelfClosing = true;
    //   effects.consume(code);
    //   return openEnd;
    // }
    // if (code === codes.greaterThan) {
    //   openEnd(code);
    // }
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
      // return afterEnd;
      if (isSelfClosing) {
        // return effects.attempt()
      } else {
        stack.push(name);
      }
      return self.interrupt
        ? ok(code)
        : effects.check(nonLazyContinuation, atNonLazyBreak, after)(code);
    }
    return nok(code);
  }

  /** @type {State} */
  function afterEnd(code) {
    console.log('continuation start', name, code);
    if (markdownSpace(code)) {
      return factorySpace(effects, afterEnd, coreTypes.whitespace)(code);
    }
    if (code === codes.eof) {
      effects.exit(types.svelteFlow);
    }
    if (markdownLineEnding(code)) {
      return effects.check(blankLine, atBlankLine, continuationStart);
    }
    return nok(code);
  }

  /** @type {State} */
  function atBlankLine(code) {
    effects.exit(types.svelteFlow);
    return ok(code);
  }

  /** @type {State} */
  function continuationStart(code) {
    effects.enter('flow');
    return continuation;
  }

  /** @type {State} */
  function continuation(code) {
    effects.enter('flow');
    return continuation;
  }

  /**
   * ```markdown
   * > | <>
   *       ^
   * ```
   *
   * @type {State}
   */
  function atNonLazyBreak(code) {
    assert(markdownLineEnding(code), 'expected eol at non lazy break');
    return effects.attempt(closeStart, after, contentBefore);
  }

  /** @type {State} */
  function contentBefore(code) {
    assert(markdownLineEnding(code), 'expected eol in content before');
    effects.enter(coreTypes.lineEnding);
    effects.consume(code);
    effects.exit(coreTypes.lineEnding);
    return contentChunkBefore;
  }

  /**
   * ```markdown
   *   | ~~~js
   * > | alert(1)
   *     ^
   *   | ~~~
   * ```
   *
   * @type {State}
   */
  function contentChunkBefore(code) {
    if (code === codes.eof || markdownLineEnding(code)) {
      return effects.check(nonLazyContinuation, atNonLazyBreak, after)(code);
    }
    effects.enter(coreTypes.chunkContent, {
      contentType: constants.contentTypeText,
    });
    return contentChunk(code);
  }

  /**
   * ```markdown
   *   | <>
   * > | jello world
   *     ^^^^^^^^^^^
   *   | </>
   * ```
   *
   * @type {State}
   */
  function contentChunk(code) {
    if (code === codes.eof || markdownLineEnding(code)) {
      effects.exit(coreTypes.chunkContent);
      return contentChunkBefore(code);
    }
    effects.consume(code);
    return contentChunk;
  }

  /**
   * ```markdown
   *   | <>
   *   | jello world
   * > | </>
   *        ^
   * ```
   *
   * @type {State}
   */
  function after(code) {
    effects.exit(types.svelteFlow);
    return ok(code);
  }

  /**
   * ```markdown
   *   | <foo>
   *   | ...
   * > | </foo>
   *     ^
   * ```
   *
   * @type {Tokenizer}
   */
  function tokenizeCloseTag(effects, ok, nok) {
    let index = 0;

    return startBefore;

    /**
     * ```markdown
     *   | <>
     *   | hi mom
     * > | </>
     *     ^
     * ```
     *
     * @type {State}
     */
    function startBefore(code) {
      assert(markdownLineEnding(code), 'expected eol before close start');
      effects.enter(coreTypes.lineEnding);
      effects.consume(code);
      effects.exit(coreTypes.lineEnding);
      return start;
    }

    /**
     * ```markdown
     *   | <>
     *   | hi mom
     * > | </>
     *     ^
     * ```
     *
     * @type {State}
     */
    function start(code) {
      assert(
        self.parser.constructs.disable.null !== undefined,
        'expected `disable.null` to be populated',
      );
      if (markdownSpace(code)) {
        return factorySpace(effects, closeStart, coreTypes.linePrefix);
      }
    }

    /**
     * ```markdown
     * > | <foo>
     * > | hi mom
     * > | </foo>
     *     ^
     * ```
     *
     * @type {State}
     */
    function closeStart(code) {
      if (code === codes.lessThan) {
        effects.enter(types.svelteFlowTag);
        effects.enter(types.svelteFlowTagMarker);
        effects.consume(code);
        effects.exit(types.svelteFlowTagMarker);
        return closeStartAfter;
      }
      return nok(code);
    }

    /**
     * ```markdown
     * > | <foo>
     * > | hi mom
     * > | </foo>
     *      ^
     * ```
     *
     * @type {State}
     */
    function closeStartAfter(code) {
      if (code === codes.slash) {
        effects.consume(code);
        effects.enter(types.svelteFlowTagName);
        return match;
      }
      return nok(code);
    }

    /**
     * ```markdown
     * > | <foo>
     * > | hi mom
     * > | </foo>
     *       ^
     * ```
     *
     * @type {State}
     */
    function match(code) {
      if (index == name.length) {
        effects.exit(types.svelteFlowTagName);
        return matchAfter(code);
      }
      if (code === name.charCodeAt(index++)) {
        effects.consume(code);
        return match;
      }
      return nok(code);
    }

    /**
     * ```markdown
     * > | <foo>
     * > | hi mom
     * > | </foo>
     *          ^
     * ```
     *
     * @type {State}
     */
    function matchAfter(code) {
      if (markdownSpace(code)) {
        return factorySpace(effects, matchAfter, coreTypes.whitespace)(code);
      }
      if (code === codes.greaterThan) {
        effects.enter(types.svelteFlowTagMarker);
        effects.consume(code);
        effects.exit(types.svelteFlowTagMarker);
        effects.exit(types.svelteFlowTag);
        effects.exit(types.svelteFlow);
        return closeAfter;
      }

      return nok(code);
    }

    /**
     * ```markdown
     * > | <foo>
     * > | hi mom
     * > | </foo>
     *           ^
     * ```
     *
     * @type {State}
     */
    function closeAfter(code) {
      if (code === codes.eof || markdownLineEnding(code)) {
        if (stack[stack.length - 1] === name) {
          stack.pop();
        }
        effects.exit(types.svelteFlow);
        return ok(code);
      }
      return nok(code);
    }
  }
}

/** @type {Tokenizer} */
function tokenizeNonLazyContinuation(effects, ok, nok) {
  const self = this;

  return start;

  /**
   * ```markdown
   * > |
   *     ^
   * > |
   * ```
   *
   * @type {State}
   */
  function start(code) {
    console.log('ASDASDASD', self.now().line);
    if (code === codes.eof) {
      return nok(code);
    }
    assert(markdownLineEnding(code), 'expected eol in non lazy continuation');
    effects.enter(coreTypes.lineEnding);
    effects.consume(code);
    effects.exit(coreTypes.lineEnding);
    return lineStart;
  }

  /**
   * ```markdown
   * > |
   * > |
   *    ^
   * ```
   *
   * @type {State}
   */
  function lineStart(code) {
    return self.parser.lazy[self.now().line] ? nok(code) : ok(code);
  }
}
