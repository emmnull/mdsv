/** @import {Tokenizer, State, Code, Effects, Extension, HtmlExtension,TokenizeContext, Construct, Token, ConstructRecord} from 'micromark-util-types' */

import { types } from 'common/constants';
import { assert } from 'common/utils';
import { factorySpace } from 'micromark-factory-space';
import {
  asciiAlpha,
  markdownLineEnding,
  markdownLineEndingOrSpace,
  markdownSpace,
} from 'micromark-util-character';
import { htmlBlockNames, htmlRawNames } from 'micromark-util-html-tag-name';
import { codes, constants, types as coreTypes } from 'micromark-util-symbol';
import { createTagContent } from './tag-content.js';
import { createTagMatch } from './tag-match.js';
import { createTagMisc } from './tag-misc.js';
import { createTagName } from './tag-name.js';

/** @returns {Extension} */
export function svelteFlowElement() {
  return {
    disable: {
      null: ['htmlFlow', 'htmlText', 'codeIndented', 'autolink'],
    },
    flow: {
      [codes.lessThan]: {
        name: types.svelteFlowElement,
        tokenize,
        previous(code) {
          return (
            code === codes.greaterThan || // allow adjacent tags for nested elements
            code === null ||
            markdownLineEnding(code) ||
            markdownSpace(code)
          );
        },
      },
    },
  };
}

/**
 * @returns {HtmlExtension}
 * @todo Implement namespaced tag name for customized elements?
 */
export function htmlSvelteFlowElement() {
  return {
    exit: {
      [types.svelteElementTag](token) {
        this.raw(this.sliceSerialize(token));
      },
      [types.svelteRawData](token) {
        this.raw(this.sliceSerialize(token));
      },
    },
  };
}

/**
 * Tokenizer for block-level HTML/Svelte elements (Flow Context).
 *
 * @this {TokenizeContext}
 * @type {Tokenizer}
 */
function tokenize(effects, ok, nok) {
  const self = this;
  /** @type {string | undefined} */
  let tagName;
  let isRawTag = false;
  let isBlockTag = false;

  return start;

  /** @type {State} */
  function start(code) {
    assert(code === codes.lessThan, 'expected "<"');
    effects.enter(types.svelteFlowElement);
    effects.enter(types.svelteElementTag);
    effects.consume(code);
    return openingTagStart;
  }

  /** @type {State} */
  function openingTagStart(code) {
    if (code === codes.exclamationMark || code === codes.questionMark) {
      return createTagMisc(effects, openingTagEnd, nok)(code);
    }
    if (code === codes.slash) {
      return nok;
    }
    if (asciiAlpha(code)) {
      effects.enter(types.svelteElementTagName);
      return createTagName(effects, openingTagNameEnd, nok)(code);
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
    isRawTag = htmlRawNames.includes(tagName);
    isBlockTag =
      htmlBlockNames.includes(tagName) ||
      /[A-Z]/.test(tagName[0]) ||
      /[-.:]/.test(tagName);
    if (!tagName) {
      return nok;
    }
    if (!isRawTag && !isBlockTag) {
      return nok;
    }
    return createTagContent(effects, openingTagEnd, nok)(code);
  }

  /** @type {State} */
  function maybeSelfClose(code) {
    if (code === codes.greaterThan) {
      effects.consume(code);
      effects.exit(types.svelteElementTag);
      effects.exit(types.svelteFlowElement);
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
      if (isRawTag) {
        effects.enter(types.svelteRawData);
        return rawData;
      }
      if (tagName === undefined) {
        // handling misc tags like <! > completed by createTagMisc
        effects.exit(types.svelteElementTag);
        effects.exit(types.svelteFlowElement);
        return ok;
      }
      return chunkStart;
    }
    return nok;
  }

  /** @type {State} */
  function rawData(code) {
    if (code === codes.eof) {
      effects.exit(types.svelteRawData);
      effects.exit(types.svelteFlowElement);
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
                'expected tagName to be defined to close raw',
              );
              effects.exit(types.svelteRawData);
              return createTagMatch(tagName, effects, ok, nok)(code);
            };
          },
        },
        finishFlow,
        rawChar,
      )(code);
    }
    return rawChar(code);
  }

  /** @type {State} */
  function rawChar(code) {
    effects.consume(code);
    return rawData;
  }

  /** @type {State} */
  function chunkStart(code) {
    if (code === codes.eof) {
      effects.exit(types.svelteFlowElement);
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
              return createTagMatch(tagName, effects, ok, nok)(code);
            };
          },
        },
        finishFlow,
        chunkLineStart,
      )(code);
    }
    return chunkLineStart(code);
  }

  /** @type {State} */
  function chunkLineStart(code) {
    effects.enter(coreTypes.chunkContent, {
      contentType: constants.contentTypeFlow,
    });
    return chunkLine(code);
  }

  /** @type {State} */
  function chunkLine(code) {
    if (code === codes.eof) {
      effects.exit(coreTypes.chunkContent);
      effects.exit(types.svelteFlowElement);
      return ok;
    }
    if (markdownLineEnding(code)) {
      effects.exit(coreTypes.chunkContent);
      effects.consume(code);
      return chunkStart;
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
              effects.exit(coreTypes.chunkContent);
              return createTagMatch(tagName, effects, ok, nok)(code);
            };
          },
        },
        finishFlow,
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
  function finishFlow() {
    effects.exit(types.svelteFlowElement);
    return ok;
  }
}
