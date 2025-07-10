import { tokens } from '@mdsv/constants';
import { ok as assert } from 'devlop';
import { blankLine } from 'micromark-core-commonmark';
import { factorySpace } from 'micromark-factory-space';
import { markdownLineEnding, markdownSpace } from 'micromark-util-character';
import { htmlRawNames } from 'micromark-util-html-tag-name';
import { codes, constants, types as coreTypes } from 'micromark-util-symbol';
import type {
  Code,
  Construct,
  Extension,
  HtmlExtension,
  Tokenizer,
} from 'micromark-util-types';
import { factoryElementTag } from './utils/factory-element-tag.js';
import { factoryExpression } from './utils/factory-expression.js';

export function mdsvElement(): Extension {
  return {
    disable: {
      null: ['htmlFlow', 'htmlText', 'codeIndented', 'autolink'],
    },
    flow: {
      [codes.lessThan]: {
        concrete: true,
        name: tokens.flowElement,
        tokenize: tokenizeElementFlow,
      },
    },
    text: {
      [codes.lessThan]: {
        concrete: true,
        name: tokens.textElement,
        tokenize: tokenizeElementText,
      },
    },
  };
}

export function mdsvElementHtml(): HtmlExtension {
  return {
    exit: {
      [tokens.flowElementTag](token) {
        this.raw(this.sliceSerialize(token));
      },
      [tokens.textElementTag](token) {
        this.raw(this.sliceSerialize(token));
      },
      [tokens.elementRaw](token) {
        this.raw(this.sliceSerialize(token));
      },
    },
  };
}

const tokenizeElementFlow: Tokenizer = function (effects, ok, nok) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const self = this;

  return start;

  /**
   * ```markdown
   * > | <
   *     ^
   * ```
   */
  function start(code: Code) {
    return factoryElementTag.call(
      self,
      effects,
      endAfter,
      nok,
      tokens.flowElementTag,
      tokens.elementTagMarker,
      tokens.elementTagName,
      tokens.elementTagAttribute,
    )(code);
  }

  /**
   * ```markdown
   * > | <>
   *       ^
   * ```
   */
  function endAfter(code: Code) {
    if (code === codes.eof) {
      return ok(code);
    }
    if (
      self.mdsvElementTagName &&
      htmlRawNames.includes(self.mdsvElementTagName)
    ) {
      effects.enter(tokens.elementRaw);
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
   */
  function continuationAfter(code: Code) {
    // effects.exit(types.svelteFlow);
    return ok(code);
  }

  /**
   * ```markdown
   *   | <>
   * > |
   *    ^
   * ```
   */
  function continuationStart(code: Code) {
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
   */
  function continuationStartNonLazy(code: Code) {
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
   */
  function chunkStart(code: Code) {
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
   */
  function chunk(code: Code) {
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
   */
  function raw(code: Code) {
    return factoryExpression(
      effects,
      effects.attempt(rawCloseTag, ok, rawConsume),
      nok,
      codes.lessThan,
    )(code);
  }

  /**
   * ```markdown
   * > | <script>foo
   *               ^
   * ```
   */
  function rawConsume(code: Code) {
    effects.consume(code);
    return raw;
  }
};

/**
 * ```markdown
 *   | <>
 *   |
 * > |
 *    ^
 * ```
 */
const tokenizeBlankLineAfter: Tokenizer = function (effects, ok, nok) {
  return start;

  /**
   * ```markdown
   * > | <>
   *       ^
   * ```
   */
  function start(code: Code) {
    assert(markdownLineEnding(code), 'expected to be at line ending');
    effects.enter(coreTypes.lineEnding);
    effects.consume(code);
    effects.exit(coreTypes.lineEnding);
    return effects.attempt(blankLine, ok, nok);
  }
};

/**
 * ```markdown
 *   | <>
 * > |
 *    ^
 * ```
 */
const tokenizeNonLazyContinuationStart: Tokenizer = function (
  effects,
  ok,
  nok,
) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const self = this;

  return start;

  /**
   * ```markdown
   * > | <>
   *       ^
   * ```
   */
  function start(code: Code) {
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
   */
  function after(code: Code) {
    return self.parser.lazy[self.now().line] ? nok(code) : ok(code);
  }
};

/**
 * ```markdown
 *   | <script>
 * > |
 *    ^
 * ```
 */
const tokenizeRawCloseTag: Tokenizer = function (effects, ok, nok) {
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
   */
  function start(code: Code) {
    assert(code === codes.lessThan, 'expected `<`');
    effects.exit(tokens.elementRaw);
    effects.enter(tokens.flowElementTag);
    effects.enter(tokens.elementTagMarker);
    effects.consume(code);
    effects.exit(tokens.elementTagMarker);
    return startAfter;
  }

  /**
   * ```markdown
   * > | <script>const foo = "bar"</script>
   *                               ^
   * ```
   */
  function startAfter(code: Code) {
    if (code === codes.slash) {
      effects.consume(code);
      effects.enter(tokens.elementTagName);
      return tagName;
    }
    return nok(code);
  }

  /**
   * ```markdown
   * > | <script>const foo = "bar"</script>
   *                                ^^^^^^
   * ```
   */
  function tagName(code: Code) {
    assert(
      rawName != undefined,
      'expected open raw element tag name to be defined',
    );
    if (index < rawName.length && code === rawName.charCodeAt(index++)) {
      effects.consume(code);
      if (index < rawName.length) {
        return tagName;
      }
      effects.exit(tokens.elementTagName);
      return end;
    }
    return nok(code);
  }

  /**
   * ```markdown
   * > | <script>const foo = "bar"</script>
   *                                      ^
   * ```
   */
  function end(code: Code) {
    if (code === codes.greaterThan) {
      effects.enter(tokens.elementTagMarker);
      effects.consume(code);
      effects.exit(tokens.elementTagMarker);
      effects.exit(tokens.flowElementTag);
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
};

const tokenizeElementText: Tokenizer = function (effects, ok, nok) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const self = this;

  return start;

  /**
   * ```markdown
   * > | jello <
   *           ^
   * ```
   */
  function start(code: Code) {
    return factoryElementTag.call(
      self,
      effects,
      ok,
      nok,
      tokens.textElementTag,
      tokens.elementTagMarker,
      tokens.elementTagName,
      tokens.elementTagAttribute,
    )(code);
  }
};

const blankLineAfter: Construct = {
  partial: true,
  tokenize: tokenizeBlankLineAfter,
};

const rawCloseTag: Construct = {
  partial: true,
  tokenize: tokenizeRawCloseTag,
};

const nonLazyContinuationStart: Construct = {
  partial: true,
  tokenize: tokenizeNonLazyContinuationStart,
};
