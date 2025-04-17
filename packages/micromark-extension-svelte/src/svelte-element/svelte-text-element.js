/** @import {Extension, HtmlExtension, Tokenizer, State, Code, Effects, TokenizeContext, Construct, Previous, Token, ConstructRecord} from 'micromark-util-types' */

import { types } from 'common/constants';
import { assert } from 'common/utils';
import {
  asciiAlpha,
  asciiAlphanumeric,
  markdownLineEnding,
  markdownSpace,
} from 'micromark-util-character';
import { codes } from 'micromark-util-symbol';
import { createTagContent } from './tag-content.js';

/** @returns {Extension} */
export function svelteTextElement() {
  return {
    disable: {
      null: ['htmlFlow', 'htmlText', 'codeIndented', 'autolink'],
    },
    flow: {
      [codes.lessThan]: {
        name: types.svelteTextElement,
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
export function htmlSvelteTextElement() {
  return {
    exit: {
      [types.svelteElementTag](token) {
        this.raw(this.sliceSerialize(token));
      },
    },
  };
}

/** @type {Construct} */
const checkFlowStartMarkerConstruct = {
  name: types.svelteFlowElement + 'Check',
  partial: true,
  tokenize(effects, ok, nok) {
    return start;
    /** @type {State} */
    function start(code) {
      assert(code === codes.lessThan, 'expected "<"');
      effects.consume(code);
      return afterStart;
    }
    /** @type {State} */
    function afterStart(code) {
      if (
        code === codes.slash ||
        code === codes.exclamationMark ||
        code === codes.questionMark
      ) {
        return ok;
      }
      return nok;
    }
  },
};

/**
 * @this {TokenizeContext}
 * @type {Tokenizer}
 */
function tokenize(effects, ok, nok) {
  return start;

  /** @type {State} */
  function start(code) {
    assert(code === codes.lessThan, 'expected "<"');
    return effects.check(checkFlowStartMarkerConstruct, nok, proceed)(code);
  }

  /** @type {State} */
  function proceed(code) {
    assert(code === codes.lessThan, 'expected "<"');
    effects.enter(types.svelteTextElement);
    effects.enter(types.svelteElementTag);
    effects.consume(code);
    return nameStart;
  }

  /** @type {State} */
  function nameStart(code) {
    if (asciiAlpha(code)) {
      effects.enter(types.svelteElementTagName);
      effects.consume(code);
      return name;
    }
    return nok;
  }

  /** @type {State} */
  function name(code) {
    if (
      asciiAlphanumeric(code) ||
      code === codes.dash ||
      code === codes.dot ||
      code === codes.colon
    ) {
      effects.consume(code);
      return name;
    }
    effects.exit(types.svelteElementTagName);
    return createTagContent(effects, end, nok)(code);
  }

  /** @param {typeof codes.greaterThan} code */
  function end(code) {
    assert(code === codes.greaterThan, 'expected ">"');
    effects.consume(code);
    effects.exit(types.svelteElementTag);
    effects.exit(types.svelteTextElement);
    return ok;
  }
}
