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
import { factoryElementContent } from './factory-element-content.js';
import { factoryTagAttributes } from './factory-tag-attributes.js';
import { factoryTagMisc } from './factory-tag-misc.js';
import { factoryTagName } from './factory-tag-name.js';

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

/** @returns {HtmlExtension} */
export function htmlSvelteFlowElement() {
  return {
    exit: {
      [types.svelteElementTag](token) {
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
    if (code === codes.slash) {
      return nok;
    }
    if (code === codes.exclamationMark || code === codes.questionMark) {
      return factoryTagMisc(effects, openingTagEnd, nok)(code);
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
    return factoryTagAttributes(effects, openingTagEnd, nok)(code);
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
      if (tagName === undefined) {
        // handling misc tags like <! > completed by createTagMisc
        effects.exit(types.svelteFlowElement);
        return ok;
      }
      if (isRawTag) {
        return factoryElementContent(
          effects,
          end,
          null,
          tagName,
          effects.enter(coreTypes.chunkString, {
            contentType: constants.contentTypeString,
          }),
        );
      }
      return effects.attempt(
        {
          partial: true,
          tokenize(effects, ok, nok) {
            return textContentStart;

            /** @type {State} */
            function textContentStart(code) {
              assert(tagName !== undefined, 'expected tag name to be defined');
              return factoryElementContent(
                effects,
                afterClose,
                nok,
                tagName,
                effects.enter(coreTypes.chunkContent, {
                  contentType: constants.contentTypeText,
                }),
              )(code);
            }

            /** @type {State} */
            function afterClose(code) {
              if (code === codes.eof || markdownLineEnding(code)) {
                // file or line ended without trailing content
                // consider content as text instead of flow
                // but also consider element as flow container
                return ok;
              }
              if (markdownSpace(code)) {
                // accept trailing spaces
                effects.consume(code);
                return afterClose;
              }
              // content found after the closing tag
              // element should be handled as a text element
              // and wrapped in a <p> alongside the subsequent content
              return nok;
            }
          },
        },
        end,
        flowContentStart,
      )(code);
    }
    return nok;
  }

  /** @type {State} */
  function flowContentStart(code) {
    assert(tagName !== undefined, 'expected tag name to be defined');
    return factoryElementContent(
      effects,
      end,
      flowContentStart,
      tagName,
      effects.enter(coreTypes.chunkContent, {
        contentType: constants.contentTypeFlow,
      }),
    )(code);
  }

  /** @type {State} */
  function end(code) {
    effects.exit(types.svelteFlowElement);
    return ok;
  }
}
