/** @import {Tokenizer, State, Code, Effects, Extension, HtmlExtension, TokenizeContext, Construct, Token, ConstructRecord} from 'micromark-util-types' */

import { types } from 'common/constants';
import { assert } from 'common/utils';
import { factorySpace } from 'micromark-factory-space';
import {
  asciiAlpha,
  markdownLineEnding,
  markdownLineEndingOrSpace,
} from 'micromark-util-character';
import { htmlRawNames } from 'micromark-util-html-tag-name';
import { codes, constants, types as coreTypes } from 'micromark-util-symbol';
import { factoryTagAttributes } from './factory-tag-attributes.js';

import { factoryTagClose } from './factory-tag-close.js';
import { factoryTagName } from './factory-tag-name.js';

/** @returns {Extension} */
export function svelteTextElement() {
  return {
    disable: {
      null: ['htmlText', 'autolink'],
    },
    text: {
      [codes.lessThan]: {
        name: types.svelteTextElement,
        tokenize,
      },
    },
  };
}

/** @returns {HtmlExtension} */
export function htmlSvelteTextElement() {
  return {
    exit: {
      [types.svelteElementTag](token) {
        this.raw(this.sliceSerialize(token));
      },
    },
  };
}

/**
 * Tokenizer for Svelte Text Elements (Inline).
 *
 * @this {TokenizeContext}
 * @type {Tokenizer}
 */
function tokenize(effects, ok, nok) {
  const self = this;
  /** @type {string | undefined} */
  let tagName;

  return start;

  /** @type {State} */
  function start(code) {
    assert(code === codes.lessThan, 'expected "<"');
    effects.enter(types.svelteTextElement);
    effects.enter(types.svelteElementTag);
    effects.consume(code);
    return openingTagStart;
  }

  /** @type {State} */
  function openingTagStart(code) {
    if (code === codes.exclamationMark || code === codes.questionMark) {
      return nok;
    }
    if (asciiAlpha(code)) {
      effects.enter(types.svelteElementTagName);
      return factoryTagName(effects, openingTagNameEnd, nok)(code);
    }
    if (markdownLineEndingOrSpace(code)) {
      return factorySpace(effects, openingTagStart, coreTypes.whitespace)(code);
    }
    return nok;
  }

  /** @type {State} */
  function openingTagNameEnd(code) {
    const nameToken = effects.exit(types.svelteElementTagName);
    tagName = self.sliceSerialize(nameToken);
    if (!tagName) {
      return nok;
    }
    if (htmlRawNames.includes(tagName)) {
      return nok;
    }
    return factoryTagAttributes(effects, openingTagEnd, nok)(code);
  }

  /** @type {State} */
  function maybeSelfClose(code) {
    if (code === codes.greaterThan) {
      effects.consume(code);
      effects.exit(types.svelteElementTag);
      effects.exit(types.svelteTextElement);
      return ok;
    }
    return nok;
  }

  /** @type {State} */
  function openingTagEnd(code) {
    if (code === codes.slash) {
      effects.consume(code);
      return maybeSelfClose;
    }
    if (code === codes.greaterThan) {
      effects.consume(code);
      effects.exit(types.svelteElementTag);
      if (tagName === undefined) {
        // handling misc tags like <! > completed by createTagMisc
        effects.exit(types.svelteTextElement);
        return ok;
      }
      return textContentStart;
    }
    return nok;
  }

  /** @type {State} */
  function textContentStart(code) {
    if (code === codes.eof) {
      effects.exit(types.svelteTextElement);
      return ok;
    }
    if (code === codes.lessThan) {
      return effects.attempt(
        {
          partial: true,
          tokenize(effects, ok, nok) {
            return function (code) {
              assert(
                tagName !== undefined,
                'expected tagName to be defined to close chunk',
              );
              return factoryTagClose(tagName, effects, ok, nok)(code);
            };
          },
        },
        finishText,
        textStart,
      )(code);
    }
    return textStart(code);
  }

  /** @type {State} */
  function textStart(code) {
    effects.enter(coreTypes.chunkText, {
      contentType: constants.contentTypeText,
    });
    return chunkLine(code);
  }

  /** @type {State} */
  function chunkLine(code) {
    if (code === codes.eof) {
      effects.exit(coreTypes.chunkText);
      effects.exit(types.svelteTextElement);
      return ok;
    }
    if (markdownLineEnding(code)) {
      effects.exit(coreTypes.chunkText);
      effects.consume(code);
      return finishText;
    }
    if (code === codes.lessThan) {
      return effects.attempt(
        {
          partial: true,
          tokenize(effects, ok, nok) {
            return function (code) {
              assert(
                tagName !== undefined,
                'expected tagName to be defined to close chunk',
              );
              effects.exit(coreTypes.chunkText);
              return factoryTagClose(tagName, effects, ok, nok)(code);
            };
          },
        },
        finishText,
        chunkChar,
      );
    }
    return chunkChar(code);
  }

  /** @type {State} */
  function chunkChar(code) {
    effects.consume(code);
    return chunkLine;
  }

  /** @type {State} */
  function finishText() {
    effects.exit(types.svelteTextElement);
    return ok;
  }
}
